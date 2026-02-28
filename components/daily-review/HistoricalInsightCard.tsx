'use client';

import React, { useState, useCallback } from 'react';
import { Clock, Zap, Link, X } from 'lucide-react';
import { SparkInput } from './SparkInput';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

type CardState =
  | 'idle'
  | 'spark-input'
  | 'spark-done'
  | 'merging'
  | 'merge-done'
  | 'dismissing'
  | 'dismissed';

interface HistoricalInsightCardProps {
  noteTitle: string | null;
  noteContent: string;
  hook: string;
  onSpark: (content: string) => Promise<void>;
  onMerge: () => Promise<void>;
  onDismiss: () => Promise<void>;
  onComplete?: () => void;
  disabled?: boolean;
}

export function HistoricalInsightCard({
  noteTitle,
  noteContent,
  hook,
  onSpark,
  onMerge,
  onDismiss,
  onComplete,
  disabled,
}: HistoricalInsightCardProps) {
  const [cardState, setCardState] = useState<CardState>('idle');
  const [submitting, setSubmitting] = useState(false);

  const triggerDismiss = useCallback(async () => {
    if (cardState !== 'idle' || submitting) return;
    setCardState('dismissing');
    try {
      await onDismiss();
    } catch (err) {
      console.error('Dismiss failed:', err);
    }
  }, [cardState, submitting, onDismiss]);

  const { translateX, isSwiping, handlers } = useSwipeGesture({
    onSwipeLeft: triggerDismiss,
  });

  const handleSparkSubmit = async (content: string) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSpark(content);
      setCardState('spark-done');
      setTimeout(() => {
        onComplete?.();
      }, 1500);
    } catch (err) {
      console.error('Spark failed:', err);
      setCardState('idle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMerge = async () => {
    if (cardState !== 'idle' || submitting) return;
    setCardState('merging');
    try {
      await onMerge();
    } catch (err) {
      console.error('Merge failed:', err);
      setCardState('idle');
    }
  };

  const handleAnimationEnd = () => {
    if (cardState === 'merging') {
      setCardState('merge-done');
      onComplete?.();
    } else if (cardState === 'dismissing') {
      setCardState('dismissed');
      onComplete?.();
    }
  };

  // Don't render after final states
  if (cardState === 'merge-done' || cardState === 'dismissed') {
    return null;
  }

  const isContentCollapsed = cardState === 'spark-input' || cardState === 'spark-done';
  const animationClass =
    cardState === 'merging'
      ? 'animate-fly-up'
      : cardState === 'dismissing'
        ? 'animate-flip-out'
        : cardState === 'spark-done'
          ? 'animate-spark-glow'
          : '';

  const swipeStyle =
    isSwiping && cardState === 'idle'
      ? { transform: `translateX(${translateX}px)`, transition: 'none' }
      : {};

  return (
    <div
      className={`rounded-[20px] backdrop-blur-2xl bg-white/40 border border-white/50 shadow-[0_15px_40px_-10px_rgba(148,159,151,0.25)] ring-1 ring-white/30 p-6 animate-fade-in-up ${animationClass}`}
      style={{ animationDelay: '0.2s', ...swipeStyle }}
      onAnimationEnd={handleAnimationEnd}
      {...handlers}
    >
      {/* Section title */}
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-morandi-sage" />
        <h3 className="text-sm font-medium font-sans text-morandi-sage">灵感遗珠</h3>
      </div>

      {/* Hook & Note content — collapsible */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isContentCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
        }`}
      >
        <p className="text-sm text-gray-500 font-sans italic mb-4 leading-relaxed">
          {hook}
        </p>
        <div className="p-4 rounded-2xl bg-morandi-mint/10 border border-morandi-mint/30 mb-4">
          {noteTitle && (
            <h4 className="text-sm font-medium text-[#6D7A70] mb-1">{noteTitle}</h4>
          )}
          <p className="text-xs text-gray-500 font-sans line-clamp-3 leading-relaxed">
            {noteContent}
          </p>
        </div>
      </div>

      {/* Spark done state */}
      {cardState === 'spark-done' && (
        <div className="text-center py-3">
          <span className="text-sm text-[#9C9460] font-sans font-medium">
            新火花已创建 ✨
          </span>
        </div>
      )}

      {/* Spark input */}
      {cardState === 'spark-input' && (
        <div className="mt-2 transition-all duration-300">
          <SparkInput
            onSubmit={handleSparkSubmit}
            onCancel={() => setCardState('idle')}
            disabled={submitting}
          />
        </div>
      )}

      {/* Action buttons — only show in idle state */}
      {cardState === 'idle' && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCardState('spark-input')}
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
            onClick={triggerDismiss}
            disabled={disabled}
            className="flex items-center justify-center p-2.5 rounded-xl bg-gray-100/50 border border-gray-200/50 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 transition-all active:scale-95 disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
