import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';

// POST /api/daily-review/[id]/insight-action - Spark/Merge/Dismiss
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: reviewId } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { noteId, action, sparkContent } = body;

  if (!noteId || !action) {
    return NextResponse.json({ error: 'noteId and action are required' }, { status: 400 });
  }

  if (!['spark', 'merge', 'dismiss'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action. Must be spark, merge, or dismiss' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Verify review belongs to user
  const { data: review, error: fetchError } = await supabase
    .from('daily_reviews')
    .select('id')
    .eq('id', reviewId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }

  let sparkNoteId: string | null = null;

  // If spark action, create a new note from the spark content
  if (action === 'spark' && sparkContent) {
    const { data: sparkNote, error: noteError } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        content: sparkContent,
        type: 'Idea',
        status: 'pending',
        position_x: Math.random() * 600 + 100,
        position_y: Math.random() * 400 + 100,
        z_index: 1,
      })
      .select()
      .single();

    if (noteError) {
      console.error('Failed to create spark note:', noteError);
      return NextResponse.json({ error: 'Failed to create spark note' }, { status: 500 });
    }

    sparkNoteId = sparkNote.id;
  }

  // Record the interaction
  const { data: interaction, error: interactionError } = await supabase
    .from('insight_interactions')
    .insert({
      user_id: userId,
      review_id: reviewId,
      note_id: noteId,
      action,
      spark_content: sparkContent ?? null,
      spark_note_id: sparkNoteId,
    })
    .select()
    .single();

  if (interactionError) {
    console.error('Failed to record interaction:', interactionError);
    return NextResponse.json({ error: 'Failed to record interaction' }, { status: 500 });
  }

  return NextResponse.json({ interaction, sparkNoteId }, { status: 201 });
}
