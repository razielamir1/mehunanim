import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, GraduationCap, Lightbulb, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MOCK_EXAMS, getMockExam, MockExam as MockExamType, ExamQ } from '@/content/mockExams';
import { useStore } from '@/store/useStore';
import { useT } from '@/i18n';
import { useSpeak } from '@/hooks/useSpeak';
import { sfx, haptic } from '@/lib/sound';
import { cn } from '@/lib/cn';

// Localized field accessors
const Q = (q: ExamQ, locale: 'he' | 'en') => ({
  prompt: locale === 'en' && q.promptEn ? q.promptEn : q.prompt,
  options: locale === 'en' && q.optionsEn ? q.optionsEn : q.options,
  explanation: locale === 'en' && q.explanationEn ? q.explanationEn : q.explanation,
  guidance: locale === 'en' && q.guidanceEn ? q.guidanceEn : q.guidance,
  dir: locale === 'en' ? ('ltr' as const) : q.dir,
});

const ExamTitle = (e: MockExamType, locale: 'he' | 'en') => locale === 'en' ? e.titleEn : e.title;
const ExamDesc = (e: MockExamType, locale: 'he' | 'en') => locale === 'en' ? e.descriptionEn : e.description;

export default function MockExam() {
  const t = useT();
  const locale = useStore((s) => s.locale);
  const age = useStore((s) => s.age);
  const [params, setParams] = useSearchParams();
  const examId = params.get('exam');
  const exam = useMemo(() => examId ? getMockExam(examId) : null, [examId]);

  // Age gate — recommended 7+
  if (age < 7) {
    return (
      <div className="card max-w-md mx-auto mt-10 text-center space-y-4">
        <GraduationCap className="w-16 h-16 text-amber-500 mx-auto" />
        <h2 className="text-2xl font-black">{t('mockExamTitle')}</h2>
        <p className="text-slate-600 dark:text-slate-300">{t('mockExamAgeGate')}</p>
        <p className="text-sm text-slate-500">{t('mockExamAgeNow', { age })}</p>
        <Link to="/dashboard" className="btn-primary w-full">{t('backHome')}</Link>
      </div>
    );
  }

  // Exam picker
  if (!exam) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black">{t('mockExamTitle')}</h1>
          <Link to="/dashboard" aria-label={t('back')} className="btn-ghost !min-h-[48px] !px-4 !py-2 text-sm">
            <ArrowRight className="w-4 h-4" /> {t('back')}
          </Link>
        </div>
        <p className="text-slate-600 dark:text-slate-300">{t('mockExamIntro')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_EXAMS.map((e, i) => (
            <motion.button
              key={e.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => { sfx.tap(); haptic(); setParams({ exam: e.id }); }}
              className="card text-start min-h-[140px] active:scale-95 transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="w-8 h-8 text-brand-500" />
                <div className="font-black text-xl">{ExamTitle(e, locale)}</div>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{ExamDesc(e, locale)}</div>
              <div className="text-xs text-slate-500 mt-2">
                {e.questions.length} {locale === 'en' ? 'questions' : 'שאלות'} • {Math.round(e.timeLimitSec / 60)} {locale === 'en' ? 'min' : 'דקות'}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return <RunningExam exam={exam} onExit={() => setParams({})} />;
}

function RunningExam({ exam, onExit }: { exam: MockExamType; onExit: () => void }) {
  const t = useT();
  const locale = useStore((s) => s.locale);
  const { speak } = useSpeak();
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(exam.timeLimitSec);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);

  useEffect(() => {
    if (!started || done) return;
    const id = setInterval(() => {
      setTimeLeft((tt) => {
        if (tt <= 1) { setDone(true); return 0; }
        return tt - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, done]);

  const correctCount = useMemo(
    () => exam.questions.reduce((sum, q) => sum + (picks[q.id] === q.correct ? 1 : 0), 0),
    [exam, picks]
  );

  const finish = () => {
    setDone(true);
    sfx.fanfare();
    confetti({ particleCount: 200, spread: 160, origin: { y: 0.5 } });
  };

  const choose = (i: number) => {
    sfx.tap(); haptic();
    setPicks({ ...picks, [exam.questions[idx].id]: i });
  };

  const next = () => {
    setShowGuidance(false);
    if (idx + 1 >= exam.questions.length) finish();
    else setIdx(idx + 1);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (!started) {
    return (
      <div className="card max-w-md mx-auto mt-10 text-center space-y-4">
        <GraduationCap className="w-16 h-16 text-brand-500 mx-auto" />
        <h2 className="text-3xl font-black">{locale === 'en' ? exam.titleEn : exam.title}</h2>
        <p className="text-slate-600 dark:text-slate-300">{locale === 'en' ? exam.descriptionEn : exam.description}</p>
        <p className="text-sm text-slate-500">{t('mockExamFormat')}</p>
        <p className="text-sm text-slate-500">{t('mockExamFooter')}</p>
        <button onClick={() => setStarted(true)} className="btn-primary w-full">{t('mockExamStart')}</button>
        <button onClick={onExit} className="btn-ghost w-full">{t('mockExamLater')}</button>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((correctCount / exam.questions.length) * 100);
    return (
      <div className="space-y-5">
        <div className="card text-center">
          <h1 className="text-3xl font-black mb-2">{t('mockExamDone')}</h1>
          <div className="text-6xl font-black my-4 bg-gradient-to-l from-indigo-500 to-pink-500 bg-clip-text text-transparent">
            {correctCount} / {exam.questions.length}
          </div>
          <div className="text-lg text-slate-600 dark:text-slate-300">{pct}%</div>
          <div className="mt-4 text-sm text-slate-500">
            {pct >= 80 ? t('mockExamReady') : pct >= 60 ? t('mockExamGood') : t('mockExamPractice')}
          </div>
        </div>

        <div className="card">
          <h2 className="font-black mb-3">{t('mockExamReview')}</h2>
          <div className="space-y-3">
            {exam.questions.map((q, i) => {
              const local = Q(q, locale);
              const pick = picks[q.id];
              const isRight = pick === q.correct;
              return (
                <div key={q.id} className={cn('p-3 rounded-2xl border-2', isRight ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-rose-300 bg-rose-50 dark:bg-rose-900/20')}>
                  <div className="font-bold text-sm mb-1">{t('mockExamQ', { n: i + 1 })} {isRight ? '✓' : '✗'}</div>
                  <div className="text-sm whitespace-pre-line" dir={local.dir}>{local.prompt}</div>
                  <div className="text-xs text-slate-500 mt-2">
                    {t('mockExamCorrect')}: <strong>{local.options[q.correct]}</strong>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">{local.explanation}</div>
                </div>
              );
            })}
          </div>
        </div>

        <Link to="/dashboard" className="btn-primary w-full">{t('backHome')}</Link>
      </div>
    );
  }

  const q = exam.questions[idx];
  const local = Q(q, locale);
  const picked = picks[q.id];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onExit} aria-label={t('mockExamExit')} className="btn-ghost !min-h-[48px] !px-4 !py-2 text-sm">
          <ArrowRight className="w-4 h-4" /> {t('mockExamExit')}
        </button>
        <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full px-4 py-2 font-black">
          <Clock className="w-5 h-5" /> {fmt(timeLeft)}
        </div>
        <div className="text-sm font-bold text-slate-500 dark:text-slate-400">{idx + 1}/{exam.questions.length}</div>
      </div>

      <div className="h-3 bg-white dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
        <motion.div className="h-full bg-gradient-to-l from-indigo-500 to-pink-500" animate={{ width: `${((idx + 1) / exam.questions.length) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={q.id} initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} className="card">
          <div className="text-xs font-bold text-brand-600 mb-2">
            {q.category === 'verbal' && t('partVerbal')}
            {q.category === 'math' && t('partMath')}
            {q.category === 'shapes' && t('partShapes')}
          </div>
          <div className="flex items-start gap-2">
            <div dir={local.dir} className="text-xl sm:text-2xl font-bold leading-relaxed mb-5 flex-1 whitespace-pre-line">{local.prompt}</div>
            <button
              onClick={() => speak(local.prompt, { force: true })}
              aria-label={t('speakBtn')}
              className="mt-1 p-3 rounded-full bg-brand-50 dark:bg-brand-700/30 text-brand-700 dark:text-brand-100 min-w-[48px] min-h-[48px] flex items-center justify-center"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
          <div className="grid gap-3">
            {local.options.map((opt, i) => (
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

          <button
            onClick={() => setShowGuidance((s) => !s)}
            className="mt-4 text-sm text-brand-600 dark:text-brand-300 font-bold flex items-center gap-1"
          >
            <Lightbulb className="w-4 h-4" />
            {showGuidance ? (locale === 'en' ? 'Hide guidance' : 'הסתר ליווי') : (locale === 'en' ? 'Show guidance' : 'הראה ליווי')}
          </button>

          {showGuidance && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700"
            >
              <div className="flex gap-2 items-start text-sm">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-start" dir={local.dir}>{local.guidance}</div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <button
        onClick={next}
        disabled={picked === undefined}
        className="btn-primary w-full disabled:opacity-40"
      >
        {idx + 1 >= exam.questions.length ? t('mockExamFinish') : t('mockExamNext')}
      </button>
    </div>
  );
}
