'use client';

import React, { useState } from 'react';
import { Zap, Send } from 'lucide-react';

interface SparkInputProps {
  onSubmit: (content: string) => void;
  disabled?: boolean;
}

export function SparkInput({ onSubmit, disabled }: SparkInputProps) {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40">
      <Zap className="w-4 h-4 text-[#9C9460] shrink-0 ml-1" />
      <input
        type="text"
        value={content}
        onChange={e => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="写下你的新火花…"
        disabled={disabled}
        className="flex-1 bg-transparent text-sm text-gray-700 font-sans placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !content.trim()}
        className="p-1.5 rounded-lg bg-morandi-sage/80 text-white hover:bg-morandi-sage transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Send className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
