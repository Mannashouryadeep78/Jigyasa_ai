import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Zap, ChevronRight, ArrowRight, Sparkles, BarChart3, Brain, Users, Cpu, MessageSquare } from 'lucide-react';
import ATSChecker from './ATSChecker';

const WORDS = ['HR Round', 'Technical', 'GD Round', 'Any Field'];

export default function LandingPage({ onGoToAuth }) {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setWordIndex(i => (i + 1) % WORDS.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen font-sans" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── Ambient background glows ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', top: '-20%', left: '10%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '5%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }} />
      </div>

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,11,20,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img src="/logo.png" alt="Jigyasa" style={{ height: '36px', objectFit: 'contain' }} />
            <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'white' }}>Jigyasa<span style={{ color: '#6366f1' }}>.Ai</span></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
              {[['#ats-checker', 'ATS Check', 'Free'], ['#features', 'Features', ''], ['#how-it-works', 'How it Works', '']].map(([href, label, badge]) => (
                <a key={href} href={href} style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(241,245,249,0.55)', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  onMouseEnter={e => e.target.style.color = 'white'}
                  onMouseLeave={e => e.target.style.color = 'rgba(241,245,249,0.55)'}>
                  {label}
                  {badge && <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '999px', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', fontWeight: 800 }}>{badge}</span>}
                </a>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={() => onGoToAuth('login')} className="btn-ghost" style={{ padding: '0.5rem 1.2rem', fontSize: '0.7rem' }}>Sign In</button>
              <button onClick={() => onGoToAuth('register')} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.7rem' }}>Get Started</button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 1.5rem 3rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.9rem', borderRadius: '999px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: '2rem' }}>
            <Sparkles size={12} color="#a5b4fc" />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a5b4fc' }}>AI-Powered Interview Coach</span>
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em', margin: '0 0 1.5rem' }}>
          Ace Your Next
          <br />
          <AnimatePresence mode="wait">
            <motion.span key={wordIndex}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="text-gradient" style={{ display: 'inline-block' }}>
              {WORDS[wordIndex]}
            </motion.span>
          </AnimatePresence>
          <br />
          <span style={{ color: 'rgba(241,245,249,0.85)' }}>with AI Coaching</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: '1.05rem', color: 'rgba(241,245,249,0.55)', maxWidth: '580px', margin: '0 auto 2.5rem', lineHeight: 1.7, fontWeight: 400 }}>
          Practice HR rounds, technical deep-dives, and group discussions with a realistic AI interviewer. Get instant rubric-based feedback. Works for <strong style={{ color: 'rgba(241,245,249,0.8)', fontWeight: 600 }}>any industry</strong>.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
          <button onClick={() => onGoToAuth('register')} className="btn-primary" style={{ padding: '0.9rem 2.25rem', fontSize: '0.8rem', gap: '0.6rem' }}>
            Start Free <ArrowRight size={15} />
          </button>
          <a href="#ats-checker" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.9rem 2rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(241,245,249,0.7)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', transition: 'color 0.2s, border-color 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(241,245,249,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}>
            <Zap size={14} color="#f59e0b" /> Free ATS Check
          </a>
        </motion.div>

        {/* Social proof strip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
          {[['HR', 'Round'], ['Technical', 'Round'], ['GD', 'Round'], ['Free ATS', 'Checker']].map(([a, b]) => (
            <div key={a} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6366f1' }}>{a}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(241,245,249,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{b}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem 5rem', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6366f1', marginBottom: '0.75rem' }}>✦ What You Get</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.04em', margin: 0 }}>Everything you need to <span className="text-gradient">land the offer</span></h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[
            { icon: <Users size={22} />, color: '#22c55e', label: 'HR Round', title: 'Behavioural Mastery', desc: 'Warm, empathetic AI interviewer probes culture fit, STAR stories, conflict resolution — for any industry.' },
            { icon: <Cpu size={22} />, color: '#6366f1', label: 'Technical Round', title: 'Resume-Driven Depth', desc: 'AI reads your resume and asks field-specific questions. Engineering, medicine, data, design — all covered.' },
            { icon: <MessageSquare size={22} />, color: '#a855f7', label: 'GD Round', title: 'Debate Practice', desc: 'AI plays a live debate partner. Practice structuring arguments and handling counterpoints confidently.' },
            { icon: <BarChart3 size={22} />, color: '#f59e0b', label: 'Analytics', title: 'Rubric-Based Scoring', desc: 'Get a detailed scorecard with quotes from your own answers, wrong-answer flags, and coaching tips.' },
            { icon: <Zap size={22} />, color: '#ef4444', label: 'Instant', title: 'Free ATS Resume Check', desc: 'Upload your resume and get an ATS score, keyword gaps, and 4 quick wins — no login needed.' },
            { icon: <Brain size={22} />, color: '#06b6d4', label: 'AI', title: 'Voice-Activated', desc: 'Speak naturally. The AI understands nuance, asks smart follow-ups, and evaluates your delivery.' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="glass glass-hover" style={{ borderRadius: '1.25rem', padding: '1.75rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '0.75rem', background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: '1rem' }}>
                {f.icon}
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: f.color, marginBottom: '0.4rem' }}>{f.label}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>{f.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(241,245,249,0.5)', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ATS Checker ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 5rem', position: 'relative', zIndex: 1 }}>
        <ATSChecker onGoToAuth={onGoToAuth} />
      </section>

      {/* ── Resume Prep Banner ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 5rem', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          onClick={() => onGoToAuth('prep')} style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden', borderRadius: '1.5rem', padding: '2.5rem', border: '1px solid rgba(245,158,11,0.2)', background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(8,11,20,0) 60%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={12} /> Free Tool
            </div>
            <h3 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.5rem' }}>Resume-to-Prep Matrix</h3>
            <p style={{ color: 'rgba(241,245,249,0.55)', margin: 0, fontSize: '0.9rem', maxWidth: '480px' }}>Upload your resume and instantly generate 15 tailored interview questions with high-quality model answers.</p>
          </div>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ChevronRight size={24} color="#f59e0b" />
          </div>
        </motion.div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 6rem', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6366f1', marginBottom: '0.75rem' }}>✦ The Process</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.04em', margin: 0 }}>Three steps to interview confidence</h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {[
            { n: '01', title: 'Choose Your Mode', desc: 'Pick HR, Technical, or Group Discussion. Upload your resume for hyper-personalized questions.' },
            { n: '02', title: 'Interview Live', desc: 'Speak naturally. The AI listens, responds, and pushes back just like a real interviewer.' },
            { n: '03', title: 'Get Scored', desc: 'Receive an instant rubric scorecard with quotes from your answers and specific coaching tips.' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass" style={{ borderRadius: '1.25rem', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 900, letterSpacing: '-0.06em', lineHeight: 1, color: 'rgba(99,102,241,0.12)', marginBottom: '1rem' }}>{s.n}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>{s.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(241,245,249,0.5)', margin: 0, lineHeight: 1.65 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 6rem', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="accent-gradient" style={{ borderRadius: '1.5rem', padding: '3.5rem 2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 60%)' }} />
          <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 1rem', position: 'relative' }}>Ready to start practising?</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', margin: '0 auto 2rem', maxWidth: '420px', fontSize: '1rem', position: 'relative' }}>Join thousands of candidates who improved their interview performance with Jigyasa AI.</p>
          <button onClick={() => onGoToAuth('register')} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.9rem 2.25rem', borderRadius: '999px', background: 'white', color: '#4f46e5', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.06em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', boxShadow: '0 0 40px rgba(255,255,255,0.25)', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            Create Free Account <ArrowRight size={15} />
          </button>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(241,245,249,0.3)', margin: 0 }}>
          © {new Date().getFullYear()} Jigyasa AI · All rights reserved
        </p>
      </footer>
    </div>
  );
}
