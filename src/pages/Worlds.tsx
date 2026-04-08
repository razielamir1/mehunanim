import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { WORLDS } from '@/themes/worlds';
import { useStore } from '@/store/useStore';
import { sfx, haptic } from '@/lib/sound';

export default function Worlds() {
  const worldId = useStore((s) => s.worldId);
  const setWorld = useStore((s) => s.setWorld);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black">בחר עולם</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">כל עולם משנה את העיצוב, הדמות והרקע</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {WORLDS.map((w, i) => {
          const active = worldId === w.id;
          return (
            <motion.button
              key={w.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                sfx.tap();
                haptic();
                setWorld(w.id);
              }}
              aria-pressed={active}
              className={`relative rounded-3xl p-5 text-start min-h-[160px] overflow-hidden border-4 transition active:scale-95 ${
                active ? 'border-brand-500 shadow-2xl' : 'border-transparent shadow-lg'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${w.bgGradient} dark:${w.bgGradientDark}`} />
              <div className="relative">
                <div className="text-5xl mb-2">{w.mascot}</div>
                <div className="font-black text-lg leading-tight text-slate-900 dark:text-white">{w.name}</div>
                <div className="text-xs text-slate-700 dark:text-slate-200 opacity-80">{w.description}</div>
                <div className="mt-2 flex gap-1 text-xl">
                  {w.particles.slice(0, 4).map((p, idx) => (
                    <span key={idx}>{p}</span>
                  ))}
                </div>
              </div>
              {active && (
                <div className="absolute top-2 end-2 bg-brand-500 text-white rounded-full p-1.5">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
