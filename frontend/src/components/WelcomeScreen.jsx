import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSearch, CheckCircle2, Mic } from 'lucide-react';

export default function WelcomeScreen({ onStart, onBack, candidateName, isInitializing }) {

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-[#e0ccb8] text-white p-4 md:p-8 selection:bg-black selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-[#1a0f0a] border border-white/5 rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden"
      >
        {/* Orbital rings */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 mix-blend-overlay" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="80%" cy="20%" rx="50%" ry="100%" fill="none" stroke="#fff" strokeWidth="1" />
            <ellipse cx="-10%" cy="80%" rx="60%" ry="80%" fill="none" stroke="#fff" strokeWidth="1" />
        </svg>

        {/* Back Button */}
        {!isInitializing && (
          <button 
            onClick={onBack}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-full border border-white/10 transition-all text-[9px] sm:text-[10px] font-bold uppercase tracking-widest"
          >
            <span>←</span> Back
          </button>
        )}

        <AnimatePresence mode="wait">
          {isInitializing ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 flex flex-col items-center text-center space-y-8 py-10"
            >
                <div className="relative w-24 h-32 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center p-2 mb-4 shadow-lg">
                   <div className="absolute top-0 left-0 w-full h-[2px] bg-[#b45309] shadow-[0_0_15px_3px_rgba(180,83,9,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                   <div className="w-full h-full flex flex-col gap-2 p-2 opacity-30">
                       <div className="w-1/2 h-2 bg-white rounded-full"></div>
                       <div className="w-full h-2 bg-white rounded-full"></div>
                       <div className="w-3/4 h-2 bg-white rounded-full"></div>
                       <div className="w-full h-2 bg-white rounded-full"></div>
                       <div className="w-2/3 h-2 bg-white rounded-full"></div>
                       <div className="w-full h-2 bg-white rounded-full"></div>
                   </div>
                </div>
                <div>
                   <h2 className="text-3xl font-medium tracking-tighter text-white mb-2">Analyzing Profile</h2>
                   <p className="text-white/50 tracking-widest uppercase text-xs font-bold animate-pulse">Building Custom Interview Engine...</p>
                </div>
            </motion.div>
          ) : (
            <motion.div
              key="rules"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative z-10"
            >
                <h1 className="text-3xl md:text-4xl font-medium tracking-tighter mb-4 text-white text-center"><span className="text-[#b45309]">{"{"}</span> Interview Rules <span className="text-[#b45309]">{"}"}</span></h1>
                <p className="text-white/50 font-medium mb-10 text-center tracking-wide">Welcome, <span className="text-white font-bold">{candidateName}</span>! Before we begin:</p>
                
                <ul className="space-y-6 mb-12 text-white/80">
                    <li className="flex items-start bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div className="bg-[#b45309]/20 p-2 rounded-full mr-4 border border-[#b45309]/30">
                            <FileSearch className="w-5 h-5 text-[#f5cca8]" />
                        </div>
                        <div>
                            <h3 className="font-bold tracking-widest text-[#f5cca8] text-xs uppercase mb-1">Tailored Assessment</h3>
                            <p className="text-sm font-medium">The AI is analyzing your uploaded resume and formulating specific questions matched to your experience.</p>
                        </div>
                    </li>
                    <li className="flex items-start bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div className="bg-[#b45309]/20 p-2 rounded-full mr-4 border border-[#b45309]/30">
                            <Mic className="w-5 h-5 text-[#f5cca8]" />
                        </div>
                        <div>
                            <h3 className="font-bold tracking-widest text-[#f5cca8] text-xs uppercase mb-1">Auto-Detection</h3>
                            <p className="text-sm font-medium">Speak naturally. Pausing for a few seconds will automatically submit your turn to the system.</p>
                        </div>
                    </li>
                    <li className="flex items-start bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div className="bg-[#b45309]/20 p-2 rounded-full mr-4 border border-[#b45309]/30">
                            <CheckCircle2 className="w-5 h-5 text-[#f5cca8]" />
                        </div>
                        <div>
                            <h3 className="font-bold tracking-widest text-[#f5cca8] text-xs uppercase mb-1">Environment Check</h3>
                            <p className="text-sm font-medium">Please ensure you are in a quiet room and have granted microphone permissions.</p>
                        </div>
                    </li>
                </ul>
                
                <button
                  onClick={onStart}
                  className="w-full py-4 bg-white hover:bg-white/90 text-[#1a0f0a] rounded-full transition-all font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 shadow-xl shadow-white/5"
                >
                  I'm Ready, Start Interview
                </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
