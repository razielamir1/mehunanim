import { motion } from 'framer-motion';

type Pose = 'idle' | 'happy' | 'thinking' | 'celebrate' | 'sad';

export default function Mascot({ pose = 'idle', size = 120 }: { pose?: Pose; size?: number }) {
  const eyeY = pose === 'sad' ? 58 : pose === 'celebrate' ? 50 : 54;
  const mouth =
    pose === 'happy' || pose === 'celebrate'
      ? 'M 85 85 Q 100 100 115 85'
      : pose === 'sad'
      ? 'M 85 95 Q 100 82 115 95'
      : 'M 88 90 Q 100 95 112 90';
  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      initial={{ scale: 0.9 }}
      animate={{ scale: 1, rotate: pose === 'celebrate' ? [0, -6, 6, 0] : 0 }}
      transition={{ duration: 0.6, repeat: pose === 'celebrate' ? Infinity : 0 }}
      className="drop-shadow-xl"
    >
      <defs>
        <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {/* body */}
      <ellipse cx="100" cy="115" rx="70" ry="75" fill="url(#body)" />
      {/* belly */}
      <ellipse cx="100" cy="130" rx="45" ry="50" fill="#fef3c7" />
      {/* eyes bg */}
      <circle cx="75" cy={eyeY} r="20" fill="white" />
      <circle cx="125" cy={eyeY} r="20" fill="white" />
      {/* pupils */}
      <circle cx="75" cy={eyeY + 2} r="8" fill="#1e293b" />
      <circle cx="125" cy={eyeY + 2} r="8" fill="#1e293b" />
      <circle cx="78" cy={eyeY - 1} r="3" fill="white" />
      <circle cx="128" cy={eyeY - 1} r="3" fill="white" />
      {/* beak */}
      <path d="M 92 72 L 108 72 L 100 85 Z" fill="#f59e0b" />
      {/* mouth */}
      <path d={mouth} stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* ear tufts */}
      <path d="M 40 45 L 55 25 L 65 50 Z" fill="url(#body)" />
      <path d="M 160 45 L 145 25 L 135 50 Z" fill="url(#body)" />
    </motion.svg>
  );
}
