import { ModelType } from '@/types';

// Review generation status
export type ReviewStatus = 'generating' | 'completed' | 'error';

// Insight interaction actions
export type InsightAction = 'spark' | 'merge' | 'dismiss';

// A single theme cluster within a review
export interface ThemeCluster {
  theme: string;
  summary: string;
  noteIds: string[];
}

// Frontend-facing daily review type (camelCase)
export interface DailyReview {
  id: string;
  userId: string;
  reviewDate: string; // YYYY-MM-DD
  title: string | null;
  summary: string | null;
  tags: string[];
  provocativeQuestion: string | null;
  clusters: ThemeCluster[];
  historicalNoteId: string | null;
  historicalHook: string | null;
  noteCount: number;
  status: ReviewStatus;
  isCompleted: boolean;
  streakCount: number;
  model: string | null;
  createdAt: number;
  updatedAt: number;
}

// Database row type (snake_case, matches Supabase schema)
export interface DbDailyReview {
  id: string;
  user_id: string;
  review_date: string;
  title: string | null;
  summary: string | null;
  tags: string[];
  provocative_question: string | null;
  clusters: ThemeCluster[];
  historical_note_id: string | null;
  historical_hook: string | null;
  note_count: number;
  status: string;
  is_completed: boolean;
  streak_count: number;
  model: string | null;
  created_at: string;
  updated_at: string;
}

// AI-generated review summary response
export interface DailyReviewSummary {
  title: string;
  summary: string;
  tags: string[];
  provocativeQuestion: string;
  clusters: ThemeCluster[];
}

// Historical insight data for display
export interface HistoricalInsight {
  noteId: string;
  noteTitle: string | null;
  noteContent: string;
  hook: string;
}

// Insight interaction record
export interface InsightInteraction {
  id: string;
  userId: string;
  reviewId: string;
  noteId: string | null;
  action: InsightAction;
  sparkContent: string | null;
  sparkNoteId: string | null;
  createdAt: number;
}

// Convert database row to frontend DailyReview
export function dbReviewToReview(db: DbDailyReview): DailyReview {
  return {
    id: db.id,
    userId: db.user_id,
    reviewDate: db.review_date,
    title: db.title,
    summary: db.summary,
    tags: db.tags ?? [],
    provocativeQuestion: db.provocative_question,
    clusters: db.clusters ?? [],
    historicalNoteId: db.historical_note_id,
    historicalHook: db.historical_hook,
    noteCount: db.note_count,
    status: db.status as ReviewStatus,
    isCompleted: db.is_completed,
    streakCount: db.streak_count,
    model: db.model,
    createdAt: new Date(db.created_at).getTime(),
    updatedAt: new Date(db.updated_at).getTime(),
  };
}
