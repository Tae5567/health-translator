import React from 'react';
import { TranscriptionStatus, TranslationStatus } from '@/types';

interface TranscriptDisplayProps {
  transcript: string;
  status: TranscriptionStatus | TranslationStatus; // Accept either type transcription or translation
  placeholder?: string;
}

export default function TranscriptDisplay({
  transcript,
  status,
  placeholder = 'Transcript will appear here...',
}: TranscriptDisplayProps) {
    
  // Determine if the status is recording, processing or an error
  const isRecording = status === 'recording';
  const isProcessing = status === 'processing' || status === 'translating';
  const isError = status === 'error';
  const isIdle = status === 'idle';

  return (
    <div className="min-h-[240px] border border-gray-100 rounded-lg p-4 bg-white relative shadow-sm transition-all">
      {/* Empty state with animated placeholder */}
      {!transcript && isIdle && (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400 italic placeholder-pulse">{placeholder}</p>
        </div>
      )}
      
      {/* Transcript content */}
      {transcript && (
        <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{transcript}</p>
      )}
      
      {/* Recording indicator with animated ping effect */}
      {isRecording && (
        <div className="absolute top-3 right-3 flex items-center bg-white/90 px-2 py-1 rounded-full shadow-sm">
          <span className="flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-xs text-red-500 font-medium">Recording</span>
        </div>
      )}
      
      {/* Processing/Translating indicator with spinner */}
      {isProcessing && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 p-3 rounded-lg shadow-md flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--primary)] mr-3"></div>
          <span className="text-sm font-medium text-[var(--primary)]">
            {status === 'translating' ? 'Translating...' : 'Processing...'}
          </span>
        </div>
      )}
      
      {/* Error indicator */}
      {isError && (
        <div className="absolute top-3 right-3 flex items-center bg-amber-50 px-2 py-1 rounded-full shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-amber-700 font-medium">Error</span>
        </div>
      )}
      
      {/* No content but listening */}
      {!transcript && isRecording && (
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center">
            <div className="flex space-x-1 mr-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-gray-500">Listening...</span>
          </div>
        </div>
      )}
    </div>
  );
}