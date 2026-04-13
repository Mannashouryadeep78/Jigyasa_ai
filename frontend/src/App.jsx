import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import ResumeUpload from './components/ResumeUpload';
import WelcomeScreen from './components/WelcomeScreen';
import InterviewRoom from './components/InterviewRoom';
import AssessmentReport from './components/AssessmentReport';
import InterviewPrepTool from './components/InterviewPrepTool';
import { api } from './api/client';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { user } = useAuth();
  const [publicPhase, setPublicPhase] = useState(() => localStorage.getItem('jigyasa_public_phase') || 'landing');
  const [authMode, setAuthMode] = useState('login'); 
  
  const [phase, setPhase] = useState(() => {
    const saved = localStorage.getItem('jigyasa_phase');
    // Only restore safe phases that don't depend on specific session state
    if (saved === 'landing' || saved === 'dashboard') return saved;
    return 'dashboard';
  });
  const [session, setSession] = useState(null);
  const [candidateName, setCandidateName] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [interviewMode, setInterviewMode] = useState('hr');
  const [initialMessage, setInitialMessage] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);

  const [initialHistory, setInitialHistory] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('jigyasa_phase', phase);
    } else {
      localStorage.removeItem('jigyasa_phase');
    }
  }, [phase, user]);

  useEffect(() => {
    localStorage.setItem('jigyasa_public_phase', publicPhase);
  }, [publicPhase]);

  useEffect(() => {
     // Ignore user kicks for now, render handled in JSX body
  }, [user]);

  const handleStartNew = () => {
    setCandidateName(user?.user_metadata?.full_name || 'Candidate');
    setPhase('upload');
  };

  const handleViewReport = (sessionId) => {
    setSession(sessionId);
    setPhase('report');
  };

  const handleUpload = (file, mode = 'hr') => {
    setResumeFile(file);
    setInterviewMode(mode);
    setPhase('welcome');
  };

  const handleStartInterview = async () => {
    setIsInitializing(true);
    try {
        const res = await api.createSession(user.id, candidateName, resumeFile, interviewMode);
        setSession(res.session_id);
        setInitialMessage(res.message);
        setInitialHistory(null); // Clear history
        setIsInitializing(false);
        setPhase('interview');
    } catch (err) {
        setIsInitializing(false);
        console.error("Error starting session", err);
        alert("Server failed to start the session. Ensure your backend is running.");
    }
  };

  const handleContinue = async (sessionId) => {
      try {
          const res = await api.getSession(sessionId);

          // Server was restarted — MemorySaver lost the graph state
          if (res.restarted) {
              alert(`Session "${res.candidate_name}" can no longer be continued — the server was restarted and the in-memory interview state was lost.\n\nPlease start a new interview from the dashboard.`);
              return;
          }

          // Check if session is in a valid continuable state
          if (res.status === 'finished' || res.status === 'closer') {
              alert("This session has already been completed. You can view the report from the dashboard.");
              return;
          }
          if (res.status === 'discontinued') {
              alert("This session was discontinued and cannot be continued.");
              return;
          }
          setSession(sessionId);
          setCandidateName(res.candidate_name);
          setInitialHistory(res.history);
          setInitialMessage(''); // We rely on history
          setPhase('interview');
      } catch (err) {
          console.error("Failed to load session", err);
          if (err.response?.status === 404) {
              alert("This session was not found. Please start a new interview.");
          } else {
              alert("Couldn't continue the session. Please try again.");
          }
      }
  };

  const handleFinish = () => {
    setPhase('report');
  };

  if (!user) {
      if (publicPhase === 'prep') {
          return <InterviewPrepTool onBack={() => setPublicPhase('landing')} />;
      }
      if (publicPhase === 'landing') {
          return <LandingPage onGoToAuth={(mode) => {
              if (mode === 'prep') {
                  setPublicPhase('prep');
              } else {
                  setAuthMode(mode);
                  setPublicPhase('auth');
              }
          }} />;
      }
      return <LoginScreen initialMode={authMode} onBack={() => setPublicPhase('landing')} />;
  }

  return (
    <>
      {phase === 'landing' && <LandingPage onGoToAuth={(mode) => {
          if (mode === 'dashboard') setPhase('dashboard');
          if (mode === 'prep') {
              // This is a bit tricky since Prep tool is currently only for public. 
              // But we can let it work for auth users too if we want.
          }
      }} />}
      {phase === 'dashboard' && (
        <Dashboard 
          onStartNew={handleStartNew} 
          onViewReport={handleViewReport} 
          onContinue={handleContinue} 
          onBackToLanding={() => setPhase('landing')}
        />
      )}
      {phase === 'upload' && <ResumeUpload onUpload={handleUpload} onBack={() => setPhase('dashboard')} />}
      {phase === 'welcome' && (
         <WelcomeScreen onStart={handleStartInterview} candidateName={candidateName} isInitializing={isInitializing} />
      )}
      {phase === 'interview' && (
        <InterviewRoom 
          sessionId={session} 
          candidateName={candidateName} 
          initialMessage={initialMessage}
          initialHistory={initialHistory}
          onFinish={handleFinish}
        />
      )}
      {phase === 'report' && (
         <div className="relative">
             <button onClick={() => setPhase('dashboard')} className="fixed top-6 left-6 z-50 bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-700 shadow-lg" style={{border: '1px solid rgba(255,255,255,0.1)'}}>← Back to Dashboard</button>
             <AssessmentReport sessionId={session} />
         </div>
      )}
    </>
  );
}
