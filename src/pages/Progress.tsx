import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Star, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { GAMES, localizeGame } from '@/games';
import { askGemini } from '@/lib/gemini';
import { useT } from '@/i18n';

type Summary = Record<string, {
  title: string;
  attempts: number;
  level: number | null;
  last3: string[];
  avgPct: number;
}>;

export default function ProgressPage() {
  const t = useT();
  const locale = useStore((s) => s.locale);
  const stars = useStore((s) => s.stars);
  const levels = useStore((s) => s.levels);
  const attempts = useStore((s) => s.attempts);
  const collectibles = useStore((s) => s.collectibles);
  const age = useStore((s) => s.age);
  const [analysis, setAnalysis] = useState<{ text: string; suggested?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const totalLvls = Object.values(levels);
  const avgLevel = totalLvls.length ? (totalLvls.reduce((a, b) => a + b, 0) / totalLvls.length).toFixed(1) : '—';

  const summary = useMemo<Summary>(() => {
    const out: Summary = {};
    GAMES.forEach((g) => {
      const lg = localizeGame(g, locale);
      const list = attempts[g.id] ?? [];
      out[g.id] = {
        title: lg.title,
        attempts: list.length,
        level: levels[g.id] ?? null,
        last3: list.slice(-3).map((a) => `${a.correct}/${a.total}@L${a.level}`),
        avgPct: list.length ? Math.round((list.reduce((s, a) => s + a.correct / a.total, 0) / list.length) * 100) : 0,
      };
    });
    return out;
  }, [attempts, levels, locale]);

  const analyze = async () => {
    setLoading(true);
    const text = await askGemini('analyze', { age, summary });
    const weakest = Object.entries(summary).sort((a, b) => a[1].avgPct - b[1].avgPct)[0]?.[0];
    setAnalysis({ text, suggested: weakest });
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-black">{t('myProgress')}</h1>

      <div className="grid grid-cols-3 gap-3">
        <div className="card !p-4 text-center">
          <Star className="w-7 h-7 text-amber-400 fill-amber-400 mx-auto mb-1" />
          <div className="text-2xl font-black">{stars}</div>
          <div className="text-xs text-slate-500">{t('starsLabel')}</div>
        </div>
        <div className="card !p-4 text-center">
          <Award className="w-7 h-7 text-purple-500 mx-auto mb-1" />
          <div className="text-2xl font-black">{avgLevel}</div>
          <div className="text-xs text-slate-500">{t('avgLevel')}</div>
        </div>
        <div className="card !p-4 text-center">
          <div className="text-2xl mb-1">🏆</div>
          <div className="text-2xl font-black">{collectibles.length}</div>
          <div className="text-xs text-slate-500">{t('collectiblesLabel')}</div>
        </div>
      </div>

      {collectibles.length > 0 && (
        <div className="card">
          <h3 className="font-black mb-2">{t('myCollection')}</h3>
          <div className="flex flex-wrap gap-2">
            {collectibles.map((c, i) => (
              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-3xl">{c}</motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="card space-y-3">
        <h3 className="font-black">{t('games')}</h3>
        {GAMES.map((g) => {
          const lg = localizeGame(g, locale);
          const s = summary[g.id];
          return (
            <div key={g.id}>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span>{g.emoji} {lg.title}</span>
                <span className="text-slate-500">{t('level')} {s.level ?? '—'} • {t('attempts', { n: s.attempts })} • {s.avgPct}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-l ${g.gradient}`} style={{ width: `${s.avgPct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={analyze} disabled={loading} className="btn-primary w-full">
        <Sparkles className="w-5 h-5" /> {loading ? t('analyzing') : t('aiAnalyze')}
      </button>

      {analysis && (
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card bg-brand-50 dark:bg-brand-700/20 border-brand-500/20">
          <div className="whitespace-pre-wrap text-start">{analysis.text}</div>
          {analysis.suggested && (
            <Link to={`/play/${analysis.suggested}`} className="btn-primary w-full mt-4">
              {t('playNow')}: {localizeGame(GAMES.find((g) => g.id === analysis.suggested)!, locale).title}
            </Link>
          )}
        </motion.div>
      )}
    </div>
  );
}
