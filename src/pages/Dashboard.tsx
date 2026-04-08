import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Award, GraduationCap } from 'lucide-react';
import Mascot from '@/components/WorldMascot';
import { useStore, getCurrentLevel } from '@/store/useStore';
import { gamesForAge } from '@/games';
import { useT } from '@/i18n';

export default function Dashboard() {
  const t = useT();
  const name = useStore((s) => s.name);
  const avatar = useStore((s) => s.avatar);
  const stars = useStore((s) => s.stars);
  const levels = useStore((s) => s.levels);
  const age = useStore((s) => s.age);
  const games = gamesForAge(age);
  const totalLvls = Object.values(levels);
  const avgLevel = totalLvls.length ? (totalLvls.reduce((a, b) => a + b, 0) / totalLvls.length).toFixed(1) : '1';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/profiles" className="flex items-center gap-3 active:scale-95 transition" aria-label="החלף פרופיל">
          <div className="text-4xl">{avatar}</div>
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{t('hello')},</div>
            <h1 className="text-3xl font-black">{name} 👋</h1>
          </div>
        </Link>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-full px-3 py-1.5 shadow">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="font-black">{stars}</span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-full px-3 py-1.5 shadow">
            <Award className="w-5 h-5 text-purple-500" />
            <span className="font-black">L{avgLevel}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 card">
        <Mascot pose="happy" size={70} />
        <div>
          <div className="font-bold">{t('pickGame')}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{t('pickSub')}</div>
        </div>
      </div>

      {age >= 7 && (
        <Link
          to="/mock-exam"
          className="block card bg-gradient-to-l from-amber-400 to-orange-500 text-white border-0 active:scale-95 transition"
        >
          <div className="flex items-center gap-3">
            <GraduationCap className="w-12 h-12" />
            <div className="flex-1">
              <div className="font-black text-xl">מבחן סימולציה</div>
              <div className="text-sm opacity-90">10 שאלות כמו במבחן האמיתי 🎓</div>
            </div>
            <span className="text-2xl">›</span>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {games.map((g, i) => {
          const lvl = getCurrentLevel(g.id);
          return (
            <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Link
                to={`/play/${g.id}`}
                className={`block rounded-3xl p-5 text-white bg-gradient-to-br ${g.gradient} shadow-xl min-h-[140px] active:scale-95 transition relative overflow-hidden`}
              >
                <div className="absolute top-2 left-2 bg-white/25 backdrop-blur rounded-full px-2 py-0.5 text-xs font-black">L{lvl}</div>
                <div className="text-4xl mb-2">{g.emoji}</div>
                <div className="font-black text-lg leading-tight">{g.title}</div>
                <div className="text-sm opacity-90">{g.subtitle}</div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
