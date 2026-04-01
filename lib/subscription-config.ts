export type SubscriptionTier = 'free' | 'active' | 'canceling' | 'canceled' | 'past_due';

export type ActionType = 'note_create' | 'ai_process' | 'daily_review';

export interface UsageLimits {
  noteCreate: number;
  aiProcess: number;
  dailyReview: number;
}

export const FREE_TIER_LIMITS: UsageLimits = {
  noteCreate: 10,
  aiProcess: 10,
  dailyReview: 3,
};

export const PRO_TIER_LIMITS: UsageLimits = {
  noteCreate: Infinity,
  aiProcess: Infinity,
  dailyReview: Infinity,
};

export function isActiveTier(tier: SubscriptionTier): boolean {
  return tier === 'active' || tier === 'canceling';
}

export function getTierLimits(tier: SubscriptionTier): UsageLimits {
  return isActiveTier(tier) ? PRO_TIER_LIMITS : FREE_TIER_LIMITS;
}

const ACTION_TO_LIMIT_KEY: Record<ActionType, keyof UsageLimits> = {
  note_create: 'noteCreate',
  ai_process: 'aiProcess',
  daily_review: 'dailyReview',
};

export function getLimitForAction(tier: SubscriptionTier, action: ActionType): number {
  const limits = getTierLimits(tier);
  return limits[ACTION_TO_LIMIT_KEY[action]];
}
