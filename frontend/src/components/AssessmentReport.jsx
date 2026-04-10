import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AssessmentReport({ sessionId }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval = setInterval(async () => {
        try {
            // Query Supabase directly for the saved assessment row
            const { data, error } = await supabase
                .from('assessments')
                .select('scores_json, quotes_json')
                .eq('session_id', sessionId);
            
            if (data && data.length > 0 && data[0].scores_json) {
                const dbScores = data[0].scores_json;
                const dbQuotes = data[0].quotes_json || {};
                
                // Calculate average since we removed the overall_score column
                const avgScore = (Object.values(dbScores).reduce((a, b) => a + b, 0) / Object.values(dbScores).length || 0).toFixed(1);
                
                setReport({
                   scores: dbScores,
                   quotes: dbQuotes,
                   overall_score: avgScore
                });
                setLoading(false);
                clearInterval(interval);
            } else {
                // Not found in DB yet, it might still be generating on the backend...
            }
        } catch (err) {
            console.error("Failed to fetch report from DB", err);
        }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId]);

  if (loading) {
      return (
          <div className="min-h-screen bg-[#e0ccb8] flex flex-col items-center justify-center text-white selection:bg-black selection:text-white p-4 font-sans">
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="w-full max-w-2xl bg-[#1a0f0a] rounded-[3rem] p-12 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center text-center"
              >
                  {/* Glowing Top Edge */}
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#b45309] to-transparent shadow-[0_0_20px_rgba(180,83,9,0.5)]"></div>
                  
                  {/* Orbital Scanner Animation */}
                  <div className="relative w-24 h-24 mb-8">
                      <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[#b45309] opacity-50"
                      />
                      <motion.div 
                          animate={{ rotate: -360 }}
                          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                          className="absolute inset-2 rounded-full border-b-2 border-l-2 border-white/30"
                      />
                      <div className="absolute inset-4 rounded-full bg-[#b45309]/10 flex items-center justify-center animate-pulse">
                          <Loader2 className="w-6 h-6 text-[#f5cca8] animate-spin-[3s]" />
                      </div>
                  </div>

                  <h2 className="text-2xl font-medium tracking-tighter mb-4 text-white">
                      <span className="text-[#b45309]">{"{"}</span> Synthesizing Report
                  </h2>
                  
                  <div className="space-y-3 w-full max-w-sm mx-auto mt-4 px-4">
                      {/* Animated Parsing Skeletons */}
                      <motion.div 
                          animate={{ opacity: [0.2, 0.6, 0.2] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="h-1.5 bg-white/20 rounded-full w-full"
                      />
                      <motion.div 
                          animate={{ opacity: [0.2, 0.6, 0.2] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                          className="h-1.5 bg-[#b45309]/40 rounded-full w-[85%] mx-auto"
                      />
                      <motion.div 
                          animate={{ opacity: [0.2, 0.6, 0.2] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                          className="h-1.5 bg-white/20 rounded-full w-[60%] mx-auto"
                      />
                  </div>

                  <p className="text-[10px] font-bold tracking-widest uppercase text-white/40 mt-10 animate-pulse">
                      Analyzing conversation vectors...
                  </p>
              </motion.div>
          </div>
      );
  }

  const { scores = {}, quotes = {}, wrong_answers = [], overall_score } = report;

  const scoreColor = (s) => {
      if (s >= 4) return 'text-green-400 bg-green-500/10 border-green-500/20';
      if (s >= 3) return 'text-[#f5cca8] bg-[#b45309]/20 border-[#b45309]/30';
      return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  const labels = {
      communication_clarity: 'Communication Clarity',
      warmth_and_patience: 'Warmth & Patience',
      ability_to_simplify: 'Ability to Simplify',
      technical_accuracy: 'Technical/Resume Accuracy',
      english_fluency: 'English Fluency'
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#e0ccb8] text-white p-4 md:p-8 font-sans overflow-y-auto print:overflow-visible print:min-h-0 print:h-auto print:bg-white print:text-black selection:bg-black selection:text-white">
        {/* Watermark for Print */}
        <div className="hidden print:flex fixed inset-0 items-center justify-center pointer-events-none z-0 overflow-hidden">
            <div className="text-[10rem] font-black text-black opacity-[0.03] transform -rotate-45 whitespace-nowrap select-none">
                Jigyasa.ai
            </div>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
            @media print {
                body { background-color: white !important; }
                .print-hidden { display: none !important; }
                .print-visible-text { color: black !important; }
                .print-bg { background-color: #f1f5f9 !important; border-color: #cbd5e1 !important; color: black !important; }
            }
        `}} />
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto space-y-8 bg-[#1a0f0a] rounded-[3rem] p-8 md:p-12 shadow-2xl relative"
        >
            <header className="text-center space-y-4 mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-4 print:border-green-500">
                    <CheckCircle2 className="w-10 h-10 text-[#f5cca8] print:text-green-600" />
                </div>
                <h1 className="text-4xl md:text-5xl font-medium tracking-tighter print-visible-text text-white"><span className="text-[#b45309]">{"}"}</span> Assessment Complete</h1>
                <p className="text-white/50 font-medium tracking-wide print:text-gray-600">Here is the detailed breakdown of your interview.</p>
                
                <div className="mt-8 p-8 bg-[#1a0f0a] rounded-[2rem] border border-white/10 shadow-[0_0_40px_-10px_rgba(180,83,9,0.15)] inline-block min-w-[300px] print-bg">
                    <div className="text-xs text-white/50 mb-2 uppercase tracking-widest font-bold print:text-gray-700">Overall Score</div>
                    <div className="text-6xl font-medium text-[#f5cca8] print:text-indigo-700">
                        {overall_score || 0} <span className="text-2xl text-white/20 tracking-widest font-bold">/ 5</span>
                    </div>
                </div>
                
                {report.error && (
                    <div className="mt-4 p-4 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl max-w-2xl mx-auto text-sm text-left font-mono">
                        <span className="font-bold uppercase block mb-1">Backend Parsing Error:</span>
                        {report.error}
                    </div>
                )}
            </header>

            <div className="grid gap-6 md:grid-cols-2 print:block print:space-y-6">
                {Object.keys(scores).map((key) => (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        key={key} 
                        className="bg-white/5 border border-white/10 rounded-[2rem] p-8 print-bg print:break-inside-avoid print:mb-6 print:!opacity-100 print:!scale-100 print:!transform-none"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="font-medium tracking-tighter text-xl text-white print-visible-text">{labels[key] || key}</h3>
                            <div className={`px-3 py-1.5 rounded-full border text-[10px] tracking-widest font-bold uppercase print-visible-text ${scoreColor(scores[key])}`}>
                                {scores[key]} / 5
                            </div>
                        </div>
                        <div className="bg-[#1a0f0a]/80 p-6 rounded-[1.5rem] mt-4 print-bg border border-white/5">
                            <div className="text-[10px] text-white/40 mb-3 uppercase tracking-widest font-bold print:text-gray-700">Evidence Quote</div>
                            <blockquote className="text-white/80 italic border-l-2 border-[#b45309] pl-4 pt-1 pb-1 print:text-gray-800">
                                "{quotes[key]}"
                            </blockquote>
                        </div>
                    </motion.div>
                ))}
            </div>

            {wrong_answers && wrong_answers.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6 text-red-400 border-b border-red-400/20 pb-4 print:text-red-700 print:border-red-200">
                        Areas for Improvement (Wrong / Weak Answers)
                    </h2>
                    <div className="space-y-4">
                        {wrong_answers.map((wa, idx) => (
                            <div key={idx} className="bg-red-950/20 border border-red-900/30 p-6 rounded-2xl print-bg">
                                <div className="mb-4">
                                    <span className="text-xs font-bold uppercase text-red-500 tracking-wide">Question</span>
                                    <h4 className="text-lg font-medium text-slate-200 mt-1 print-visible-text">{wa.question}</h4>
                                </div>
                                <div className="mb-4 pl-4 border-l-2 border-slate-700">
                                    <span className="text-xs font-bold uppercase text-slate-500 tracking-wide print:text-gray-600">Candidate Answer</span>
                                    <p className="text-slate-300 mt-1 italic print:text-gray-800">"{wa.candidate_answer}"</p>
                                </div>
                                <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 print:bg-red-50 print:border-red-200">
                                    <span className="text-xs font-bold uppercase text-red-400 tracking-wide print:text-red-600">Why it missed the mark</span>
                                    <p className="text-red-200 mt-1 print:text-red-900">{wa.reason}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-12 pb-8 print-hidden">
                <button
                    onClick={handlePrint}
                    className="px-8 py-4 bg-white hover:bg-white/90 text-[#1a0f0a] rounded-full transition-colors tracking-widest uppercase text-xs font-bold flex justify-center items-center gap-2 shadow-xl shadow-white/5"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download PDF
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white rounded-full transition-colors tracking-widest uppercase text-xs font-bold"
                >
                    Back to Dashboard
                </button>
            </div>
        </motion.div>
    </div>
  );
}
