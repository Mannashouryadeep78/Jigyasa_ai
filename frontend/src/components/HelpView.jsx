import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Target, Play, LayoutGrid, ShieldCheck, Info, BarChart2, CheckCircle2 } from 'lucide-react';

const HelpSection = ({ title, icon: Icon, children }) => (
  <div className="bg-white/5 border border-white/10 rounded-[1.8rem] sm:rounded-[2.5rem] p-6 sm:p-10 backdrop-blur-md">
    <div className="flex items-center gap-4 mb-4 sm:mb-6">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#b45309]/20 flex items-center justify-center text-[#f5cca8]">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <h2 className="text-sm sm:text-lg font-bold uppercase tracking-widest text-white">{title}</h2>
    </div>
    <div className="space-y-4 text-white/50 text-[11px] sm:text-sm leading-relaxed font-medium">
      {children}
    </div>
  </div>
);

export default function HelpView({ onBack }) {
  return (
    <div className="w-full h-full pb-20 overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto py-12 px-4">
        
        <header className="mb-10 sm:mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 sm:mb-4">
              <HelpCircle className="w-3 h-3" /> Documentation & Guidance
            </div>
            <h1 className="text-3xl sm:text-6xl font-medium tracking-tighter text-white uppercase italic leading-tight">
              Platform <span className="text-[#f5cca8]">Guide</span>
            </h1>
          </div>
          <button 
            onClick={onBack}
            className="px-6 py-3 bg-white hover:bg-white text-[#1a0f0a] border border-white/10 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all w-full md:w-auto"
          >
            ← Back to History
          </button>
        </header>

        <div className="grid gap-8">
          
          <HelpSection title="Interview Modes" icon={Play}>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-[#f5cca8] font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Practice Mode
                </h3>
                <p>Designed for focused improvement. You can select a single round (HR, Technical, or GD) and receive an instant rubric-based evaluation including technical accuracy, fluency, and content quality.</p>
              </div>
              <div>
                <h3 className="text-[#f5cca8] font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Exam Mode (Pro)
                </h3>
                <p>A professional 3-round sequential assessment simulating a real tutor hiring workflow. Your scores are aggregated across rounds, and a final selection status is calculated based on an average threshold of 3.5/5.</p>
              </div>
            </div>
          </HelpSection>

          <HelpSection title="Tutor Career Tools" icon={LayoutGrid}>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-[#f5cca8] font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                   Prep Matrix
                </h3>
                <p>Upload your resume to our AI analyzer. It identifies your teaching unique selling points (USPs) and synthesizes the top 15 most likely targeted questions you'll face, along with suggested pedagogy approaches.</p>
              </div>
              <div>
                <h3 className="text-[#f5cca8] font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                   ATS Checker
                </h3>
                <p>Ensure your CV clears automated recruitment filters. The checker evaluates your resume against tutor-specific compliance criteria, structure, and keyword density.</p>
              </div>
            </div>
          </HelpSection>

          <HelpSection title="Scoring Rubrics" icon={BarChart2}>
            <p className="mb-4">All assessments are graded on a scale of 1 to 5 based on five core pillars:</p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                "English Fluency",
                "Technical Accuracy",
                "Ability to Simplify",
                "Confidence & Pace",
                "Scenario Handling"
              ].map(item => (
                <li key={item} className="px-4 py-3 bg-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-white/80 border border-white/5">
                  {item}
                </li>
              ))}
            </ul>
          </HelpSection>

          <HelpSection title="Pro Tips" icon={Info}>
            <div className="space-y-4">
                <div className="p-6 bg-[#b45309]/10 rounded-3xl border border-[#b45309]/20">
                    <p className="text-[#f5cca8] text-sm">Always ensure you have a stable internet connection for real-time AI transcription and grading. In Exam Mode, the next round starts automatically after 30 seconds unless you proceed manually.</p>
                </div>
            </div>
          </HelpSection>

        </div>

        <div className="mt-20 pt-10 border-t border-white/5 text-center">
            <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">Jigyasa AI v2.4 — Advanced Tutor Screening Suite</p>
        </div>

      </div>
    </div>
  );
}
