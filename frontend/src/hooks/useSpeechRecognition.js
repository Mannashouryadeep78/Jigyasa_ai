import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechRecognition({ onTranscriptSubmit }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const maxDurationTimerRef = useRef(null);
  const transcriptRef = useRef('');
  const isListeningRef = useRef(false);
  const submitCallbackRef = useRef(onTranscriptSubmit);
  // KEY FIX: Track which result index we have already consumed to prevent re-reading on mobile restarts
  const lastResultIndexRef = useRef(0);
  // Accumulated final text across multiple recognition sessions (needed because mobile stops/starts)
  const accumulatedFinalRef = useRef('');

  useEffect(() => {
    submitCallbackRef.current = onTranscriptSubmit;
  }, [onTranscriptSubmit]);

  const clearTimers = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (maxDurationTimerRef.current) clearTimeout(maxDurationTimerRef.current);
  };

  const submitTranscript = useCallback(() => {
    const finalText = transcriptRef.current.trim();
    if (finalText) {
        submitCallbackRef.current(finalText);
    } else {
        // Submit empty to advance the session gracefully on silence
        submitCallbackRef.current('');
    }
    // Full reset
    transcriptRef.current = '';
    accumulatedFinalRef.current = '';
    lastResultIndexRef.current = 0;
    setTranscript('');
  }, []);

  const stopListening = useCallback((submit = false) => {
    isListeningRef.current = false;
    clearTimers();

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }

    setIsListening(false);

    if (submit) {
      submitTranscript();
    }
  }, [submitTranscript]);

  const startListening = useCallback(() => {
    if (isListeningRef.current) return;

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech Recognition not supported in this browser.');
      return;
    }

    // Full cleanup before starting fresh
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    clearTimers();

    // Full state reset before starting a new session
    transcriptRef.current = '';
    accumulatedFinalRef.current = '';
    lastResultIndexRef.current = 0;
    setTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    // KEY FIX: Use continuous=false and restart manually.
    // Mobile browsers (Android Chrome, iOS Safari) have critical bugs with continuous=true:
    // they accumulate and re-deliver old result buffers on every restart, causing infinite repetition.
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      // Only read results starting from the last known index to prevent re-processing old results
      let newFinalText = '';
      let newInterimText = '';

      for (let i = lastResultIndexRef.current; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          newFinalText += event.results[i][0].transcript + ' ';
          lastResultIndexRef.current = i + 1; // advance the pointer
        } else {
          newInterimText = event.results[i][0].transcript;
        }
      }

      if (newFinalText) {
        accumulatedFinalRef.current += newFinalText;
      }

      const displayText = (accumulatedFinalRef.current + newInterimText).trim();
      transcriptRef.current = displayText;
      setTranscript(displayText);

      // Reset the silence timer on each new word
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        if (isListeningRef.current) {
          stopListening(true);
        }
      }, 3000); // 3 seconds of silence triggers submission
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        // Microphone permission denied - stop completely
        stopListening(false);
      }
      // For network, aborted, audio-capture - just stop and let user retry
    };

    recognition.onend = () => {
      // If we're still supposed to be listening AND have accumulated some text,
      // restart without resetting to capture more speech.
      // If we have NO text yet and still listening, also restart (user is just thinking).
      if (isListeningRef.current) {
        // Reset result index because a new recognition session starts fresh from index 0
        lastResultIndexRef.current = 0;
        try {
          const newRecognition = new SpeechRecognition();
          recognitionRef.current = newRecognition;
          newRecognition.continuous = false;
          newRecognition.interimResults = true;
          newRecognition.lang = 'en-US';
          newRecognition.maxAlternatives = 1;
          newRecognition.onresult = recognition.onresult;
          newRecognition.onerror = recognition.onerror;
          newRecognition.onend = recognition.onend;
          newRecognition.start();
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

      // 20-second silence guard (no speech at all detected)
      silenceTimerRef.current = setTimeout(() => {
        if (isListeningRef.current && transcriptRef.current.trim() === '') {
          stopListening(true);
        }
      }, 20000);

      // Hard 120-second max cap
      maxDurationTimerRef.current = setTimeout(() => {
        if (isListeningRef.current) {
          stopListening(true);
        }
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) stopListening(true);
    else startListening();
  }, [startListening, stopListening]);

  return { isListening, transcript, startListening, stopListening, toggleListening };
}
