import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function WaveformVisualizer({ isActive, color = 'bg-blue-500' }) {
  // Memoize random heights and durations so they don't change on every re-render
  const bars = useMemo(() =>
    Array.from({ length: 9 }).map((_, i) => ({
      id: i,
      height: 16 + Math.random() * 24,
      duration: 0.5 + Math.random() * 0.5,
    })),
  []);

  return (
    <div className="flex items-center justify-center gap-1 h-16 pointer-events-none">
      {bars.map((bar) => (
        <motion.div
          key={bar.id}
          className={`w-1.5 rounded-full ${color}`}
          initial={{ height: 4 }}
          animate={{
            height: isActive ? [4, bar.height, 4] : 4,
          }}
          transition={{
            duration: bar.duration,
            repeat: isActive ? Infinity : 0,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}
