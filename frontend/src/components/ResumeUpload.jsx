import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUp, CheckCircle2, Users, Cpu, MessageSquare, ArrowRight } from 'lucide-react';

const MODES = [
  {
    id: 'hr',
    icon: <Users size={20} />,
    title: 'HR Round',
    sub: 'Behavioural & Culture Fit',
    desc: 'Values, teamwork, conflict resolution, and career goals. Works for any field.',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.15)',
  },
  {
    id: 'technical',
    icon: <Cpu size={20} />,
    title: 'Technical Round',
    sub: 'Resume-Specific Deep Dive',
    desc: 'Probes your actual projects and domain — engineering, data, medicine, design, finance.',
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.15)',
  },
  {
    id: 'gd',
    icon: <MessageSquare size={20} />,
    title: 'Group Discussion',
    sub: 'Debate & Articulation',
    desc: 'AI plays a live debate partner. Practice structuring arguments and handling counterpoints.',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.15)',
  },
];

export default function ResumeUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f) => { if (f) setFile(f); };
  const handleDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };
  const handleSubmit = () => { if (selectedMode) onUpload(file, selectedMode); };

  const selected = MODES.find(m => m.id === selectedMode);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: 'Inter, sans-serif', position: 'relative' }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', borderRadius: '50%', background: `radial-gradient(circle, ${selectedMode ? MODES.find(m=>m.id===selectedMode)?.glow : 'rgba(99,102,241,0.08)'} 0%, transparent 70%)`, filter: 'blur(40px)', pointerEvents: 'none', transition: 'background 0.5s' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: '520px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 0.4rem', color: 'white' }}>
            Choose your <span className="text-gradient">round</span>
          </h1>
          <p style={{ color: 'rgba(241,245,249,0.4)', fontSize: '0.85rem', margin: 0, fontWeight: 500 }}>
            Select an interview mode to tailor the AI to your goal
          </p>
        </div>

        {/* Mode cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {MODES.map((mode, i) => {
            const isSelected = selectedMode === mode.id;
            return (
              <motion.button key={mode.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                onClick={() => setSelectedMode(mode.id)}
                style={{
                  width: '100%', textAlign: 'left', padding: '1.1rem 1.25rem', borderRadius: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem',
                  background: isSelected ? `${mode.color}10` : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${isSelected ? mode.color + '45' : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: isSelected ? `0 0 24px ${mode.glow}` : 'none',
                  transition: 'all 0.2s',
                }}>
                {/* Icon */}
                <div style={{ width: '42px', height: '42px', borderRadius: '0.75rem', background: `${mode.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: mode.color, flexShrink: 0 }}>
                  {mode.icon}
                </div>
                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white', letterSpacing: '-0.01em' }}>{mode.title}</span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.15rem 0.5rem', borderRadius: '999px', background: `${mode.color}15`, color: mode.color }}>{mode.sub}</span>
                  </div>
                  <p style={{ color: 'rgba(241,245,249,0.45)', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>{mode.desc}</p>
                </div>
                {/* Radio */}
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${isSelected ? mode.color : 'rgba(255,255,255,0.18)'}`, background: isSelected ? mode.color : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                  {isSelected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Resume upload */}
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(241,245,249,0.3)', margin: '0 0 0.75rem', textAlign: 'center' }}>
            Resume Upload <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — makes questions more specific)</span>
          </p>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className="glass"
            style={{ position: 'relative', borderRadius: '0.875rem', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', cursor: 'pointer', borderColor: dragging ? 'rgba(99,102,241,0.4)' : file ? 'rgba(34,197,94,0.3)' : undefined, transition: 'all 0.2s' }}>
            <input type="file" accept=".pdf" onChange={e => handleFile(e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }} />
            <div style={{ width: '38px', height: '38px', borderRadius: '0.6rem', background: file ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {file ? <CheckCircle2 size={18} color="#4ade80" /> : <FileUp size={18} color="rgba(241,245,249,0.3)" />}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', color: file ? '#4ade80' : 'rgba(241,245,249,0.6)' }}>
                {file ? file.name : 'Click or drag PDF here'}
              </p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(241,245,249,0.3)', marginTop: '0.1rem' }}>
                {file ? 'Resume ready' : 'PDF files only'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <button onClick={handleSubmit} disabled={!selectedMode} className="btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '0.8rem', gap: '0.5rem', justifyContent: 'center', opacity: selectedMode ? 1 : 0.4 }}>
            {selectedMode ? `Start ${selected?.title}` : 'Select a mode to continue'} {selectedMode && <ArrowRight size={15} />}
          </button>
          <button onClick={() => onUpload(null, 'hr')}
            style={{ width: '100%', padding: '0.65rem', borderRadius: '999px', background: 'none', border: 'none', color: 'rgba(241,245,249,0.25)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(241,245,249,0.5)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(241,245,249,0.25)'}>
            Skip — Quick Start (HR Mode)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
