import { useState, useCallback, useRef, useEffect } from 'react';
import { api } from '../api/client';

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);
  const blobUrlRef = useRef(null); // Track blob URL for cleanup (Fix #12)
  const fetchIdRef = useRef(0);
  const isMountedRef = useRef(true); // Unmount guard (Fix #8)

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Clean up any lingering blob URL on unmount
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
    }
    // Revoke existing blob URL to free memory (Fix #12)
    if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
    }
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    fetchIdRef.current += 1; // Invalidate any inflight requests
    if (isMountedRef.current) setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text, onFinish) => {
    stop(); // Pause any existing audio

    const currentFetchId = ++fetchIdRef.current;

    try {
        if (isMountedRef.current) setIsSpeaking(true);
        const audioBlob = await api.generateTTS(text);

        // Discard if superseded or unmounted (Fix #8)
        if (currentFetchId !== fetchIdRef.current || !isMountedRef.current) {
            return;
        }

        if (!audioBlob || audioBlob.size < 100) {
            throw new Error("Backend returned empty audio. Triggering native fallback.");
        }

        // Revoke any previous blob URL before creating a new one (Fix #12)
        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
        }
        const url = URL.createObjectURL(audioBlob);
        blobUrlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
            // Revoke blob URL immediately after playback to free memory (Fix #12)
            URL.revokeObjectURL(url);
            if (blobUrlRef.current === url) blobUrlRef.current = null;

            if (currentFetchId === fetchIdRef.current && isMountedRef.current) {
                setIsSpeaking(false);
            }
            // Only fire onFinish if component is still mounted (Fix #8)
            if (onFinish && isMountedRef.current) onFinish();
        };

        audio.onerror = (e) => {
            console.error("TTS Audio Playback Error", e);
            URL.revokeObjectURL(url);
            if (blobUrlRef.current === url) blobUrlRef.current = null;

            if (currentFetchId === fetchIdRef.current && isMountedRef.current) setIsSpeaking(false);
            if (onFinish && isMountedRef.current) onFinish();
        };

        audio.play().catch((e) => {
            console.error("Audio playback prevented:", e);
            if (currentFetchId === fetchIdRef.current && isMountedRef.current) setIsSpeaking(false);
            if (onFinish && isMountedRef.current) onFinish();
        });

    } catch (e) {
        console.warn("Backend TTS failed, using browser Native TTS instead:", e);
        if (currentFetchId !== fetchIdRef.current || !isMountedRef.current) return;

        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 1.0;
            utterance.onend = () => {
                if (currentFetchId === fetchIdRef.current && isMountedRef.current) setIsSpeaking(false);
                if (onFinish && isMountedRef.current) onFinish();
            };
            utterance.onerror = () => {
                if (currentFetchId === fetchIdRef.current && isMountedRef.current) setIsSpeaking(false);
                if (onFinish && isMountedRef.current) onFinish();
            };
            window.speechSynthesis.speak(utterance);
        } else {
            if (currentFetchId === fetchIdRef.current && isMountedRef.current) setIsSpeaking(false);
            if (onFinish && isMountedRef.current) onFinish();
        }
    }
  }, [stop]);

  return { speak, stop, isSpeaking };
}
