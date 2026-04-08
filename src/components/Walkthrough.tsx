import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { MCQ } from '@/games/generators';
import { useStore } from '@/store/useStore';

const TXT: Record<'he' | 'en', Record<string, string>> = {
  he: {
    title: 'ככה פותרים את זה',
    correctIs: 'התשובה הנכונה היא',
    wrongLabel: 'לא נכון',
    correctLabel: 'נכון!',
    why: 'למה?',
    cta: 'הבנתי, אני רוצה לנסות לבד!',
    levelLabel: 'רמה',
  },
  en: {
    title: "Here's how to solve it",
    correctIs: 'The correct answer is',
    wrongLabel: 'Wrong',
    correctLabel: 'Correct!',
    why: 'Why?',
    cta: "Got it, let me try!",
    levelLabel: 'Level',
  },
};

// Reasonable per-game wrong-explanations
function whyWrongHe(gameId: string): string {
  switch (gameId) {
    case 'pattern': return 'לא ממשיך את הרצף הנכון.';
    case 'odd': return 'שייך לאותה קבוצה כמו השאר.';
    case 'sequence': return 'לא נובע מהכלל של הרצף.';
    case 'analogy': return 'היחס שונה מהיחס בזוג הראשון.';
    case 'memory': return 'לא נמצא במקום הזה ברצף.';
    case 'math': return 'החישוב לא מסתדר.';
    case 'reading': return 'לא מסתמך על מה שכתוב בקטע.';
    case 'synonym': return 'משמעות שונה מהמילה המבוקשת.';
    case 'idiom': return 'לא הפירוש הנכון של הביטוי.';
    default: return 'לא מתאים לכלל של השאלה.';
  }
}
function whyWrongEn(gameId: string): string {
  switch (gameId) {
    case 'pattern': return "Doesn't continue the right pattern.";
    case 'odd': return 'Belongs to the same group as the others.';
    case 'sequence': return "Doesn't follow the rule.";
    case 'analogy': return 'Different relationship from the first pair.';
    case 'memory': return "Wasn't at that position in the sequence.";
    case 'math': return "The calculation doesn't add up.";
    case 'reading': return "Not based on what the passage says.";
    case 'synonym': return 'Different meaning from the target word.';
    case 'idiom': return "Not the correct meaning of the idiom.";
    default: return "Doesn't fit the question's rule.";
  }
}

export default function Walkthrough({
  q,
  gameId,
  level,
  onContinue,
}: {
  q: MCQ;
  gameId: string;
  level: number;
  onContinue: () => void;
}) {
  const locale = useStore((s) => s.locale);
  const tt = (k: string) => TXT[locale][k] || k;
  const why = locale === 'en' ? whyWrongEn : whyWrongHe;
  const isHe = locale === 'he';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto p-4 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card max-w-2xl w-full my-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-gradient-to-br from-amber-400 to-pink-500 text-white rounded-full px-3 py-1 text-sm font-black">
            🎓 {tt('title')} ({tt('levelLabel')} {level})
          </div>
        </div>

        <div
          dir={q.dir}
          className="text-2xl sm:text-3xl font-black my-4 leading-relaxed whitespace-pre-line"
          style={{ unicodeBidi: 'plaintext' }}
        >
          {q.prompt}
        </div>

        <div className="grid gap-3">
          {q.options.map((opt, i) => {
            const isCorrect = i === q.correct;
            return (
              <div
                key={i}
                className={`rounded-2xl border-2 p-4 ${
                  isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 opacity-70'
                }`}
              >
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-black text-lg" dir="auto">{opt}</div>
                    <div className="text-xs mt-1 text-slate-600 dark:text-slate-400" dir="auto">
                      {isCorrect ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                          {tt('correctLabel')} {q.hintContext && `— ${q.hintContext}`}
                        </span>
                      ) : (
                        <>
                          <span className="font-bold">{tt('wrongLabel')}: </span>
                          {why(gameId)}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={onContinue} className="btn-primary w-full mt-5 text-lg">
          {tt('cta')}
          {isHe ? <ArrowRight className="w-5 h-5 rotate-180" /> : <ArrowRight className="w-5 h-5" />}
        </button>
      </motion.div>
    </div>
  );
}
