import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import ResumeUpload from './components/ResumeUpload';
import WelcomeScreen from './components/WelcomeScreen';
import InterviewRoom from './components/InterviewRoom';
import AssessmentReport from './components/AssessmentReport';
import InterviewPrepTool from './components/InterviewPrepTool';
import ExamResultScreen from './components/ExamResultScreen';
import RoundTransition from './components/RoundTransition';
import { api } from './api/client';
import { useAuth } from './contexts/AuthContext';

const EXAM_MODES = ['gd', 'technical', 'hr'];
const EXAM_MODE_NAMES = ['Communication & GD', 'Technical Domain', 'HR Round'];

export default function App() {
  const { user } = useAuth();
  const [publicPhase, setPublicPhase] = useState(() => localStorage.getItem('jigyasa_public_phase') || 'landing');
  const [authMode, setAuthMode] = useState('login'); 
  
  const [phase, setPhase] = useState(() => {
    const saved = localStorage.getItem('jigyasa_phase');
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

  // Exam Mode State
  const [sessionType, setSessionType] = useState('practice'); // 'practice' or 'exam'
  const [examRound, setExamRound] = useState(0); // 0, 1, 2
  const [examScores, setExamScores] = useState([]);
  const [lastRoundScore, setLastRoundScore] = useState(0);

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

  const handleStartNew = (type = 'practice') => {
    setCandidateName(user?.user_metadata?.full_name || 'Candidate');
    setSessionType(type);
    setExamRound(0);
    setExamScores([]);
    setPhase('upload');
  };

  const handleViewReport = (sessionId) => {
    setSession(sessionId);
    setPhase('report');
  };

  const handleUpload = (file, mode = 'hr') => {
    setResumeFile(file);
    if (sessionType === 'practice') {
        setInterviewMode(mode);
    } else {
        setInterviewMode(EXAM_MODES[0]); // Starts with GD
    }
    setPhase('welcome');
  };

  const handleStartInterview = async () => {
    setIsInitializing(true);
    try {
        const res = await api.createSession(user.id, candidateName, resumeFile, interviewMode);
        setSession(res.session_id);
        setInitialMessage(res.message);
        setInitialHistory(null);
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
          if (res.restarted) {
              alert(`Session "${res.candidate_name}" can no longer be continued — the server was restarted.\n\nPlease start a new interview.`);
              return;
          }
          setSession(sessionId);
          setCandidateName(res.candidate_name);
          setInitialHistory(res.history);
          setInitialMessage('');
          setPhase('interview');
      } catch (err) {
          console.error("Failed to load session", err);
          alert("Couldn't continue the session.");
      }
  };

  const handleFinish = async () => {
    if (sessionType === 'exam') {
        setIsInitializing(true);
        try {
            // Wait slightly for the backend to finalize the status before polling
            await new Promise(r => setTimeout(r, 2000));

            let report = null;
            // Poll for up to 15 seconds (15 attempts, 1s each)
            for (let i = 0; i < 15; i++) {
                try {
                    report = await api.getReport(session);
                    // Check if scores exist in the report object
                    if (report && (report.scores || report.scores_json)) break;
                } catch (e) {
                    console.warn(`Polling attempt ${i+1} failed:`, e);
                }
                await new Promise(r => setTimeout(r, 1000));
            }

            if (!report || (!report.scores && !report.scores_json)) {
                throw new Error("Assessment not generated in time. The AI may still be processing.");
            }

            const scores = report.scores || report.scores_json;
            const avg = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;
            
            const newScores = [...examScores, avg];
            setExamScores(newScores);
            setLastRoundScore(avg);

            if (examRound < 2) {
                setPhase('round_transition');
            } else {
                setPhase('exam_result');
            }
        } catch (err) {
            console.error("Failed to process exam round result:", err);
            // Fallback: If score fetching fails, proceed to transition with 0 as placeholder
            // to avoid blocking the entire exam.
            const newScores = [...examScores, 0];
            setExamScores(newScores);
            setLastRoundScore(0);
            
            if (examRound < 2) {
                setPhase('round_transition');
            } else {
                setPhase('exam_result');
            }
        } finally {
            setIsInitializing(false);
        }
    } else {
        setPhase('report');
    }
  };

  const handleProceedNextRound = () => {
      const nextIdx = examRound + 1;
      setExamRound(nextIdx);
      setInterviewMode(EXAM_MODES[nextIdx]);
      setPhase('welcome');
  };

  if (!user) {
      if (publicPhase === 'prep') return <InterviewPrepTool onBack={() => setPublicPhase('landing')} />;
      if (publicPhase === 'landing') return <LandingPage onGoToAuth={(mode) => {
          if (mode === 'prep') setPublicPhase('prep');
          else { setAuthMode(mode); setPublicPhase('auth'); }
      }} />;
      return <LoginScreen initialMode={authMode} onBack={() => setPublicPhase('landing')} />;
  }

  return (
    <>
      {phase === 'dashboard' && (
        <Dashboard 
          onStartNew={handleStartNew} 
          onViewReport={handleViewReport} 
          onContinue={handleContinue} 
        />
      )}
      {phase === 'upload' && <ResumeUpload type={sessionType} onUpload={handleUpload} onBack={() => setPhase('dashboard')} />}
      {phase === 'welcome' && (
         <WelcomeScreen onStart={handleStartInterview} onBack={() => setPhase('upload')} candidateName={candidateName} isInitializing={isInitializing} />
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
      {phase === 'round_transition' && (
          <RoundTransition 
              lastRoundName={EXAM_MODE_NAMES[examRound]} 
              lastRoundScore={lastRoundScore} 
              nextRoundName={EXAM_MODE_NAMES[examRound + 1]} 
              onProceed={handleProceedNextRound} 
          />
      )}
      {phase === 'report' && (
         <div className="relative">
             <button onClick={() => setPhase('dashboard')} className="fixed top-6 left-6 z-50 bg-[#1a0f0a] text-white px-4 py-2 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-[#b45309] border border-white/10 shadow-lg transition-all transition-duration-300">← Back to Dashboard</button>
             <AssessmentReport sessionId={session} />
         </div>
      )}
      {phase === 'exam_result' && (
          <ExamResultScreen examScores={examScores} onBackToDashboard={() => setPhase('dashboard')} />
      )}
    </>
  );
}
