import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { GAMES } from '@/games';
import { askGemini } from '@/lib/gemini';
import { Sparkles, RotateCcw } from 'lucide-react';

export default function Parent() {
  const [unlocked, setUnlocked] = useState(false);
  const [ans, setAns] = useState('');
  const attempts = useStore((s) => s.attempts);
  const levels = useStore((s) => s.levels);
  const name = useStore((s) => s.name);
  const age = useStore((s) => s.age);
  const reset = useStore((s) => s.reset);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);

  if (!unlocked) {
    return (
      <div className="card max-w-sm mx-auto mt-10 text-center space-y-4">
        <h2 className="text-2xl font-black">אזור הורים</h2>
        <p className="text-slate-600 dark:text-slate-300">כמה זה 7 × 8?</p>
        <input
          type="number" inputMode="numeric"
          value={ans} onChange={(e) => setAns(e.target.value)}
          className="w-full rounded-2xl border-2 border-slate-200 px-4 py-4 text-center text-xl"
        />
        <button onClick={() => ans === '56' && setUnlocked(true)} className="btn-primary w-full">כניסה</button>
      </div>
    );
  }

  const stats: any = {};
  GAMES.forEach((g) => {
    const list = attempts[g.id] ?? [];
    stats[g.id] = {
      title: g.title,
      attempts: list.length,
      level: levels[g.id] ?? null,
      avgPct: list.length ? Math.round((list.reduce((s, a) => s + a.correct / a.total, 0) / list.length) * 100) : 0,
    };
  });

  const getInsight = async () => {
    setLoading(true);
    setInsight(await askGemini('insight', { name, age, stats }));
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-black">שלום, הורה של {name} 👋</h1>

      <div className="card">
        <h2 className="font-black text-lg mb-3">התקדמות לפי משחק</h2>
        <div className="space-y-2">
          {GAMES.map((g) => {
            const s = stats[g.id];
            return (
              <div key={g.id}>
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span>{g.emoji} {g.title}</span>
                  <span>רמה {s.level ?? '—'} • {s.attempts} ניסיונות • {s.avgPct}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-l ${g.gradient}`} style={{ width: `${s.avgPct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={getInsight} disabled={loading} className="btn-primary w-full">
        <Sparkles className="w-5 h-5" /> {loading ? 'מכין תובנות...' : 'תובנות AI מבוקי'}
      </button>
      {insight && <div className="card bg-brand-50 dark:bg-brand-700/20 text-start whitespace-pre-wrap">{insight}</div>}

      <button onClick={() => { if (confirm('לאפס את כל ההתקדמות?')) reset(); }} className="btn-ghost w-full text-rose-600">
        <RotateCcw className="w-5 h-5" /> אפס התקדמות
      </button>
    </div>
  );
}
