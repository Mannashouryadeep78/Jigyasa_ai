import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, CheckCircle2, XCircle, AlertTriangle, Zap, ChevronRight, Sparkles } from 'lucide-react';
import { api } from '../api/client';

const GRADE_CONFIG = {
  A: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'ATS Ready', ring: '#22c55e' },
  B: { color: '#84cc16', bg: 'rgba(132,204,22,0.1)', label: 'Good Shape', ring: '#84cc16' },
  C: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Needs Work', ring: '#f59e0b' },
  D: { color: '#f97316', bg: 'rgba(249,115,22,0.1)', label: 'At Risk', ring: '#f97316' },
  F: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Will Be Filtered', ring: '#ef4444' },
};

function ScoreDial({ score, grade }) {
  const cfg = GRADE_CONFIG[grade] || GRADE_CONFIG['C'];
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={cfg.ring}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s ease', filter: `drop-shadow(0 0 8px ${cfg.ring}88)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">/ 100</span>
        </div>
      </div>
      <div className="px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase"
        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
        {grade} — {cfg.label}
      </div>
    </div>
  );
}

function Pill({ text, type }) {
  const styles = {
    found: 'bg-green-500/10 text-green-400 border-green-500/20',
    missing: 'bg-red-500/10 text-red-400 border-red-500/20',
    gap: 'bg-[#b45309]/10 text-[#f5cca8] border-[#b45309]/20',
    issue: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };
  const icons = {
    found: <CheckCircle2 className="w-3 h-3 shrink-0" />,
    missing: <XCircle className="w-3 h-3 shrink-0" />,
    gap: <AlertTriangle className="w-3 h-3 shrink-0" />,
    issue: <AlertTriangle className="w-3 h-3 shrink-0" />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${styles[type]}`}>
      {icons[type]}
      {text}
    </span>
  );
}

export default function ATSChecker({ onGoToAuth }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const handleFile = (f) => {
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setResult(null);
      setError('');
    } else {
      setError('Please upload a PDF file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleCheck = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await api.checkATS(file);
      setResult(data);
    } catch (e) {
      setError('Analysis failed. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="ats-checker" className="w-full relative z-20">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-[1.8rem] bg-[#1a0800]/90 backdrop-blur-sm border border-white/8 overflow-hidden shadow-2xl relative"
      >
        
        {/* Header */}
        <div className="p-12 lg:p-16 border-b border-white/5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase font-black text-[#b45309] mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Free · No Login Required
              </div>
              <h2 className="text-4xl md:text-5xl font-medium tracking-tighter text-white mb-6 leading-[1.1]">
                Tutor Resume<br />Compliance Checker
              </h2>
              <p className="text-white/40 text-sm font-medium max-w-lg leading-relaxed">
                Upload your teaching CV and find out in seconds if school recruitment systems will filter you out — before a principal ever sees it.
              </p>
            </div>

            {/* Drop zone */}
            <div className="lg:w-96 shrink-0 relative z-10">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`relative group cursor-pointer rounded-[2rem] border-2 border-dashed p-10 text-center transition-all duration-500 ${
                  dragging ? 'border-[#f5cca8] bg-[#f5cca8]/5' :
                  file ? 'border-[#b45309] bg-[#b45309]/10' :
                  'border-white/10 hover:border-[#b45309]/30 hover:bg-white/5'
                }`}
              >
                <input
                  type="file" accept=".pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                {file ? (
                  <div className="flex flex-col items-center gap-3">
                    <CheckCircle2 className="w-10 h-10 text-[#f5cca8] animate-bounce" />
                    <p className="text-[#f5cca8] font-bold text-sm truncate max-w-full px-4">{file.name}</p>
                    <p className="text-white/20 text-[10px] font-black tracking-widest uppercase">Click to change file</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-[#b45309]/10 transition-all">
                      <FileUp className="w-8 h-8 text-white/20 group-hover:text-[#b45309] transition-colors" />
                    </div>
                    <p className="text-white/30 text-[10px] font-black tracking-widest uppercase leading-relaxed">
                        Drop PDF or<br />click to upload
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={handleCheck}
                disabled={!file || loading}
                className="mt-6 w-full py-5 rounded-full bg-white hover:bg-[#f5cca8] text-[#1a0f0a] text-xs font-black tracking-[0.2em] uppercase transition-all shadow-2xl disabled:opacity-20 disabled:cursor-not-allowed group"
              >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        Analysing <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }}>...</motion.span>
                    </span>
                ) : 'Check My Resume'}
              </button>
              {error && <p className="mt-4 text-red-400 text-[10px] font-black tracking-widest uppercase text-center">{error}</p>}
            </div>
          </div>
        </div>

        {/* Loading / Scan line effect */}
        {loading && (
            <div className="h-1 bg-white/5 relative overflow-hidden">
                <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-[#b45309] to-transparent w-1/3"
                />
            </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="p-12 lg:p-16 bg-gradient-to-b from-transparent to-black/20"
            >
              {/* Score card */}
              <div className="grid lg:grid-cols-3 gap-12 items-center mb-16">
                <ScoreDial score={result.ats_score ?? 0} grade={result.grade ?? 'C'} />
                <div className="lg:col-span-2">
                  <p className="text-[#b45309] text-[10px] font-black tracking-widest uppercase mb-4">School System Verdict</p>
                  <p className="text-white/80 font-medium text-xl leading-relaxed">"{result.ats_verdict}"</p>
                </div>
              </div>

              {/* Detail Grids */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/5">
                  <p className="text-[10px] font-black tracking-widest uppercase text-green-400 mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Detected
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(result.sections_found ?? []).map((s, i) => <Pill key={i} text={s} type="found" />)}
                  </div>
                </div>
                <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/5">
                  <p className="text-[10px] font-black tracking-widest uppercase text-red-400 mb-6 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Missing
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(result.sections_missing ?? []).map((s, i) => <Pill key={i} text={s} type="missing" />)}
                  </div>
                </div>
              </div>

              {/* Optimizations */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/5">
                    <p className="text-[10px] font-black tracking-widest uppercase text-[#f5cca8] mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Keyword Gaps
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {(result.keyword_gaps ?? []).map((s, i) => <Pill key={i} text={s} type="gap" />)}
                    </div>
                </div>
                <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/5">
                  <p className="text-[10px] font-black tracking-widest uppercase text-orange-400 mb-6 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Quick Wins
                  </p>
                  <div className="space-y-3">
                    {(result.quick_wins ?? []).map((win, i) => (
                        <div key={i} className="text-[11px] text-white/40 font-medium leading-relaxed">• {win}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-10 rounded-[2.5rem] bg-[#b45309]/5 border border-[#b45309]/20 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <p className="text-white font-medium text-lg mb-1 tracking-tight">Ready for a tutor mock interview?</p>
                  <p className="text-white/30 text-xs font-medium">Practice Tutor HR, Domain, or Policy rounds with AI feedback.</p>
                </div>
                <button
                  onClick={() => onGoToAuth('register')}
                  className="px-10 py-5 rounded-full bg-white text-[#1a0f0a] text-[10px] font-black tracking-widest uppercase hover:bg-[#f5cca8] transition-all"
                >
                  Start Practice Session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

