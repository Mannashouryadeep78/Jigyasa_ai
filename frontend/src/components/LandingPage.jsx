import React from 'react';
import { motion } from 'framer-motion';
import { Mic, FileText, Zap, ChevronRight, ShieldCheck } from 'lucide-react';

export default function LandingPage({ onGoToAuth }) {

  const features = [
      {
          icon: <Mic className="w-8 h-8 text-[#f5cca8]" />,
          title: "Conversational AI",
          description: "Speak naturally. Our engine understands nuance and asks smart follow-up questions tailored to your exact responses."
      },
      {
          icon: <Zap className="w-8 h-8 text-[#f5cca8]" />,
          title: "Instant Analysis",
          description: "No more waiting days for feedback. Get comprehensive evaluation matrices the exact second your session ends."
      },
      {
          icon: <FileText className="w-8 h-8 text-[#f5cca8]" />,
          title: "Resume Aware",
          description: "Upload your CV and the system dynamically modifies its entire interview strategy based on your unique history."
      }
  ];

  return (
    <div className="min-h-screen bg-[#e0ccb8] p-2 md:p-6 font-sans selection:bg-black selection:text-white">

        <div className="relative w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-[#1a0f0a]">
            
            {/* Massive Custom Web3 Radial Gradient */}
            <div 
                className="absolute inset-0 pointer-events-none" 
                style={{
                     background: 'radial-gradient(120% 100% at 50% 100%, rgba(210,90,20,0.6) 0%, rgba(130,45,10,0.4) 40%, rgba(30,12,3,0.8) 85%)'
                }} 
            />

            {/* Orbital Rings - Decorative SVGs mimicking the reference */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-overlay" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="50%" cy="120%" rx="80%" ry="100%" fill="none" stroke="#000" strokeWidth="1" />
                <ellipse cx="80%" cy="30%" rx="50%" ry="120%" fill="none" stroke="#000" strokeWidth="1" />
                <ellipse cx="-10%" cy="50%" rx="60%" ry="80%" fill="none" stroke="#000" strokeWidth="1" />
            </svg>

            <nav className="relative z-20 max-w-7xl mx-auto flex items-center justify-between p-4 sm:p-6 md:p-10">
                <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                    <img src="/logo.png" alt="Jigyasa Logo" className="h-8 sm:h-10 md:h-12 object-contain shrink-0" />
                    <span className="font-bold text-lg sm:text-xl md:text-2xl tracking-tight text-white truncate max-w-[100px] sm:max-w-none">Jigyasa.Ai</span>
                </div>
                <div className="hidden md:flex items-center gap-12 text-xs font-bold tracking-widest text-white/70 uppercase">
                    <a href="#features" className="hover:text-white transition">Features <sup className="text-[9px]">3</sup></a>
                    <a href="#how-it-works" className="hover:text-white transition">How it Works <sup className="text-[9px]">1</sup></a>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <button 
                      onClick={() => onGoToAuth('login')}
                      className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white transition px-1 sm:px-2"
                    >
                        Sign In
                    </button>
                    <button 
                      onClick={() => onGoToAuth('register')}
                      className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2 sm:px-6 sm:py-3 rounded-full bg-[#1e1d24]/50 backdrop-blur-md hover:bg-white hover:text-black border border-white/10 transition duration-300 whitespace-nowrap"
                    >
                        Register
                    </button>
                </div>
            </nav>

            <main className="relative z-20 max-w-7xl mx-auto px-6 pt-16 pb-20 md:pb-32 grid md:grid-cols-2 gap-12 items-center">
                
                {/* Hero Left Text */}
                <div className="text-left">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-[2.6rem] sm:text-5xl md:text-[5.5rem] font-medium tracking-tighter mb-8 leading-[1.05] md:leading-[0.95] text-white"
                    >
                        <span className="text-white/60 font-light">{"}"}</span> Interview<br/>
                        <span className="text-white">Is an Automated <br/>
                        Infrastructure<br/>
                        <span className="font-bold text-[#f5cca8]">Provider</span></span>
                    </motion.h1>
                    {/* Hacking the text gradient to map the reference properly */}
                    {/* The reference uses huge text overlaying the middle gradient. We'll simulate this. */}
                </div>

                {/* Hero Right Desc & CTA */}
                <div className="flex flex-col items-start md:items-end md:text-right mt-auto md:pb-8">
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-sm md:text-base text-white/80 font-medium mb-10 max-w-sm leading-relaxed"
                    >
                        <span className="font-mono text-white/60">{"}"}</span> Renowned for powering the backbone of recruitment ecosystems with state-of-the-art voice validation services, AI endpoints & dynamic reporting.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 w-full md:w-auto"
                    >
                        <button 
                            onClick={() => onGoToAuth('register')}
                            className="w-full sm:w-auto px-10 py-5 rounded-full bg-white hover:bg-white/90 text-[#1a0f0a] text-sm font-bold tracking-widest uppercase shadow-2xl shadow-white/10 transition group"
                        >
                            Get Started
                        </button>
                    </motion.div>
                </div>
            </main>

            {/* Modular Features Grid (Bottom of Hero) */}
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="max-w-7xl mx-auto px-6 pb-12"
                id="features"
            >
                <div className="grid md:grid-cols-3 gap-6 relative z-20">
                    {features.map((f, i) => (
                        <div key={i} className="flex flex-col p-6 sm:p-8 rounded-[2rem] bg-[#1a0f0a]/90 backdrop-blur-xl border border-white/5 hover:border-white/20 transition group shadow-2xl overflow-hidden">
                            <h3 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tighter text-[#f5cca8] mb-4 break-words">{f.title.split(' ')[0]}</h3>
                            <div className="text-xs tracking-widest uppercase font-bold text-white/50 mb-4">{f.title.split(' ').slice(1).join(' ')}</div>
                            <p className="text-white/60 leading-relaxed text-sm">
                                {f.description}
                            </p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* AI Prep Tool Banner Block */}
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-7xl mx-auto px-6 pb-20 relative z-20"
            >
                <div 
                    onClick={() => onGoToAuth('prep')}
                    className="cursor-pointer group flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-r from-[#b45309]/10 to-[#1a0f0a] border border-[#b45309]/20 hover:border-[#b45309]/50 transition-all shadow-2xl overflow-hidden relative"
                >
                    <div className="absolute right-0 top-0 w-64 h-64 bg-[#b45309]/10 blur-3xl rounded-full pointer-events-none"></div>
                    
                    <div className="text-left max-w-2xl relative z-10">
                        <div className="text-xs tracking-widest uppercase font-bold text-[#b45309] mb-4 flex items-center gap-2">
                           <Zap className="w-4 h-4" /> Beta Release
                        </div>
                        <h3 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tighter text-white mb-4">
                            Resume-to-Prep Matrix
                        </h3>
                        <p className="text-white/60 leading-relaxed font-medium">
                            Upload your resume and instantly generate the top 15 highly-targeted behavioral and technical interview questions to practice with. Automatically formatted into a printable study guide.
                        </p>
                    </div>
                    
                    <div className="mt-8 md:mt-0 relative z-10 md:pl-8">
                        <div className="w-16 h-16 rounded-full bg-white text-[#1a0f0a] flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                            <ChevronRight className="w-8 h-8 ml-1" />
                        </div>
                    </div>
                </div>
            </motion.div>

        </div>

        {/* How It Works Section - Adapted to fit cleanly in the soft wrapper */}
        <section id="how-it-works" className="relative z-10 w-full py-24 my-8 rounded-[2rem] bg-white/40 shadow-sm border border-white/50">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-medium tracking-tighter text-[#1a0f0a] mb-4">{"}"} How it works</h2>
                    <p className="text-[#1a0f0a]/60 font-medium">Three simple steps to automate your technical screening.</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 relative">
                    {[
                        { step: "1", title: "Upload Resume", desc: "Start an interview session by passing the candidate's PDF. The AI reads it contextually." },
                        { step: "2", title: "Talk Naturally", desc: "Using the browser's built-in microphone, the candidate answers dynamic technical questions." },
                        { step: "3", title: "View Report", desc: "Once finished, a rubric-based scorecard is instantly appended to the user dashboard." }
                    ].map((item, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.2 }}
                            key={i} 
                            className="relative flex flex-col items-center text-center p-8 bg-[#1a0f0a] rounded-[2rem] group hover:-translate-y-2 transition-transform"
                        >
                            <div className="mb-6 font-medium text-6xl text-[#f5cca8]">
                                {item.step}
                            </div>
                            <h3 className="text-sm uppercase tracking-widest font-bold text-white mb-3">{item.title}</h3>
                            <p className="text-white/50 leading-relaxed text-sm">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        <footer className="py-8 text-center text-[#1a0f0a]/50 font-bold text-xs uppercase tracking-widest">
             © {new Date().getFullYear()} Jigyasa
        </footer>

    </div>
  );
}
