import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Cloud, CheckCircle2, ArrowRight } from 'lucide-react';
import {
  isFirebaseConfigured,
  sendMagicLink,
  isMagicLinkInUrl,
  completeMagicLinkSignIn,
  syncProfilesDown,
} from '@/lib/firebase';
import { useStore } from '@/store/useStore';

const TXT: Record<'he' | 'en', Record<string, string>> = {
  he: {
    title: 'סנכרון בענן',
    sub: 'שמור את הפרופילים שלך כדי לחזור אליהם מכל מכשיר',
    emailLabel: 'הזן את האימייל שלך',
    emailPh: 'parent@example.com',
    sendBtn: 'שלח קישור כניסה',
    sending: 'שולח...',
    sent: 'הקישור נשלח! בדוק את האימייל שלך ולחץ על הקישור כדי להיכנס.',
    finishing: 'מסיים כניסה...',
    success: 'נכנסת בהצלחה! 🎉',
    failed: 'הכניסה נכשלה. נסה שוב.',
    notConfigured: 'סנכרון בענן עדיין לא הוגדר באתר.',
    back: 'חזרה',
    benefit1: '✨ פרופילים מסונכרנים בכל המכשירים',
    benefit2: '🔒 פרטי, מאובטח, ולא נשלח לשום מקום נוסף',
    benefit3: '💾 גיבוי אוטומטי של כל ההתקדמות',
    privacy: 'כניסה דרך קישור באימייל בלבד — אין סיסמאות. רק האימייל שלך נשמר אצלנו.',
  },
  en: {
    title: 'Cloud sync',
    sub: 'Save your profiles to access them from any device',
    emailLabel: 'Enter your email',
    emailPh: 'parent@example.com',
    sendBtn: 'Send sign-in link',
    sending: 'Sending...',
    sent: 'Link sent! Check your email and click the link to sign in.',
    finishing: 'Finishing sign-in...',
    success: 'Signed in successfully! 🎉',
    failed: 'Sign-in failed. Please try again.',
    notConfigured: 'Cloud sync is not yet configured.',
    back: 'Back',
    benefit1: '✨ Profiles synced across all devices',
    benefit2: "🔒 Private, secure, never shared",
    benefit3: '💾 Automatic backup of all progress',
    privacy: 'Sign-in via email link only — no passwords. We only store your email.',
  },
};

export default function Login() {
  const locale = useStore((s) => s.locale);
  const tt = (k: string) => TXT[locale][k] || k;
  const nav = useNavigate();
  const setCloudUser = useStore((s) => s.setCloudUser);
  const applyCloudData = useStore((s) => s.applyCloudData);
  const cloudEmail = useStore((s) => s.cloudEmail);

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'finishing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // If we landed here from a magic link, complete the sign-in flow
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    if (!isMagicLinkInUrl()) return;
    setStatus('finishing');
    completeMagicLinkSignIn().then(async ({ user, error }) => {
      if (error || !user) {
        setStatus('error');
        setErrorMsg(error || '');
        return;
      }
      setCloudUser(user.uid, user.email);
      // Pull existing data from cloud (if any)
      const cloud = await syncProfilesDown(user.uid);
      if (cloud && Array.isArray(cloud.profiles) && cloud.profiles.length > 0) {
        applyCloudData(cloud.profiles as any, cloud.activeProfileId, cloud.updatedAt);
      }
      setStatus('success');
      setTimeout(() => nav('/dashboard'), 1500);
    });
  }, []);

  if (!isFirebaseConfigured) {
    return (
      <div className="card max-w-md mx-auto mt-10 text-center space-y-4">
        <Cloud className="w-16 h-16 text-slate-400 mx-auto" />
        <h2 className="text-2xl font-black">{tt('title')}</h2>
        <p className="text-slate-600 dark:text-slate-300">{tt('notConfigured')}</p>
        <Link to="/dashboard" className="btn-primary w-full">{tt('back')}</Link>
      </div>
    );
  }

  const send = async () => {
    if (!email.trim()) return;
    setStatus('sending');
    const r = await sendMagicLink(email.trim());
    if (r.ok) setStatus('sent');
    else { setStatus('error'); setErrorMsg(r.error || ''); }
  };

  return (
    <div className="space-y-5 max-w-md mx-auto py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">{tt('title')}</h1>
        <Link to="/dashboard" className="btn-ghost !min-h-[48px] !px-4 !py-2 text-sm">
          <ArrowRight className="w-4 h-4" /> {tt('back')}
        </Link>
      </div>

      {cloudEmail ? (
        <div className="card text-center space-y-3">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-xl font-black">{tt('success')}</h2>
          <p className="text-sm text-slate-500">{cloudEmail}</p>
          <Link to="/dashboard" className="btn-primary w-full">{tt('back')}</Link>
        </div>
      ) : (
        <>
          <div className="card space-y-2">
            <p className="text-slate-600 dark:text-slate-300">{tt('sub')}</p>
            <ul className="text-sm space-y-1 mt-3">
              <li>{tt('benefit1')}</li>
              <li>{tt('benefit2')}</li>
              <li>{tt('benefit3')}</li>
            </ul>
          </div>

          {status === 'sent' ? (
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-center">
              <Mail className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold">{tt('sent')}</p>
              <p className="text-xs text-slate-500 mt-2">{email}</p>
            </motion.div>
          ) : status === 'finishing' ? (
            <div className="card text-center">
              <p className="font-bold">{tt('finishing')}</p>
            </div>
          ) : (
            <div className="card space-y-4">
              <label className="block text-start font-bold mb-1">{tt('emailLabel')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={tt('emailPh')}
                dir="auto"
                className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 px-4 py-4 text-lg focus:border-brand-500 focus:outline-none"
              />
              <button
                onClick={send}
                disabled={!email.trim() || status === 'sending'}
                className="btn-primary w-full disabled:opacity-50"
              >
                <Mail className="w-5 h-5" />
                {status === 'sending' ? tt('sending') : tt('sendBtn')}
              </button>
              {status === 'error' && (
                <p className="text-rose-500 text-sm text-center">{tt('failed')} {errorMsg && `(${errorMsg})`}</p>
              )}
              <p className="text-xs text-slate-500 text-center">{tt('privacy')}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
