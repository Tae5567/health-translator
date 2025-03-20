import React, { useState, useEffect } from 'react';

interface PrivacyNoticeProps {
  onAccept: () => void;
}

export default function PrivacyNotice({ onAccept }: PrivacyNoticeProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user has already accepted the privacy notice
    const hasAccepted = localStorage.getItem('privacyNoticeAccepted');
    if (hasAccepted === 'true') {
      setIsVisible(false);
      onAccept();
    }
  }, [onAccept]);

  const handleAccept = () => {
    // Store acceptance in localStorage
    localStorage.setItem('privacyNoticeAccepted', 'true');
    setIsVisible(false);
    onAccept();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[#ff8496] mb-4">Privacy Notice</h2>
          
          <div className="space-y-4 text-gray-700">
            <p>
              Welcome to Health Talk Translation. Before you begin, please read our privacy policy regarding your medical conversations.
            </p>
            
            <h3 className="font-semibold text-lg mt-4">How We Handle Your Data</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>No Data Storage:</strong> We do not store your voice recordings or transcripts on our servers. All processing happens in your browser.
              </li>
              <li>
                <strong>API Processing:</strong> Your text is sent to OpenAI&apos;s API for translation and medical term improvement. These interactions are subject to OpenAI&apos;s privacy policy.
              </li>
              <li>
                <strong>Temporary Processing:</strong> Data is only held in memory during your session and is automatically cleared when you close the app.
              </li>
              <li>
                <strong>No Patient Identifiers:</strong> Avoid including patient names or identifiable information in your conversations.
              </li>
            </ul>
            
            <h3 className="font-semibold text-lg mt-4">Recommendations for Security</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use this tool in private environments only</li>
              <li>Reset transcripts after each conversation</li>
              <li>Be mindful of sensitive information in your speech</li>
              <li>Follow your organization&apos;s privacy protocols</li>
            </ul>
            
            <p className="mt-4 text-sm">
              By clicking &quot;I Understand and Accept&quot; below, you acknowledge that you have read and understood our privacy practices and agree to use this tool responsibly.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={handleAccept}
            className="bg-[#ff9aab] hover:bg-[#ff8496] text-white font-medium rounded-full px-6 py-2 shadow-sm transition-colors duration-200"
          >
            I Understand and Accept
          </button>
        </div>
      </div>
    </div>
  );
}