import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { getWorld } from '@/themes/worlds';

// Animated background — floating themed particles + gradient.
// Respects reduced-motion accessibility setting.
export default function WorldBackground() {
  const worldId = useStore((s) => s.worldId);
  const theme = useStore((s) => s.theme);
  const reduceMotion = useStore((s) => s.a11y.reduceMotion);
  const world = getWorld(worldId);

  const particles = useMemo(() => {
    const count = reduceMotion ? 6 : 18;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      emoji: world.particles[i % world.particles.length],
      x: Math.random() * 100,
      delay: Math.random() * 5,
      dur: 8 + Math.random() * 12,
      size: 18 + Math.random() * 24,
      drift: (Math.random() - 0.5) * 30,
    }));
  }, [worldId, reduceMotion]);

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme === 'dark' ? world.bgGradientDark : world.bgGradient}`} />
      {!reduceMotion &&
        particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute select-none opacity-60 dark:opacity-40"
            style={{ left: `${p.x}%`, fontSize: p.size, top: '-5%' }}
            initial={{ y: -50 }}
            animate={{ y: '110vh', x: [0, p.drift, 0, -p.drift, 0] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'linear' }}
          >
            {p.emoji}
          </motion.div>
        ))}
      {reduceMotion &&
        particles.map((p) => (
          <div
            key={p.id}
            className="absolute select-none opacity-30"
            style={{ left: `${p.x}%`, top: `${p.delay * 15}%`, fontSize: p.size }}
          >
            {p.emoji}
          </div>
        ))}
    </div>
  );
}
