import { SupabaseClient } from '@supabase/supabase-js';
import { ActionType, SubscriptionTier, getLimitForAction } from './subscription-config';

export interface UsageCount {
  noteCreate: number;
  aiProcess: number;
  dailyReview: number;
}

export async function getTodayUsage(
  supabase: SupabaseClient,
  clerkUserId: string,
): Promise<UsageCount> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('usage_logs')
    .select('action_type')
    .eq('user_id', clerkUserId)
    .eq('action_date', today);

  if (error) {
    console.error('Failed to fetch usage:', error);
    return { noteCreate: 0, aiProcess: 0, dailyReview: 0 };
  }

  const counts: UsageCount = { noteCreate: 0, aiProcess: 0, dailyReview: 0 };
  for (const row of data ?? []) {
    if (row.action_type === 'note_create') counts.noteCreate++;
    else if (row.action_type === 'ai_process') counts.aiProcess++;
    else if (row.action_type === 'daily_review') counts.dailyReview++;
  }

  return counts;
}

export async function incrementUsage(
  supabase: SupabaseClient,
  clerkUserId: string,
  actionType: ActionType,
): Promise<void> {
  const { error } = await supabase
    .from('usage_logs')
    .insert({ user_id: clerkUserId, action_type: actionType });

  if (error) {
    console.error('Failed to increment usage:', error);
  }
}

export interface UsageLimitResult {
  allowed: boolean;
  current: number;
  limit: number;
}

export async function checkUsageLimit(
  supabase: SupabaseClient,
  clerkUserId: string,
  actionType: ActionType,
): Promise<UsageLimitResult> {
  // Get user's subscription tier
  const { data: user } = await supabase
    .from('users')
    .select('subscription_status')
    .eq('clerk_id', clerkUserId)
    .single();

  const tier: SubscriptionTier = (user?.subscription_status as SubscriptionTier) ?? 'free';
  const limit = getLimitForAction(tier, actionType);

  if (limit === Infinity) {
    return { allowed: true, current: 0, limit };
  }

  const usage = await getTodayUsage(supabase, clerkUserId);
  const actionKey = actionType === 'note_create' ? 'noteCreate'
    : actionType === 'ai_process' ? 'aiProcess'
    : 'dailyReview';
  const current = usage[actionKey];

  return { allowed: current < limit, current, limit };
}
