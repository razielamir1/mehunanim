import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lightbulb, Sparkles, Flame, BookOpen, ArrowLeftRight, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import Mascot from '@/components/WorldMascot';
import { GAMES } from '@/games';
import { generate, MCQ } from '@/games/generators';
import { useStore, getCurrentLevel } from '@/store/useStore';
import { sfx, haptic } from '@/lib/sound';
import { askGemini } from '@/lib/gemini';
import { cn } from '@/lib/cn';
import { useSpeak } from '@/hooks/useSpeak';
import { useT } from '@/i18n';
import { hasSeenWalkthrough, markWalkthroughSeen } from '@/store/useStore';
import Walkthrough from '@/components/Walkthrough';
import BonusRound from '@/components/BonusRound';
import MiniExam from '@/components/MiniExam';

const ROUND = 5;

const burst = () =>
  confetti({
    particleCount: 80,
    spread: 90,
    origin: { y: 0.6 },
    colors: ['#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#60a5fa'],
  });

export default function Play() {
  const t = useT();
  const { gameId = 'pattern' } = useParams();
  const nav = useNavigate();
  const ttsOn = useStore((s) => s.ttsOn);
  const age = useStore((s) => s.age);
  const locale = useStore((s) => s.locale);
  const profiles = useStore((s) => s.profiles);
  const activeProfileId = useStore((s) => s.activeProfileId);
  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const bypass = activeProfile?.levelOverride != null;
  const addStar = useStore((s) => s.addStar);
  const recordAttempt = useStore((s) => s.recordAttempt);
  const bumpStreak = useStore((s) => s.bumpStreak);
  const streak = useStore((s) => s.streak);
  const rawMeta = GAMES.find((g) => g.id === gameId)!;
  const meta = { ...rawMeta, title: locale === 'en' ? rawMeta.titleEn : rawMeta.title };
  const [level] = useState(() => getCurrentLevel(gameId));
  // Toddler mode triggered by age UNLESS parent override is set
  const isToddler = age <= 3 && !bypass;

  // Track used prompts to avoid repeats within a session
  const usedPromptsRef = useRef(new Set<string>());
  const genQ = () => {
    const q = generate(gameId, level, age, bypass, usedPromptsRef.current);
    usedPromptsRef.current.add(q.prompt);
    return q;
  };

  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [q, setQ] = useState<MCQ>(() => genQ());
  const [picked, setPicked] = useState<number | null>(null);
  const [autoExplain, setAutoExplain] = useState('');
  const [hint, setHint] = useState('');
  const [explain, setExplain] = useState('');
  const [loading, setLoading] = useState<'hint' | 'explain' | null>(null);
  // Show walkthrough on first question of a new level
  const [showWalkthrough, setShowWalkthrough] = useState(() => !hasSeenWalkthrough(gameId, level));
  // Bonus round phase after main session ends
  const [showBonus, setShowBonus] = useState(false);
  // Mini-exam phase (after bonus, before results)
  const [showMiniExam, setShowMiniExam] = useState(false);
  const bonusEnabled = useStore((s) => s.bonusEnabled);
  const finalResultRef = useRef<{ correct: number; total: number; leveledUp?: boolean; newCollectible?: string; bonusCorrect?: number } | null>(null);

  const { speak, stop } = useSpeak();
  // Auto-TTS only if user explicitly turned it on. No surprise speech.
  useEffect(() => {
    if (!ttsOn || picked !== null) return;
    const t = setTimeout(() => speak(q.prompt, { rate: isToddler ? 0.8 : 0.9 }), isToddler ? 500 : 200);
    return () => { clearTimeout(t); stop(); };
  }, [q, picked, ttsOn, isToddler, speak, stop]);

  const pose = picked === null ? 'idle' : picked === q.correct ? 'celebrate' : 'thinking';

  const next = () => { setPicked(null); setAutoExplain(''); setHint(''); setExplain(''); setQ(genQ()); };

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    haptic();
    const isRight = i === q.correct;
    bumpStreak(isRight);
    if (isRight) {
      sfx.correct();
      addStar();
      burst();
      setCorrect((c) => c + 1);
      if ((streak + 1) % 3 === 0) addStar(); // bonus
    } else {
      sfx.wrong();
    }
    // Always explain after answer — both correct and wrong
    const correctAnswer = q.options[q.correct];
    const explainText = isRight
      ? (locale === 'en'
          ? `Correct! ${q.hintContext || ''}`
          : `נָכוֹן! ${q.hintContext || ''}`)
      : (locale === 'en'
          ? `Not quite. The correct answer is ${correctAnswer}. ${q.hintContext || ''}`
          : `לֹא בְּדִיּוּק. הַתְּשׁוּבָה הַנְּכוֹנָה הִיא ${correctAnswer}. ${q.hintContext || ''}`);
    setAutoExplain(explainText);
    // Speak the explanation out loud (force — always, regardless of ttsOn)
    setTimeout(() => speak(explainText, { force: true, rate: 0.85 }), 600);
    // Longer delay to let explanation be heard before moving on
    setTimeout(() => {
      if (idx + 1 >= ROUND) {
        const finalCorrect = correct + (isRight ? 1 : 0);
        const result = recordAttempt(gameId, finalCorrect, ROUND);
        sfx.fanfare();
        if (result.leveledUp || result.newCollectible) {
          confetti({ particleCount: 200, spread: 160, origin: { y: 0.5 } });
        }
        finalResultRef.current = { correct: finalCorrect, total: ROUND, leveledUp: result.leveledUp, newCollectible: result.newCollectible };
        if (bonusEnabled) {
          setShowBonus(true);
          return;
        }
        setShowMiniExam(true);
      } else {
        setIdx((x) => x + 1);
        next();
      }
    }, 4000);
  };

  const ask = async (mode: 'hint' | 'explain') => {
    setLoading(mode);
    const text = await askGemini(mode, { gameId, question: q.prompt, context: q.hintContext, correct: q.options[q.correct], level });
    if (mode === 'hint') setHint(text); else setExplain(text);
    setLoading(null);
  };

  const progressPct = useMemo(() => (idx / ROUND) * 100, [idx]);

  // Auto-detect actual reading direction from the prompt content.
  // RULE: everything is LTR (shapes, numbers, emojis) EXCEPT pure Hebrew text.
  const effectiveDir = useMemo<'rtl' | 'ltr'>(() => {
    // If prompt is purely Hebrew text (no emojis/shapes/numbers as primary content) → RTL
    const stripped = q.prompt.replace(/[\s\u200F\u200E.,;:!?\-–—•❓_\n]/g, '');
    const hebrewChars = (stripped.match(/[\u0590-\u05FF]/g) || []).length;
    const totalChars = stripped.length;
    // If more than 60% Hebrew characters → it's a text question, use RTL
    if (totalChars > 0 && hebrewChars / totalChars > 0.6) return 'rtl';
    // Everything else (emojis, numbers, shapes, sequences, mixed) → LTR
    return 'ltr';
  }, [q.prompt]);

  if (showMiniExam) {
    return (
      <MiniExam
        gameId={gameId}
        age={age}
        level={level}
        onComplete={(mc) => {
          const r = finalResultRef.current!;
          nav('/results', {
            state: {
              correct: r.correct,
              total: ROUND,
              gameId,
              leveledUp: r.leveledUp,
              newCollectible: r.newCollectible,
              level,
              bonusCorrect: r.bonusCorrect,
              miniExamCorrect: mc,
            },
          });
        }}
      />
    );
  }

  if (showBonus) {
    return (
      <BonusRound
        gameId={gameId}
        onComplete={(bonusCorrect) => {
          finalResultRef.current = { ...finalResultRef.current!, bonusCorrect };
          setShowBonus(false);
          setShowMiniExam(true);
        }}
      />
    );
  }

  if (showWalkthrough) {
    return (
      <Walkthrough
        q={q}
        gameId={gameId}
        level={level}
        onContinue={() => {
          markWalkthroughSeen(gameId, level);
          setShowWalkthrough(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" aria-label={t('backHome')} className="btn-ghost !min-h-[48px] !px-4 !py-2 text-sm">
          <ArrowRight className="w-4 h-4" /> {t('back')}
        </Link>
        <div className="flex items-center gap-3">
          {streak >= 2 && (
            <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full px-3 py-1 text-sm font-bold">
              <Flame className="w-4 h-4" /> {streak}
            </div>
          )}
          <div className="text-sm font-bold text-slate-500 dark:text-slate-400">{t('level')} {level} • {idx + 1}/{ROUND}</div>
        </div>
      </div>

      <div className="h-3 bg-white dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
        <motion.div className={`h-full bg-gradient-to-l ${meta.gradient}`} animate={{ width: `${progressPct}%` }} />
      </div>

      <div className="text-center">
        <div className="text-3xl mb-1">{meta.emoji}</div>
        <h2 className="text-2xl font-black">{meta.title}</h2>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }}
          className="card text-center"
        >
          <div
            className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-700/30 text-brand-700 dark:text-brand-100 px-4 py-1.5 rounded-full text-sm font-bold mb-2"
            aria-label={effectiveDir === 'rtl' ? t('rtlAria') : t('ltrAria')}
          >
            <ArrowLeftRight className="w-4 h-4" />
            {effectiveDir === 'rtl' ? t('readDirRtl') : t('readDirLtr')}
          </div>
          <div className="flex items-start justify-center gap-2">
            <div
              dir={effectiveDir}
              className={cn(
                'font-black my-4 leading-relaxed whitespace-pre-line break-words flex-1',
                isToddler ? 'text-4xl sm:text-5xl md:text-6xl' : 'text-2xl sm:text-3xl'
              )}
              style={{ unicodeBidi: 'plaintext' }}
            >
              {q.prompt}
            </div>
            <button
              onClick={() => speak(q.prompt, { force: true })}
              aria-label={t('speakBtn')}
              className="mt-3 p-3 rounded-full bg-brand-50 dark:bg-brand-700/30 text-brand-700 dark:text-brand-100 hover:scale-110 active:scale-95 transition min-w-[56px] min-h-[56px] flex items-center justify-center"
            >
              <Volume2 className={isToddler ? 'w-8 h-8' : 'w-6 h-6'} />
            </button>
          </div>
          <div className={cn('gap-3', isToddler ? 'grid grid-cols-2' : 'grid grid-cols-2')}>
            {q.options.map((opt, i) => {
              // Toddler mode: hide all but the correct + first wrong option
              if (isToddler) {
                const firstWrong = q.options.findIndex((_, j) => j !== q.correct);
                if (i !== q.correct && i !== firstWrong) return null;
              }
              const isRight = picked !== null && i === q.correct;
              const isWrong = picked === i && i !== q.correct;
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  className={cn(
                    'rounded-2xl font-black border-2 transition px-3',
                    isToddler ? 'min-h-[140px] text-5xl' : 'min-h-[80px] text-2xl',
                    picked === null && 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 active:scale-95 hover:border-brand-500',
                    isRight && 'bg-emerald-400 border-emerald-500 text-white animate-pop',
                    isWrong && 'bg-rose-300 border-rose-400 text-white animate-shake',
                    picked !== null && !isRight && !isWrong && 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50'
                  )}
                >{opt}</button>
              );
            })}
          </div>
          {autoExplain && picked !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'mt-4 rounded-2xl px-4 py-3 text-start text-base font-bold border-2',
                picked === q.correct
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200'
              )}
              dir="auto"
            >
              <div className="flex items-start gap-2">
                <Volume2 className="w-5 h-5 shrink-0 mt-0.5 opacity-60" />
                <span>{autoExplain}</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Mascot pose={pose as any} size={70} />
        <button onClick={() => ask('hint')} disabled={loading !== null || picked !== null}
          className="btn-ghost !min-h-[52px] text-base disabled:opacity-50">
          {loading === 'hint' ? <Sparkles className="w-5 h-5 animate-spin" /> : <Lightbulb className="w-5 h-5" />} {t('hintBtn')}
        </button>
        {picked !== null && (
          <button onClick={() => ask('explain')} disabled={loading !== null}
            className="btn-ghost !min-h-[52px] text-base disabled:opacity-50">
            {loading === 'explain' ? <Sparkles className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />} {t('explainBtn')}
          </button>
        )}
      </div>

      {hint && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700">
          <div className="flex gap-2 items-start">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
            <div className="text-start">{hint}</div>
          </div>
        </motion.div>
      )}
      {explain && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-700">
          <div className="flex gap-2 items-start">
            <BookOpen className="w-5 h-5 text-sky-500 shrink-0 mt-1" />
            <div className="text-start whitespace-pre-wrap">{explain}</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
