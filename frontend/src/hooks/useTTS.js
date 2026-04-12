import { useState, useCallback, useRef, useEffect } from 'react';
import { api } from '../api/client';

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);
  const blobUrlRef = useRef(null);
  const fetchIdRef = useRef(0);
  const isMountedRef = useRef(true);
  const nativeVoiceRef = useRef(null); // Cached best English voice

  useEffect(() => {
    isMountedRef.current = true;

    // Pre-load the best available English voice so it's ready when TTS is called
    const loadVoice = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      // Priority: en-US Neural > en-US any > en-GB > en fallback
      const preferred = [
        voices.find(v => v.name.includes('Neural') && v.lang.startsWith('en-US')),
        voices.find(v => v.lang === 'en-US'),
        voices.find(v => v.lang.startsWith('en-GB')),
        voices.find(v => v.lang.startsWith('en')),
      ].find(Boolean);
      if (preferred) nativeVoiceRef.current = preferred;
    };

    if (window.speechSynthesis) {
      loadVoice();
      // voiceschanged fires asynchronously in most browsers
      window.speechSynthesis.addEventListener('voiceschanged', loadVoice);
    }

    return () => {
      isMountedRef.current = false;
      window.speechSynthesis?.removeEventListener?.('voiceschanged', loadVoice);
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  const _speakNative = useCallback((text, onFinish, currentFetchId) => {
    if (!('speechSynthesis' in window)) {
      if (isMountedRef.current) setIsSpeaking(false);
      if (onFinish && isMountedRef.current) onFinish();
      return;
    }

    // Cancel anything already speaking
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Use the pre-cached best voice if available
    if (nativeVoiceRef.current) {
      utterance.voice = nativeVoiceRef.current;
    }

    const finish = () => {
      if (currentFetchId === fetchIdRef.current && isMountedRef.current) {
        setIsSpeaking(false);
      }
      if (onFinish && isMountedRef.current) onFinish();
    };

    utterance.onend = finish;
    utterance.onerror = (e) => {
      // 'interrupted' is not a real error — happens when stop() is called
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('SpeechSynthesis error:', e.error);
      }
      finish();
    };

    // Chrome bug: long utterances get cut off — split into sentences
    if (text.length > 200) {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      let idx = 0;

      const speakNext = () => {
        if (idx >= sentences.length) { finish(); return; }
        if (currentFetchId !== fetchIdRef.current || !isMountedRef.current) return;
        const utt = new SpeechSynthesisUtterance(sentences[idx++].trim());
        utt.lang = 'en-US';
        utt.rate = 1.0;
        if (nativeVoiceRef.current) utt.voice = nativeVoiceRef.current;
        utt.onend = speakNext;
        utt.onerror = finish;
        window.speechSynthesis.speak(utt);
      };

      speakNext();
    } else {
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    fetchIdRef.current += 1; // Invalidate any in-flight fetches
    if (isMountedRef.current) setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text, onFinish) => {
    // Interrupt current playback WITHOUT incrementing fetchIdRef
    // (stop() would increment it, causing the new speak()'s fetch to appear "superseded")
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (!text?.trim()) {
      if (onFinish && isMountedRef.current) onFinish();
      return;
    }

    const currentFetchId = ++fetchIdRef.current;
    if (isMountedRef.current) setIsSpeaking(true);

    try {
      const audioBlob = await api.generateTTS(text);

      // Discard if superseded or unmounted
      if (currentFetchId !== fetchIdRef.current || !isMountedRef.current) return;

      if (!audioBlob || audioBlob.size < 100) {
        throw new Error('Empty audio from backend — falling back to native TTS');
      }

      // Revoke old blob URL
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      const url = URL.createObjectURL(audioBlob);
      blobUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        if (currentFetchId === fetchIdRef.current && isMountedRef.current) setIsSpeaking(false);
        if (onFinish && isMountedRef.current) onFinish();
      };

      audio.onerror = (e) => {
        console.error('TTS Audio Playback Error — falling back to native', e);
        // Fall back to native instead of just stopping
        _speakNative(text, onFinish, currentFetchId);
      };

      audio.play().catch((e) => {
        console.warn('Audio.play() prevented (autoplay policy?) — falling back to native:', e);
        // On autoplay block, fall back to native which IS allowed after user interaction
        _speakNative(text, onFinish, currentFetchId);
      });

    } catch (e) {
      console.warn('Backend TTS failed — using browser native TTS:', e.message);
      if (currentFetchId !== fetchIdRef.current || !isMountedRef.current) return;
      _speakNative(text, onFinish, currentFetchId);
    }
  }, [stop, _speakNative]);

  return { speak, stop, isSpeaking };
}
