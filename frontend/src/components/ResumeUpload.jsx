import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileUp, CheckCircle2, Users, Cpu, MessageSquare, ListChecks } from 'lucide-react';

const MODES = [
  {
    id: 'hr',
    icon: <Users className="w-7 h-7" />,
    title: 'Tutor HR Round',
    subtitle: 'Behavioural & School Culture',
    description: 'Values, teamwork, and pedagogical alignment. Suitable for tutors, administrators, and educational staff seeking roles.',
    accent: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.25)',
  },
  {
    id: 'technical',
    icon: <Cpu className="w-7 h-7" />,
    title: 'Tutor Domain Specific Interview Round',
    subtitle: 'Subject Expertise & Methods',
    description: 'Deep dive into your specific teaching domain (Math, Science, Humanities, etc.). Probes your core subject knowledge and classroom methods.',
    accent: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.25)',
  },
  {
    id: 'gd',
    icon: <MessageSquare className="w-7 h-7" />,
    title: 'Communication and Current Affairs Round for Tutors',
    subtitle: 'Policy & Articulation',
    description: 'The AI debates educational policy and school current affairs. Practice articulating viewpoints on educational trends and social issues.',
    accent: '#a855f7',
    bg: 'rgba(168,85,247,0.08)',
    border: 'rgba(168,85,247,0.25)',
  },
];

export default function ResumeUpload({ type = 'practice', onUpload, onBack }) {
  const [file, setFile] = useState(null);
  const [selectedMode, setSelectedMode] = useState(type === 'exam' ? 'hr' : null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (type === 'exam') setSelectedMode('hr');
  }, [type]);

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
    <div className="min-h-screen bg-[#1a0f0a] p-4 sm:p-8 flex items-center justify-center selection:bg-[#b45309] selection:text-white relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[20%] left-[10%] w-[50%] h-[50%] bg-[#b45309] rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] sm:rounded-[4rem] p-6 sm:p-12 shadow-2xl relative overflow-hidden"
      >
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-full border border-white/10 transition-all text-[10px] font-bold uppercase tracking-widest"
        >
          <span>←</span> Back
        </button>

        <div className="relative z-10">
          <h1 className="text-3xl sm:text-5xl font-medium tracking-tighter mb-4 text-white text-center mt-12 sm:mt-0 uppercase italic">
            Session <span className="text-[#f5cca8]">Setup</span>
          </h1>
          <p className="text-white/40 font-medium mb-10 text-center tracking-widest uppercase text-[10px] sm:text-xs">
            {type === 'exam' ? '3-Round Sequential Evaluation' : 'Select your interview parameter'}
          </p>

          {type === 'practice' ? (
            <div className="grid gap-4 mb-10">
                {MODES.map((mode) => (
                <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className="w-full text-left p-5 rounded-3xl border-2 transition-all duration-300 flex items-start gap-5 relative overflow-hidden group"
                    style={{
                    background: selectedMode === mode.id ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                    borderColor: selectedMode === mode.id ? mode.accent : 'rgba(255,255,255,0.05)',
                    boxShadow: selectedMode === mode.id ? `0 0 30px ${mode.accent}20` : 'none',
                    }}
                >
                    <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: `${mode.accent}18`, color: mode.accent }}>
                    {mode.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                        <span className="text-white font-bold tracking-tight text-sm sm:text-base leading-tight uppercase">{mode.title}</span>
                    </div>
                    <p className="text-white/40 text-[11px] sm:text-xs leading-relaxed tracking-wide">{mode.description}</p>
                    </div>
                    <div className="shrink-0 w-6 h-6 rounded-full border-2 mt-1 flex items-center justify-center transition-all"
                    style={{
                        borderColor: selectedMode === mode.id ? mode.accent : 'rgba(255,255,255,0.1)',
                        background: selectedMode === mode.id ? mode.accent : 'transparent',
                    }}>
                    {selectedMode === mode.id && <CheckCircle2 className="w-4 h-4 text-[#1a0f0a]" />}
                    </div>
                </button>
                ))}
            </div>
          ) : (
            <div className="mb-10 p-8 bg-white/5 border border-white/5 rounded-3xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-[#b45309]/20 rounded-xl flex items-center justify-center text-[#f5cca8]">
                        <ListChecks className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold tracking-widest uppercase text-xs">Exam Protocol</h3>
                        <p className="text-white/20 text-[10px] uppercase font-bold">Standardized Rubric</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {['Communication (GD)', 'Domain Specific', 'HR Round'].map((round, idx) => (
                        <div key={idx} className="flex items-center gap-4 text-white/60">
                            <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">{idx + 1}</div>
                            <span className="text-xs font-medium uppercase tracking-widest">{round}</span>
                        </div>
                    ))}
                </div>
            </div>
          )}

          {/* Resume Upload */}
          <div className="mb-8">
            <p className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 text-center">
              Candidate Resume <span className="text-[#f5cca8] font-black">(PDF ONLY)</span>
            </p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`relative group cursor-pointer rounded-[2rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center py-10 ${
                dragging ? 'border-[#f5cca8] bg-[#f5cca8]/5' :
                file ? 'border-[#b45309] bg-[#b45309]/10' :
                'border-white/10 hover:border-white/20 bg-white/2'
              }`}
            >
              <input
                type="file" accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {file ? (
                <div className="flex flex-col items-center gap-3 px-4 text-center animate-in fade-in zoom-in duration-300">
                  <div className="w-12 h-12 bg-[#b45309] rounded-2xl flex items-center justify-center text-[#1a0f0a] mb-2 shadow-lg shadow-[#b45309]/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className="text-[#f5cca8] font-bold text-sm tracking-tight truncate max-w-[200px]">{file.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-white/30 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/2 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileUp className="w-8 h-8 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.3em] uppercase group-hover:text-white transition-colors">Select PDF Document</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedMode || !file}
            className="w-full py-5 bg-white hover:bg-[#b45309] text-[#1a0f0a] hover:text-white rounded-full transition-all duration-500 font-bold tracking-[0.2em] uppercase text-xs shadow-2xl disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed"
          >
            {type === 'exam' ? 'Start 3-Round Assessment' : (selectedMode ? `Initialize ${selectedMode.toUpperCase()} Round` : 'Configure Selection')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
