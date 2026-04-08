import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import Mascot from '@/components/Mascot';

export default function Results() {
  const { state } = useLocation() as {
    state?: { correct: number; total: number; gameId: string; leveledUp?: boolean; newCollectible?: string; level?: number };
  };
  const correct = state?.correct ?? 0;
  const total = state?.total ?? 5;
  const pct = Math.round((correct / total) * 100);
  const pose = pct >= 80 ? 'celebrate' : pct >= 50 ? 'happy' : 'thinking';

  useEffect(() => {
    if (pct >= 80 || state?.leveledUp) {
      confetti({ particleCount: 150, spread: 120, origin: { y: 0.5 } });
    }
  }, []);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center gap-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
        <Mascot pose={pose as any} size={150} />
      </motion.div>
      <h1 className="text-4xl font-black">{pct >= 80 ? 'מדהים!' : pct >= 50 ? 'כל הכבוד!' : 'ננסה שוב?'}</h1>

      {state?.leveledUp && (
        <motion.div
          initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-l from-amber-400 to-orange-500 text-white font-black text-xl shadow-xl"
        >
          <TrendingUp className="w-6 h-6" /> עלית לרמה {(state?.level ?? 1) + 1}!
        </motion.div>
      )}
      {state?.newCollectible && (
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="card max-w-xs"
        >
          <div className="text-sm text-slate-500 mb-1">פריט חדש באוסף!</div>
          <div className="text-6xl">{state.newCollectible}</div>
        </motion.div>
      )}

      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <Star key={i} className={`w-10 h-10 ${i < correct ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
        ))}
      </div>
      <div className="text-2xl font-black">{correct} / {total}</div>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link to="/dashboard" className="btn-ghost">חזרה לבית</Link>
        {state?.gameId && <Link to={`/play/${state.gameId}`} className="btn-primary">סיבוב נוסף</Link>}
      </div>
    </div>
  );
}
