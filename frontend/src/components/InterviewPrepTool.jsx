import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, Loader2, Play, Download, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../api/client';

export default function InterviewPrepTool({ onBack }) {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, processing, complete, error
    const [results, setResults] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    
    // For expanding individual questions
    const [expanded, setExpanded] = useState({});

    const handleFile = (selectedFile) => {
        if (selectedFile?.type === 'application/pdf') {
            setFile(selectedFile);
        } else {
            alert('Please select a valid PDF file.');
        }
    };

    const handleGenerate = async () => {
        if (!file) return;
        setStatus('processing');
        setErrorMsg("");
        
        try {
            const data = await api.generatePrepQuestions(file);
            if (data?.qa_pairs && Array.isArray(data.qa_pairs)) {
                setResults(data.qa_pairs);
                setStatus('complete');
            } else {
                throw new Error("Invalid format received from server.");
            }
        } catch (e) {
            console.error("Prep Tool Error:", e);
            setStatus('error');
            setErrorMsg(e.message || "Failed to generate interview prep.");
        }
    };

    const toggleExpand = (idx) => {
        setExpanded(prev => ({...prev, [idx]: !prev[idx]}));
    };

    const handlePrint = () => {
        // Expand everything before printing
        const allExpanded = {};
        results.forEach((_, i) => allExpanded[i] = true);
        setExpanded(allExpanded);
        
        // Wait for DOM to update
        setTimeout(() => {
            window.print();
        }, 100);
    };

        return (
            <div className="flex flex-col items-center justify-center text-white selection:bg-black selection:text-white p-4 font-sans print:hidden py-24">
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="w-full max-w-2xl bg-[#1a0f0a] rounded-[3rem] p-12 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center text-center"
              >
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#b45309] to-transparent shadow-[0_0_20px_rgba(180,83,9,0.5)]"></div>
                  
                  <div className="relative w-24 h-24 mb-8">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[#b45309] opacity-50" />
                      <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute inset-2 rounded-full border-b-2 border-l-2 border-white/30" />
                      <div className="absolute inset-4 rounded-full bg-[#b45309]/10 flex items-center justify-center animate-pulse">
                          <Search className="w-6 h-6 text-[#f5cca8]" />
                      </div>
                  </div>

                  <h2 className="text-2xl font-medium tracking-tighter mb-4 text-white">
                      <span className="text-[#b45309]">{"{"}</span> Deep Scanning Resume
                  </h2>
                  
                  <div className="space-y-3 w-full max-w-sm mx-auto mt-4 px-4">
                      <motion.div animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ repeat: Infinity, duration: 1.5 }} className="h-1.5 bg-white/20 rounded-full w-full" />
                      <motion.div animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="h-1.5 bg-[#b45309]/40 rounded-full w-[85%] mx-auto" />
                      <motion.div animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="h-1.5 bg-white/20 rounded-full w-[60%] mx-auto" />
                  </div>

                  <p className="text-[10px] font-bold tracking-widest uppercase text-white/40 mt-10 animate-pulse">
                      Generating Top 15 Targeted Questions... (approx 15s)
                  </p>
              </motion.div>
          </div>
        );
    }

        return (
            <div className="text-[#1a0f0a] p-4 md:p-8 font-sans selection:bg-black selection:text-white print:bg-white print:p-0 pb-20">
                {/* Watermark for Print */}
                <div className="hidden print:flex fixed inset-0 items-center justify-center pointer-events-none z-0 overflow-hidden">
                    <div className="text-[10rem] font-black text-black opacity-[0.03] transform -rotate-45 whitespace-nowrap select-none">
                        Jigyasa.ai
                    </div>
                </div>
                
                <div className="max-w-4xl mx-auto space-y-6">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1a0f0a] text-white p-8 rounded-[2rem] shadow-2xl print:bg-white print:text-black print:shadow-none print:border-b print:rounded-none">
                        <div>
                            <button onClick={onBack} className="text-white/50 hover:text-white transition text-sm font-bold flex items-center gap-1 mb-4 print-hidden uppercase tracking-widest">
                                ← Return to Home
                            </button>
                            <h1 className="text-3xl md:text-4xl font-medium tracking-tighter">
                                <span className="text-[#b45309]">{"}"}</span> Interview Prep Sheet
                            </h1>
                            <p className="text-white/60 font-medium mt-2">Customized top 15 highly-targeted questions & suggested responses.</p>
                        </div>
                        <button 
                            onClick={handlePrint}
                            className="print-hidden px-8 py-4 bg-white hover:bg-white/90 text-[#1a0f0a] rounded-full transition font-bold uppercase tracking-widest text-xs shadow-xl flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" /> Download PDF
                        </button>
                    </header>

                    <div className="bg-[#1a0f0a] p-4 md:p-8 rounded-[2rem] shadow-xl text-white space-y-4 print:bg-white print:text-black">
                        {results.map((item, idx) => {
                            const isExp = expanded[idx];
                            return (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(idx * 0.05, 1) }}
                                    key={idx} 
                                    className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden print-bg print:break-inside-avoid print:border-slate-300 print:mb-4"
                                >
                                    <button 
                                        onClick={() => toggleExpand(idx)}
                                        className="w-full text-left p-6 flex justify-between items-start gap-4 hover:bg-white/5 transition print:hover:bg-transparent"
                                    >
                                        <div>
                                            <span className="text-[#b45309] font-bold text-xs tracking-widest uppercase mb-1 block print:text-indigo-600">Question {idx + 1}</span>
                                            <h3 className="font-medium text-lg leading-relaxed print-visible-text">{item.question}</h3>
                                        </div>
                                        <div className="text-white/30 shrink-0 print-hidden mt-1">
                                            {isExp ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </div>
                                    </button>
                                    
                                    {(isExp || window.matchMedia('print').matches) && (
                                        <div className="p-6 pt-0 text-white/70 border-t border-white/5 print:border-slate-200 print:text-slate-800">
                                            <div className="text-xs font-bold uppercase tracking-widest text-green-400 mb-3 mt-4 print:text-green-700">Suggested Approach</div>
                                            <p className="leading-relaxed text-sm md:text-base italic border-l-2 border-green-500/30 pl-4">{item.suggested_answer}</p>
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="text-[#1a0f0a] p-4 font-sans selection:bg-black selection:text-white flex flex-col items-center justify-center py-12">
            <button onClick={onBack} className="absolute top-0 left-0 text-white/50 hover:text-white transition text-[10px] font-bold flex items-center gap-1 uppercase tracking-widest">
                ← Return to History
            </button>
            
            <div className="w-full max-w-xl bg-[#1a0f0a] rounded-[3rem] p-8 md:p-12 shadow-2xl relative border border-white/5">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-medium tracking-tighter text-white">
                        <span className="text-[#b45309]">{"}"}</span> Interview Prep
                    </h1>
                    <p className="text-white/50 mt-2 font-medium">Upload your resume to generate 15 highly-targeted behavioral and technical practice questions.</p>
                </div>

                <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const files = e.dataTransfer.files;
                        if (files.length) handleFile(files[0]);
                    }}
                    className={`w-full relative border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center transition-all ${
                        isDragging ? 'border-[#b45309] bg-[#b45309]/10 scale-105' : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
                    }`}
                >
                    <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={(e) => {
                            if (e.target.files.length) handleFile(e.target.files[0]);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    {file ? (
                        <>
                            <File className="w-16 h-16 text-[#b45309] mb-4" />
                            <div className="text-center">
                                <p className="text-white font-medium truncate max-w-[200px]">{file.name}</p>
                                <p className="text-white/50 text-xs mt-1 uppercase tracking-widest font-bold">Ready to Scan</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <Upload className="w-16 h-16 text-[#f5cca8] mb-4 opacity-80" />
                            <p className="text-white font-medium text-center">Drag & Drop your Resume</p>
                            <p className="text-white/40 text-xs mt-2 uppercase tracking-widest font-bold">PDF Format Only</p>
                        </>
                    )}
                </div>

                {status === 'error' && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium text-center">
                        {errorMsg}
                    </div>
                )}

                <button 
                    disabled={!file}
                    onClick={handleGenerate}
                    className="w-full mt-8 py-5 bg-white hover:bg-white/90 text-[#1a0f0a] font-bold tracking-widest uppercase text-sm rounded-full transition shadow-xl disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                >
                    <Play className="w-4 h-4" /> Synthesize Questions
                </button>
            </div>
        </div>
    );
}
