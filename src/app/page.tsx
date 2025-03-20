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
        <h1 className="text-3xl font-bold text-center mb-8 gradient-text">
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
      <h1 className="text-4xl font-bold text-center mb-4 gradient-text">
        Health Talk Translation
      </h1>
      <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
        Breaking language barriers in healthcare conversations with real-time translation
      </p>
      
      {!apiKeyAvailable && (
        <div className="bg-amber-50 border-l-4 border-amber-400 text-amber-800 px-6 py-4 rounded shadow-sm mb-8">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">OpenAI API Key Missing</p>
          </div>
          <p className="mt-1 text-sm ml-7">Translation functionality is disabled. Please add your OpenAI API key to the environment variables.</p>
        </div>
      )}
      
      {!privacyAccepted && <PrivacyNotice onAccept={() => setPrivacyAccepted(true)} />}
      
      <div className="card mb-8">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source Language
            </label>
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              className="language-select w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] focus:border-transparent transition-all duration-200"
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
            className="mt-6 p-3 rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
            aria-label="Swap languages"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Language
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="language-select w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] focus:border-transparent transition-all duration-200"
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card relative">
          <div className="absolute -top-3 left-4 bg-white px-2 rounded-md">
            <span className="text-sm font-medium text-gray-600">
              Original ({LANGUAGES.find(lang => lang.code === sourceLanguage)?.name})
            </span>
          </div>
          <div className="h-64 overflow-auto mb-4">
            <TranscriptDisplay
              transcript={transcript}
              status={transcriptionStatus}
              placeholder="Speak to start transcription..."
            />
          </div>
          <div className="mt-4">
            <SpeechRecognition
              language={sourceLanguage}
              onTranscriptChange={setTranscript}
              onStatusChange={setTranscriptionStatus}
            />
          </div>
        </div>
        
        <div className="card relative">
          <div className="absolute -top-3 left-4 bg-white px-2 rounded-md">
            <span className="text-sm font-medium text-gray-600">
              Translation ({LANGUAGES.find(lang => lang.code === targetLanguage)?.name})
            </span>
          </div>
          <div className="h-64 overflow-auto mb-4">
            <TranscriptDisplay
              transcript={translation}
              status={translationStatus}
              placeholder="Translation will appear here..."
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {synthesisSupported && (
              <button
                onClick={handleSpeak}
                disabled={!translation || translationStatus === 'translating'}
                className={`flex items-center gap-2 btn-primary ${
                  !translation || translationStatus === 'translating'
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                aria-label={isSpeaking ? "Stop speaking" : "Speak translation"}
              >
                {isSpeaking ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                    Stop Speaking
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    </svg>
                    Speak Translation
                  </>
                )}
              </button>
            )}
            <button
              onClick={handleReset}
              className="btn-secondary flex items-center gap-2"
              aria-label="Reset all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Reset All
            </button>
          </div>
        </div>
      </div>
      
      <footer className="mt-16 text-center">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
          <p className="text-gray-600">
            This application uses OpenAI&apos;s API for translation and the Web Speech API for 
            speech recognition and synthesis. For best results, use Chrome or Edge.
          </p>
          <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
            <span>© {new Date().getFullYear()} Health Talk Translation</span>
            <span className="mx-2">•</span>
            <span>Breaking language barriers in healthcare</span>
          </div>
        </div>
      </footer>
    </main>
  );
}