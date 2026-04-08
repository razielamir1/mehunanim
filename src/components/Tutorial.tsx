import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Sparkles, Target, GraduationCap, Heart } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useT } from '@/i18n';

type Slide = {
  icon: any;
  titleKey: string;
  bodyKey: string;
};

const SLIDES: Slide[] = [
  { icon: Sparkles, titleKey: 'tut1Title', bodyKey: 'tut1Body' },
  { icon: Target, titleKey: 'tut2Title', bodyKey: 'tut2Body' },
  { icon: GraduationCap, titleKey: 'tut3Title', bodyKey: 'tut3Body' },
  { icon: Heart, titleKey: 'tut4Title', bodyKey: 'tut4Body' },
];

// Tutorial dictionary additions (loaded inline to avoid expanding i18n key types)
const TUT_TEXT: Record<'he' | 'en', Record<string, string>> = {
  he: {
    tut1Title: 'ברוכים הבאים! 🦉',
    tut1Body: 'מחוננים היא פלטפורמה אינטראקטיבית להכנת ילדים למבחני המחוננים. לומדים דרך משחקים, ברמה שמתאימה בדיוק לגיל של הילד.',
    tut2Title: 'איך זה עובד?',
    tut2Body: 'בוחרים גיל ומקבלים משחקים מותאמים: חישוב, מילים, רצפים, זיכרון ועוד. כל הצלחה מקדמת רמה. אין לחץ — קצב אישי לכל ילד.',
    tut3Title: 'מבחן סימולציה',
    tut3Body: 'מגיל 7 פתוח גם מבחן סימולציה אמיתי, עם 5 גרסאות שונות, ליווי מלא, והסברים פדגוגיים אחרי כל שאלה.',
    tut4Title: 'יש לכם הערות?',
    tut4Body: 'נשמח לשמוע איך אפשר להשתפר! יש כפתור משוב בהגדרות בכל זמן. בהצלחה!',
    next: 'הבא',
    prev: 'הקודם',
    skip: 'דלג',
    start: 'בואו נתחיל!',
    close: 'סגור',
  },
  en: {
    tut1Title: 'Welcome! 🦉',
    tut1Body: 'Mehunanim is an interactive platform to prepare kids for gifted exams. Learn through games at exactly the right level for your child\'s age.',
    tut2Title: 'How does it work?',
    tut2Body: "Pick an age and get tailored games: math, words, sequences, memory, and more. Every success unlocks a level. No pressure — your child's own pace.",
    tut3Title: 'Mock Exam',
    tut3Body: 'From age 7, a real mock exam is available with 5 different versions, full guidance, and pedagogical explanations after every question.',
    tut4Title: 'Got feedback?',
    tut4Body: 'We\'d love to hear how we can improve! There\'s a feedback button in settings anytime. Good luck!',
    next: 'Next',
    prev: 'Back',
    skip: 'Skip',
    start: "Let's begin!",
    close: 'Close',
  },
};

export default function Tutorial({ onClose }: { onClose: () => void }) {
  const locale = useStore((s) => s.locale);
  const tt = (k: string) => TUT_TEXT[locale][k] || k;
  const _ = useT(); void _;
  const [step, setStep] = useState(0);
  const isLast = step === SLIDES.length - 1;

  const next = () => isLast ? onClose() : setStep(step + 1);
  const prev = () => setStep(Math.max(0, step - 1));

  const slide = SLIDES[step];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card max-w-md w-full text-center relative"
      >
        <button
          onClick={onClose}
          aria-label={tt('close')}
          className="absolute top-3 end-3 text-slate-400 hover:text-slate-600 p-2"
        >
          <X className="w-5 h-5" />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="py-6"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Icon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-3">{tt(slide.titleKey)}</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{tt(slide.bodyKey)}</p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-2 mb-4">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition ${i === step ? 'bg-brand-500 w-8' : 'bg-slate-300 dark:bg-slate-700'}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          {step > 0 && (
            <button onClick={prev} className="btn-ghost flex-1 !min-h-[52px]">
              {locale === 'he' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              {tt('prev')}
            </button>
          )}
          {!isLast && (
            <button onClick={onClose} className="btn-ghost flex-1 !min-h-[52px] text-sm">{tt('skip')}</button>
          )}
          <button onClick={next} className="btn-primary flex-1 !min-h-[52px]">
            {isLast ? tt('start') : tt('next')}
            {!isLast && (locale === 'he' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />)}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
