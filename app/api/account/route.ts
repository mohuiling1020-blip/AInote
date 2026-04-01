import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { ensureUser } from '@/lib/ensure-user';
import { getTodayUsage } from '@/lib/usage';
import { SubscriptionTier, getTierLimits } from '@/lib/subscription-config';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureUser(userId);
  } catch (e) {
    console.error('ensureUser failed in GET /api/account:', e);
    return NextResponse.json({ error: 'Failed to initialize user' }, { status: 500 });
  }

  const supabase = createServerClient();

  const { data: user, error } = await supabase
    .from('users')
    .select('subscription_status, email, name, created_at')
    .eq('clerk_id', userId)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const tier: SubscriptionTier = (user.subscription_status as SubscriptionTier) ?? 'free';
  const usage = await getTodayUsage(supabase, userId);
  const limits = getTierLimits(tier);

  return NextResponse.json({
    tier,
    usage,
    limits: {
      noteCreate: limits.noteCreate === Infinity ? -1 : limits.noteCreate,
      aiProcess: limits.aiProcess === Infinity ? -1 : limits.aiProcess,
      dailyReview: limits.dailyReview === Infinity ? -1 : limits.dailyReview,
    },
    email: user.email,
    name: user.name,
    createdAt: user.created_at,
  });
}
