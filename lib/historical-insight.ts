import { SupabaseClient } from '@supabase/supabase-js';
import { DbNote } from '@/types';
import { generateHistoricalHook } from '@/lib/daily-review-ai';

interface HistoricalMatch {
  note: DbNote;
  hook: string;
}

// Find a historical note related to today's tags
export async function findHistoricalInsight(
  supabase: SupabaseClient,
  userId: string,
  todayTags: string[],
  todayDate: string,
  model: string,
): Promise<HistoricalMatch | null> {
  // Get IDs of dismissed notes for this user
  const dismissedNoteIds = await getDismissedNoteIds(supabase, userId);

  // Get IDs of notes already pushed in the last 14 days
  const recentlyPushedNoteIds = await getRecentlyPushedNoteIds(supabase, userId, todayDate);

  // Calculate the date threshold (exclude today's notes)
  const oneDayAgo = new Date(todayDate);
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const cutoffDate = oneDayAgo.toISOString();

  // Try tag-based matching first
  const tagMatch = await findByTags(
    supabase, userId, todayTags, cutoffDate, dismissedNoteIds, recentlyPushedNoteIds,
  );

  if (tagMatch) {
    const hook = await generateHistoricalHook(tagMatch, todayTags, model);
    return { note: tagMatch, hook };
  }

  // Fallback: random note from 3+ days ago
  const fallbackNote = await findFallbackNote(
    supabase, userId, todayDate, dismissedNoteIds, recentlyPushedNoteIds,
  );

  if (fallbackNote) {
    const hook = await generateHistoricalHook(fallbackNote, todayTags, model);
    return { note: fallbackNote, hook };
  }

  return null;
}

async function getDismissedNoteIds(
  supabase: SupabaseClient,
  userId: string,
): Promise<Set<string>> {
  const { data } = await supabase
    .from('insight_interactions')
    .select('note_id')
    .eq('user_id', userId)
    .eq('action', 'dismiss');

  const ids = new Set<string>();
  if (data) {
    for (const row of data) {
      if (row.note_id) ids.add(row.note_id);
    }
  }
  return ids;
}

async function getRecentlyPushedNoteIds(
  supabase: SupabaseClient,
  userId: string,
  todayDate: string,
): Promise<Set<string>> {
  const fourteenDaysAgo = new Date(todayDate);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const { data } = await supabase
    .from('daily_reviews')
    .select('historical_note_id')
    .eq('user_id', userId)
    .gte('review_date', fourteenDaysAgo.toISOString().split('T')[0])
    .not('historical_note_id', 'is', null);

  const ids = new Set<string>();
  if (data) {
    for (const row of data) {
      if (row.historical_note_id) ids.add(row.historical_note_id);
    }
  }
  return ids;
}

async function findByTags(
  supabase: SupabaseClient,
  userId: string,
  todayTags: string[],
  cutoffDate: string,
  dismissedIds: Set<string>,
  recentlyPushedIds: Set<string>,
): Promise<DbNote | null> {
  if (todayTags.length === 0) return null;

  // Query notes that have overlapping tags, older than cutoff
  const { data } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .lt('created_at', cutoffDate)
    .overlaps('tags', todayTags)
    .order('created_at', { ascending: false })
    .limit(20);

  if (!data || data.length === 0) return null;

  // Filter out dismissed and recently pushed notes
  const candidates = data.filter(
    (n: DbNote) => !dismissedIds.has(n.id) && !recentlyPushedIds.has(n.id),
  );

  if (candidates.length === 0) return null;

  // Return the one with the most tag overlap
  const scored = candidates.map((note: DbNote) => {
    const noteTags = note.tags ?? [];
    const overlap = todayTags.filter(t => noteTags.includes(t)).length;
    return { note, overlap };
  });
  scored.sort((a, b) => b.overlap - a.overlap);

  return scored[0].note;
}

async function findFallbackNote(
  supabase: SupabaseClient,
  userId: string,
  todayDate: string,
  dismissedIds: Set<string>,
  recentlyPushedIds: Set<string>,
): Promise<DbNote | null> {
  const threeDaysAgo = new Date(todayDate);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const { data } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .lt('created_at', threeDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(50);

  if (!data || data.length === 0) return null;

  const candidates = data.filter(
    (n: DbNote) => !dismissedIds.has(n.id) && !recentlyPushedIds.has(n.id),
  );

  if (candidates.length === 0) return null;

  // Pick a random one
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}
