import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Star, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { GAMES } from '@/games';
import { askGemini } from '@/lib/gemini';

export default function ProgressPage() {
  const stars = useStore((s) => s.stars);
  const levels = useStore((s) => s.levels);
  const attempts = useStore((s) => s.attempts);
  const collectibles = useStore((s) => s.collectibles);
  const name = useStore((s) => s.name);
  const age = useStore((s) => s.age);
  const [analysis, setAnalysis] = useState<{ text: string; suggested?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const totalLvls = Object.values(levels);
  const avgLevel = totalLvls.length ? (totalLvls.reduce((a, b) => a + b, 0) / totalLvls.length).toFixed(1) : '—';

  const analyze = async () => {
    setLoading(true);
    const summary: any = {};
    GAMES.forEach((g) => {
      const list = attempts[g.id] ?? [];
      summary[g.id] = {
        title: g.title,
        attempts: list.length,
        level: levels[g.id] ?? null,
        last3: list.slice(-3).map((a) => `${a.correct}/${a.total}@L${a.level}`),
        avgPct: list.length ? Math.round((list.reduce((s, a) => s + a.correct / a.total, 0) / list.length) * 100) : 0,
      };
    });
    const text = await askGemini('analyze', { name, age, summary });
    // suggest weakest game
    const weakest = Object.entries(summary).sort((a: any, b: any) => a[1].avgPct - b[1].avgPct)[0]?.[0];
    setAnalysis({ text, suggested: weakest });
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-black">ההתקדמות שלי</h1>

      <div className="grid grid-cols-3 gap-3">
        <div className="card !p-4 text-center">
          <Star className="w-7 h-7 text-amber-400 fill-amber-400 mx-auto mb-1" />
          <div className="text-2xl font-black">{stars}</div>
          <div className="text-xs text-slate-500">כוכבים</div>
        </div>
        <div className="card !p-4 text-center">
          <Award className="w-7 h-7 text-purple-500 mx-auto mb-1" />
          <div className="text-2xl font-black">{avgLevel}</div>
          <div className="text-xs text-slate-500">רמה ממוצעת</div>
        </div>
        <div className="card !p-4 text-center">
          <div className="text-2xl mb-1">🏆</div>
          <div className="text-2xl font-black">{collectibles.length}</div>
          <div className="text-xs text-slate-500">פריטים</div>
        </div>
      </div>

      {collectibles.length > 0 && (
        <div className="card">
          <h3 className="font-black mb-2">האוסף שלי</h3>
          <div className="flex flex-wrap gap-2">
            {collectibles.map((c, i) => (
              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-3xl">{c}</motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="card space-y-3">
        <h3 className="font-black">משחקים</h3>
        {GAMES.map((g) => {
          const list = attempts[g.id] ?? [];
          const lvl = levels[g.id] ?? '—';
          const pct = list.length ? Math.round((list.reduce((s, a) => s + a.correct / a.total, 0) / list.length) * 100) : 0;
          return (
            <div key={g.id}>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span>{g.emoji} {g.title}</span>
                <span className="text-slate-500">רמה {lvl} • {list.length} ניסיונות • {pct}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-l ${g.gradient}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={analyze} disabled={loading} className="btn-primary w-full">
        <Sparkles className="w-5 h-5" /> {loading ? 'מנתח...' : 'ניתוח AI מתקדם'}
      </button>

      {analysis && (
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card bg-brand-50 dark:bg-brand-700/20 border-brand-500/20">
          <div className="whitespace-pre-wrap text-start">{analysis.text}</div>
          {analysis.suggested && (
            <Link to={`/play/${analysis.suggested}`} className="btn-primary w-full mt-4">
              שחק עכשיו: {GAMES.find((g) => g.id === analysis.suggested)?.title}
            </Link>
          )}
        </motion.div>
      )}
    </div>
  );
}
