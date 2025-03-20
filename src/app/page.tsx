// Main Page for the Healthcare Translation App
'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { LANGUAGES } from '@/types';
import SpeechRecognition from '@/components/SpeechRecognition';
import TranscriptDisplay from '@/components/TranscriptDisplay';
import { TranscriptionStatus, TranslationStatus } from '@/types';
import { useSpeechSupport } from '@/components/SpeechSupportProvider';
import UnsupportedBrowser from '@/components/UnsupportedBrowser';
import { translateText, speakText, stopSpeaking } from '@/lib/translationService';
import PrivacyNotice from '@/components/PrivacyNotice';
//import Link from 'next/link';

export default function Home() {
  const { recognitionSupported, synthesisSupported, browserInfo } = useSpeechSupport();
  
  const [sourceLanguage, setSourceLanguage] = useState(LANGUAGES[0].code);
  const [targetLanguage, setTargetLanguage] = useState(LANGUAGES[1].code);
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [transcriptionStatus, setTranscriptionStatus] = useState<TranscriptionStatus>('idle');
  const [translationStatus, setTranslationStatus] = useState<TranslationStatus>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [apiKeyAvailable, setApiKeyAvailable] = useState(true);

  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem("privacyNoticeAccepted") === "true";
    setPrivacyAccepted(hasAccepted);
  }, []);

  
  // Translation debounce
  const translationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check for API key on component mount
  useEffect(() => {
    const hasApiKey = !!process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    setApiKeyAvailable(hasApiKey);
    
    if (!hasApiKey) {
      console.warn("Missing OpenAI API key - translation functionality will be disabled");
    }
  }, []);

  // Handle translation when transcript changes
  useEffect(() => {
    // Only translate if there's content, languages are different, and API key is available
    if (transcript && sourceLanguage !== targetLanguage && apiKeyAvailable) {
      // Clear if existing timeout
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
      
      // Set delay to avoid too many API calls when user is still speaking
      translationTimeoutRef.current = setTimeout(async () => {
        try {
          await translateText(
            transcript,
            sourceLanguage,
            targetLanguage,
            setTranslation,
            setTranslationStatus
          );
        } catch (error) {
          console.error('Translation error:', error);
          setTranslationStatus('error');
        }
      }, 1000);
    } else if (!transcript) {
      // Reset translation when transcript is cleared
      setTranslation('');
      setTranslationStatus('idle');
    } else if (sourceLanguage === targetLanguage) {
      // When languages are the same, just copy the transcript
      setTranslation(transcript);
      setTranslationStatus('completed');
    }
    
    // Cleanup function
    return () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
    };
  }, [transcript, sourceLanguage, targetLanguage, apiKeyAvailable]);

  // Handle speaking of translated text
  const handleSpeak = useCallback(() => {
    if (!synthesisSupported || !translation) return;
  
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speakText(translation, targetLanguage);
      setIsSpeaking(true);
  
      // Properly handle speech synthesis end event
      const onEnd = () => {
        setIsSpeaking(false);
        window.speechSynthesis.removeEventListener("end", onEnd);
      };
  
      window.speechSynthesis.addEventListener("end", onEnd);
    }
  }, [translation, targetLanguage, isSpeaking, synthesisSupported]);
  

  // Swap languages
  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setTranscript(translation);
    setTranslation(transcript);
  };

  // Reset everything
  const handleReset = () => {
    setTranscript('');
    setTranslation('');
    setTranscriptionStatus('idle');
    setTranslationStatus('idle');
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    }
  };

  // If speech recognition is not supported, show unsupported browser message
  if (!recognitionSupported) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#ff8496]">
          Health Talk Translation
        </h1>
        <UnsupportedBrowser 
          feature="Speech Recognition" 
          browserInfo={browserInfo} 
        />
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-[#ff8496]">
        Health Talk Translation
      </h1>
      
      {!apiKeyAvailable && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
          <p className="font-medium">OpenAI API Key Missing</p>
          <p className="text-sm">Translation functionality is disabled. Please add your OpenAI API key to the environment variables.</p>
        </div>
      )}
       <>
    {!privacyAccepted && <PrivacyNotice onAccept={() => setPrivacyAccepted(true)} />}
    {/* Existing Page Code */}
  </>
      
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Language
            </label>
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff9aab]"
            >
              {LANGUAGES.map((lang) => (
                <option key={`source-${lang.code}`} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleSwapLanguages}
            className="mt-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Swap languages"
          >
            ↔️
          </button>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Language
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff9aab]"
            >
              {LANGUAGES.map((lang) => (
                <option key={`target-${lang.code}`} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-700">
            Original ({LANGUAGES.find(lang => lang.code === sourceLanguage)?.name})
          </h2>
          <TranscriptDisplay
            transcript={transcript}
            status={transcriptionStatus}
            placeholder="Speak to start transcription..."
          />
          <div className="mt-4">
            <SpeechRecognition
              language={sourceLanguage}
              onTranscriptChange={setTranscript}
              onStatusChange={setTranscriptionStatus}
            />
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-700">
            Translation ({LANGUAGES.find(lang => lang.code === targetLanguage)?.name})
          </h2>
          <TranscriptDisplay
            transcript={translation}
            status={translationStatus}
            placeholder="Translation will appear here..."
          />
          <div className="mt-4 flex gap-3">
            {synthesisSupported && (
              <button
                onClick={handleSpeak}
                disabled={!translation || translationStatus === 'translating'}
                className={`rounded-full px-5 py-2 font-medium flex items-center gap-2 shadow-sm transition-colors duration-200 ${
                  !translation || translationStatus === 'translating'
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : isSpeaking
                    ? 'bg-[#ffb1be] hover:bg-[#ff9aab] text-white'
                    : 'bg-[#ff9aab] hover:bg-[#ff8496] text-white'
                }`}
                aria-label={isSpeaking ? "Stop speaking" : "Speak translation"}
              >
                {isSpeaking ? 'Stop Speaking' : 'Speak Translation'}
              </button>
            )}
            <button
              onClick={handleReset}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-5 py-2 shadow-sm transition-colors duration-200"
              aria-label="Reset all"
            >
              Reset All
            </button>
          </div>
        </div>
      </div>
      
      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>
          This application uses OpenAI&apos;s API for translation and the Web Speech API for 
          speech recognition and synthesis. For best results, use Chrome or Edge.
        </p>
        <p className="mt-2">
          © {new Date().getFullYear()} Health Talk Translation
        </p>
      </footer>
    </main>
  );
}