import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, FileText, Calendar, Play, Target, ChevronRight } from 'lucide-react';
import { api } from '../api/client';
import AnalyticsView from './AnalyticsView';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import InterviewPrepTool from './InterviewPrepTool';
import ATSChecker from './ATSChecker';
import FeatureDiscoveryModal from './FeatureDiscoveryModal';
import HelpView from './HelpView';

export default function Dashboard({ onStartNew, onViewReport, onContinue }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [activeTab, setActiveTab] = useState('finished');
  const [showModeChoice, setShowModeChoice] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('jigyasa_onboarded');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('jigyasa_onboarded', 'true');
    setShowOnboarding(false);
  };

  useEffect(() => {
    if (!user) return;
    
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

  const filteredSessions = sessions.filter(s => {
    const isFinished = s.status === 'finished' || (s.assessments && s.assessments.length > 0);
    const isDiscontinued = s.status === 'discontinued';
    const isActive = s.status === 'active' || s.status === 'start' || s.status === 'in_progress';

    if (activeTab === 'finished') return isFinished;
    if (activeTab === 'discontinued') return isDiscontinued;
    if (activeTab === 'active') return isActive;
    return true;
  });

  const counts = {
    finished: sessions.filter(s => s.status === 'finished' || (s.assessments && s.assessments.length > 0)).length,
    discontinued: sessions.filter(s => s.status === 'discontinued').length,
    active: sessions.filter(s => s.status === 'active' || s.status === 'start' || s.status === 'in_progress').length
  };

  const handleStartChoice = (type) => {
    setShowModeChoice(false);
    onStartNew(type);
  };

  return (
    <div className="h-dvh bg-[#1a0f0a] text-white font-sans selection:bg-[#b45309] selection:text-white flex flex-col relative overflow-hidden">
      
      {/* Immersive Background Gradient (matching 1st pic) */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#b45309]/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#b45309]/10 rounded-full blur-[100px]" />
          
          {/* Subtle curved lines (matching 1st pic abstract lines) */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.15]" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M0,20 Q50,50 100,20" fill="none" stroke="white" strokeWidth="0.1" />
            <path d="M0,80 Q50,50 100,80" fill="none" stroke="white" strokeWidth="0.1" />
            <path d="M20,0 Q50,50 20,100" fill="none" stroke="white" strokeWidth="0.1" />
            <path d="M80,0 Q50,50 80,100" fill="none" stroke="white" strokeWidth="0.1" />
          </svg>
      </div>

      <Navbar activeView={view} onViewChange={setView} />

      <div className="relative z-10 flex-grow flex flex-col px-4 sm:px-8 md:px-12 py-8 max-w-7xl mx-auto w-full overflow-hidden">
        
        {view === 'list' ? (
            <main className="w-full h-full flex flex-col min-h-0">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 shrink-0">
                    <div>
                        <h2 className="text-3xl sm:text-5xl font-medium tracking-tighter text-white mb-2 uppercase italic leading-tight">
                            Member <span className="text-[#f5cca8]">Portal</span>
                        </h2>
                        <p className="text-white/40 font-medium tracking-widest uppercase text-[10px] sm:text-xs">
                           Tracking your progress with Jigyasa AI
                        </p>
                    </div>

                    <button 
                        onClick={() => setShowModeChoice(true)}
                        className="group flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-[#b45309] text-[#1a0f0a] hover:text-white rounded-full transition-all duration-500 font-bold tracking-widest uppercase text-[10px] shadow-2xl hover:shadow-[#b45309]/40 w-full md:w-auto"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" /> Start New Session
                    </button>
                </header>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
                    <div className="flex items-center gap-4 text-[#b45309]">
                        <div className="w-1.5 h-6 bg-[#b45309] rounded-full" />
                        <h3 className="text-lg font-bold uppercase tracking-widest text-white/90">Interview History</h3>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {[
                            { id: 'finished', label: 'Completed', count: counts.finished },
                            { id: 'active', label: 'Active', count: counts.active },
                            { id: 'discontinued', label: 'Stopped', count: counts.discontinued }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all border whitespace-nowrap text-[10px] font-bold uppercase tracking-widest ${
                                    activeTab === tab.id 
                                        ? 'bg-[#b45309]/20 border-[#b45309]/40 text-[#f5cca8]' 
                                        : 'bg-white/5 border-white/5 text-white/40 hover:text-white/60'
                                }`}
                            >
                                {tab.label}
                                <span className="opacity-40">/</span>
                                <span className={activeTab === tab.id ? 'text-white' : ''}>{tab.count}</span>
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Scrollable Area */}
                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar pb-10">
                    {loading ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-6 h-[260px] animate-pulse" />
                            ))}
                        </div>
                    ) : filteredSessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 bg-white/2 border border-white/5 rounded-[3rem] text-center backdrop-blur-sm">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/5 text-[#f5cca8]/20">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-medium tracking-tighter text-white mb-2 uppercase">No sessions found</h3>
                            <p className="text-white/30 font-medium max-w-xs mx-auto mb-8 text-xs tracking-wide">
                                {activeTab === 'finished' ? "You haven't completed any interviews yet." :
                                 activeTab === 'discontinued' ? "Any stopped sessions will appear here." :
                                 "Start your first session to begin your AI tutor prep."}
                            </p>
                            <button 
                                onClick={() => setShowModeChoice(true)}
                                className="px-8 py-3 bg-[#b45309]/10 hover:bg-[#b45309]/20 text-[#f5cca8] border border-[#b45309]/20 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
                            >
                                Get Started
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-12">
                            {filteredSessions.map((session) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={session.id} 
                                    className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#b45309]/30 rounded-[2rem] p-6 transition-all group flex flex-col justify-between h-full backdrop-blur-md relative overflow-hidden"
                                >
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`px-3 py-1 text-[9px] font-bold uppercase rounded-full tracking-widest border ${
                                                (session.status === 'finished' || (session.assessments && session.assessments.length > 0)) 
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                                    : session.status === 'discontinued'
                                                        ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                        : 'bg-[#b45309]/10 text-[#f5cca8] border border-[#b45309]/20'
                                            }`}>
                                                {(session.status === 'finished' || (session.assessments && session.assessments.length > 0)) ? 'COMPLETED' : session.status.toUpperCase()}
                                            </div>
                                            <span className="text-[10px] text-white/30 flex items-center gap-1.5 font-bold tracking-widest">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(session.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-medium tracking-tighter text-white mb-1 leading-tight group-hover:text-[#f5cca8] transition-colors uppercase">
                                            {session.name.replace('Review', '')}
                                        </h3>
                                        <p className="text-[10px] tracking-widest text-[#b45309]/60 font-mono mb-6">REF: {session.id.substring(0,8).toUpperCase()}</p>
                                        
                                        {session.assessments && session.assessments.length > 0 && session.assessments[0].scores_json && (
                                            <div className="mb-6 p-4 bg-black/40 rounded-2xl border border-white/5">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 mb-1">Rubric Score</p>
                                                        <div className="text-3xl font-medium text-white">
                                                            {(Object.values(session.assessments[0].scores_json).reduce((a, b) => a + b, 0) / Object.values(session.assessments[0].scores_json).length || 0).toFixed(1)}
                                                            <span className="text-sm text-white/20 ml-1">/ 5</span>
                                                        </div>
                                                    </div>
                                                    <Target className="w-8 h-8 text-[#b45309]/30" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative z-10 mt-auto">
                                        {(session.status === 'active' || session.status === 'start' || session.status === 'in_progress') ? (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => onContinue(session.id)}
                                                    className="flex-grow py-3.5 bg-white hover:bg-[#b45309] text-[#1a0f0a] hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                                                >
                                                    Resume <Play className="w-3 h-3 fill-current" />
                                                </button>
                                                <button 
                                                    onClick={async () => {
                                                        await api.discontinueSession(session.id);
                                                        window.location.reload();
                                                    }}
                                                    className="px-4 py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 transition-all"
                                                    title="Discontinue"
                                                >
                                                    Quit
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => onViewReport(session.id)}
                                                disabled={session.status === 'discontinued' || (session.status !== 'finished' && (!session.assessments || session.assessments.length === 0))}
                                                className="w-full py-4 bg-white/5 group-hover:bg-white text-white group-hover:text-[#1a0f0a] text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5 group-hover:border-white disabled:opacity-20 disabled:hover:bg-white/5 disabled:hover:text-white disabled:cursor-not-allowed shadow-xl group-hover:shadow-white/5"
                                            >
                                                {session.status === 'discontinued' ? 'Discontinued' : 'Full Analysis'} <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    
                                    {/* Card Glow Decoration */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#b45309]/10 rounded-full blur-3xl group-hover:bg-[#b45309]/20 transition-all pointer-events-none" />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        ) : view === 'analytics' ? (
            <div className="w-full h-full pb-20 overflow-y-auto custom-scrollbar">
                <AnalyticsView sessions={sessions} onBack={() => setView('list')} />
            </div>
        ) : view === 'prep' ? (
            <div className="w-full h-full pb-20 overflow-y-auto custom-scrollbar">
                <InterviewPrepTool onBack={() => setView('list')} />
            </div>
        ) : view === 'checker' ? (
            <div className="w-full h-full pb-20 overflow-y-auto custom-scrollbar">
                <ATSChecker onGoToAuth={() => {}} /> 
            </div>
        ) : view === 'help' ? (
            <HelpView onBack={() => setView('list')} />
        ) : null}
      </div>

      <FeatureDiscoveryModal 
        isOpen={showOnboarding} 
        onConfirm={completeOnboarding} 
      />

      {/* Mode Choice Overlay */}
      <AnimatePresence>
        {showModeChoice && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModeChoice(false)}
              className="absolute inset-0 bg-[#000]/80 backdrop-blur-xl" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-2xl bg-[#1a0f0a] border border-white/10 rounded-[2.5rem] p-6 sm:p-14 shadow-3xl text-center"
            >
              <h2 className="text-3xl sm:text-5xl font-medium tracking-tighter text-white mb-4 uppercase italic leading-tight">
                Choose your <span className="text-[#f5cca8]">Path</span>
              </h2>
              <p className="text-white/40 font-medium tracking-widest uppercase text-[10px] sm:text-xs mb-8 sm:mb-12 px-4 sm:px-8">
                Select your intended interview format
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mb-10">
                <button 
                    onClick={() => handleStartChoice('practice')}
                    className="group relative flex flex-col items-center p-8 bg-white/5 hover:bg-[#b45309]/10 border border-white/5 hover:border-[#b45309]/50 rounded-[2.5rem] transition-all"
                >
                    <div className="w-16 h-16 bg-[#b45309]/20 rounded-2xl flex items-center justify-center mb-6 text-[#f5cca8] group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 fill-current" />
                    </div>
                    <span className="text-white font-bold tracking-widest uppercase text-xs mb-2">Practice Mode</span>
                    <span className="text-white/40 text-[10px] italic">Focus on single rounds</span>
                </button>

                <button 
                    onClick={() => handleStartChoice('exam')}
                    className="group relative flex flex-col items-center p-8 bg-white/5 hover:bg-[#b45309]/10 border border-white/5 hover:border-[#b45309]/50 rounded-[2.5rem] transition-all"
                >
                    <div className="w-16 h-16 bg-[#b45309]/20 rounded-2xl flex items-center justify-center mb-6 text-[#f5cca8] group-hover:scale-110 transition-transform">
                        <Target className="w-8 h-8" />
                    </div>
                    <span className="text-white font-bold tracking-widest uppercase text-xs mb-2">Exam Mode</span>
                    <span className="text-white/40 text-[10px] italic">Complete 3-round assessment</span>
                </button>
              </div>

              <button 
                onClick={() => setShowModeChoice(false)}
                className="text-white/30 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Close Window
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
