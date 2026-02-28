'use client';

import React from 'react';

const LOADING_MESSAGES = [
  'AI 正在连结你的思维…',
  '正在发现今日灵感脉络…',
  '梳理你的思考碎片中…',
];

export function LoadingState() {
  const [messageIndex, setMessageIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      {/* Animated rings */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-morandi-sage/30 animate-ping" />
        <div className="absolute inset-2 rounded-full border-2 border-morandi-cream/50 animate-pulse" />
        <div className="absolute inset-4 rounded-full border-2 border-morandi-mint/40 animate-pulse-slow" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-morandi-sage animate-pulse" />
        </div>
      </div>

      <p className="text-gray-500 text-sm font-sans animate-pulse">
        {LOADING_MESSAGES[messageIndex]}
      </p>
    </div>
  );
}
