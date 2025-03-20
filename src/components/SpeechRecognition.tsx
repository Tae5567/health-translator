//Speech Recognition Component
import React, { useEffect } from 'react';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import { TranscriptionStatus } from '@/types';

interface SpeechRecognitionProps {
  language: string;
  onTranscriptChange: (transcript: string) => void;
  onStatusChange: (status: TranscriptionStatus) => void;
}

export default function SpeechRecognition({
    language,
    onTranscriptChange,
    onStatusChange,
  }: SpeechRecognitionProps) {
    const {
      transcript,
      interimTranscript,
      isListening,
      error,
      startListening,
      stopListening,
      resetTranscript,
      supported
    } = useSpeechRecognition({
      language,
      continuous: true,
      interimResults: true,
      improveMedical: true,
    });
  
    // Update the transcript when it changes
    useEffect(() => {
      console.log("Transcript changed:", transcript);
      onTranscriptChange(transcript);
    }, [transcript, onTranscriptChange]);
  
    // Update status when recognition state changes
    useEffect(() => {
      let newStatus: TranscriptionStatus = 'idle';
      
      if (isListening) {
        newStatus = 'recording';
      } else if (error) {
        newStatus = 'error';
      } else if (transcript) {
        newStatus = 'completed'; 
      }
      
      console.log("Transcription status changed:", newStatus);
      onStatusChange(newStatus);
    }, [isListening, error, transcript, onStatusChange]);
  
    const handleToggleListening = () => {
      if (isListening) {
        console.log("Stopping listening");
        stopListening();
      } else {
        console.log("Starting listening");
        startListening();
      }
    };
  
    const handleReset = () => {
      console.log("Resetting transcript");
      stopListening();
      resetTranscript();
      onTranscriptChange('');
      onStatusChange('idle');
    };
  
    if (!supported) {
      console.warn("Speech recognition not supported");
      return (
        <div className="p-4 bg-[#fff0f0] border border-red-200 text-red-700 rounded-lg">
          <p>Speech recognition is not supported in this browser.</p>
          <p>Please try Chrome, Edge or Safari.</p>
        </div>
      );
    }
  
    return (
      <div className="speech-recognition">
        {/* Controls */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleToggleListening}
            className={`rounded-full px-5 py-2 font-medium flex items-center gap-2 shadow-sm transition-colors duration-200 ${
              isListening
                ? 'bg-[#ff8496] hover:bg-[#ff6277] text-white'
                : 'bg-[#ff9aab] hover:bg-[#ff8496] text-white'
            }`}
            aria-label={isListening ? "Stop recording" : "Start recording"}
          >
            {isListening ? (
              <>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute h-3 w-3 rounded-full bg-red-200"></span>
                  <span className="relative rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Stop Recording
              </>
            ) : (
              <>Start Recording</>
            )}
          </button>
          
          {transcript && (
            <button
              onClick={handleReset}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-5 py-2 shadow-sm transition-colors duration-200"
              aria-label="Reset transcript"
            >
              Reset
            </button>
          )}
        </div>
  
        {/* Error display */}
        {error && (
          <div className="mt-3 p-2 bg-[#fff0f0] border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
  
        {/* Interim results display */}
        {isListening && interimTranscript && (
          <div className="mt-3 italic text-gray-500 text-sm">
            {interimTranscript}...
          </div>
        )}
      </div>
    );
  }