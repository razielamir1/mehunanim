import { useStore, FontSize } from '@/store/useStore';
import { Type, Contrast, Zap, BookOpen, Link as LinkIcon, RotateCcw } from 'lucide-react';

const SECTIONS: Array<{
  key: keyof ReturnType<typeof useStore.getState>['a11y'];
  label: string;
  desc: string;
  icon: any;
}> = [
  { key: 'highContrast', label: 'ניגודיות גבוהה', desc: 'רקע שחור וטקסט לבן בולט', icon: Contrast },
  { key: 'reduceMotion', label: 'הפחתת אנימציות', desc: 'מבטל תנועות וקונפטי', icon: Zap },
  { key: 'dyslexiaFont', label: 'גופן ידידותי לדיסלקציה', desc: 'מרווחים גדולים יותר וגופן קריא', icon: BookOpen },
  { key: 'underlineLinks', label: 'קו תחתון לקישורים', desc: 'הדגשת קישורים בכל האתר', icon: LinkIcon },
];

export default function Accessibility() {
  const a11y = useStore((s) => s.a11y);
  const setA11y = useStore((s) => s.setA11y);

  const sizes: { v: FontSize; label: string; cls: string }[] = [
    { v: 'normal', label: 'רגיל', cls: 'text-base' },
    { v: 'large', label: 'גדול', cls: 'text-lg' },
    { v: 'xlarge', label: 'ענק', cls: 'text-2xl' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black">נגישות</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">התאם את האתר ליכולות שלך</p>
      </div>

      <div className="card">
        <h2 className="font-black mb-3 flex items-center gap-2">
          <Type className="w-5 h-5" /> גודל טקסט
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {sizes.map((s) => (
            <button
              key={s.v}
              onClick={() => setA11y({ fontSize: s.v })}
              aria-pressed={a11y.fontSize === s.v}
              className={`min-h-[64px] rounded-2xl border-2 font-bold ${s.cls} transition ${
                a11y.fontSize === s.v
                  ? 'bg-gradient-to-l from-indigo-500 to-pink-500 text-white border-transparent shadow-lg'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {SECTIONS.map(({ key, label, desc, icon: Icon }) => (
        <button
          key={key as string}
          onClick={() => setA11y({ [key]: !a11y[key] } as any)}
          aria-pressed={!!a11y[key]}
          className="card w-full text-start flex items-center gap-4 active:scale-[0.98] transition"
        >
          <Icon className="w-7 h-7 text-brand-500 shrink-0" />
          <div className="flex-1">
            <div className="font-black">{label}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{desc}</div>
          </div>
          <div
            className={`w-14 h-8 rounded-full transition relative ${
              a11y[key] ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
            aria-hidden="true"
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${
                a11y[key] ? 'start-7' : 'start-1'
              }`}
            />
          </div>
        </button>
      ))}

      <button
        onClick={() =>
          setA11y({ fontSize: 'normal', highContrast: false, reduceMotion: false, dyslexiaFont: false, underlineLinks: false })
        }
        className="btn-ghost w-full"
      >
        <RotateCcw className="w-5 h-5" /> איפוס נגישות
      </button>

      <div className="card text-sm text-slate-600 dark:text-slate-300">
        <p className="font-bold mb-1">הצהרת נגישות</p>
        <p>
          האתר תוכנן לפי תקן WCAG 2.1 AA: ניווט מקלדת מלא, ניגודיות גבוהה, גדלי טקסט מתכווננים, תגיות ARIA, ושמירה על העדפת
          המערכת `prefers-reduced-motion`.
        </p>
      </div>
    </div>
  );
}
