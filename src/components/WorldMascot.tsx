import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { getWorld } from '@/themes/worlds';
import Mascot from './Mascot';

type Pose = 'idle' | 'happy' | 'thinking' | 'celebrate' | 'sad';

// Themed mascot — owl uses the original SVG; other worlds use a styled emoji character.
export default function WorldMascot({ pose = 'idle', size = 120 }: { pose?: Pose; size?: number }) {
  const worldId = useStore((s) => s.worldId);
  const reduceMotion = useStore((s) => s.a11y.reduceMotion);
  const world = getWorld(worldId);

  if (world.id === 'owl') return <Mascot pose={pose} size={size} />;

  const animate = reduceMotion
    ? {}
    : pose === 'celebrate'
    ? { rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.15, 1] }
    : pose === 'happy'
    ? { y: [0, -6, 0] }
    : pose === 'thinking'
    ? { rotate: [0, 4, -4, 0] }
    : { y: [0, -4, 0] };

  return (
    <motion.div
      role="img"
      aria-label={`${world.mascotName} — ${pose}`}
      animate={animate}
      transition={{ duration: pose === 'celebrate' ? 0.6 : 3, repeat: Infinity, ease: 'easeInOut' }}
      className="relative inline-flex items-center justify-center drop-shadow-2xl"
      style={{ width: size, height: size }}
    >
      {/* glow */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${world.primary} ${world.accent} opacity-30 blur-2xl`}
      />
      <span style={{ fontSize: size * 0.85, lineHeight: 1 }} className="relative">
        {world.mascot}
      </span>
    </motion.div>
  );
}
