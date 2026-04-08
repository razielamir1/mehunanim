import { useEffect, useRef, useState } from 'react';
import { Send, Trash2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Mascot from '@/components/WorldMascot';
import { useStore, ChatMsg } from '@/store/useStore';
import { askGemini } from '@/lib/gemini';
import { useT } from '@/i18n';

export default function Coach() {
  const t = useT();
  const history = useStore((s) => s.chatHistory);
  const pushChat = useStore((s) => s.pushChat);
  const clearChat = useStore((s) => s.clearChat);
  const age = useStore((s) => s.age);
  const levels = useStore((s) => s.levels);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [history, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: ChatMsg = { role: 'user', text, ts: Date.now() };
    pushChat(userMsg);
    setInput('');
    setLoading(true);
    const recent = [...history, userMsg].slice(-10);
    // Privacy: only forward age + levels (no PII like name/city)
    const ctx = { age, levels };
    const reply = await askGemini('chat', { history: recent, ctx });
    pushChat({ role: 'model', text: reply, ts: Date.now() });
    setLoading(false);
  };

  const messages = history.length === 0
    ? [{ role: 'model' as const, text: t('coachWelcome'), ts: 0 }]
    : history;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="card !p-4 mb-3 flex items-center gap-3">
        <Mascot pose="happy" size={56} />
        <div className="flex-1">
          <div className="font-black">{t('coachTitle')}</div>
          <div className="text-xs text-slate-500">{t('coachSub')}</div>
        </div>
        {history.length > 0 && (
          <button onClick={clearChat} aria-label={t('clearChat')} className="text-slate-400 hover:text-rose-500 p-2 min-w-[44px] min-h-[44px]"><Trash2 className="w-5 h-5" /></button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-3">
        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
              m.role === 'user'
                ? 'bg-gradient-to-l from-indigo-500 to-pink-500 text-white rounded-bl-md'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-br-md'
            } whitespace-pre-wrap text-start`}>{m.text}</div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3">
              <Sparkles className="w-5 h-5 animate-spin text-brand-500" />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pb-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !(e.nativeEvent as any).isComposing) send();
          }}
          placeholder={t('coachPh')}
          dir="auto"
          aria-label={t('coachPh')}
          className="flex-1 rounded-full border-2 border-slate-200 dark:border-slate-700 px-5 py-3 focus:border-brand-500 focus:outline-none"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          aria-label={t('send')}
          className="btn-primary !min-h-[52px] !px-5 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
