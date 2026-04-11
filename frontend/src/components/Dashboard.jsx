import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Plus, FileText, Loader2, Calendar, BarChart2, ChevronRight, Sparkles, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import AnalyticsView from './AnalyticsView';

const MODE_LABELS = { hr: 'HR', technical: 'Technical', gd: 'GD' };
const MODE_COLORS = { hr: '#22c55e', technical: '#6366f1', gd: '#a855f7' };

function ScoreBadge({ scores }) {
  if (!scores || Object.keys(scores).length === 0) return null;
  const avg = (Object.values(scores).reduce((a, b) => a + Number(b), 0) / Object.values(scores).length).toFixed(1);
  const pct = (avg / 5) * 100;
  const color = avg >= 4 ? '#22c55e' : avg >= 3 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.25rem' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(241,245,249,0.4)' }}>Score</span>
      <span style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.02em', color }}>{avg}<span style={{ fontSize: '0.75rem', color: 'rgba(241,245,249,0.3)', fontWeight: 600 }}> / 5</span></span>
    </div>
  );
}

export default function Dashboard({ onStartNew, onViewReport, onContinue }) {
  const { user, signOut } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      const { data, error } = await supabase.from('sessions')
        .select(`id, name, status, created_at, assessments(scores_json)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setSessions(data);
      setLoading(false);
    };
    fetchHistory();
  }, [user]);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'Inter, sans-serif', position: 'relative' }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: 0, left: '30%', width: '500px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Top nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8,11,20,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img src="/logo.png" alt="Jigyasa" style={{ height: '32px', objectFit: 'contain' }} />
            <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>Jigyasa<span style={{ color: '#6366f1' }}>.Ai</span></span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button onClick={() => setView(view === 'analytics' ? 'list' : 'analytics')} className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem', gap: '0.4rem' }}>
              <BarChart2 size={14} /> {view === 'analytics' ? 'Sessions' : 'Analytics'}
            </button>
            <button onClick={onStartNew} className="btn-primary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.7rem', gap: '0.4rem' }}>
              <Plus size={14} /> New Interview
            </button>
            <button onClick={() => signOut()} className="btn-ghost" style={{ padding: '0.5rem 0.9rem', fontSize: '0.7rem', gap: '0.4rem' }}>
              <LogOut size={13} /> Out
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem', position: 'relative', zIndex: 1 }}>

        {/* Welcome header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', borderRadius: '999px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '0.75rem' }}>
            <Sparkles size={11} color="#a5b4fc" />
            <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a5b4fc' }}>Dashboard</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 0.3rem' }}>
            Welcome back, <span className="text-gradient">{firstName}</span>
          </h1>
          <p style={{ color: 'rgba(241,245,249,0.45)', margin: 0, fontSize: '0.9rem' }}>
            {sessions.length > 0 ? `${sessions.length} interview session${sessions.length > 1 ? 's' : ''} recorded` : 'No sessions yet — start your first interview below'}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div key="list" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(241,245,249,0.4)', margin: 0 }}>Interview History</h2>
                {!loading && sessions.length > 0 && (
                  <span style={{ fontSize: '0.75rem', color: 'rgba(241,245,249,0.3)', fontWeight: 600 }}>{sessions.length} sessions</span>
                )}
              </div>

              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="glass" style={{ borderRadius: '1.25rem', padding: '1.75rem', height: '260px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)', animation: 'shimmer 1.5s infinite' }} />
                    </div>
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="glass" style={{ borderRadius: '1.25rem', padding: '4rem 2rem', textAlign: 'center' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '1rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <FileText size={28} color="#818cf8" />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 0.5rem' }}>No interviews yet</h3>
                  <p style={{ color: 'rgba(241,245,249,0.45)', margin: '0 auto 1.75rem', maxWidth: '340px', fontSize: '0.875rem' }}>
                    Start your first session to see your performance history and analytics here.
                  </p>
                  <button onClick={onStartNew} className="btn-primary" style={{ gap: '0.5rem' }}>
                    <Plus size={15} /> Start First Interview
                  </button>
                </motion.div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {sessions.map((session, idx) => {
                    const isFinished = session.status === 'finished' || (session.assessments && session.assessments.length > 0);
                    const isActive = ['active', 'start', 'in_progress'].includes(session.status);
                    const scores = session.assessments?.[0]?.scores_json;
                    return (
                      <motion.div key={session.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                        className="glass glass-hover" style={{ borderRadius: '1.25rem', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                        {/* Top row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.25rem 0.6rem', borderRadius: '999px', background: isFinished ? 'rgba(34,197,94,0.1)' : isActive ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: isFinished ? '#4ade80' : isActive ? '#fbbf24' : '#f87171', border: `1px solid ${isFinished ? 'rgba(34,197,94,0.2)' : isActive ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                              {isFinished ? 'Complete' : isActive ? 'In Progress' : session.status}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'rgba(241,245,249,0.35)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={11} /> {new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {/* Name */}
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 0.25rem', color: 'white' }}>{session.name}</h3>
                        <p style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', color: 'rgba(241,245,249,0.3)', margin: '0 0 1rem', fontFamily: 'monospace' }}>
                          {session.id.substring(0, 8).toUpperCase()}
                        </p>

                        {/* Score */}
                        {scores && <ScoreBadge scores={scores} />}

                        {/* CTA */}
                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {isActive ? (
                            <>
                              <button onClick={() => onContinue(session.id)} className="btn-primary" style={{ width: '100%', padding: '0.7rem' }}>
                                Continue Interview <ChevronRight size={14} />
                              </button>
                              <button onClick={async () => { await api.discontinueSession(session.id); window.location.reload(); }}
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '999px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                                Discontinue
                              </button>
                            </>
                          ) : (
                            <button onClick={() => onViewReport(session.id)}
                              disabled={session.status === 'discontinued' || (!isFinished && !scores)}
                              style={{ width: '100%', padding: '0.7rem', borderRadius: '999px', background: isFinished ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isFinished ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)'}`, color: isFinished ? '#a5b4fc' : 'rgba(241,245,249,0.3)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: isFinished ? 'pointer' : 'not-allowed', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                              {session.status === 'discontinued' ? 'Discontinued' : 'View Report'} {isFinished && <ChevronRight size={13} />}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="analytics" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AnalyticsView sessions={sessions} onBack={() => setView('list')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
