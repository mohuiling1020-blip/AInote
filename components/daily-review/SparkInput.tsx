'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Zap, Send, X } from 'lucide-react';

interface SparkInputProps {
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export function SparkInput({ onSubmit, onCancel, disabled }: SparkInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

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
    <div className="flex items-start gap-2 p-2 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40">
      <Zap className="w-4 h-4 text-[#9C9460] shrink-0 ml-1 mt-2" />
      <textarea
        ref={textareaRef}
        rows={2}
        value={content}
        onChange={e => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="写下你的新火花…"
        disabled={disabled}
        className="flex-1 bg-transparent text-sm text-gray-700 font-sans placeholder:text-gray-400 focus:outline-none disabled:opacity-50 resize-none leading-relaxed"
      />
      <div className="flex flex-col gap-1 shrink-0">
        <button
          onClick={handleSubmit}
          disabled={disabled || !content.trim()}
          className="p-1.5 rounded-lg bg-morandi-sage/80 text-white hover:bg-morandi-sage transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg bg-gray-200/50 text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
