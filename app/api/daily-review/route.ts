import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { ensureUser } from '@/lib/ensure-user';
import { checkUsageLimit, incrementUsage } from '@/lib/usage';
import { generateReviewSummary } from '@/lib/daily-review-ai';
import { findHistoricalInsight } from '@/lib/historical-insight';

// GET /api/daily-review?date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get('date');
  if (!date) {
    return NextResponse.json({ error: 'date parameter is required' }, { status: 400 });
  }

  try {
    await ensureUser(userId);
  } catch (e) {
    console.error('ensureUser failed in GET /api/daily-review:', e);
    return NextResponse.json({ error: 'Failed to initialize user' }, { status: 500 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('daily_reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('review_date', date)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch daily review:', error);
    return NextResponse.json({ error: 'Failed to fetch daily review' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'No review found for this date' }, { status: 404 });
  }

  return NextResponse.json(data);
}

// POST /api/daily-review - Generate a new daily review
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { date, model, force } = body;
  if (!date) {
    return NextResponse.json({ error: 'date is required' }, { status: 400 });
  }
  if (!model || (model !== 'gemini-flash' && model !== 'qwen3-max')) {
    return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
  }

  try {
    await ensureUser(userId);
  } catch (e) {
    console.error('ensureUser failed in POST /api/daily-review:', e);
    return NextResponse.json({ error: 'Failed to initialize user' }, { status: 500 });
  }

  const supabase = createServerClient();

  // Check if review already exists for this date
  const { data: existing } = await supabase
    .from('daily_reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('review_date', date)
    .maybeSingle();

  if (existing && force) {
    // Force regeneration: delete existing review first
    const { error: deleteError } = await supabase
      .from('daily_reviews')
      .delete()
      .eq('id', existing.id);

    if (deleteError) {
      console.error('Failed to delete existing review for force regeneration:', deleteError);
      return NextResponse.json({ error: 'Failed to regenerate review' }, { status: 500 });
    }
  } else if (existing) {
    return NextResponse.json(existing);
  }

  // Check usage limit for fresh generation only
  const usageCheck = await checkUsageLimit(supabase, userId, 'daily_review');
  if (!usageCheck.allowed) {
    return NextResponse.json(
      { error: '今日复盘次数已达上限', code: 'USAGE_LIMIT', current: usageCheck.current, limit: usageCheck.limit },
      { status: 429 },
    );
  }

  // Fetch today's notes
  const dayStart = `${date}T00:00:00.000Z`;
  const dayEnd = `${date}T23:59:59.999Z`;

  const { data: todayNotes, error: notesError } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', dayStart)
    .lte('created_at', dayEnd)
    .eq('status', 'completed')
    .order('created_at', { ascending: true });

  if (notesError) {
    console.error('Failed to fetch today notes:', notesError);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }

  if (!todayNotes || todayNotes.length === 0) {
    return NextResponse.json({ error: 'No completed notes found for this date' }, { status: 404 });
  }

  // Create a placeholder review record
  const { data: reviewRow, error: insertError } = await supabase
    .from('daily_reviews')
    .insert({
      user_id: userId,
      review_date: date,
      status: 'generating',
      note_count: todayNotes.length,
      model,
    })
    .select()
    .single();

  if (insertError) {
    // Handle unique constraint violation (concurrent request)
    if (insertError.code === '23505') {
      const { data: existingReview } = await supabase
        .from('daily_reviews')
        .select('*')
        .eq('user_id', userId)
        .eq('review_date', date)
        .single();
      if (existingReview) return NextResponse.json(existingReview);
    }
    console.error('Failed to create review:', insertError);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }

  try {
    // Generate AI summary + clusters
    const summary = await generateReviewSummary(todayNotes, model);

    // Find historical insight
    const historical = await findHistoricalInsight(
      supabase, userId, summary.tags, date, model,
    );

    // Update the review with AI results
    const { data: updatedReview, error: updateError } = await supabase
      .from('daily_reviews')
      .update({
        title: summary.title,
        summary: summary.summary,
        tags: summary.tags,
        provocative_question: summary.provocativeQuestion,
        clusters: summary.clusters,
        historical_note_id: historical?.note.id ?? null,
        historical_hook: historical?.hook ?? null,
        status: 'completed',
      })
      .eq('id', reviewRow.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update review:', updateError);
      return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
    }

    // Increment usage after successful generation
    await incrementUsage(supabase, userId, 'daily_review');

    return NextResponse.json(updatedReview, { status: 201 });
  } catch (aiError: any) {
    console.error('AI generation failed:', aiError);
    // Mark review as error
    await supabase
      .from('daily_reviews')
      .update({ status: 'error' })
      .eq('id', reviewRow.id);

    return NextResponse.json(
      { error: `AI generation failed: ${aiError.message}` },
      { status: 500 },
    );
  }
}
