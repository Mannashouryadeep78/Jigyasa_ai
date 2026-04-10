import { useState, useCallback, useRef } from 'react';
import { api } from '../api/client';

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);
  const fetchIdRef = useRef(0);

  const stop = useCallback(() => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    fetchIdRef.current += 1; // Invalidate any incoming inflight requests
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text, onFinish) => {
    stop(); // Immediately pause existing audio and invalidate existing fetches
    
    const currentFetchId = ++fetchIdRef.current;
    
    try {
        setIsSpeaking(true);
        const audioBlob = await api.generateTTS(text);
        
        // If a new TTS was requested while this one was downloading, discard this one
        if (currentFetchId !== fetchIdRef.current) {
            return;
        }

        // Render IP block protection: if blob is tiny, it's a silent failure from edge-tts
        if (!audioBlob || audioBlob.size < 100) {
            throw new Error("Backend returned empty audio (Cloud IP block). Triggering native fallback.");
        }
        
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        
        audioRef.current = audio;
        
        audio.onended = () => {
            if (currentFetchId === fetchIdRef.current) setIsSpeaking(false);
            if (onFinish) onFinish();
        };
        
        audio.onerror = (e) => {
            console.error("TTS Audio Playback Error", e);
            if (currentFetchId === fetchIdRef.current) setIsSpeaking(false);
            if (onFinish) onFinish();
        };

        audio.play().catch(e => {
            console.error("Audio playback prevented:", e);
            if (currentFetchId === fetchIdRef.current) setIsSpeaking(false);
            if (onFinish) onFinish();
        });
    } catch (e) {
        console.warn("Backend TTS failed, using browser Native TTS instead:", e);
        if (currentFetchId !== fetchIdRef.current) return;
        
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 1.0;
            utterance.onend = () => {
                 if (currentFetchId === fetchIdRef.current) setIsSpeaking(false);
                 if (onFinish) onFinish();
            };
            utterance.onerror = () => {
                 if (currentFetchId === fetchIdRef.current) setIsSpeaking(false);
                 if (onFinish) onFinish();
            };
            window.speechSynthesis.speak(utterance);
        } else {
            if (currentFetchId === fetchIdRef.current) setIsSpeaking(false);
            if (onFinish) onFinish();
        }
    }
  }, [stop]);

  return { speak, stop, isSpeaking };
}
