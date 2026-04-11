import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, CheckCircle2, XCircle, AlertTriangle, Zap, ChevronRight } from 'lucide-react';
import { api } from '../api/client';

const GRADE = {
  A: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.25)',  label: 'ATS Ready'        },
  B: { color: '#a3e635', bg: 'rgba(163,230,53,0.1)',  border: 'rgba(163,230,53,0.25)',  label: 'Good Shape'       },
  C: { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)',  label: 'Needs Attention'  },
  D: { color: '#fb923c', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.25)',  label: 'At Risk'          },
  F: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', label: 'Will Be Filtered' },
};

function ScoreDial({ score, grade }) {
  const cfg = GRADE[grade] ?? GRADE['C'];
  const r = 48, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
      <div style={{ position: 'relative', width: '120px', height: '120px' }}>
        <svg viewBox="0 0 110 110" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
          <circle cx="55" cy="55" r={r} fill="none" stroke={cfg.color} strokeWidth="9"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s ease', filter: `drop-shadow(0 0 6px ${cfg.color}88)` }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: '0.6rem', color: 'rgba(241,245,249,0.35)', fontWeight: 700 }}>/ 100</span>
        </div>
      </div>
      <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.25rem 0.75rem', borderRadius: '999px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
        {grade} · {cfg.label}
      </span>
    </div>
  );
}

function Tag({ text, type }) {
  const styles = {
    found:   { bg: 'rgba(74,222,128,0.08)',  color: '#4ade80',  border: 'rgba(74,222,128,0.2)',  icon: <CheckCircle2 size={11} /> },
    missing: { bg: 'rgba(248,113,113,0.08)', color: '#f87171',  border: 'rgba(248,113,113,0.2)', icon: <XCircle size={11} /> },
    gap:     { bg: 'rgba(251,191,36,0.08)',  color: '#fbbf24',  border: 'rgba(251,191,36,0.2)',  icon: <AlertTriangle size={11} /> },
    issue:   { bg: 'rgba(251,146,60,0.08)',  color: '#fb923c',  border: 'rgba(251,146,60,0.2)',  icon: <AlertTriangle size={11} /> },
  };
  const s = styles[type];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.icon} {text}
    </span>
  );
}

function Panel({ label, color, icon, children }) {
  return (
    <div style={{ padding: '1.1rem', borderRadius: '0.875rem', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color, margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>{icon} {label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>{children}</div>
    </div>
  );
}

export default function ATSChecker({ onGoToAuth }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const handleFile = (f) => {
    if (f?.type === 'application/pdf') { setFile(f); setResult(null); setError(''); }
    else if (f) setError('Please upload a PDF file.');
  };

  const handleCheck = async () => {
    if (!file) return;
    setLoading(true); setError(''); setResult(null);
    try { setResult(await api.checkATS(file)); }
    catch { setError('Analysis failed — please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div id="ats-checker">
      {/* Section header */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', borderRadius: '999px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '0.75rem' }}>
          <Zap size={11} color="#fbbf24" />
          <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fbbf24' }}>Free · No Login Needed</span>
        </div>
        <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 0.6rem' }}>
          Instant ATS Resume <span className="text-gradient">Checker</span>
        </h2>
        <p style={{ color: 'rgba(241,245,249,0.5)', maxWidth: '500px', margin: '0 auto', fontSize: '0.9rem' }}>
          Find out if an ATS will reject you before a human ever sees your resume.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="glass" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>

        {/* Upload area */}
        <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: '1', minWidth: '220px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.3rem', letterSpacing: '-0.02em' }}>Upload your resume</h3>
            <p style={{ color: 'rgba(241,245,249,0.4)', fontSize: '0.82rem', margin: 0 }}>PDF only · Results in under 10 seconds</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Drop zone */}
            <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
              style={{ position: 'relative', padding: '0.7rem 1.25rem', borderRadius: '0.75rem', border: `1.5px dashed ${dragging ? 'rgba(99,102,241,0.5)' : file ? 'rgba(74,222,128,0.35)' : 'rgba(255,255,255,0.12)'}`, background: file ? 'rgba(74,222,128,0.05)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'all 0.2s', minWidth: '200px' }}>
              <input type="file" accept=".pdf" onChange={e => handleFile(e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 5 }} />
              {file ? <CheckCircle2 size={16} color="#4ade80" /> : <FileUp size={16} color="rgba(241,245,249,0.35)" />}
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: file ? '#4ade80' : 'rgba(241,245,249,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                {file ? file.name : 'Drop PDF or click'}
              </span>
            </div>
            <button onClick={handleCheck} disabled={!file || loading} className="btn-primary" style={{ padding: '0.7rem 1.5rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
              {loading ? 'Analysing...' : 'Check Resume'}
            </button>
          </div>
          {error && <p style={{ width: '100%', textAlign: 'center', color: '#f87171', fontSize: '0.8rem', margin: 0, fontWeight: 500 }}>{error}</p>}
        </div>

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '60px', height: '75px', borderRadius: '0.7rem', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #6366f1, transparent)', boxShadow: '0 0 10px rgba(99,102,241,0.8)', animation: 'scan 1.8s ease-in-out infinite' }} />
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', opacity: 0.15 }}>
                  {['55%','100%','75%','100%','65%'].map((w, i) => <div key={i} style={{ height: '3px', background: 'white', borderRadius: '2px', width: w }} />)}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 700, color: 'white', margin: '0 0 0.3rem', fontSize: '1rem' }}>Scanning ATS Compatibility</p>
                <p style={{ color: 'rgba(241,245,249,0.4)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0, animation: 'pulse 2s infinite' }}>Checking sections · Keywords · Formatting...</p>
              </div>
              <style>{`@keyframes scan{0%{top:0;opacity:0}10%{opacity:1}90%{opacity:1}100%{top:100%;opacity:0}} @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Score row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.75rem', alignItems: 'flex-start' }}>
                <ScoreDial score={result.ats_score ?? 0} grade={result.grade ?? 'C'} />
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(241,245,249,0.35)', margin: '0 0 0.5rem' }}>ATS Verdict</p>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: 'rgba(241,245,249,0.85)', margin: 0, lineHeight: 1.6 }}>{result.ats_verdict}</p>
                </div>
              </div>

              {/* Sections */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                <Panel label="Sections Found" color="#4ade80" icon={<CheckCircle2 size={12} />}>
                  {(result.sections_found ?? []).map((s, i) => <Tag key={i} text={s} type="found" />)}
                </Panel>
                <Panel label="Sections Missing" color="#f87171" icon={<XCircle size={12} />}>
                  {(result.sections_missing ?? []).length > 0
                    ? (result.sections_missing ?? []).map((s, i) => <Tag key={i} text={s} type="missing" />)
                    : <span style={{ fontSize: '0.8rem', color: 'rgba(241,245,249,0.3)' }}>None — great! 🎉</span>}
                </Panel>
              </div>

              {/* Gaps & Issues */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                <Panel label="Keyword Gaps" color="#fbbf24" icon={<AlertTriangle size={12} />}>
                  {(result.keyword_gaps ?? []).map((s, i) => <Tag key={i} text={s} type="gap" />)}
                </Panel>
                <Panel label="Formatting Issues" color="#fb923c" icon={<AlertTriangle size={12} />}>
                  {(result.formatting_issues ?? []).length > 0
                    ? (result.formatting_issues ?? []).map((s, i) => <Tag key={i} text={s} type="issue" />)
                    : <span style={{ fontSize: '0.8rem', color: 'rgba(241,245,249,0.3)' }}>No issues found 🎉</span>}
                </Panel>
              </div>

              {/* Quick wins */}
              <div style={{ padding: '1.25rem', borderRadius: '0.875rem', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#818cf8', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Zap size={12} /> 4 Quick Wins — Fix These Today
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  {(result.quick_wins ?? []).map((win, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a5b4fc', fontWeight: 800, fontSize: '0.65rem', flexShrink: 0, marginTop: '0.1rem' }}>{i + 1}</div>
                      <p style={{ color: 'rgba(241,245,249,0.75)', fontSize: '0.85rem', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{win}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1.25rem', borderRadius: '0.875rem', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <p style={{ fontWeight: 700, color: 'white', margin: '0 0 0.2rem', fontSize: '0.95rem' }}>Practice with AI mock interviews</p>
                  <p style={{ color: 'rgba(241,245,249,0.4)', fontSize: '0.8rem', margin: 0 }}>HR, Technical and GD rounds with instant scoring</p>
                </div>
                <button onClick={() => onGoToAuth('register')} className="btn-primary" style={{ gap: '0.4rem', padding: '0.65rem 1.5rem', fontSize: '0.75rem', flexShrink: 0 }}>
                  Start Free <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
