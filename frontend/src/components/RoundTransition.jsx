import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, ClipboardCheck, Timer, ChevronRight } from 'lucide-react';

export default function RoundTransition({ lastRoundName, lastRoundScore, nextRoundName, onProceed }) {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (timeLeft <= 0) {
      onProceed();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onProceed]);

  return (
    <div className="min-h-screen bg-[#1a0f0a] flex items-center justify-center p-4 sm:p-8 font-sans selection:bg-[#b45309]">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-[#b45309] rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-xl bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 sm:p-14 shadow-3xl text-center"
      >
        <div className="w-20 h-20 bg-[#b45309]/20 rounded-2xl flex items-center justify-center mx-auto mb-8 text-[#f5cca8]">
          <ClipboardCheck className="w-10 h-10" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-medium tracking-tighter text-white mb-2 uppercase italic">
          Round <span className="text-[#f5cca8]">Complete</span>
        </h2>
        
        <div className="mb-10 p-6 bg-black/40 rounded-2xl border border-white/5 inline-block mx-auto min-w-[200px]">
            <p className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">{lastRoundName} Score</p>
            <div className="text-4xl font-medium text-white">
                {(lastRoundScore || 0).toFixed(1)}
                <span className="text-sm text-white/20 ml-1">/ 5</span>
            </div>
        </div>

        <div className="h-px w-full bg-white/10 mb-10" />

        <div className="flex flex-col items-center mb-10">
            <p className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Up Next</p>
            <div className="flex items-center gap-4 text-2xl font-medium text-[#f5cca8] uppercase italic">
                {nextRoundName} <ChevronRight className="w-6 h-6 text-white/20" />
            </div>
        </div>

        <div className="relative mb-10">
            <div className="flex items-center justify-center gap-3 text-white/60 mb-4">
                <Timer className="w-4 h-4" />
                <span className="text-xs font-bold tracking-widest uppercase">Auto-starting in {timeLeft}s</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 30, ease: "linear" }}
                    className="h-full bg-[#b45309]"
                />
            </div>
        </div>

        <button
          onClick={onProceed}
          className="w-full py-5 bg-white hover:bg-[#b45309] text-[#1a0f0a] hover:text-white rounded-full transition-all duration-300 font-bold tracking-[0.2em] uppercase text-xs flex items-center justify-center gap-3 shadow-xl hover:shadow-[#b45309]/20 group"
        >
          Proceed Now <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
}
