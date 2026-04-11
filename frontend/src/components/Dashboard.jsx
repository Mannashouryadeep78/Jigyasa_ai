import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Plus, FileText, Loader2, Calendar, BarChart2 } from 'lucide-react';
import { api } from '../api/client';
import AnalyticsView from './AnalyticsView';

export default function Dashboard({ onStartNew, onViewReport, onContinue }) {
  const { user, signOut } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');

  useEffect(() => {
    if (!user) return;
    
    // Fetch user sessions that are finished from Supabase
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
            id, 
            name, 
            status, 
            created_at, 
            assessments(scores_json)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Failed to load history", error);
      } else if (data) {
        setSessions(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#e0ccb8] text-white font-sans p-4 md:p-8 selection:bg-black selection:text-white">
      <div className="max-w-7xl mx-auto bg-[#1a0f0a] rounded-[3rem] p-8 md:p-14 shadow-2xl relative overflow-hidden min-h-[90vh]">
        
        {/* Orbital decorative rings */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 mix-blend-overlay" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="80%" cy="20%" rx="50%" ry="100%" fill="none" stroke="#fff" strokeWidth="1" />
            <ellipse cx="-10%" cy="80%" rx="60%" ry="80%" fill="none" stroke="#fff" strokeWidth="1" />
        </svg>

        <header className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 mb-16 border-b border-white/10 pb-10">
            <div>
                <h1 className="text-4xl font-medium tracking-tighter text-white"><span className="text-[#b45309]">✦</span> Jigyasa Dashboard</h1>
                <p className="text-white/50 font-medium mt-2">Welcome back, <span className="text-white tracking-wide">{user?.user_metadata?.full_name || user?.email}</span></p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4">
                <button 
                  onClick={() => setView('analytics')}
                  className="flex px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-full transition font-bold tracking-widest uppercase text-xs items-center gap-2 border border-white/10"
                >
                  <BarChart2 className="w-4 h-4" /> View Analytics
                </button>
                <button 
                  onClick={onStartNew}
                  className="px-8 py-3.5 bg-white hover:bg-white/90 text-[#1a0f0a] rounded-full transition font-bold tracking-widest uppercase text-xs flex items-center gap-2 shadow-xl shadow-white/5"
                >
                  <Plus className="w-4 h-4" /> Start Interview
                </button>
                <button 
                  onClick={() => signOut()}
                  className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-full transition font-bold tracking-widest uppercase text-xs flex items-center gap-2 border border-white/10"
                >
                  <LogOut className="w-3 h-3" /> Sign Out
                </button>
            </div>
        </header>

        {view === 'list' ? (
            <main className="relative z-10 w-full shrink-0">
                <h2 className="text-xl font-medium tracking-tighter text-white mb-8 flex items-center gap-2 border-l-4 border-[#b45309] pl-4">
                    Interview History
                </h2>
                
                {loading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 h-[340px] flex flex-col justify-between overflow-hidden relative">
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                                <div>
                                    <div className="flex justify-between items-start mb-6 w-full">
                                        <div className="h-6 w-20 bg-white/10 rounded-full"></div>
                                        <div className="h-4 w-16 bg-white/5 rounded-full"></div>
                                    </div>
                                    <div className="h-8 w-48 bg-white/10 rounded-lg mb-4"></div>
                                    <div className="h-4 w-32 bg-white/5 rounded-md mb-8"></div>
                                    <div className="p-6 bg-[#1a0f0a]/80 rounded-[1.5rem] border border-white/5 flex justify-between items-center">
                                        <div className="h-4 w-24 bg-white/5 rounded-md"></div>
                                        <div className="h-8 w-16 bg-white/10 rounded-md"></div>
                                    </div>
                                </div>
                                <div className="w-full h-12 bg-white/5 rounded-full mt-auto"></div>
                            </div>
                        ))}
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 bg-white/5 border border-white/10 rounded-[2rem] text-center">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10">
                            <FileText className="w-10 h-10 text-[#f5cca8]" />
                        </div>
                        <h3 className="text-3xl font-medium tracking-tighter text-white mb-4">No interviews yet</h3>
                        <p className="text-white/50 font-medium max-w-sm mx-auto mb-8">You haven't completed any Jigyasa interviews on this account. Click the Start button above to begin your first test.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {sessions.map((session) => (
                            <div key={session.id} className="bg-white/5 border border-white/10 hover:border-[#b45309]/50 hover:bg-white/10 rounded-[2rem] p-8 transition-all group flex flex-col justify-between h-full shadow-lg">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-full tracking-widest ${
                                            (session.status === 'finished' || (session.assessments && session.assessments.length > 0)) 
                                                ? 'bg-[#b45309]/20 text-[#f5cca8] border border-[#b45309]/30' 
                                                : session.status === 'discontinued'
                                                    ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                    : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                        }`}>
                                            {(session.status === 'finished' || (session.assessments && session.assessments.length > 0)) ? 'FINISHED' : session.status}
                                        </div>
                                        <span className="text-xs text-white/40 flex items-center gap-1.5 font-bold tracking-widest">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(session.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-medium tracking-tighter text-white mb-2">{session.name} Review</h3>
                                    <p className="text-xs tracking-widest text-[#b45309]/60 font-mono mb-8">ID: {session.id.substring(0,8)}...</p>
                                    
                                    {session.assessments && session.assessments.length > 0 && session.assessments[0].scores_json && (
                                        <div className="mb-8 p-6 bg-[#1a0f0a]/80 rounded-[1.5rem] border border-white/5 flex justify-between items-center">
                                            <span className="text-xs font-bold tracking-widest uppercase text-white/50">Final Score</span>
                                            <span className="text-3xl font-medium text-[#f5cca8]">
                                                {(Object.values(session.assessments[0].scores_json).reduce((a, b) => a + b, 0) / Object.values(session.assessments[0].scores_json).length || 0).toFixed(1)} <span className="text-lg text-white/20 font-bold tracking-widest">/ 5</span>
                                            </span>
                                        </div>
                                    )}
                                    {(session.status === 'active' || session.status === 'start' || session.status === 'in_progress') ? (
                                        <div className="flex flex-col gap-2">
                                            <button 
                                                onClick={() => onContinue(session.id)}
                                                className="w-full py-3 bg-[#b45309] hover:bg-white text-[#1a0f0a] text-xs font-bold uppercase tracking-widest rounded-full transition flex justify-center shadow-lg shadow-[#b45309]/20"
                                            >
                                                Continue Interview
                                            </button>
                                            <button 
                                                onClick={async () => {
                                                    await api.discontinueSession(session.id);
                                                    window.location.reload();
                                                }}
                                                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-full transition flex justify-center border border-red-500/20"
                                            >
                                                Discontinue
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => onViewReport(session.id)}
                                            disabled={session.status === 'discontinued' || (session.status !== 'finished' && (!session.assessments || session.assessments.length === 0))}
                                            className="w-full py-4 bg-white/5 hover:bg-[#b45309] text-white hover:text-[#1a0f0a] text-xs font-bold uppercase tracking-widest rounded-full transition flex justify-center disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-white disabled:cursor-not-allowed group-hover:bg-white group-hover:text-[#1a0f0a]"
                                        >
                                            {session.status === 'discontinued' ? 'Discontinued' : 'View Detailed Report'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        ) : (
            <AnalyticsView sessions={sessions} onBack={() => setView('list')} />
        )}
      </div>
    </div>
  );
}
