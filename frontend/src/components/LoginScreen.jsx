import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ArrowLeft, Mail, Lock, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginScreen({ initialMode = 'login', onBack }) {
  const { signUp, signIn, verifyOtp } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error } = await signIn({ email, password });
    if (error) { setError(error.message); setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { data, error } = await signUp({ email, password, options: { data: { full_name: name } } });
    if (error) { setError(error.message); setLoading(false); return; }
    setMode('otp'); setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error } = await verifyOtp({ email, token: otp, type: 'signup' });
    if (error) { setError(error.message); setLoading(false); }
  };

  const switchMode = (m) => { setMode(m); setError(null); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* Back button */}
        {onBack && (
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'rgba(241,245,249,0.4)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem', padding: 0, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(241,245,249,0.8)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(241,245,249,0.4)'}>
            <ArrowLeft size={14} /> Back to home
          </button>
        )}

        {/* Card */}
        <div className="glass" style={{ borderRadius: '1.5rem', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
          {/* Top accent line */}
          <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)' }} />

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', borderRadius: '999px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '1.25rem' }}>
              <Sparkles size={11} color="#a5b4fc" />
              <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a5b4fc' }}>Jigyasa AI</span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.5rem', color: 'white' }}>
              {mode === 'otp' ? 'Verify your email' : mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p style={{ color: 'rgba(241,245,249,0.45)', fontSize: '0.85rem', margin: 0 }}>
              {mode === 'otp' ? `We sent a code to ${email}` : mode === 'login' ? 'Sign in to your dashboard' : 'Start your free interview practice'}
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', color: '#fca5a5', fontSize: '0.82rem', marginBottom: '1.25rem', textAlign: 'center' }}>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {mode === 'otp' ? (
              <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(241,245,249,0.45)', marginBottom: '0.5rem' }}>Verification Code</label>
                  <input type="text" className="input-field" required value={otp} onChange={e => setOtp(e.target.value)}
                    placeholder="000000" maxLength={8} style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.3rem', fontWeight: 700, fontFamily: 'monospace' }} />
                </div>
                <button type="submit" disabled={loading || otp.length < 6} className="btn-primary" style={{ width: '100%', padding: '0.9rem' }}>
                  {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Verify Email'}
                </button>
              </motion.form>
            ) : (
              <motion.form key={mode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={mode === 'login' ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {mode === 'register' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(241,245,249,0.45)', marginBottom: '0.5rem' }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(241,245,249,0.25)' }} />
                      <input type="text" className="input-field" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={{ paddingLeft: '2.5rem' }} />
                    </div>
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(241,245,249,0.45)', marginBottom: '0.5rem' }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(241,245,249,0.25)' }} />
                    <input type="email" className="input-field" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ paddingLeft: '2.5rem' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(241,245,249,0.45)', marginBottom: '0.5rem' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(241,245,249,0.25)' }} />
                    <input type="password" className="input-field" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" minLength={6} style={{ paddingLeft: '2.5rem' }} />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '0.9rem', marginTop: '0.25rem' }}>
                  {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Switch mode */}
          {mode !== 'otp' && (
            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'rgba(241,245,249,0.4)', fontWeight: 500 }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>
                {mode === 'login' ? 'Register' : 'Sign in'}
              </button>
            </p>
          )}
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
