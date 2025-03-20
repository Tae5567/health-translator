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

  return (
    <div className="min-h-[240px] border border-[#f0e0e0] rounded-lg p-4 bg-[#fefeff] relative shadow-inner">
      {transcript ? (
        <p className="whitespace-pre-wrap text-gray-700">{transcript}</p>
      ) : (
        <p className="text-gray-400 italic">{placeholder}</p>
      )}
      
      {/* Status indicators */}
      {isRecording && (
        <div className="absolute top-3 right-3 flex items-center">
          <span className="flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-xs text-red-500 font-medium">Recording</span>
        </div>
      )}
      
      {isProcessing && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/80 p-4 rounded-lg shadow flex items-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ff9aab] mr-3"></div>
        <span className="text-[#ff8496] font-medium">
          {status === 'translating' ? 'Translating...' : 'Processing...'}
        </span>
      </div>
      )}
      
      {isError && (
        <div className="absolute top-3 right-3 flex items-center">
          <span className="inline-flex rounded-full h-3 w-3 bg-yellow-500 mr-2"></span>
          <span className="text-xs text-yellow-600 font-medium">Error</span>
        </div>
      )}
    </div>
  );
}