import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';

// POST /api/daily-review/[id]/complete - Mark review as completed
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: reviewId } = await params;
  const supabase = createServerClient();

  // Verify review belongs to user
  const { data: review, error: fetchError } = await supabase
    .from('daily_reviews')
    .select('*')
    .eq('id', reviewId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }

  if (review.is_completed) {
    return NextResponse.json(review);
  }

  // Calculate streak: count consecutive completed reviews ending at this review's date
  const streakCount = await calculateStreak(supabase, userId, review.review_date);

  const { data: updated, error: updateError } = await supabase
    .from('daily_reviews')
    .update({
      is_completed: true,
      streak_count: streakCount,
    })
    .eq('id', reviewId)
    .select()
    .single();

  if (updateError) {
    console.error('Failed to complete review:', updateError);
    return NextResponse.json({ error: 'Failed to complete review' }, { status: 500 });
  }

  return NextResponse.json(updated);
}

async function calculateStreak(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
  reviewDate: string,
): Promise<number> {
  // Get all completed reviews for this user, ordered by date descending
  const { data: reviews } = await supabase
    .from('daily_reviews')
    .select('review_date')
    .eq('user_id', userId)
    .eq('is_completed', true)
    .order('review_date', { ascending: false })
    .limit(100);

  if (!reviews || reviews.length === 0) {
    return 1; // This will be the first completed review
  }

  // Build a set of completed dates
  const completedDates = new Set(reviews.map(r => r.review_date));

  // Count backwards from the current review date
  let streak = 1; // Include today
  const current = new Date(reviewDate);

  while (true) {
    current.setDate(current.getDate() - 1);
    const dateStr = current.toISOString().split('T')[0];
    if (completedDates.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
