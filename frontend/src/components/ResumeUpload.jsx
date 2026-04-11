import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUp, CheckCircle2, Users, Cpu, MessageSquare } from 'lucide-react';

const MODES = [
  {
    id: 'hr',
    icon: <Users className="w-7 h-7" />,
    title: 'HR Round',
    subtitle: 'Behavioural & Culture Fit',
    description: 'Values, teamwork, conflict resolution, career goals, and communication. Suitable for any field or industry.',
    accent: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.25)',
  },
  {
    id: 'technical',
    icon: <Cpu className="w-7 h-7" />,
    title: 'Technical Round',
    subtitle: 'Resume-Specific Deep Dive',
    description: 'Probes your actual projects, tools, and domain expertise — whether you are in engineering, data science, medicine, design, or finance.',
    accent: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.25)',
  },
  {
    id: 'gd',
    icon: <MessageSquare className="w-7 h-7" />,
    title: 'Group Discussion',
    subtitle: 'Debate & Articulation',
    description: 'The AI plays a live debate partner. Practice structuring arguments, handling counterpoints, and leading a discussion confidently.',
    accent: '#a855f7',
    bg: 'rgba(168,85,247,0.08)',
    border: 'rgba(168,85,247,0.25)',
  },
];

export default function ResumeUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = () => {
    if (selectedMode) onUpload(file, selectedMode);
  };

  return (
    <div className="min-h-screen bg-[#e0ccb8] p-4 md:p-8 flex flex-col items-center justify-center selection:bg-black selection:text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-[#1a0f0a] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
      >
        {/* Orbital rings */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 mix-blend-overlay" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="80%" cy="20%" rx="50%" ry="100%" fill="none" stroke="#fff" strokeWidth="1" />
          <ellipse cx="-10%" cy="80%" rx="60%" ry="80%" fill="none" stroke="#fff" strokeWidth="1" />
        </svg>

        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tighter mb-2 text-white text-center">
            <span className="text-[#b45309]">{"{"}</span> Choose Your Round <span className="text-[#b45309]">{"}"}</span>
          </h1>
          <p className="text-white/40 font-medium mb-8 text-center tracking-wide text-sm">
            Select an interview mode to tailor the AI to your goal.
          </p>

          {/* Mode Cards */}
          <div className="grid gap-4 mb-8">
            {MODES.map((mode) => (
              <motion.button
                key={mode.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedMode(mode.id)}
                className="w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-start gap-5"
                style={{
                  background: selectedMode === mode.id ? mode.bg : 'rgba(255,255,255,0.03)',
                  borderColor: selectedMode === mode.id ? mode.border : 'rgba(255,255,255,0.07)',
                  boxShadow: selectedMode === mode.id ? `0 0 20px ${mode.accent}22` : 'none',
                }}
              >
                <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${mode.accent}18`, color: mode.accent }}>
                  {mode.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-bold tracking-tight">{mode.title}</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
                      style={{ background: `${mode.accent}18`, color: mode.accent }}>
                      {mode.subtitle}
                    </span>
                  </div>
                  <p className="text-white/45 text-sm leading-relaxed">{mode.description}</p>
                </div>
                <div className="shrink-0 w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center transition-colors"
                  style={{
                    borderColor: selectedMode === mode.id ? mode.accent : 'rgba(255,255,255,0.2)',
                    background: selectedMode === mode.id ? mode.accent : 'transparent',
                  }}>
                  {selectedMode === mode.id && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Resume Upload (optional) */}
          <div className="mb-6">
            <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-3 text-center">
              Resume Upload <span className="text-white/20 normal-case font-normal tracking-normal">(optional — makes questions more specific)</span>
            </p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`relative group cursor-pointer rounded-2xl border border-dashed transition-all duration-300 flex flex-col items-center justify-center py-6 ${
                dragging ? 'border-[#f5cca8] bg-[#f5cca8]/5' :
                file ? 'border-[#b45309] bg-[#b45309]/10' :
                'border-white/15 hover:border-[#b45309]/40 bg-white/2'
              }`}
            >
              <input
                type="file" accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {file ? (
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#f5cca8]" />
                  <span className="text-[#f5cca8] font-bold text-sm">{file.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-white/30">
                  <FileUp className="w-5 h-5 group-hover:text-[#b45309] transition-colors" />
                  <span className="text-xs font-bold tracking-widest uppercase group-hover:text-white/60 transition-colors">Click or drag PDF here</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSubmit}
              disabled={!selectedMode}
              className="w-full py-4 bg-white hover:bg-white/90 text-[#1a0f0a] rounded-full transition-all font-bold tracking-widest uppercase text-xs shadow-xl disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed"
            >
              {selectedMode
                ? `Start ${MODES.find(m => m.id === selectedMode)?.title}`
                : 'Select a Mode to Continue'}
            </button>
            <button
              type="button"
              onClick={() => onUpload(null, 'hr')}
              className="w-full py-3 text-white/30 hover:text-white/60 font-bold text-[10px] tracking-widest uppercase transition-colors"
            >
              Skip — Quick Start (HR Mode)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
