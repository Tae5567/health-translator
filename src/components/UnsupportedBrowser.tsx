//Unsupported Browser Component for if the browser does not support the speech recognition feature

import React from 'react';

interface UnsupportedBrowserProps {
  feature: string;
  browserInfo: string;
}

export default function UnsupportedBrowser({ feature, browserInfo }: UnsupportedBrowserProps) {
  return (
    <div className="p-6 bg-[#fff5f7] border border-[#ffd6dd] rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Unsupported Browser
      </h2>
      
      <p className="mb-4 text-gray-700">
        {feature} is not supported in your current browser ({browserInfo}).
      </p>
      
      <div className="mb-4">
        <p className="font-medium mb-2 text-gray-700">Please try one of these browsers instead:</p>
        <ul className="list-disc pl-6 space-y-1 text-gray-600">
          <li>Google Chrome (Recommended)</li>
          <li>Microsoft Edge</li>
          <li>Safari (on macOS)</li>
        </ul>
      </div>
      
      <p className="text-sm text-[#ff8496]">
        This application requires speech recognition capabilities that are not available in all browsers.
      </p>
    </div>
  );
}