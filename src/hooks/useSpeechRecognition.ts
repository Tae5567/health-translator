'use client';
//Hook for Speech Recognition
import {useState, useEffect, useCallback, useRef} from 'react';

import { improveMedicalTerms } from '@/lib/openai';

interface useSpeechRecognitionProps {
    language: string;
    continuous?: boolean;
    interimResults?: boolean;
    improveMedical?: boolean;
}

interface useSpeechRecognitionResult {
    transcript:string;
    interimTranscript: string;
    isListening: boolean;
    error: string | null;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
    supported: boolean;
}

interface SpeechRecognitionEventType extends Event {
    results: {
        [key: number]: {
            [key: number]: {
                transcript: string;
            };
            isFinal: boolean;
        };
        length: number;
    };
    resultIndex: number;
}

interface SpeechRecognitionErrorType extends Event {
    error: string;
}


interface SpeechRecognitionType extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;  
    stop: () => void;
    abort: () => void;
    onresult: (event: SpeechRecognitionEventType) => void;
    onend: (event: Event) => void;
    onerror: (event: SpeechRecognitionErrorType) => void;
    onspeechstart: (event: Event) => void;
    onspeechend: (event: Event) => void;
}

//Check browser support for SpeechRecognition
const SpeechRecognitionAPI = typeof window !== 'undefined' 
?(window.SpeechRecognition || window.webkitSpeechRecognition) 
: undefined;

export default function useSpeechRecognition({
    language,
    continuous = false,
    interimResults = true,
    improveMedical = true,
}: useSpeechRecognitionProps): useSpeechRecognitionResult {
    const [transcript, setTranscript] = useState<string>('');
    const [interimTranscript, setInterimTranscript] = useState<string>('');
    const [isListening, setIsListening] = useState<boolean>(false);         
    const [error, setError] = useState<string | null>(null); 
    const recognitionRef = useRef<SpeechRecognitionType | null>(null);
    const supported = typeof SpeechRecognitionAPI !== 'undefined';
    
    // Add a shouldRestartRef to track if we want to restart recognition
    const shouldRestartRef = useRef<boolean>(false);

    //Store the last time the transcript was improved
    const lastImproved = useRef<number>(0);
    const improveTermsTimeout = useRef<NodeJS.Timeout | null>(null);

    //Function to improve medical terms
    const improveTerms = useCallback(async (text: string) => {
        if (!improveMedical|| !text.trim()) return;
        try {
            console.log("Improving medical terms:", text);
            const improvedText = await improveMedicalTerms(text);
            console.log("Improved text:", improvedText);
            setTranscript(improvedText);
        } catch (error) {
            console.error("Error improving transcript", error);
            //Set the original transcript if there is an error
        }
    }, [improveMedical]);

    //Initialize SpeechRecognition
    useEffect(() => {
        if (!supported) {
            setError("Speech Recognition is not supported in this browser");
            return;
        }

        if (typeof SpeechRecognitionAPI === 'undefined'){
            return;
        }

        const recognition = new SpeechRecognitionAPI() as SpeechRecognitionType;
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = language;

        recognition.onresult = (event: SpeechRecognitionEventType) => {
            console.log("Speech recognition result received", event);
            let finalTranscript = '';
            let currentInterimTranscript = '';
          
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
          
              if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
              } else {
                currentInterimTranscript += transcript;
              }
            }
          
            // Update transcript
            if (finalTranscript) {
              setTranscript(prevTranscript => {
                const newTranscript = prevTranscript + finalTranscript;
                console.log("New transcript:", newTranscript);
                
                // Separate the improvement logic to avoid race conditions
                handleTranscriptImprovement(newTranscript);
                
                return newTranscript;
              });
            }
          
            setInterimTranscript(currentInterimTranscript);
          };
          
          // Separate function to handle transcript improvement
          const handleTranscriptImprovement = (text: string) => {
            if (!improveMedical) return;
            
            const now = Date.now();
            
            // Clear pending improvements
            if (improveTermsTimeout.current) {
              clearTimeout(improveTermsTimeout.current);
            }
            
            // Only improve/enhance medical terminology transcripts every 2 seconds
            if (now - lastImproved.current > 2000) {
              improveTerms(text);
              lastImproved.current = now;
            } else {
              // Set enhancing to be done after 2 seconds
              improveTermsTimeout.current = setTimeout(() => {
                improveTerms(text);
                lastImproved.current = Date.now();
              }, 2000);
            }
          };
        

        recognition.onspeechstart = () => {
            console.log("🎙️ Speech detected (onspeechstart)");
        };
        
        recognition.onspeechend = () => {
            console.log("🔇 Speech ended (onspeechend)");
        };
        

        recognition.onerror = (event) => {
            console.error("⚠️ Speech Recognition Error Detected:", event);
            
            // Handle specific error types
            switch(event.error) {
              case 'no-speech':
                console.log("No speech detected");
                // This is normal, don't set error
                break;
              case 'aborted':
                console.log("Speech recognition aborted");
                // User or system aborted, don't set error
                break;
              case 'network':
                console.error("Network error occurred");
                setError("Network error. Please check your connection.");
                setIsListening(false);
                shouldRestartRef.current = false; // Don't restart on network error
                break;
              case 'not-allowed':
              case 'security':
                console.error("Microphone permission denied");
                setError("Microphone permission denied. Please allow microphone access.");
                setIsListening(false);
                shouldRestartRef.current = false; // Don't restart if permission denied
                break;
              case 'service-not-allowed':
                console.error("Speech service not allowed");
                setError("Speech recognition service not allowed on this device.");
                setIsListening(false);
                shouldRestartRef.current = false; // Don't restart if service not allowed
                break;
              default:
                console.error("🔴 Error Type:", event.error);
                setError(event.error || "Unknown error");
                setIsListening(false);
                shouldRestartRef.current = false; // Don't restart on unknown errors
            }
          };
        

        recognition.onend = () => {
            console.warn("⚠️ Speech recognition ended.");
            
            // Check if we should restart
            if (shouldRestartRef.current) {
              console.log("🔄 Restarting speech recognition...");
              
              // Add a delay before attempting to restart
              setTimeout(() => {
                try {
                  // Only restart if we're still flagged to restart
                  if (shouldRestartRef.current && recognitionRef.current) {
                    recognitionRef.current.start();
                    console.log("✅ Speech recognition restarted!");
                  } else {
                    console.log("Not restarting - restart flag is now false");
                    setIsListening(false);
                  }
                } catch (err) {
                  console.error("Error restarting recognition:", err);
                  setError("Failed to restart speech recognition");
                  setIsListening(false);
                  shouldRestartRef.current = false;
                }
              }, 300);
            } else {
              console.log("Not restarting speech recognition - shouldRestart is false");
              setIsListening(false);
            }
          };
        

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                try {
                  recognitionRef.current.abort(); // Use abort() instead of stop()
                } catch (e) {
                  console.error("Error aborting recognition:", e);
                }
            }
            shouldRestartRef.current = false;
        };
    }, [language, continuous, interimResults, improveMedical, improveTerms, supported]);

    //Function to start listening
    const startListening = useCallback(() => {
        setError(null);
        if (!supported) {
            setError("Speech Recognition is not supported in this browser");
            return;
        }
    
        if (recognitionRef.current) {
            console.log("🔊 Attempting to start speech recognition...");
            try {
                shouldRestartRef.current = true; // Set flag to restart when recognition ends
                recognitionRef.current.start();
                setIsListening(true);
                console.log("✅ Speech recognition started!");
            } catch (err) {
                console.error("🚨 Error starting recognition:", err);
                shouldRestartRef.current = false;
                setIsListening(false);
            }
        } else {
            console.error("❌ recognitionRef.current is NULL. Speech recognition cannot start.");
        }
    }, [supported]);
    
        
    //Function to stop listening
    const stopListening = useCallback(() => {
        console.log("Stopping speech recognition");
        // Set flag to not restart
        shouldRestartRef.current = false;
        
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);

            //Process pending improvements/enhancements
            if (improveTermsTimeout.current) {
                clearTimeout(improveTermsTimeout.current);
                improveTerms(transcript);
            }
        }
    }, [transcript, improveTerms]);

    //Function to reset transcript
    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
    }, []);

    return {
        transcript,
        interimTranscript,
        isListening,
        error,
        startListening,
        stopListening,
        resetTranscript,
        supported
    };
}