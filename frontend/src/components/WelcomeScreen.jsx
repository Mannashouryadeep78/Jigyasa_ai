import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSearch, Mic, CheckCircle2, ArrowRight } from 'lucide-react';

export default function WelcomeScreen({ onStart, candidateName, isInitializing }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: 'Inter, sans-serif', position: 'relative' }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="glass" style={{ width: '100%', maxWidth: '460px', borderRadius: '1.5rem', padding: '2.5rem', position: 'relative', overflow: 'hidden', zIndex: 1 }}>
        {/* Top accent */}
        <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)' }} />

        <AnimatePresence mode="wait">
          {isInitializing ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.5rem 0', gap: '1.5rem' }}>
              {/* Animated resume scan */}
              <div style={{ width: '72px', height: '90px', borderRadius: '0.75rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #6366f1, transparent)', boxShadow: '0 0 12px rgba(99,102,241,0.8)', animation: 'scan 1.8s ease-in-out infinite' }} />
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '5px', opacity: 0.2 }}>
                  {['55%','100%','75%','100%','65%','90%'].map((w, i) => (
                    <div key={i} style={{ height: '4px', background: 'white', borderRadius: '2px', width: w }} />
                  ))}
                </div>
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'white', margin: '0 0 0.4rem' }}>Building your interview</h2>
                <p style={{ color: 'rgba(241,245,249,0.4)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0, animation: 'pulse 2s infinite' }}>Analysing resume · Customising questions...</p>
              </div>
              <style>{`
                @keyframes scan { 0%{top:0;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:100%;opacity:0} }
                @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
              `}</style>
            </motion.div>
          ) : (
            <motion.div key="rules" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 0.4rem', color: 'white' }}>
                  Ready, <span className="text-gradient">{candidateName}</span>?
                </h1>
                <p style={{ color: 'rgba(241,245,249,0.4)', fontSize: '0.85rem', margin: 0 }}>A few things before we begin</p>
              </div>

              {/* Rules */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                {[
                  { icon: <FileSearch size={17} />, color: '#6366f1', title: 'Tailored Questions', body: 'The AI has read your resume and will ask specific questions based on your actual experience.' },
                  { icon: <Mic size={17} />, color: '#a855f7', title: 'Speak Naturally', body: 'Pause for a few seconds to auto-submit your turn. No button needed — just talk.' },
                  { icon: <CheckCircle2 size={17} />, color: '#22c55e', title: 'Quiet Environment', body: 'Find a quiet room with your microphone enabled for best results.' },
                ].map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', padding: '1rem 1.1rem', borderRadius: '0.875rem', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '0.6rem', background: `${r.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.color, flexShrink: 0, marginTop: '0.05rem' }}>
                      {r.icon}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '0.875rem', margin: '0 0 0.2rem', color: 'white', letterSpacing: '-0.01em' }}>{r.title}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(241,245,249,0.45)', margin: 0, lineHeight: 1.55 }}>{r.body}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button onClick={onStart} className="btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '0.8rem', gap: '0.5rem', justifyContent: 'center' }}>
                I'm Ready — Start Interview <ArrowRight size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
