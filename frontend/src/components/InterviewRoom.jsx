import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Loader2, XCircle } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTTS } from '../hooks/useTTS';
import { api } from '../api/client';
import WaveformVisualizer from './WaveformVisualizer';

export default function InterviewRoom({ sessionId, candidateName, initialMessage, initialHistory = null, onFinish, onCancel }) {
    const [typedAnswer, setTypedAnswer] = useState('');
    const [history, setHistory] = useState(() => {
        if (initialHistory) {
            return initialHistory.map((m, i) => ({ ...m, id: m.id || `${m.role}-${i}-${Date.now()}` }));
        }
        return initialMessage ? [{ id: 'init', role: 'ai', content: initialMessage }] : [];
    });
    const [isProcessing, setIsProcessing] = useState(false);

    const { speak, stop: stopTTS, isSpeaking } = useTTS();

    // Fix #7: Use ref for blankCount to avoid state race conditions on rapid blank submissions
    const blankCountRef = useRef(0);

    // Fix #6: Use a ref flag to indicate if the component is actively mounted and processing
    const isProcessingRef = useRef(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const handleTranscriptSubmit = async (browserText, audioBlob) => {
        // Guard against submitting while already processing (Fix #6)
        if (isProcessingRef.current) return;

        // ── Whisper transcription (more accurate than browser Speech API) ──
        // Try to get a Whisper-quality transcript from the recorded audio blob.
        // Fall back to the browser's live transcript if Whisper fails or is unavailable.
        let submitText = browserText.trim();
        if (audioBlob) {
            try {
                const result = await api.transcribeAudio(audioBlob);
                if (result?.transcript?.trim()) {
                    submitText = result.transcript.trim();
                }
            } catch (e) {
                console.warn('[Whisper] Transcription failed, using browser transcript as fallback:', e.message);
            }
        }

        if (!submitText) {
            if (blankCountRef.current === 0) {
                blankCountRef.current = 1;
                speak("I didn't quite catch that. Could you please repeat your answer?", () => {
                    if (isMountedRef.current) startListening();
                });
                return;
            } else {
                submitText = "[The user remained completely silent. Move immediately to the next question skipping evaluation.]";
                blankCountRef.current = 0;
            }
        } else {
            blankCountRef.current = 0;
        }

        // Add user message to history — use timestamp-based unique ID (Fix #19)
        const userMsgId = `user-${Date.now()}`;
        if (submitText.startsWith("[")) {
            if (isMountedRef.current) setHistory(prev => [...prev, { id: userMsgId, role: 'user', content: "(No response provided)" }]);
        } else {
            if (isMountedRef.current) setHistory(prev => [...prev, { id: userMsgId, role: 'user', content: submitText }]);
        }

        isProcessingRef.current = true;
        if (isMountedRef.current) setIsProcessing(true);

        try {
            const res = await api.respond(sessionId, submitText);

            if (!isMountedRef.current) return; // Component unmounted during await

            const aiMsgId = `ai-${Date.now()}`;
            setHistory(prev => [...prev, { id: aiMsgId, role: 'ai', content: res.message }]);

            if (res.status === 'finished') {
                speak(res.message, () => {
                    if (isMountedRef.current) onFinish();
                });
            } else {
                speak(res.message, () => {
                    if (!isMountedRef.current) return;
                    setTimeout(() => {
                        if (isMountedRef.current) startListening();
                    }, 500);
                });
            }
        } catch (err) {
            console.error("Failed to respond", err);
            if (isMountedRef.current) {
                alert("The AI Screener encountered a connection error. This is often caused by Groq API Free-Tier Rate Limits (Too Many Requests / Minute) or backend server restarts. Please wait 60 seconds and refresh the page to start a new session.");
            }
        } finally {
            isProcessingRef.current = false;
            if (isMountedRef.current) setIsProcessing(false);
        }
    };

    const { isSupported, isListening, transcript, startListening, toggleListening, stopListening } = useSpeechRecognition({
        onTranscriptSubmit: handleTranscriptSubmit
    });

    // Speak initial message on mount
    useEffect(() => {
        if (initialMessage) {
            speak(initialMessage, () => {
                if (isMountedRef.current) startListening();
            });
        }
        return () => stopTTS();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex flex-col min-h-dvh bg-[#e0ccb8] text-white font-sans selection:bg-black selection:text-white pb-2 md:pb-8">

            <header className="p-4 sm:p-6 md:px-12 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 group">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-400 animate-pulse shadow-[0_0_10px_2px_rgba(248,113,113,0.3)]"></div>
                    <span className="font-bold tracking-widest text-[#1a0f0a] uppercase text-[9px] sm:text-xs">Live • {candidateName}</span>
                </div>
                <div className="hidden sm:block text-[9px] sm:text-xs text-[#1a0f0a]/50 font-bold tracking-widest uppercase">
                    ID: {sessionId?.split('-')[0] || 'TEST'}
                </div>
                <button
                    onClick={async () => {
                        stopTTS();
                        stopListening();
                        await api.discontinueSession(sessionId);
                        onCancel();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-[9px] font-bold uppercase tracking-widest transition-all"
                >
                    <XCircle className="w-3 h-3" /> Cancel
                </button>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 md:px-8 w-full max-w-7xl mx-auto overflow-hidden">
                <div className="w-full h-full bg-[#1a0f0a] rounded-[1.5rem] sm:rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center">

                    {/* Orbital decorative rings */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 mix-blend-overlay" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="80%" cy="20%" rx="50%" ry="100%" fill="none" stroke="#fff" strokeWidth="1" />
                        <ellipse cx="-10%" cy="80%" rx="60%" ry="80%" fill="none" stroke="#fff" strokeWidth="1" />
                    </svg>

                    <div className="w-full max-w-4xl flex-1 flex flex-col justify-end mb-4 sm:mb-8 relative z-10 px-4 sm:px-8 overflow-hidden">
                        <div className="space-y-4 sm:space-y-6 max-h-full overflow-y-auto pb-4 custom-scrollbar pr-2 sm:pr-4">
                            {history.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={`msg-${msg.id}`}
                                    className={`flex flex-col ${msg.role === 'ai' ? 'items-start' : 'items-end'}`}
                                >
                                    <span className="text-[9px] text-white/40 mb-1.5 font-bold tracking-widest uppercase select-none">
                                        {msg.role === 'ai' ? 'Screener' : 'You'}
                                    </span>
                                    <div className={`px-4 sm:px-6 py-3 sm:py-5 rounded-[1.2rem] sm:rounded-[2rem] max-w-[95%] sm:max-w-[85%] text-xs sm:text-sm md:text-base font-medium shadow-xl ${msg.role === 'ai'
                                            ? 'bg-white/5 text-white rounded-bl-sm border border-white/10'
                                            : 'bg-[#b45309] text-[#1a0f0a] rounded-br-sm'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}

                            {isSpeaking && (
                                <div key="state-speaking" className="flex items-center justify-start mt-4 sm:mt-6 pl-2 sm:pl-4">
                                    <WaveformVisualizer isActive={true} color="bg-[#f5cca8]" />
                                </div>
                            )}

                            {(isListening || transcript) && !isProcessing && (
                                <div key="state-listening" className="flex flex-col items-end mt-4">
                                    <div className="max-w-[90%] sm:max-w-[85%] text-right text-[#f5cca8] px-4 sm:px-6 py-3 sm:py-5 bg-[#b45309]/10 border border-[#b45309]/20 rounded-[1.2rem] sm:rounded-[2rem] rounded-br-sm italic font-medium text-xs sm:text-sm md:text-base">
                                        {transcript || 'Listening...'}
                                        <span className="animate-pulse">_</span>
                                    </div>
                                    <div className="pr-2 sm:pr-4 pt-3 sm:pt-4">
                                        <WaveformVisualizer isActive={isListening && transcript.length > 0} color="bg-[#b45309]" />
                                    </div>
                                </div>
                            )}

                            {isProcessing && (
                                <div key="state-processing" className="flex items-center justify-center py-4 sm:py-8">
                                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-[#b45309] animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="w-full bg-[#1a0f0a]/90 backdrop-blur-sm flex flex-col items-center justify-center pb-6 sm:pb-12 pb-safe pt-4 sm:pt-6 border-t border-white/5 relative z-10 shrink-0">
                        {isSupported ? (
                            <>
                                <button
                                    onClick={toggleListening}
                                    disabled={isSpeaking || isProcessing}
                                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full transition-all flex items-center justify-center border-2 sm:border-4 ${isListening
                                            ? 'bg-red-500 active:bg-red-600 text-white border-red-400 shadow-[0_0_40px_rgba(239,68,68,0.4)]'
                                            : 'bg-white active:bg-white/90 text-[#1a0f0a] grayscale active:grayscale-0 border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)]'
                                        } disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group`}
                                >
                                    {isListening ? <Mic className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" /> : <MicOff className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform" />}
                                </button>
                                <p className="mt-4 sm:mt-6 text-[8px] sm:text-[10px] tracking-widest font-bold uppercase text-white/50 text-center max-w-[200px] sm:max-w-sm px-4">
                                    {isListening ? 'Speak naturally. Pausing for 3 seconds will auto-submit.' : 'Microphone disabled'}
                                </p>
                            </>
                        ) : (
                            /* iOS / browsers without Web Speech API — text input fallback */
                            <div className="w-full max-w-xl px-4 flex flex-col items-center gap-3">
                                <textarea
                                    value={typedAnswer}
                                    onChange={e => setTypedAnswer(e.target.value)}
                                    disabled={isSpeaking || isProcessing}
                                    placeholder="Type your answer here…"
                                    rows={3}
                                    className="w-full rounded-2xl bg-white/10 border border-white/10 text-white text-base placeholder:text-white/30 px-4 py-3 outline-none focus:border-white/30 resize-none disabled:opacity-50"
                                />
                                <button
                                    onClick={() => { handleTranscriptSubmit(typedAnswer); setTypedAnswer(''); }}
                                    disabled={isSpeaking || isProcessing || !typedAnswer.trim()}
                                    className="w-full py-3 rounded-full bg-[#b45309] active:bg-[#b45309]/80 text-white text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? 'Processing…' : 'Submit Answer'}
                                </button>
                                <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">
                                    Voice unavailable on this device — type your answer above
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

