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
            // Don't revoke the URL here or it causes ERR_FILE_NOT_FOUND in the media fetcher
            if (currentFetchId === fetchIdRef.current) setIsSpeaking(false);
            if (onFinish) onFinish();
        });
    } catch (e) {
        console.error("Failed to fetch TTS:", e);
        if (currentFetchId === fetchIdRef.current) setIsSpeaking(false);
        if (onFinish) onFinish();
    }
  }, [stop]);

  return { speak, stop, isSpeaking };
}
