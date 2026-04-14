import { useState, useCallback, useRef, useEffect } from 'react';

// iOS Safari blocks Audio() autoplay without a prior user gesture
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fetchIdRef = useRef(0);
  const isMountedRef = useRef(true);
  const nativeVoiceRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;

    const loadVoice = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      if (!voices.length) return;

      const preferred = isIOS
        // iOS: just grab any English voice — Neural ones don't exist there
        ? (
            voices.find(v => v.lang === 'en-US') ||
            voices.find(v => v.lang.startsWith('en')) ||
            voices[0]
          )
        // Desktop: prefer the most natural-sounding voices first
        : [
            // Microsoft Edge "Online (Natural)" Neural voices — best quality
            voices.find(v => v.name.includes('Aria')   && v.name.includes('Online') && v.lang.startsWith('en')),
            voices.find(v => v.name.includes('Jenny')  && v.name.includes('Online') && v.lang.startsWith('en')),
            voices.find(v => v.name.includes('Online') && v.lang === 'en-US'),
            voices.find(v => v.name.includes('Natural') && v.lang === 'en-US'),
            // Google Chrome neural voices
            voices.find(v => v.name === 'Google US English'),
            // Any online/neural voice
            voices.find(v => (v.name.includes('Online') || v.name.includes('Neural')) && v.lang.startsWith('en')),
            // Standard fallbacks
            voices.find(v => v.lang === 'en-US'),
            voices.find(v => v.lang.startsWith('en-GB')),
            voices.find(v => v.lang.startsWith('en')),
          ].find(Boolean);

      if (preferred) nativeVoiceRef.current = preferred;
    };

    if (window.speechSynthesis) {
      loadVoice();
      window.speechSynthesis.addEventListener('voiceschanged', loadVoice);
    }

    return () => {
      isMountedRef.current = false;
      window.speechSynthesis?.removeEventListener?.('voiceschanged', loadVoice);
    };
  }, []);

  const _speakNative = useCallback((text, onFinish, currentFetchId) => {
    if (!('speechSynthesis' in window)) {
      if (isMountedRef.current) setIsSpeaking(false);
      if (onFinish && isMountedRef.current) onFinish();
      return;
    }

    window.speechSynthesis.cancel();

    const makeUtt = (chunk) => {
      const utt = new SpeechSynthesisUtterance(chunk);
      utt.lang = 'en-US';
      utt.rate = 1.0;   // natural conversational pace
      utt.pitch = 0.95; // slightly warmer tone
      if (nativeVoiceRef.current) utt.voice = nativeVoiceRef.current;
      return utt;
    };

    const finish = () => {
      if (currentFetchId === fetchIdRef.current && isMountedRef.current) setIsSpeaking(false);
      if (onFinish && isMountedRef.current) onFinish();
    };

    // Chrome bug: utterances >200 chars get silently cut off — split at sentences
    if (text.length > 200) {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      let idx = 0;
      const speakNext = () => {
        if (idx >= sentences.length) { finish(); return; }
        if (currentFetchId !== fetchIdRef.current || !isMountedRef.current) return;
        const utt = makeUtt(sentences[idx++].trim());
        utt.onend = speakNext;
        utt.onerror = finish;
        window.speechSynthesis.speak(utt);
      };
      speakNext();
    } else {
      const utt = makeUtt(text);
      utt.onend = finish;
      utt.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') console.warn('TTS error:', e.error);
        finish();
      };
      window.speechSynthesis.speak(utt);
    }
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    fetchIdRef.current += 1;
    if (isMountedRef.current) setIsSpeaking(false);
  }, []);

  const speak = useCallback((text, onFinish) => {
    window.speechSynthesis?.cancel();

    if (!text?.trim()) {
      if (onFinish && isMountedRef.current) onFinish();
      return;
    }

    const currentFetchId = ++fetchIdRef.current;
    if (isMountedRef.current) setIsSpeaking(true);

    // Native speechSynthesis starts in ~50ms — no network round-trip.
    // Edge/Chrome ship built-in Neural voices (Online Natural) that sound human.
    _speakNative(text, onFinish, currentFetchId);
  }, [_speakNative]);

  return { speak, stop, isSpeaking };
}
