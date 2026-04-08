import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { GAMES, localizeGame } from '@/games';
import { askGemini } from '@/lib/gemini';
import { Sparkles, RotateCcw, AlertTriangle } from 'lucide-react';
import { useT } from '@/i18n';

export default function Parent() {
  const t = useT();
  const locale = useStore((s) => s.locale);
  const [unlocked, setUnlocked] = useState(false);
  const [ans, setAns] = useState('');
  const attempts = useStore((s) => s.attempts);
  const levels = useStore((s) => s.levels);
  const name = useStore((s) => s.name);
  const age = useStore((s) => s.age);
  const reset = useStore((s) => s.reset);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  if (!unlocked) {
    return (
      <div className="card max-w-sm mx-auto mt-10 text-center space-y-4">
        <h2 className="text-2xl font-black">{t('parentTitle')}</h2>
        <p className="text-slate-600 dark:text-slate-300">{t('parentQuiz')}</p>
        <input
          type="number" inputMode="numeric"
          value={ans} onChange={(e) => setAns(e.target.value)}
          className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 px-4 py-4 text-center text-xl"
        />
        <button onClick={() => ans === '56' && setUnlocked(true)} className="btn-primary w-full">{t('enter')}</button>
      </div>
    );
  }

  type GameStat = { id: string; title: string; emoji: string; gradient: string; attempts: number; level: number | null; avgPct: number };
  const stats = useMemo<GameStat[]>(() => {
    return GAMES.map((g) => {
      const lg = localizeGame(g, locale);
      const list = attempts[g.id] ?? [];
      return {
        id: g.id,
        title: lg.title,
        emoji: g.emoji,
        gradient: g.gradient,
        attempts: list.length,
        level: levels[g.id] ?? null,
        avgPct: list.length ? Math.round((list.reduce((s, a) => s + a.correct / a.total, 0) / list.length) * 100) : 0,
      };
    });
  }, [attempts, levels, locale]);

  const getInsight = async () => {
    setLoading(true);
    setInsight(await askGemini('insight', { age, stats }));
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-black">{t('parentGreeting', { name })} 👋</h1>

      <div className="card">
        <h2 className="font-black text-lg mb-3">{t('statsTitle')}</h2>
        <div className="space-y-2">
          {stats.map((s) => (
            <div key={s.id}>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span>{s.emoji} {s.title}</span>
                <span>{t('level')} {s.level ?? '—'} • {t('attempts', { n: s.attempts })} • {s.avgPct}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-l ${s.gradient}`} style={{ width: `${s.avgPct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={getInsight} disabled={loading} className="btn-primary w-full">
        <Sparkles className="w-5 h-5" /> {loading ? t('preparingInsights') : t('aiInsights')}
      </button>
      {insight && <div className="card bg-brand-50 dark:bg-brand-700/20 text-start whitespace-pre-wrap">{insight}</div>}

      <button onClick={() => setShowResetModal(true)} className="btn-ghost w-full text-rose-600">
        <RotateCcw className="w-5 h-5" /> {t('reset')}
      </button>

      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card max-w-sm w-full text-center">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-xl font-black mb-2">{t('resetConfirm')}</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{t('resetWarning')}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetModal(false)} className="btn-ghost flex-1">{t('cancel')}</button>
              <button onClick={() => { reset(); setShowResetModal(false); }} className="btn flex-1 bg-rose-500 text-white">{t('reset')}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
