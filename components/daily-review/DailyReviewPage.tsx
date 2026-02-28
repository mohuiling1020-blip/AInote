'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DbNote, ModelType } from '@/types';
import { DailyReview, dbReviewToReview } from '@/types/daily-review';
import {
  fetchDailyReview,
  generateDailyReview,
  completeReview,
  submitInsightAction,
} from '@/services/dailyReviewService';
import { fetchNotes } from '@/services/apiService';
import { Share2, RefreshCw, Clock } from 'lucide-react';
import { DailyReviewHeader } from './DailyReviewHeader';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { SummaryCard } from './SummaryCard';
import { ThemeClusterGroup } from './ThemeClusterGroup';
import { HistoricalInsightCard } from './HistoricalInsightCard';
import { CompletionOverlay } from './CompletionOverlay';
import { ShareCardModal } from './ShareCardModal';

type PageState = 'loading' | 'empty' | 'ready' | 'error' | 'completed';

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DailyReviewPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [review, setReview] = useState<DailyReview | null>(null);
  const [notesMap, setNotesMap] = useState<Map<string, DbNote>>(new Map());
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showCompletion, setShowCompletion] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [date, setDate] = useState(getTodayDateString());
  const [regenerating, setRegenerating] = useState(false);

  // Load settings from localStorage
  const getModel = (): ModelType => {
    try {
      const saved = localStorage.getItem('mindspark_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.model === 'qwen3-max') return 'qwen3-max';
      }
    } catch { /* use default */ }
    return 'gemini-flash';
  };

  // Load or generate review
  const loadReview = useCallback(async () => {
    setPageState('loading');
    setErrorMessage('');

    try {
      // First, try to fetch existing review
      const existing = await fetchDailyReview(date);

      if (existing) {
        const converted = dbReviewToReview(existing);
        setReview(converted);
        setPageState(converted.isCompleted ? 'completed' : 'ready');
        await loadNotesMap();
        return;
      }

      // No existing review - generate one
      const model = getModel();
      const generated = await generateDailyReview(date, model);
      const converted = dbReviewToReview(generated);
      setReview(converted);
      setPageState('ready');
      await loadNotesMap();
    } catch (err: any) {
      const message = err.message || 'Unknown error';
      // Check if it's a "no notes" situation
      if (message.includes('No completed notes') || message.includes('No review found')) {
        setPageState('empty');
      } else {
        setErrorMessage(message);
        setPageState('error');
      }
    }
  }, [date]);

  // Load all notes into a map for cluster lookups
  const loadNotesMap = async () => {
    try {
      const allNotes = await fetchNotes();
      const map = new Map<string, DbNote>();
      for (const note of allNotes) {
        map.set(note.id, note);
      }
      setNotesMap(map);
    } catch {
      // Non-critical: clusters just won't show note details
    }
  };

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  // Handle complete review
  const handleComplete = async () => {
    if (!review || completing) return;
    setCompleting(true);

    try {
      const updated = await completeReview(review.id);
      const converted = dbReviewToReview(updated);
      setReview(converted);
      setShowCompletion(true);
    } catch (err: any) {
      console.error('Failed to complete review:', err);
    } finally {
      setCompleting(false);
    }
  };

  // Handle insight actions
  const handleSpark = async (content: string) => {
    if (!review || actionLoading) return;
    setActionLoading(true);
    try {
      await submitInsightAction(review.id, review.historicalNoteId!, 'spark', content);
    } catch (err: any) {
      console.error('Spark action failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMerge = async () => {
    if (!review || actionLoading) return;
    setActionLoading(true);
    try {
      await submitInsightAction(review.id, review.historicalNoteId!, 'merge');
    } catch (err: any) {
      console.error('Merge action failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismiss = async () => {
    if (!review || actionLoading) return;
    setActionLoading(true);
    try {
      await submitInsightAction(review.id, review.historicalNoteId!, 'dismiss');
    } catch (err: any) {
      console.error('Dismiss action failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
  };

  const handleRegenerate = async () => {
    if (regenerating) return;
    const confirmed = window.confirm('确定要重新生成今日复盘吗？当前复盘内容将被替换。');
    if (!confirmed) return;

    setRegenerating(true);
    try {
      const model = getModel();
      const generated = await generateDailyReview(date, model, true);
      const converted = dbReviewToReview(generated);
      setReview(converted);
      setPageState('ready');
      await loadNotesMap();
    } catch (err: any) {
      const message = err.message || 'Unknown error';
      setErrorMessage(message);
      setPageState('error');
    } finally {
      setRegenerating(false);
    }
  };

  const historicalNote = review?.historicalNoteId ? notesMap.get(review.historicalNoteId) : null;

  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto h-screen">
      {/* Background - same as main app */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-transparent">
        <div className="absolute top-[-10%] left-[-2%] w-[200px] h-[200px] rounded-full bg-[#EBE2AA] blur-[50px] opacity-60" />
        <div className="absolute bottom-[5%] left-[0%] w-[800px] h-[600px] rounded-full bg-[#C8D5C5] blur-[200px] opacity-60" />
        <div className="absolute top-[5%] left-[1%] w-[800px] h-[800px] rounded-full bg-[#949F97] blur-[200px] opacity-80" />
        <div className="absolute bottom-[1%] right-[1%] w-[1000px] h-[700px] rounded-full bg-[#EEE9D0] blur-[130px] opacity-60" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-lg mx-auto px-6 py-8">
        <DailyReviewHeader date={date} onBack={handleBack} onDateChange={handleDateChange}>
          {(pageState === 'ready' || pageState === 'completed') && review && (
            <>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="p-2 rounded-full bg-white/40 border border-white/50 text-morandi-sage hover:bg-white/60 transition-all active:scale-95 disabled:opacity-50"
                title="重新复盘"
              >
                <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 rounded-full bg-white/40 border border-white/50 text-morandi-sage hover:bg-white/60 transition-all active:scale-95"
                title="分享卡片"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </>
          )}
        </DailyReviewHeader>

        {pageState === 'loading' && <LoadingState />}

        {pageState === 'empty' && <EmptyState onBack={handleBack} />}

        {pageState === 'error' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
            <p className="text-sm text-red-500 font-sans">{errorMessage}</p>
            <button
              onClick={loadReview}
              className="px-6 py-2.5 bg-morandi-sage text-white text-sm font-medium rounded-full hover:bg-[#859188] transition-all active:scale-95"
            >
              重试
            </button>
          </div>
        )}

        {(pageState === 'ready' || pageState === 'completed') && review && (
          <div className="space-y-6 pb-24">
            {/* AI Summary */}
            {review.title && review.summary && (
              <SummaryCard
                title={review.title}
                summary={review.summary}
                tags={review.tags}
                provocativeQuestion={review.provocativeQuestion || ''}
              />
            )}

            {/* Theme Clusters */}
            {review.clusters.length > 0 && (
              <ThemeClusterGroup clusters={review.clusters} notesMap={notesMap} />
            )}

            {/* Historical Insight */}
            {historicalNote && review.historicalHook ? (
              <HistoricalInsightCard
                noteTitle={historicalNote.title}
                noteContent={historicalNote.processed_content || historicalNote.content}
                hook={review.historicalHook}
                onSpark={handleSpark}
                onMerge={handleMerge}
                onDismiss={handleDismiss}
                disabled={actionLoading}
              />
            ) : (
              <div className="rounded-[20px] backdrop-blur-2xl bg-white/40 border border-white/60 shadow-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-morandi-sage" />
                  <h3 className="text-sm font-semibold text-morandi-text font-sans">灵感遗珠</h3>
                </div>
                <p className="text-xs text-morandi-text/60 font-sans leading-relaxed">
                  坚持记录，灵感遗珠将在几天后浮现
                </p>
              </div>
            )}

            {/* Complete button */}
            {pageState === 'ready' && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="px-8 py-3 bg-morandi-sage text-white text-sm font-medium rounded-full hover:bg-[#859188] shadow-lg shadow-morandi-sage/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {completing ? '完成中…' : '完成复盘'}
                </button>
              </div>
            )}

            {/* Already completed indicator */}
            {pageState === 'completed' && (
              <div className="text-center py-4">
                <span className="text-sm text-morandi-sage font-sans">
                  复盘已完成
                  {review.streakCount > 1 && ` · 连续 ${review.streakCount} 天`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Completion overlay */}
      {showCompletion && review && (
        <CompletionOverlay
          streakCount={review.streakCount}
          onClose={() => {
            setShowCompletion(false);
            setPageState('completed');
          }}
        />
      )}

      {/* Share card modal */}
      {showShareModal && review && review.title && review.summary && (
        <ShareCardModal
          title={review.title}
          summary={review.summary}
          tags={review.tags}
          provocativeQuestion={review.provocativeQuestion || ''}
          reviewDate={review.reviewDate}
          noteCount={review.noteCount}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
