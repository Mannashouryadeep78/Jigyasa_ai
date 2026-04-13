import React from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle2, XCircle, ChevronRight, BarChart2, Star } from 'lucide-react';

export default function ExamResultScreen({ examScores, onBackToDashboard }) {
  const averageScore = examScores.reduce((a, b) => a + b, 0) / examScores.length;
  const isSelected = averageScore >= 3.5;

  const rounds = [
    { name: 'GD & Communication', score: examScores[0] },
    { name: 'Technical Domain', score: examScores[1] },
    { name: 'HR Interview', score: examScores[2] },
  ];

  return (
    <div className="min-h-screen bg-[#1a0f0a] flex items-center justify-center p-4 sm:p-8 font-sans">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-[#b45309] rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-[#b45309] rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 sm:p-12 shadow-2xl text-center"
      >
        <div className={`w-20 h-20 sm:w-28 sm:h-28 mx-auto rounded-full flex items-center justify-center mb-8 ${
          isSelected ? 'bg-green-500/20 text-green-400 border-2 border-green-500/30' : 'bg-[#b45309]/20 text-[#f5cca8] border-2 border-[#b45309]/30'
        }`}>
          {isSelected ? <Award className="w-10 h-10 sm:w-14 sm:h-14" /> : <Star className="w-10 h-10 sm:w-14 sm:h-14" />}
        </div>

        <h1 className="text-3xl sm:text-5xl font-medium tracking-tighter text-white mb-4">
          Exam <span className="text-[#f5cca8]">Assessment</span>
        </h1>
        
        <p className="text-white/40 font-medium mb-10 tracking-widest uppercase text-xs">
          Jigyasa AI Evaluation Report
        </p>

        <div className="grid gap-4 mb-10">
          {rounds.map((round, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-white/70 font-medium text-sm sm:text-base">{round.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-white font-black text-lg">{round.score.toFixed(1)}</span>
                <span className="text-white/20 text-xs font-bold">/ 5.0</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-black/30 rounded-3xl p-8 border border-white/5 mb-8">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Final Average Score</p>
          <div className="text-5xl sm:text-7xl font-medium text-white mb-6">
            {averageScore.toFixed(2)}
            <span className="text-lg sm:text-2xl text-white/20 ml-2">/ 5.00</span>
          </div>

          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs border ${
            isSelected 
              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {isSelected ? 'Selected for Next Round' : 'Practice More to Qualify'}
          </div>
        </div>

        <button
          onClick={onBackToDashboard}
          className="w-full py-4 bg-white hover:bg-[#b45309] text-[#1a0f0a] hover:text-white rounded-full transition-all duration-300 font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 shadow-xl hover:shadow-[#b45309]/20"
        >
          Return to Dashboard <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}
