//Speech Spport Provider for Browsers Component

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface SpeechSupportState {
  recognitionSupported: boolean;
  synthesisSupported: boolean;
  browserInfo: string;
}

const SpeechSupportContext = createContext<SpeechSupportState>({
  recognitionSupported: false,
  synthesisSupported: false,
  browserInfo: '',
});

export function SpeechSupportProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SpeechSupportState>({
    recognitionSupported: false,
    synthesisSupported: false,
    browserInfo: '',
  });

  useEffect(() => {
    // Check if in a browser environment
    if (typeof window === 'undefined') return;

    // Detect browser
    const userAgent = navigator.userAgent;
    let browserInfo = '';

    if (userAgent.indexOf('Chrome') > -1) {
      browserInfo = 'Google Chrome';
    } else if (userAgent.indexOf('Safari') > -1) {
      browserInfo = 'Apple Safari';
    } else if (userAgent.indexOf('Firefox') > -1) {
      browserInfo = 'Mozilla Firefox';
    } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) {
      browserInfo = 'Internet Explorer';
    } else if (userAgent.indexOf('Edge') > -1) {
      browserInfo = 'Microsoft Edge';
    } else {
      browserInfo = 'Unknown Browser';
    }

    // Check Speech Recognition support
    const recognitionSupported = 
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

    // Check Speech Synthesis support
    const synthesisSupported = 
      'speechSynthesis' in window;

    setState({
      recognitionSupported,
      synthesisSupported,
      browserInfo,
    });
  }, []);

  return (
    <SpeechSupportContext.Provider value={state}>
      {children}
    </SpeechSupportContext.Provider>
  );
}

export function useSpeechSupport() {
  return useContext(SpeechSupportContext);
}