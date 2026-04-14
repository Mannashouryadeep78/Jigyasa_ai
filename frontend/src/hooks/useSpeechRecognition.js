import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechRecognition({ onTranscriptSubmit }) {
  const isSupported = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const maxDurationTimerRef = useRef(null);
  const transcriptRef = useRef('');
  const isListeningRef = useRef(false);
  const submitCallbackRef = useRef(onTranscriptSubmit);
  // Track which result index we have already consumed to prevent re-reading on mobile restarts
  const lastResultIndexRef = useRef(0);
  // Accumulated final text across multiple recognition sessions
  const accumulatedFinalRef = useRef('');

  // ── Whisper audio recording ─────────────────────────────────────────────────
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    submitCallbackRef.current = onTranscriptSubmit;
  }, [onTranscriptSubmit]);

  const clearTimers = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (maxDurationTimerRef.current) clearTimeout(maxDurationTimerRef.current);
  };

  // Stops MediaRecorder and resolves with the recorded audio blob (or null if too short)
  const stopMediaRecorder = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = () => {
          const blob = audioChunksRef.current.length > 0
            ? new Blob(audioChunksRef.current, { type: 'audio/webm' })
            : null;
          audioChunksRef.current = [];
          mediaRecorderRef.current = null;
          // Stop the underlying stream tracks
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(t => t.stop());
            mediaStreamRef.current = null;
          }
          // Only return the blob if it's large enough to contain real speech (>2 KB)
          resolve(blob && blob.size > 2000 ? blob : null);
        };
        try { recorder.stop(); } catch (e) { resolve(null); }
      } else {
        audioChunksRef.current = [];
        mediaRecorderRef.current = null;
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(t => t.stop());
          mediaStreamRef.current = null;
        }
        resolve(null);
      }
    });
  }, []);

  const submitTranscript = useCallback(async () => {
    const browserText = transcriptRef.current.trim();
    const audioBlob = await stopMediaRecorder();

    // Call with both browser transcript (for instant fallback) and audio blob (for Whisper)
    submitCallbackRef.current(browserText, audioBlob);

    // Full reset
    transcriptRef.current = '';
    accumulatedFinalRef.current = '';
    lastResultIndexRef.current = 0;
    setTranscript('');
  }, [stopMediaRecorder]);

  const stopListening = useCallback((submit = false) => {
    isListeningRef.current = false;
    clearTimers();

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }

    setIsListening(false);

    if (submit) {
      submitTranscript(); // async — caller doesn't need to await
    } else {
      stopMediaRecorder(); // discard recording
      transcriptRef.current = '';
      accumulatedFinalRef.current = '';
      lastResultIndexRef.current = 0;
      setTranscript('');
    }
  }, [submitTranscript, stopMediaRecorder]);

  const startListening = useCallback(async () => {
    if (isListeningRef.current) return;

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech Recognition not supported in this browser.');
      return;
    }

    // Full cleanup
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    clearTimers();

    // Full state reset
    transcriptRef.current = '';
    accumulatedFinalRef.current = '';
    lastResultIndexRef.current = 0;
    audioChunksRef.current = [];
    setTranscript('');

    // ── Start MediaRecorder for Whisper (fail silently if unavailable) ──────
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.start(250); // collect chunks every 250 ms
    } catch (e) {
      console.warn('[Whisper] MediaRecorder unavailable — browser-only transcription:', e.message);
    }

    // ── Browser SpeechRecognition for real-time visual feedback ─────────────
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let newFinalText = '';
      let newInterimText = '';

      for (let i = lastResultIndexRef.current; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          newFinalText += event.results[i][0].transcript + ' ';
          lastResultIndexRef.current = i + 1;
        } else {
          newInterimText = event.results[i][0].transcript;
        }
      }

      if (newFinalText) accumulatedFinalRef.current += newFinalText;

      const displayText = (accumulatedFinalRef.current + newInterimText).trim();
      transcriptRef.current = displayText;
      setTranscript(displayText);

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        if (isListeningRef.current) stopListening(true);
      }, 3000);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        stopListening(false);
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        lastResultIndexRef.current = 0;
        try {
          const newRec = new SpeechRecognition();
          recognitionRef.current = newRec;
          newRec.continuous = false;
          newRec.interimResults = true;
          newRec.lang = 'en-US';
          newRec.maxAlternatives = 1;
          newRec.onresult = recognition.onresult;
          newRec.onerror = recognition.onerror;
          newRec.onend = recognition.onend;
          newRec.start();
        } catch (e) {
          console.warn('Could not restart recognition:', e);
          setIsListening(false);
          isListeningRef.current = false;
        }
      }
    };

    try {
      recognition.start();
      setIsListening(true);
      isListeningRef.current = true;

      // 20-second guard — no speech detected at all
      silenceTimerRef.current = setTimeout(() => {
        if (isListeningRef.current && transcriptRef.current.trim() === '') {
          stopListening(true);
        }
      }, 20000);

      // Hard 120-second cap
      maxDurationTimerRef.current = setTimeout(() => {
        if (isListeningRef.current) stopListening(true);
      }, 120000);

    } catch (e) {
      console.warn('Recognition start failed:', e);
    }
  }, [stopListening]);

  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      clearTimers();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) stopListening(true);
    else startListening();
  }, [startListening, stopListening]);

  return { isSupported, isListening, transcript, startListening, stopListening, toggleListening };
}
