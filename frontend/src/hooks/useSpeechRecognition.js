import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechRecognition({ onTranscriptSubmit }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const transcriptRef = useRef('');
  const isListeningRef = useRef(false);
  const submitCallbackRef = useRef(onTranscriptSubmit);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    submitCallbackRef.current = onTranscriptSubmit;
  }, [onTranscriptSubmit]);

  const maxDurationTimerRef = useRef(null);
  const lastSubmittedRef = useRef(null);

  const submitTranscript = () => {
      const finalTranscript = transcriptRef.current.trim();
      let validTranscript = finalTranscript;
      
      // Prevent browser STT zombie-buffer bug where it immediately spits out the previous sentence
      if (finalTranscript && finalTranscript === lastSubmittedRef.current) {
          validTranscript = ''; // Ignore the zombie text and treat as blank/silence
      }
      
      if (validTranscript) {
          lastSubmittedRef.current = validTranscript;
      }
      
      // Allow empty transcript to be submitted to handle blank answer logic
      submitCallbackRef.current(validTranscript);
      setTranscript('');
      transcriptRef.current = '';
  };

  const stopListening = useCallback((submit = false) => {
    if (recognitionRef.current) {
      try {
          recognitionRef.current.stop();
      } catch(e) {}
    }
    setIsListening(false);
    isListeningRef.current = false;
    
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (maxDurationTimerRef.current) clearTimeout(maxDurationTimerRef.current);
    
    if (submit) {
       submitTranscript();
    }
  }, []);

  const startListening = useCallback(() => {
    if (isListeningRef.current) return;
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech Recognition API not supported in this browser.');
      return;
    }

    // Stop any existing instance
    if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        let full = '';
        for(let j=0; j < event.results.length; j++) {
            full += event.results[j][0].transcript;
        }
        transcriptRef.current = full;
        setTranscript(full);

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        
        silenceTimerRef.current = setTimeout(() => {
            stopListening(true);
        }, 5000);
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error !== 'no-speech') {
            setIsListening(false);
            isListeningRef.current = false;
        }
    };

    recognition.onend = () => {
        // If it ended due to Chrome's native no-speech (which happens automatically around 8-10s of silence)
        // AND we haven't hit our actual intended 15s or 120s timeouts, we should secretly restart it
        // so the user still has time to think!
        if (isListeningRef.current) {
             try {
                 recognition.start();
             } catch(e) {
                 setIsListening(false);
                 isListeningRef.current = false;
             }
        } else {
             setIsListening(false);
             isListeningRef.current = false;
        }
    };

    setTranscript('');
    transcriptRef.current = '';
    
    try {
      recognition.start();
      setIsListening(true);
      isListeningRef.current = true;
      
      // Give the user 20 seconds to THINK and start speaking before assuming they stepped away
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
          if (isListeningRef.current && transcriptRef.current.trim() === '') {
              isListeningRef.current = false; // prevent onend from restarting
              stopListening(true); 
          }
      }, 20000);

      // Max 120s timer
      if (maxDurationTimerRef.current) clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = setTimeout(() => {
          if (isListeningRef.current) {
              isListeningRef.current = false; // prevent onend from restarting
              stopListening(true);
          }
      }, 120000);

    } catch (e) {
      console.warn("Recognition start failed", e);
    }
  }, [stopListening]);

  useEffect(() => {
      // Cleanup on unmount
      return () => {
          if (recognitionRef.current) {
              try { recognitionRef.current.stop(); } catch(e){}
          }
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) stopListening(true);
    else startListening();
  }, [startListening, stopListening]);

  return { isListening, transcript, startListening, stopListening, toggleListening };
}
