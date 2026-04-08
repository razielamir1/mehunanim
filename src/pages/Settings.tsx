import { useStore } from '@/store/useStore';
import { Volume2, VolumeX, Sun, Moon, Mic, Languages, UserCog } from 'lucide-react';
import { useT } from '@/i18n';
import { Link } from 'react-router-dom';

export default function Settings() {
  const t = useT();
  const { soundOn, ttsOn, theme, locale, name, age, city, avatar } = useStore();
  const toggleSound = useStore((s) => s.toggleSound);
  const toggleTts = useStore((s) => s.toggleTts);
  const setTheme = useStore((s) => s.setTheme);
  const setLocale = useStore((s) => s.setLocale);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-black">{t('settings')}</h1>

      <div className="card space-y-2">
        <h3 className="font-black mb-2">{t('profile')}</h3>
        <div className="flex items-center gap-3">
          <div className="text-4xl">{avatar}</div>
          <div>
            <div className="font-bold">{name || '—'}</div>
            <div className="text-sm text-slate-500">גיל {age} {city && `• ${city}`}</div>
          </div>
        </div>
      </div>

      <button onClick={toggleSound} className="btn-ghost w-full justify-between">
        <span className="flex items-center gap-2">{soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />} צלילים</span>
        <span className="text-sm">{soundOn ? 'פועלים' : 'כבויים'}</span>
      </button>

      <button onClick={toggleTts} className="btn-ghost w-full justify-between">
        <span className="flex items-center gap-2"><Mic className="w-5 h-5" /> {t('tts')}</span>
        <span className="text-sm">{ttsOn ? 'פועלת' : 'כבויה'}</span>
      </button>

      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="btn-ghost w-full justify-between"
      >
        <span className="flex items-center gap-2">{theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />} {t('theme')}</span>
        <span className="text-sm">{theme === 'dark' ? t('themeDark') : t('themeLight')}</span>
      </button>

      <button
        onClick={() => setLocale(locale === 'he' ? 'en' : 'he')}
        className="btn-ghost w-full justify-between"
      >
        <span className="flex items-center gap-2"><Languages className="w-5 h-5" /> {t('language')}</span>
        <span className="text-sm">{locale === 'he' ? 'עברית' : 'English'}</span>
      </button>

      <Link to="/parent" className="btn-ghost w-full justify-between">
        <span className="flex items-center gap-2"><UserCog className="w-5 h-5" /> {t('parent')}</span>
        <span>›</span>
      </Link>
    </div>
  );
}
