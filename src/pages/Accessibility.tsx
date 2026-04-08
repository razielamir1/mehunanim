import { useStore, FontSize } from '@/store/useStore';
import { Type, Contrast, Zap, BookOpen, Link as LinkIcon, RotateCcw } from 'lucide-react';
import { useT } from '@/i18n';

export default function Accessibility() {
  const t = useT();
  const a11y = useStore((s) => s.a11y);
  const setA11y = useStore((s) => s.setA11y);

  const sizes: { v: FontSize; label: string; cls: string }[] = [
    { v: 'normal', label: t('fontNormal'), cls: 'text-base' },
    { v: 'large', label: t('fontLarge'), cls: 'text-lg' },
    { v: 'xlarge', label: t('fontXLarge'), cls: 'text-2xl' },
  ];

  const sections: Array<{
    key: keyof ReturnType<typeof useStore.getState>['a11y'];
    label: string;
    desc: string;
    icon: typeof Contrast;
  }> = [
    { key: 'highContrast', label: t('highContrast'), desc: t('highContrastDesc'), icon: Contrast },
    { key: 'reduceMotion', label: t('reduceMotion'), desc: t('reduceMotionDesc'), icon: Zap },
    { key: 'dyslexiaFont', label: t('dyslexiaFont'), desc: t('dyslexiaFontDesc'), icon: BookOpen },
    { key: 'underlineLinks', label: t('underlineLinks'), desc: t('underlineLinksDesc'), icon: LinkIcon },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black">{t('a11yTitle')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('a11ySub')}</p>
      </div>

      <div className="card">
        <h2 className="font-black mb-3 flex items-center gap-2">
          <Type className="w-5 h-5" /> {t('fontSize')}
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

      {sections.map(({ key, label, desc, icon: Icon }) => (
        <button
          key={key as string}
          onClick={() => setA11y({ [key]: !a11y[key] } as any)}
          aria-pressed={!!a11y[key]}
          className="card w-full text-start flex items-center gap-4 active:scale-[0.98] transition min-h-[88px]"
        >
          <Icon className="w-7 h-7 text-brand-500 shrink-0" />
          <div className="flex-1">
            <div className="font-black">{label}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{desc}</div>
          </div>
          <div
            className={`w-16 h-9 rounded-full transition relative ${
              a11y[key] ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
            aria-hidden="true"
          >
            <div
              className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow transition-all ${
                a11y[key] ? 'start-8' : 'start-1'
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
        <RotateCcw className="w-5 h-5" /> {t('a11yReset')}
      </button>

      <div className="card text-sm text-slate-600 dark:text-slate-300">
        <p className="font-bold mb-1">{t('a11yStatement')}</p>
        <p>{t('a11yStatementBody')}</p>
      </div>
    </div>
  );
}
