import React from 'react';
import { motion } from 'framer-motion';

export default function WaveformVisualizer({ isActive, color = 'bg-blue-500' }) {
  // Simple fake waveform representation
  const bars = Array.from({ length: 9 }).map((_, i) => i);

  return (
    <div className="flex items-center justify-center gap-1 h-16 pointer-events-none">
      {bars.map((bar) => (
        <motion.div
          key={bar}
          className={`w-1.5 rounded-full ${color}`}
          initial={{ height: 4 }}
          animate={{
            height: isActive ? [4, 16 + Math.random() * 24, 4] : 4,
          }}
          transition={{
            duration: 0.5 + Math.random() * 0.5,
            repeat: isActive ? Infinity : 0,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}
