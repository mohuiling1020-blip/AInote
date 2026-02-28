import { ModelType } from '@/types';
import { DbDailyReview, InsightAction } from '@/types/daily-review';

async function handleResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    let errorMessage = fallbackMessage;
    try {
      const errorText = await response.text();
      if (errorText) {
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      }
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

// Fetch existing daily review for a specific date
export async function fetchDailyReview(date: string): Promise<DbDailyReview | null> {
  const response = await fetch(`/api/daily-review?date=${encodeURIComponent(date)}`);
  if (response.status === 404) {
    return null;
  }
  return handleResponse<DbDailyReview>(response, 'Failed to fetch daily review');
}

// Generate a new daily review for a specific date
export async function generateDailyReview(
  date: string,
  model: ModelType,
  force?: boolean,
): Promise<DbDailyReview> {
  const response = await fetch('/api/daily-review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, model, force }),
  });
  return handleResponse<DbDailyReview>(response, 'Failed to generate daily review');
}

// Mark a review as completed
export async function completeReview(reviewId: string): Promise<DbDailyReview> {
  const response = await fetch(`/api/daily-review/${reviewId}/complete`, {
    method: 'POST',
  });
  return handleResponse<DbDailyReview>(response, 'Failed to complete review');
}

// Submit an insight interaction (spark/merge/dismiss)
export async function submitInsightAction(
  reviewId: string,
  noteId: string,
  action: InsightAction,
  sparkContent?: string,
): Promise<{ interaction: unknown; sparkNote?: unknown }> {
  const response = await fetch(`/api/daily-review/${reviewId}/insight-action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteId, action, sparkContent }),
  });
  return handleResponse(response, 'Failed to submit insight action');
}
