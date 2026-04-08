import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, GraduationCap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MOCK_EXAM, MOCK_TIME_LIMIT_SEC, MockQ } from '@/content/mockExam';
import { useStore } from '@/store/useStore';
import { sfx, haptic } from '@/lib/sound';
import { cn } from '@/lib/cn';

// Shuffle once on mount, take 10 questions
const sample = (n: number): MockQ[] => {
  const a = [...MOCK_EXAM];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
};

export default function MockExam() {
  const age = useStore((s) => s.age);
  const [questions] = useState(() => sample(10));
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(MOCK_TIME_LIMIT_SEC);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  // Age gate — recommended 7+
  if (age < 7) {
    return (
      <div className="card max-w-md mx-auto mt-10 text-center space-y-4">
        <GraduationCap className="w-16 h-16 text-amber-500 mx-auto" />
        <h2 className="text-2xl font-black">מבחן סימולציה</h2>
        <p className="text-slate-600 dark:text-slate-300">
          המבחן הזה מותאם לילדים בגילאי 7-8 לקראת מבחן המחוננים בסוף כיתה ב'.
        </p>
        <p className="text-sm text-slate-500">הילד שלך כעת בן {age}. כדאי לתרגל קודם במשחקים הרגילים.</p>
        <Link to="/dashboard" className="btn-primary w-full">חזרה לבית</Link>
      </div>
    );
  }

  useEffect(() => {
    if (!started || done) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { setDone(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, done]);

  const correctCount = useMemo(
    () => questions.reduce((sum, q) => sum + (picks[q.id] === q.correct ? 1 : 0), 0),
    [questions, picks]
  );

  const finish = () => {
    setDone(true);
    sfx.fanfare();
    confetti({ particleCount: 200, spread: 160, origin: { y: 0.5 } });
  };

  const choose = (i: number) => {
    sfx.tap(); haptic();
    setPicks({ ...picks, [questions[idx].id]: i });
  };

  const next = () => {
    if (idx + 1 >= questions.length) finish();
    else setIdx(idx + 1);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (!started) {
    return (
      <div className="card max-w-md mx-auto mt-10 text-center space-y-4">
        <GraduationCap className="w-16 h-16 text-brand-500 mx-auto" />
        <h2 className="text-3xl font-black">מבחן סימולציה</h2>
        <p className="text-slate-600 dark:text-slate-300">
          סימולציה של מבחן המחוננים האמיתי לכיתה ב'. <br />
          <strong>10 שאלות</strong> • <strong>25 דקות</strong> • ללא רמזים, ללא הסברים תוך כדי
        </p>
        <p className="text-sm text-slate-500">בסיום תקבל ציון, ניתוח פרטני, והסברים מהיועצת.</p>
        <button onClick={() => setStarted(true)} className="btn-primary w-full">התחל מבחן</button>
        <Link to="/dashboard" className="btn-ghost w-full">לא עכשיו</Link>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="space-y-5">
        <div className="card text-center">
          <h1 className="text-3xl font-black mb-2">סיימת! 🎓</h1>
          <div className="text-6xl font-black my-4 bg-gradient-to-l from-indigo-500 to-pink-500 bg-clip-text text-transparent">
            {correctCount} / {questions.length}
          </div>
          <div className="text-lg text-slate-600 dark:text-slate-300">{pct}%</div>
          <div className="mt-4 text-sm text-slate-500">
            {pct >= 80 ? '🌟 מצוין! מוכן למבחן' : pct >= 60 ? '👍 התקדמות יפה' : '💪 כדאי להמשיך לתרגל'}
          </div>
        </div>

        <div className="card">
          <h2 className="font-black mb-3">פירוט תשובות</h2>
          <div className="space-y-3">
            {questions.map((q, i) => {
              const pick = picks[q.id];
              const isRight = pick === q.correct;
              return (
                <div key={q.id} className={cn('p-3 rounded-2xl border-2', isRight ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-rose-300 bg-rose-50 dark:bg-rose-900/20')}>
                  <div className="font-bold text-sm mb-1">שאלה {i + 1} {isRight ? '✓' : '✗'}</div>
                  <div className="text-sm whitespace-pre-line" dir={q.dir}>{q.prompt}</div>
                  <div className="text-xs text-slate-500 mt-2">
                    תשובה נכונה: <strong>{q.options[q.correct]}</strong>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">{q.explanation}</div>
                </div>
              );
            })}
          </div>
        </div>

        <Link to="/dashboard" className="btn-primary w-full">חזרה לבית</Link>
      </div>
    );
  }

  const q = questions[idx];
  const picked = picks[q.id];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" aria-label="צא מהמבחן" className="btn-ghost !min-h-[48px] !px-4 !py-2 text-sm">
          <ArrowRight className="w-4 h-4" /> צא
        </Link>
        <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full px-4 py-2 font-black">
          <Clock className="w-5 h-5" /> {fmt(timeLeft)}
        </div>
        <div className="text-sm font-bold text-slate-500 dark:text-slate-400">{idx + 1}/{questions.length}</div>
      </div>

      <div className="h-3 bg-white dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
        <motion.div className="h-full bg-gradient-to-l from-indigo-500 to-pink-500" animate={{ width: `${((idx + 1) / questions.length) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={q.id} initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} className="card">
          <div className="text-xs font-bold text-brand-600 mb-2">
            {q.category === 'verbal' && '📝 חלק מילולי'}
            {q.category === 'math' && '🧮 חלק חשבון'}
            {q.category === 'shapes' && '🔷 חלק צורות'}
          </div>
          <div dir={q.dir} className="text-xl sm:text-2xl font-bold leading-relaxed mb-5">{q.prompt}</div>
          <div className="grid gap-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => choose(i)}
                className={cn(
                  'min-h-[64px] rounded-2xl text-lg font-bold border-2 px-4 text-start transition active:scale-95',
                  picked === i ? 'bg-brand-500 text-white border-brand-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-500'
                )}
              >
                <span className="ms-2">{['א', 'ב', 'ג', 'ד'][i]}.</span> {opt}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={next}
        disabled={picked === undefined}
        className="btn-primary w-full disabled:opacity-40"
      >
        {idx + 1 >= questions.length ? 'סיים מבחן' : 'הבא ←'}
      </button>
    </div>
  );
}
