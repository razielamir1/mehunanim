import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Volume2, VolumeX, Sun, Moon, Mic, Languages, UserCog, Sparkles, Accessibility as A11yIcon, Users, MessageSquare, Cloud, LogOut } from 'lucide-react';
import { signOutUser, isFirebaseConfigured } from '@/lib/firebase';
import { useT } from '@/i18n';
import { Link } from 'react-router-dom';
import FeedbackModal from '@/components/FeedbackModal';

export default function Settings() {
  const t = useT();
  const soundOn = useStore((s) => s.soundOn);
  const ttsOn = useStore((s) => s.ttsOn);
  const theme = useStore((s) => s.theme);
  const locale = useStore((s) => s.locale);
  const name = useStore((s) => s.name);
  const age = useStore((s) => s.age);
  const city = useStore((s) => s.city);
  const avatar = useStore((s) => s.avatar);
  const toggleSound = useStore((s) => s.toggleSound);
  const toggleTts = useStore((s) => s.toggleTts);
  const setTheme = useStore((s) => s.setTheme);
  const setLocale = useStore((s) => s.setLocale);
  const cloudEmail = useStore((s) => s.cloudEmail);
  const setCloudUser = useStore((s) => s.setCloudUser);
  const [showFeedback, setShowFeedback] = useState(false);

  const onSignOut = async () => {
    await signOutUser();
    setCloudUser(null, null);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-black">{t('settings')}</h1>

      <div className="card space-y-2">
        <h3 className="font-black mb-2">{t('profile')}</h3>
        <div className="flex items-center gap-3">
          <div className="text-4xl">{avatar}</div>
          <div>
            <div className="font-bold">{name || '—'}</div>
            <div className="text-sm text-slate-500">{t('ageLabel')} {age} {city && `• ${city}`}</div>
          </div>
        </div>
      </div>

      <button onClick={toggleSound} className="btn-ghost w-full justify-between">
        <span className="flex items-center gap-2">{soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />} {t('soundOnLabel')}</span>
        <span className="text-sm">{soundOn ? t('soundOnState') : t('soundOffState')}</span>
      </button>

      <button onClick={toggleTts} className="btn-ghost w-full justify-between">
        <span className="flex items-center gap-2"><Mic className="w-5 h-5" /> {t('ttsLabel')}</span>
        <span className="text-sm">{ttsOn ? t('ttsOnState') : t('ttsOffState')}</span>
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

      <Link to="/profiles" className="btn-ghost w-full justify-between">
        <span className="flex items-center gap-2"><Users className="w-5 h-5" /> {t('myKids')}</span>
        <span>›</span>
      </Link>

      {isFirebaseConfigured && (
        cloudEmail ? (
          <div className="card !p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Cloud className="w-5 h-5 text-emerald-500" />
              <span className="font-bold">{t('signedInAs')}:</span>
              <span className="text-slate-500 truncate">{cloudEmail}</span>
            </div>
            <button onClick={onSignOut} className="btn-ghost w-full !min-h-[48px] text-sm text-rose-600">
              <LogOut className="w-4 h-4" /> {t('signOut')}
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn-ghost w-full justify-between">
            <span className="flex items-center gap-2"><Cloud className="w-5 h-5" /> {t('cloudSync')}</span>
            <span>›</span>
          </Link>
        )
      )}

      <Link to="/worlds" className="btn-ghost w-full justify-between">
        <span className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> {t('pickWorld')}</span>
        <span>›</span>
      </Link>

      <Link to="/accessibility" className="btn-ghost w-full justify-between">
        <span className="flex items-center gap-2"><A11yIcon className="w-5 h-5" /> {t('accessibility')}</span>
        <span>›</span>
      </Link>

      <button onClick={() => setShowFeedback(true)} className="btn-ghost w-full justify-between">
        <span className="flex items-center gap-2"><MessageSquare className="w-5 h-5" /> {locale === 'en' ? 'Feedback' : 'משוב'}</span>
        <span>›</span>
      </button>

      <Link to="/parent" className="btn-ghost w-full justify-between">
        <span className="flex items-center gap-2"><UserCog className="w-5 h-5" /> {t('parent')}</span>
        <span>›</span>
      </Link>

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </div>
  );
}
