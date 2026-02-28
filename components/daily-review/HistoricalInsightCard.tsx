'use client';

import React, { useState } from 'react';
import { Clock, Zap, Link, X } from 'lucide-react';
import { SparkInput } from './SparkInput';

interface HistoricalInsightCardProps {
  noteTitle: string | null;
  noteContent: string;
  hook: string;
  onSpark: (content: string) => void;
  onMerge: () => void;
  onDismiss: () => void;
  disabled?: boolean;
}

export function HistoricalInsightCard({
  noteTitle,
  noteContent,
  hook,
  onSpark,
  onMerge,
  onDismiss,
  disabled,
}: HistoricalInsightCardProps) {
  const [showSparkInput, setShowSparkInput] = useState(false);
  const [actionTaken, setActionTaken] = useState<string | null>(null);

  const handleSpark = (content: string) => {
    onSpark(content);
    setActionTaken('spark');
    setShowSparkInput(false);
  };

  const handleMerge = () => {
    onMerge();
    setActionTaken('merge');
  };

  const handleDismiss = () => {
    onDismiss();
    setActionTaken('dismiss');
  };

  return (
    <div className="rounded-[20px] backdrop-blur-2xl bg-white/40 border border-white/50 shadow-[0_15px_40px_-10px_rgba(148,159,151,0.25)] ring-1 ring-white/30 p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      {/* Section title */}
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-morandi-sage" />
        <h3 className="text-sm font-serif text-gray-700">灵感遗珠</h3>
      </div>

      {/* Hook */}
      <p className="text-sm text-gray-500 font-sans italic mb-4 leading-relaxed">
        {hook}
      </p>

      {/* Historical note preview */}
      <div className="p-4 rounded-2xl bg-morandi-mint/10 border border-morandi-mint/30 mb-4">
        {noteTitle && (
          <h4 className="text-sm font-medium text-[#6D7A70] mb-1">{noteTitle}</h4>
        )}
        <p className="text-xs text-gray-500 font-sans line-clamp-3 leading-relaxed">
          {noteContent}
        </p>
      </div>

      {/* Action buttons or result */}
      {actionTaken ? (
        <div className="text-center py-2">
          <span className="text-xs text-morandi-sage font-sans">
            {actionTaken === 'spark' && '新火花已创建'}
            {actionTaken === 'merge' && '已收藏关联'}
            {actionTaken === 'dismiss' && '已跳过'}
          </span>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSparkInput(true)}
              disabled={disabled}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#EBE2AA]/30 border border-[#EBE2AA]/50 text-[#9C9460] text-xs font-medium hover:bg-[#EBE2AA]/50 transition-all active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              产生火花
            </button>
            <button
              onClick={handleMerge}
              disabled={disabled}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-morandi-mint/20 border border-morandi-mint/40 text-[#6D7A70] text-xs font-medium hover:bg-morandi-mint/40 transition-all active:scale-95 disabled:opacity-50"
            >
              <Link className="w-3.5 h-3.5" />
              记住关联
            </button>
            <button
              onClick={handleDismiss}
              disabled={disabled}
              className="flex items-center justify-center p-2.5 rounded-xl bg-gray-100/50 border border-gray-200/50 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 transition-all active:scale-95 disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Spark input */}
          {showSparkInput && (
            <div className="mt-3">
              <SparkInput onSubmit={handleSpark} disabled={disabled} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
