import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, CheckCircle2, XCircle, AlertTriangle, Zap, ChevronRight } from 'lucide-react';
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
      <div className="px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
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
    gap: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    issue: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };
  const icons = {
    found: <CheckCircle2 className="w-3 h-3 shrink-0" />,
    missing: <XCircle className="w-3 h-3 shrink-0" />,
    gap: <AlertTriangle className="w-3 h-3 shrink-0" />,
    issue: <AlertTriangle className="w-3 h-3 shrink-0" />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[type]}`}>
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
    <section id="ats-checker" className="max-w-7xl mx-auto px-6 pb-20 relative z-20">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-[2.5rem] bg-[#1a0f0a]/95 border border-white/8 overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-8 md:p-12 border-b border-white/5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="text-xs tracking-widest uppercase font-bold text-[#f5cca8] mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Free · No Login Required
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tighter text-white mb-3">
                Instant ATS Resume<br />Checker
              </h2>
              <p className="text-white/50 font-medium max-w-lg">
                Upload your resume and find out in seconds if an ATS will filter you out — before a human ever sees it.
              </p>
            </div>
            {/* Drop zone */}
            <div className="md:w-80 shrink-0">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`relative group cursor-pointer rounded-[1.5rem] border-2 border-dashed p-8 text-center transition-all duration-300 ${
                  dragging ? 'border-[#f5cca8] bg-[#f5cca8]/5' :
                  file ? 'border-[#b45309] bg-[#b45309]/10' :
                  'border-white/15 hover:border-[#b45309]/50 hover:bg-white/3'
                }`}
              >
                <input
                  type="file" accept=".pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-8 h-8 text-[#f5cca8]" />
                    <p className="text-[#f5cca8] font-bold text-sm truncate max-w-full px-2">{file.name}</p>
                    <p className="text-white/30 text-xs">Click to change file</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FileUp className="w-8 h-8 text-white/30 group-hover:text-[#b45309] transition-colors" />
                    <p className="text-white/50 text-xs font-bold tracking-widest uppercase">Drop PDF or click to upload</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleCheck}
                disabled={!file || loading}
                className="mt-4 w-full py-4 rounded-full bg-white hover:bg-white/90 text-[#1a0f0a] text-sm font-bold tracking-widest uppercase transition-all shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Analysing...' : 'Check My Resume'}
              </button>
              {error && <p className="mt-3 text-red-400 text-xs text-center font-medium">{error}</p>}
            </div>
          </div>
        </div>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 flex flex-col items-center gap-6"
            >
              <div className="relative w-20 h-28 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center p-2">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-[#f5cca8] shadow-[0_0_15px_3px_rgba(245,204,168,0.6)]"
                  style={{ animation: 'scan 1.8s ease-in-out infinite' }} />
                <div className="w-full h-full flex flex-col gap-2 p-2 opacity-20">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`h-1.5 bg-white rounded-full`}
                      style={{ width: ['50%','100%','75%','100%','65%','100%'][i] }} />
                  ))}
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-medium tracking-tighter text-xl mb-1">Scanning ATS Compatibility</p>
                <p className="text-white/40 text-xs font-bold tracking-widest uppercase animate-pulse">Analysing sections, keywords, formatting...</p>
              </div>
              <style>{`@keyframes scan { 0%{top:0;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:100%;opacity:0} }`}</style>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-8 md:p-12"
            >
              {/* Score row */}
              <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center md:items-start mb-10">
                <ScoreDial score={result.ats_score ?? 0} grade={result.grade ?? 'C'} />
                <div className="flex-1 text-center md:text-left">
                  <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-3">ATS Verdict</p>
                  <p className="text-white font-medium text-lg leading-relaxed">{result.ats_verdict}</p>
                </div>
              </div>

              {/* Sections found / missing */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 rounded-2xl bg-white/3 border border-white/5">
                  <p className="text-xs font-bold tracking-widest uppercase text-green-400 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Sections Detected
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(result.sections_found ?? []).map((s, i) => <Pill key={i} text={s} type="found" />)}
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-white/3 border border-white/5">
                  <p className="text-xs font-bold tracking-widest uppercase text-red-400 mb-4 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Sections Missing
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(result.sections_missing ?? []).map((s, i) => <Pill key={i} text={s} type="missing" />)}
                    {(result.sections_missing ?? []).length === 0 && (
                      <span className="text-white/30 text-sm">None detected 🎉</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Keyword gaps + formatting issues */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 rounded-2xl bg-white/3 border border-white/5">
                  <p className="text-xs font-bold tracking-widest uppercase text-amber-400 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Keyword Gaps
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(result.keyword_gaps ?? []).map((s, i) => <Pill key={i} text={s} type="gap" />)}
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-white/3 border border-white/5">
                  <p className="text-xs font-bold tracking-widest uppercase text-orange-400 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Formatting Issues
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(result.formatting_issues ?? []).map((s, i) => <Pill key={i} text={s} type="issue" />)}
                    {(result.formatting_issues ?? []).length === 0 && (
                      <span className="text-white/30 text-sm">No major issues 🎉</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick wins */}
              <div className="p-6 rounded-2xl bg-[#b45309]/8 border border-[#b45309]/20 mb-8">
                <p className="text-xs font-bold tracking-widest uppercase text-[#f5cca8] mb-5 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> 4 Quick Wins — Fix These Today
                </p>
                <div className="space-y-3">
                  {(result.quick_wins ?? []).map((win, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-7 h-7 shrink-0 rounded-full bg-[#b45309]/20 border border-[#b45309]/30 flex items-center justify-center text-[#f5cca8] font-bold text-xs">
                        {i + 1}
                      </div>
                      <p className="text-white/80 text-sm font-medium leading-relaxed pt-1">{win}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-6 rounded-2xl bg-white/3 border border-white/5">
                <div>
                  <p className="text-white font-bold tracking-tight text-lg mb-1">Ready for a mock interview?</p>
                  <p className="text-white/40 text-sm">Practice HR, Technical, or GD rounds with AI feedback.</p>
                </div>
                <button
                  onClick={() => onGoToAuth('register')}
                  className="shrink-0 flex items-center gap-2 px-8 py-4 rounded-full bg-white hover:bg-white/90 text-[#1a0f0a] text-sm font-bold tracking-widest uppercase transition shadow-xl"
                >
                  Start Free <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
