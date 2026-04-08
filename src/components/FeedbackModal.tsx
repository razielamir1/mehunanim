import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Send } from 'lucide-react';
import { useStore } from '@/store/useStore';

const FB_TEXT: Record<'he' | 'en', Record<string, string>> = {
  he: {
    title: 'משוב והערות',
    sub: 'נשמח לשמוע מה לשפר! המשוב יישלח באימייל.',
    placeholder: 'כתוב לנו מה דעתך...',
    send: 'שלח משוב',
    cancel: 'סגור',
    type: 'סוג המשוב',
    bug: 'באג',
    idea: 'רעיון',
    compliment: 'מחמאה',
    other: 'אחר',
  },
  en: {
    title: 'Feedback',
    sub: "We'd love to hear what to improve! Feedback will be sent by email.",
    placeholder: 'Tell us what you think...',
    send: 'Send feedback',
    cancel: 'Close',
    type: 'Feedback type',
    bug: 'Bug',
    idea: 'Idea',
    compliment: 'Compliment',
    other: 'Other',
  },
};

export default function FeedbackModal({ onClose }: { onClose: () => void }) {
  const locale = useStore((s) => s.locale);
  const tt = (k: string) => FB_TEXT[locale][k] || k;
  const [type, setType] = useState<'bug' | 'idea' | 'compliment' | 'other'>('idea');
  const [text, setText] = useState('');

  const send = () => {
    const subject = `[Mehunanim ${type}] feedback`;
    const body = `${tt(type)}:\n\n${text}\n\n---\nLocale: ${locale}`;
    const mailto = `mailto:razielamir@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    onClose();
  };

  const types: ('bug' | 'idea' | 'compliment' | 'other')[] = ['idea', 'bug', 'compliment', 'other'];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card max-w-md w-full relative">
        <button onClick={onClose} aria-label={tt('cancel')} className="absolute top-3 end-3 text-slate-400 hover:text-slate-600 p-2">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-pink-500 flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black">{tt('title')}</h2>
            <p className="text-xs text-slate-500">{tt('sub')}</p>
          </div>
        </div>

        <label className="block text-start font-bold mb-2 text-sm">{tt('type')}</label>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              aria-pressed={type === t}
              className={`min-h-[48px] rounded-xl text-sm font-bold transition ${
                type === t
                  ? 'bg-gradient-to-l from-indigo-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700'
              }`}
            >
              {tt(t)}
            </button>
          ))}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={tt('placeholder')}
          dir="auto"
          rows={5}
          maxLength={1000}
          className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 px-4 py-3 text-base focus:border-brand-500 focus:outline-none mb-4"
        />

        <div className="flex gap-2">
          <button onClick={onClose} className="btn-ghost flex-1 !min-h-[52px]">{tt('cancel')}</button>
          <button onClick={send} disabled={!text.trim()} className="btn-primary flex-1 !min-h-[52px] disabled:opacity-50">
            <Send className="w-5 h-5" /> {tt('send')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
