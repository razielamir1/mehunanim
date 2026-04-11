import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, CheckCircle2, XCircle, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MOCK_EXAMS, ExamQ, ExamCategory } from '@/content/mockExams';
import { useStore } from '@/store/useStore';
import { useSpeak } from '@/hooks/useSpeak';
import { sfx, haptic } from '@/lib/sound';
import { cn } from '@/lib/cn';

const TXT: Record<'he' | 'en', Record<string, string>> = {
  he: {
    title: '🎓 שאלות בונוס מהמבחן האמיתי!',
    sub: '2 שאלות נוספות בסגנון מבחן',
    questionOf: 'שאלה {n} מתוך 2',
    next: 'הבא ←',
    finish: 'סיים בונוס',
    correct: '✓ נכון!',
    wrong: '✗ לא נכון',
    correctIs: 'התשובה הנכונה היא',
    explanation: 'הסבר',
  },
  en: {
    title: '🎓 Bonus questions from the real exam!',
    sub: '2 more exam-style questions',
    questionOf: 'Question {n} of 2',
    next: 'Next →',
    finish: 'Finish bonus',
    correct: '✓ Correct!',
    wrong: '✗ Wrong',
    correctIs: 'Correct answer:',
    explanation: 'Explanation',
  },
};

// Map game IDs to exam categories that test similar skills
const GAME_TO_CATEGORY: Record<string, ExamCategory> = {
  pattern: 'shapes',
  memory: 'shapes',
  odd: 'verbal',
  analogy: 'verbal',
  synonym: 'verbal',
  idiom: 'verbal',
  reading: 'verbal',
  sequence: 'math',
  math: 'math',
  trivia: 'verbal',
  inequality: 'math',
};

function pickBonusQuestions(gameId: string): ExamQ[] {
  const cat = GAME_TO_CATEGORY[gameId] ?? 'verbal';
  // Pull all questions from all 5 mock exams matching the category
  const all = MOCK_EXAMS.flatMap((e) => e.questions).filter((q) => q.category === cat);
  // Shuffle and pick 2
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

const Q = (q: ExamQ, locale: 'he' | 'en') => ({
  prompt: locale === 'en' && q.promptEn ? q.promptEn : q.prompt,
  options: locale === 'en' && q.optionsEn ? q.optionsEn : q.options,
  explanation: locale === 'en' && q.explanationEn ? q.explanationEn : q.explanation,
  dir: locale === 'en' ? ('ltr' as const) : q.dir,
});

export default function BonusRound({
  gameId,
  onComplete,
}: {
  gameId: string;
  onComplete: (bonusCorrect: number) => void;
}) {
  const locale = useStore((s) => s.locale);
  const addStar = useStore((s) => s.addStar);
  const tt = (k: string, params?: Record<string, any>) => {
    let v: string = TXT[locale][k] || k;
    if (params) for (const [pk, pv] of Object.entries(params)) v = v.replace(`{${pk}}`, String(pv));
    return v;
  };
  const { speak } = useSpeak();
  const questions = useMemo(() => pickBonusQuestions(gameId), [gameId]);
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [showExplain, setShowExplain] = useState(false);

  if (questions.length === 0) {
    // No matching content — skip bonus
    onComplete(0);
    return null;
  }

  const q = questions[idx];
  const local = Q(q, locale);
  const picked = picks[q.id];
  const isCorrect = picked === q.correct;

  const choose = (i: number) => {
    if (picked !== undefined) return;
    sfx.tap(); haptic();
    setPicks({ ...picks, [q.id]: i });
    if (i === q.correct) {
      sfx.correct();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } else {
      sfx.wrong();
    }
    setShowExplain(true);
  };

  const next = () => {
    setShowExplain(false);
    if (idx + 1 >= questions.length) {
      const correct = questions.reduce((sum, qq) => sum + (picks[qq.id] === qq.correct ? 1 : 0), 0);
      // Bonus rewards
      if (correct === questions.length) {
        addStar(5);
        sfx.fanfare();
        confetti({ particleCount: 200, spread: 160, origin: { y: 0.5 } });
      }
      onComplete(correct);
    } else {
      setIdx(idx + 1);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="card bg-gradient-to-l from-amber-400 to-orange-500 text-white border-0 text-center">
        <GraduationCap className="w-12 h-12 mx-auto mb-2" />
        <div className="font-black text-xl">{tt('title')}</div>
        <div className="text-sm opacity-90">{tt('sub')}</div>
      </div>

      <div className="text-sm font-bold text-slate-500 dark:text-slate-400 text-center">
        {tt('questionOf', { n: idx + 1 })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 40, opacity: 0 }}
          className="card"
        >
          <div className="flex items-start gap-2">
            <div
              dir={local.dir}
              className="text-xl sm:text-2xl font-bold leading-relaxed flex-1 mb-4 whitespace-pre-line"
              style={{ unicodeBidi: 'plaintext' }}
            >
              {local.prompt}
            </div>
            <button
              onClick={() => speak(local.prompt, { force: true })}
              aria-label="Read aloud"
              className="mt-1 p-3 rounded-full bg-brand-50 dark:bg-brand-700/30 text-brand-700 dark:text-brand-100 min-w-[48px] min-h-[48px] flex items-center justify-center"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid gap-3">
            {local.options.map((opt, i) => {
              const isRight = picked !== undefined && i === q.correct;
              const isWrong = picked === i && i !== q.correct;
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={picked !== undefined}
                  className={cn(
                    'min-h-[64px] rounded-2xl text-lg font-bold border-2 px-4 text-start transition active:scale-95',
                    picked === undefined && 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-500',
                    isRight && 'bg-emerald-400 border-emerald-500 text-white animate-pop',
                    isWrong && 'bg-rose-300 border-rose-400 text-white animate-shake',
                    picked !== undefined && !isRight && !isWrong && 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50'
                  )}
                >
                  <span className="ms-2">{['א', 'ב', 'ג', 'ד'][i]}.</span> {opt}
                </button>
              );
            })}
          </div>

          {showExplain && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'mt-4 p-4 rounded-2xl border-2',
                isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-900/20 border-rose-300'
              )}
            >
              <div className="flex items-start gap-2">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-start">
                  <div className="font-black text-sm mb-1">
                    {isCorrect ? tt('correct') : (
                      <>
                        {tt('wrong')} — {tt('correctIs')} <strong>{local.options[q.correct]}</strong>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">{local.explanation}</div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {showExplain && (
        <button onClick={next} className="btn-primary w-full">
          {idx + 1 >= questions.length ? tt('finish') : tt('next')}
        </button>
      )}
    </div>
  );
}
