import React, { useState } from 'react';
import { FileUp, FileText } from 'lucide-react';

export default function ResumeUpload({ onUpload }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#e0ccb8] text-white p-4 md:p-8 selection:bg-black selection:text-white">
      <div className="max-w-xl w-full bg-[#1a0f0a] border border-white/5 rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden text-center z-10">
        {/* Orbital rings */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 mix-blend-overlay" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="80%" cy="20%" rx="50%" ry="100%" fill="none" stroke="#fff" strokeWidth="1" />
            <ellipse cx="-10%" cy="80%" rx="60%" ry="80%" fill="none" stroke="#fff" strokeWidth="1" />
        </svg>

        <div className="relative z-10">
            <div className="w-20 h-20 bg-[#b45309]/20 border border-[#b45309]/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(180,83,9,0.2)]">
                <FileText className="w-8 h-8 text-[#f5cca8]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tighter mb-4 text-white text-center"><span className="text-[#b45309]">{"{"}</span> Upload Resume <span className="text-[#b45309]">{"}"}</span></h2>
            <p className="text-white/50 font-medium mb-10 text-center tracking-wide text-sm">
                Our AI will parse your resume and uniquely tailor your interview questions based on your background and skills. PDF only.
            </p>

        <div className="relative group cursor-pointer relative z-10 mb-8">
            <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
            />
            <div className={`p-10 border border-dashed rounded-[2rem] transition-all duration-300 flex flex-col items-center
                ${file ? 'border-[#b45309] bg-[#b45309]/10 shadow-[0_0_20px_rgba(180,83,9,0.1)]' : 'border-white/20 group-hover:border-[#b45309]/50 bg-white/5'}`}>
                {file ? (
                    <div className="text-[#f5cca8] font-bold tracking-widest text-sm">{file.name}</div>
                ) : (
                    <>
                        <FileUp className="h-8 w-8 text-white/30 mb-4 group-hover:text-[#b45309] transition-colors" />
                        <span className="text-white/50 text-xs font-bold tracking-widest uppercase">Click or drag PDF here</span>
                    </>
                )}
            </div>
        </div>

        <div className="relative z-10 flex flex-col gap-4">
            <button 
                type="button"
                onClick={handleSubmit}
                disabled={!file}
                className="w-full py-4 bg-white hover:bg-white/90 text-[#1a0f0a] rounded-full transition-all font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2 shadow-xl shadow-white/5 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed disabled:hover:bg-white"
            >
                Start Preparation
            </button>
            <button 
                type="button"
                onClick={() => onUpload(null)}
                className="w-full py-3 text-white/40 hover:text-white font-bold text-[10px] tracking-widest uppercase transition-colors"
            >
                Skip for now
            </button>
        </div>
      </div>
      </div>
    </div>
  );
}
