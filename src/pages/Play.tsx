import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lightbulb, Sparkles, Flame, BookOpen, ArrowLeftRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import Mascot from '@/components/WorldMascot';
import { GAMES } from '@/games';
import { generate, MCQ } from '@/games/generators';
import { useStore, getCurrentLevel } from '@/store/useStore';
import { sfx, haptic } from '@/lib/sound';
import { askGemini } from '@/lib/gemini';
import { cn } from '@/lib/cn';

const ROUND = 5;

const burst = () =>
  confetti({
    particleCount: 80,
    spread: 90,
    origin: { y: 0.6 },
    colors: ['#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#60a5fa'],
  });

export default function Play() {
  const { gameId = 'pattern' } = useParams();
  const nav = useNavigate();
  const ttsOn = useStore((s) => s.ttsOn);
  const addStar = useStore((s) => s.addStar);
  const recordAttempt = useStore((s) => s.recordAttempt);
  const bumpStreak = useStore((s) => s.bumpStreak);
  const streak = useStore((s) => s.streak);
  const meta = GAMES.find((g) => g.id === gameId)!;
  const [level] = useState(() => getCurrentLevel(gameId));

  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [q, setQ] = useState<MCQ>(() => generate(gameId, level));
  const [picked, setPicked] = useState<number | null>(null);
  const [hint, setHint] = useState('');
  const [explain, setExplain] = useState('');
  const [loading, setLoading] = useState<'hint' | 'explain' | null>(null);

  // TTS read aloud for young kids
  useEffect(() => {
    if (!ttsOn || picked !== null) return;
    try {
      const u = new SpeechSynthesisUtterance(q.prompt.replace(/[\n•❓]/g, ' '));
      u.lang = 'he-IL';
      u.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {}
    return () => {
      try { window.speechSynthesis.cancel(); } catch {}
    };
  }, [q, picked, ttsOn]);

  const pose = picked === null ? 'idle' : picked === q.correct ? 'celebrate' : 'thinking';

  const next = () => { setPicked(null); setHint(''); setExplain(''); setQ(generate(gameId, level)); };

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
    setTimeout(() => {
      if (idx + 1 >= ROUND) {
        const finalCorrect = correct + (isRight ? 1 : 0);
        const result = recordAttempt(gameId, finalCorrect, ROUND);
        sfx.fanfare();
        if (result.leveledUp || result.newCollectible) {
          confetti({ particleCount: 200, spread: 160, origin: { y: 0.5 } });
        }
        nav('/results', { state: { correct: finalCorrect, total: ROUND, gameId, ...result, level } });
      } else {
        setIdx((x) => x + 1);
        next();
      }
    }, 1500);
  };

  const ask = async (mode: 'hint' | 'explain') => {
    setLoading(mode);
    const text = await askGemini(mode, { gameId, question: q.prompt, context: q.hintContext, correct: q.options[q.correct], level });
    if (mode === 'hint') setHint(text); else setExplain(text);
    setLoading(null);
  };

  const progressPct = useMemo(() => (idx / ROUND) * 100, [idx]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" aria-label="חזרה לבית" className="btn-ghost !min-h-[48px] !px-4 !py-2 text-sm">
          <ArrowRight className="w-4 h-4" /> חזרה
        </Link>
        <div className="flex items-center gap-3">
          {streak >= 2 && (
            <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full px-3 py-1 text-sm font-bold">
              <Flame className="w-4 h-4" /> {streak}
            </div>
          )}
          <div className="text-sm font-bold text-slate-500 dark:text-slate-400">רמה {level} • {idx + 1}/{ROUND}</div>
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
            aria-label={q.dir === 'rtl' ? 'כיוון קריאה: מימין לשמאל' : 'כיוון קריאה: משמאל לימין'}
          >
            {q.dir === 'rtl' ? (
              <>
                <ArrowLeftRight className="w-4 h-4" />
                קרא מימין לשמאל ←
              </>
            ) : (
              <>
                <ArrowLeftRight className="w-4 h-4" />
                → קרא משמאל לימין
              </>
            )}
          </div>
          <div
            dir={q.dir}
            className="text-2xl sm:text-3xl font-black my-4 leading-relaxed whitespace-pre-line break-words"
            style={{ unicodeBidi: 'plaintext' }}
          >
            {q.prompt}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt, i) => {
              const isRight = picked !== null && i === q.correct;
              const isWrong = picked === i && i !== q.correct;
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  className={cn(
                    'min-h-[80px] rounded-2xl text-2xl font-black border-2 transition px-3',
                    picked === null && 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 active:scale-95 hover:border-brand-500',
                    isRight && 'bg-emerald-400 border-emerald-500 text-white animate-pop',
                    isWrong && 'bg-rose-300 border-rose-400 text-white animate-shake',
                    picked !== null && !isRight && !isWrong && 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50'
                  )}
                >{opt}</button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Mascot pose={pose as any} size={70} />
        <button onClick={() => ask('hint')} disabled={loading !== null || picked !== null}
          className="btn-ghost !min-h-[52px] text-base disabled:opacity-50">
          {loading === 'hint' ? <Sparkles className="w-5 h-5 animate-spin" /> : <Lightbulb className="w-5 h-5" />} רמז
        </button>
        {picked !== null && (
          <button onClick={() => ask('explain')} disabled={loading !== null}
            className="btn-ghost !min-h-[52px] text-base disabled:opacity-50">
            {loading === 'explain' ? <Sparkles className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />} הסבר
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
