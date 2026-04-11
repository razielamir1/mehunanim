import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, CheckCircle2, XCircle, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generate, MCQ } from '@/games/generators';
import { useStore } from '@/store/useStore';
import { useSpeak } from '@/hooks/useSpeak';
import { sfx, haptic } from '@/lib/sound';
import { cn } from '@/lib/cn';

const TXT: Record<'he' | 'en', Record<string, string>> = {
  he: {
    title: '🎓 שְׁאֵלָה מִמִּבְחָן אֲמִתִּי',
    sub: '2 שְׁאֵלוֹת בִּרְמָה גְּבוֹהָה',
    questionOf: 'שְׁאֵלָה {n} מִתּוֹךְ 2',
    next: 'הַבָּא ←',
    finish: 'הַמְשֵׁךְ לַתּוֹצָאוֹת',
    correct: '✓ נָכוֹן!',
    wrong: '✗ לֹא נָכוֹן',
    correctIs: 'הַתְּשׁוּבָה הַנְּכוֹנָה הִיא',
    explanation: 'הֶסְבֵּר',
  },
  en: {
    title: '🎓 Real Exam Question',
    sub: '2 higher-level questions',
    questionOf: 'Question {n} of 2',
    next: 'Next →',
    finish: 'Continue to results',
    correct: '✓ Correct!',
    wrong: '✗ Wrong',
    correctIs: 'Correct answer:',
    explanation: 'Explanation',
  },
};

export default function MiniExam({
  gameId,
  age,
  level,
  onComplete,
}: {
  gameId: string;
  age: number;
  level: number;
  onComplete: (correct: number) => void;
}) {
  const locale = useStore((s) => s.locale);
  const bypass = (() => {
    const profiles = useStore.getState().profiles;
    const activeId = useStore.getState().activeProfileId;
    const p = profiles.find((pr) => pr.id === activeId);
    return p?.levelOverride != null;
  })();
  const { speak } = useSpeak();

  const tt = (k: string, params?: Record<string, any>) => {
    let v: string = TXT[locale][k] || k;
    if (params) for (const [pk, pv] of Object.entries(params)) v = v.replace(`{${pk}}`, String(pv));
    return v;
  };

  // Generate 2 questions at slightly harder level (min 5)
  const questions = useMemo<MCQ[]>(() => {
    const examLevel = Math.max(level, 5);
    return [
      generate(gameId, examLevel, age, bypass),
      generate(gameId, examLevel, age, bypass),
    ];
  }, [gameId, level, age, bypass]);

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const q = questions[idx];

  // Auto-advance after 2s when result is shown
  useEffect(() => {
    if (!showResult) return;
    const timer = setTimeout(() => {
      if (idx + 1 >= questions.length) {
        onComplete(correctCount);
      } else {
        setPicked(null);
        setShowResult(false);
        setIdx(idx + 1);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [showResult, idx, questions.length, correctCount, onComplete]);

  const effectiveDir = useMemo<'rtl' | 'ltr'>(() => {
    const hasHebrew = /[\u0590-\u05FF]/.test(q.prompt);
    if (hasHebrew) return 'rtl';
    const onlyNumeric = /^[\d\s+\-×÷=?,.()><]*$/.test(q.prompt.trim());
    if (onlyNumeric) return 'ltr';
    return q.dir;
  }, [q.prompt, q.dir]);

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    haptic();
    const isRight = i === q.correct;
    if (isRight) {
      sfx.correct();
      setCorrectCount((c) => c + 1);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } else {
      sfx.wrong();
    }
    setShowResult(true);
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="card bg-gradient-to-l from-purple-500 to-violet-600 text-white border-0 text-center">
        <GraduationCap className="w-12 h-12 mx-auto mb-2" />
        <div className="font-black text-xl">{tt('title')}</div>
        <div className="text-sm opacity-90">{tt('sub')}</div>
      </div>

      <div className="text-sm font-bold text-slate-500 dark:text-slate-400 text-center">
        {tt('questionOf', { n: idx + 1 })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 40, opacity: 0 }}
          className="card"
        >
          <div className="flex items-start gap-2">
            <div
              dir={effectiveDir}
              className="text-xl sm:text-2xl font-bold leading-relaxed flex-1 mb-4 whitespace-pre-line"
              style={{ unicodeBidi: 'plaintext' }}
            >
              {q.prompt}
            </div>
            <button
              onClick={() => speak(q.prompt, { force: true })}
              aria-label={locale === 'en' ? 'Read aloud' : 'הַקְרָאָה'}
              className="mt-1 p-3 rounded-full bg-brand-50 dark:bg-brand-700/30 text-brand-700 dark:text-brand-100 min-w-[48px] min-h-[48px] flex items-center justify-center"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid gap-3">
            {q.options.map((opt, i) => {
              const isRight = picked !== null && i === q.correct;
              const isWrong = picked === i && i !== q.correct;
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={picked !== null}
                  className={cn(
                    'min-h-[64px] rounded-2xl text-lg font-bold border-2 px-4 text-start transition active:scale-95',
                    picked === null && 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-500',
                    isRight && 'bg-emerald-400 border-emerald-500 text-white animate-pop',
                    isWrong && 'bg-rose-300 border-rose-400 text-white animate-shake',
                    picked !== null && !isRight && !isWrong && 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50'
                  )}
                >
                  <span className="ms-2">{['א', 'ב', 'ג', 'ד'][i]}.</span> {opt}
                </button>
              );
            })}
          </div>

          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'mt-4 p-4 rounded-2xl border-2',
                picked === q.correct
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-900/20 border-rose-300'
              )}
            >
              <div className="flex items-start gap-2">
                {picked === q.correct ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-start">
                  <div className="font-black text-sm mb-1">
                    {picked === q.correct ? tt('correct') : (
                      <>
                        {tt('wrong')} — {tt('correctIs')} <strong>{q.options[q.correct]}</strong>
                      </>
                    )}
                  </div>
                  {q.hintContext && (
                    <div className="text-sm text-slate-600 dark:text-slate-300">{q.hintContext}</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
