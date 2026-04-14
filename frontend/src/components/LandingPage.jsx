import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ATSChecker from './ATSChecker';

const SparkleIcon = ({ className = "w-6 h-6" }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
    </svg>
);

export default function LandingPage({ onGoToAuth }) {
    const { user, signOut } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const userInitial = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || '?';

    const features = [
        {
            title: "Hyper",
            subtitle: "PEDAGOGICAL",
            description: "Speak naturally using voice-to-text. Our engine understands nuance and challenges you just like a real school principal or academic director.",
        },
        {
            title: "Instant",
            subtitle: "ASSESSMENT",
            description: "No more waiting days for feedback. Get incredibly detailed, rubric-based teaching scorecards the exact second your session ends.",
        },
        {
            title: "Context",
            subtitle: "DRIVEN",
            description: "Upload your teaching portfolio/CV and the system dynamically builds a custom interview strategy tailored uniquely to your experience.",
        }
    ];

    return (
        <div className="min-h-screen font-sans" style={{ fontFamily: "'Outfit', sans-serif" }}>

            {/* ───── SECTION 1: AMBER-BROWN MAIN WITH ORBITAL BACKGROUND ───── */}
            <div className="relative min-h-screen overflow-hidden" style={{
                background: 'radial-gradient(ellipse 80% 90% at 35% 50%, #c45c00 0%, #8b3300 40%, #2a0e00 75%, #150800 100%)',
            }}>

                {/* Orbital Arc Lines */}
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 1440 900"
                    preserveAspectRatio="xMidYMid slice"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ opacity: 0.18 }}
                >
                    <ellipse cx="420" cy="450" rx="280" ry="500" fill="none" stroke="#d97706" strokeWidth="1" />
                    <ellipse cx="640" cy="450" rx="200" ry="520" fill="none" stroke="#d97706" strokeWidth="0.8" />
                    <ellipse cx="820" cy="450" rx="320" ry="480" fill="none" stroke="#d97706" strokeWidth="0.7" />
                    <ellipse cx="1100" cy="450" rx="400" ry="600" fill="none" stroke="#d97706" strokeWidth="0.5" />
                </svg>

                {/* Bottom-right sparkle */}
                <div className="absolute bottom-8 right-8 text-white/20 pointer-events-none">
                    <SparkleIcon className="w-10 h-10" />
                </div>

                {/* ── NAVBAR ── */}
                <nav className="relative z-50 w-full flex items-center justify-between px-4 sm:px-8 md:px-14 py-4 sm:py-6">
                    {/* Logo */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#f97316] rounded-xl flex items-center justify-center shadow-lg shrink-0">
                            <SparkleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <span className="font-bold text-base sm:text-lg tracking-tight text-white whitespace-nowrap">Jigyasa.Ai</span>
                    </div>

                    {/* Nav Links — hidden on mobile/tablet */}
                    <div className="hidden lg:flex items-center gap-10 text-[10px] font-bold tracking-[0.18em] text-white/50 uppercase">
                        <a href="#ats-checker" className="hover:text-white transition-colors flex items-baseline gap-1">
                            ATS CHECK <sup className="text-[7px] text-[#f97316]">FREE</sup>
                        </a>
                        <a href="#features" className="hover:text-white transition-colors flex items-baseline gap-1">
                            FEATURES <sup className="text-[7px] text-white/40">3</sup>
                        </a>
                        <a href="#how-it-works" className="hover:text-white transition-colors flex items-baseline gap-1">
                            HOW IT WORKS <sup className="text-[7px] text-white/40">1</sup>
                        </a>
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        {user ? (
                            <div className="relative">
                                <button 
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center gap-2 group p-1 pl-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all"
                                >
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#f97316] rounded-full flex items-center justify-center text-white font-black text-sm sm:text-base shadow-lg shadow-orange-500/20 uppercase">
                                        {userInitial}
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-white/50 group-hover:text-white transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isMenuOpen && (
                                        <>
                                            {/* Invisible backdrop to close menu on outside tap (mobile-first approach) */}
                                            <div 
                                                className="fixed inset-0 z-0 bg-transparent" 
                                                onClick={() => setIsMenuOpen(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-48 bg-[#1a0800]/95 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl py-2 z-50"
                                            >
                                                <button
                                                    onClick={() => onGoToAuth('dashboard')}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                                >
                                                    <LayoutDashboard className="w-4 h-4 text-[#f97316]" />
                                                    Dashboard
                                                </button>
                                                <button
                                                    onClick={() => signOut()}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-colors border-t border-white/5"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Sign Out
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => onGoToAuth('login')}
                                    className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors px-2 py-1"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => onGoToAuth('register')}
                                    className="px-4 sm:px-7 py-2 sm:py-3 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-sm whitespace-nowrap"
                                >
                                    Register
                                </button>
                            </>
                        )}
                    </div>
                </nav>

                {/* ── HERO ── */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-14 pt-8 sm:pt-20 pb-20 flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-0 min-h-[calc(100vh-120px)] sm:min-h-[calc(100vh-160px)]">
                    {/* Left: Headline */}
                    <div className="lg:w-3/5 w-full text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-2 sm:gap-4 mb-2">
                                <SparkleIcon className="w-6 h-6 sm:w-10 sm:h-10 text-white mt-1 sm:mt-3 shrink-0" />
                                {/* Responsive hero text: fluid scaling from mobile to desktop */}
                                <h1 className="text-[1.6rem] xs:text-[2.2rem] sm:text-[3.2rem] md:text-[4rem] lg:text-[5rem] font-bold leading-[0.95] tracking-tighter text-white">
                                    Ace<br />
                                    Your Next<br />
                                    <span className="text-white">Professional</span><br />
                                    <span className="text-[#f5cca8]">Tutor Interview</span>
                                </h1>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Descriptor + CTA */}
                    <div className="lg:w-2/5 w-full flex flex-col items-center lg:items-end lg:justify-center lg:pt-48">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            className="max-w-xs text-center lg:text-right"
                        >
                            <p className="text-white/60 text-xs sm:text-sm font-medium leading-relaxed mb-6 sm:mb-8">
                                ✦ Specialized AI mock interviews for educators. Domain deep dives, HR rounds, and policy assessments with a free tutor ATS checker.
                            </p>
                            <button
                                onClick={() => user ? onGoToAuth('dashboard') : onGoToAuth('register')}
                                className="w-full sm:w-auto px-8 sm:px-10 py-4 rounded-full bg-white text-[#1a0800] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#f5cca8] transition-all shadow-xl"
                            >
                                {user ? 'Go to Dashboard' : 'Get Started'}
                            </button>
                        </motion.div>
                    </div>
                </div>

                {/* ── FEATURE CARDS ── */}
                <section id="features" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-14 pt-24 sm:pt-32 pb-10 sm:pb-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    {features.map((f, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 80 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ delay: idx * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-[#1a0800]/90 backdrop-blur-sm border border-white/8 rounded-[1.8rem] sm:rounded-[2.2rem] p-8 sm:p-12 hover:border-[#b45309]/40 transition-all duration-500 shadow-2xl group"
                        >
                            <h3 className="text-2xl sm:text-3xl font-bold text-[#f5cca8] tracking-tight mb-2 group-hover:translate-x-1 transition-transform">{f.title}</h3>
                            <p className="text-[11px] font-black tracking-[0.25em] text-white/35 uppercase mb-5 sm:mb-6">{f.subtitle}</p>
                            <p className="text-white/50 text-sm leading-relaxed">{f.description}</p>
                        </motion.div>
                    ))}
                </section>

                {/* ── RESUME-TO-PREP MATRIX BANNER ── */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-14 pb-10 sm:pb-16"
                >
                    <div className="bg-[#1a0800]/90 backdrop-blur-sm border border-white/8 rounded-[1.5rem] sm:rounded-[1.8rem] px-6 sm:px-12 py-8 sm:py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-black tracking-[0.2em] text-[#f5cca8]/60 uppercase flex items-center gap-2 mb-3">
                                <Zap className="w-3 h-3" /> Complimentary Access
                            </div>
                            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 tracking-tight">Resume-to-Prep Matrix</h2>
                            <p className="text-white/40 text-sm leading-relaxed">
                                Upload your resume and instantly generate the top 15 highly-targeted pedagogical and
                                subject-specific interview questions to practice with. Automatically formatted into a printable study guide.
                            </p>
                        </div>
                        <button
                            onClick={() => onGoToAuth('prep')}
                            className="shrink-0 sm:ml-8 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white text-[#1a0800] flex items-center justify-center hover:bg-[#f5cca8] transition-all shadow-xl text-xl font-bold self-end sm:self-auto"
                        >
                            ›
                        </button>
                    </div>
                </motion.div>

                {/* ── ATS CHECKER ── */}
                <motion.div
                    id="ats-checker"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-14 pb-16 sm:pb-20"
                >
                    <ATSChecker onGoToAuth={onGoToAuth} />
                </motion.div>
            </div>

            {/* ───── SECTION 2: BEIGE "HOW IT WORKS" ───── */}
            <div className="bg-[#e8d5c0] py-6 px-4 md:px-8">
                <section id="how-it-works" className="w-full max-w-5xl mx-auto bg-[#e8d5c0] rounded-[2.5rem] py-12 sm:py-16 px-4 sm:px-8">
                    {/* Heading */}
                    <div className="text-center mb-10 sm:mb-14">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <SparkleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#1a0800]" />
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a0800] tracking-tight">How it works</h2>
                        </div>
                        <p className="text-[#1a0800]/40 text-sm">Three simple steps to automate your teaching assessment.</p>
                    </div>

                    {/* Step Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        {[
                            { num: "1", title: "UPLOAD RESUME", desc: "Start a tutor interview session by passing your teaching CV. The AI reads it contextually." },
                            { num: "2", title: "TALK NATURALLY", desc: "Using the browser's built-in microphone, answer dynamic pedagogical and domain-specific questions." },
                            { num: "3", title: "VIEW REPORT", desc: "Once finished, a rubric-based teaching scorecard is instantly appended to your user dashboard." }
                        ].map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className="bg-[#1a0800] rounded-[1.5rem] sm:rounded-[1.8rem] p-8 sm:p-10 flex flex-col items-center text-center shadow-2xl hover:scale-[1.02] transition-transform duration-300"
                            >
                                <span className="text-6xl sm:text-7xl font-bold text-[#f5cca8] mb-4 leading-none">{step.num}</span>
                                <p className="text-[10px] font-black tracking-[0.2em] text-white/35 uppercase mb-3">{step.title}</p>
                                <p className="text-white/30 text-xs leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer className="text-center py-8 text-[#1a0800]/25 text-[10px] font-black tracking-[0.3em] uppercase">
                    © 2026 JIGYASA
                </footer>
            </div>
        </div>
    );
}
