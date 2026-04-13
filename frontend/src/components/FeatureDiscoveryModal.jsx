import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Play, LayoutGrid, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, color }) => (
  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center group hover:bg-white/10 transition-all">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-${color}/20 text-${color}`}>
        <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-2">{title}</h3>
    <p className="text-white/40 text-[10px] leading-relaxed font-medium">{description}</p>
  </div>
);

export default function FeatureDiscoveryModal({ isOpen, onConfirm }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#000]/90 backdrop-blur-2xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-4xl bg-white/5 border border-white/10 rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-16 shadow-3xl text-center overflow-hidden"
          >
            {/* Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#b45309]/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#b45309]/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-20">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#b45309]/20 text-[#f5cca8] border border-[#b45309]/30 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                <Sparkles className="w-3 h-3" /> Welcome to Jigyasa AI
              </div>

              <h2 className="text-3xl sm:text-6xl font-medium tracking-tighter text-white mb-4 uppercase italic leading-tight">
                Master your <span className="text-[#f5cca8]">Tutor Career</span>
              </h2>
              
              <p className="text-white/40 font-medium tracking-widest uppercase text-xs mb-12 max-w-xl mx-auto leading-relaxed">
                Elevate your teaching profile with AI-driven interview assessments and highly targeted pedagogy prep.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 sm:mb-14">
                <FeatureCard 
                  icon={Play}
                  title="Practice Mode"
                  description="Single round drills for HR, Domain, or Policy rounds with instant feedback."
                  color="[#f5cca8]"
                />
                <FeatureCard 
                  icon={Target}
                  title="Exam Mode"
                  description="A comprehensive 3-round sequential assessment (GD -> Tech -> HR)."
                  color="[#b45309]"
                />
                <FeatureCard 
                  icon={LayoutGrid}
                  title="Prep Matrix"
                  description="Resume-based synthesis of top 15 targeted practice questions."
                  color="[#f5cca8]"
                />
                <FeatureCard 
                  icon={ShieldCheck}
                  title="ATS Checker"
                  description="Compliance analysis of your teaching CV against hiring standards."
                  color="[#b45309]"
                />
              </div>

              <div className="flex flex-col items-center gap-6">
                <button
                  onClick={onConfirm}
                  className="px-12 py-5 bg-white hover:bg-[#b45309] text-[#1a0f0a] hover:text-white rounded-full transition-all duration-500 font-bold tracking-[0.3em] uppercase text-xs shadow-2xl hover:shadow-[#b45309]/40 flex items-center gap-3 group"
                >
                  Enter Dashboard <CheckCircle2 className="w-4 h-4 group-hover:scale-125 transition-transform" />
                </button>
                <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest">
                  You can revisit these details anytime in the <span className="text-white/40">Help</span> section.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
