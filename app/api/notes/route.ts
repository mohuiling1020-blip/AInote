import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { ensureUser } from '@/lib/ensure-user';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureUser(userId);
  } catch (e) {
    console.error('ensureUser failed in GET /api/notes:', e);
    return NextResponse.json({ error: 'Failed to initialize user' }, { status: 500 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }

  return NextResponse.json(data);
}

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
  const { content, type, status, title, processed_content, tags, suggested_action, deadline, position_x, position_y, z_index, is_expanded, checked_items } = body;

  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  try {
    await ensureUser(userId);
  } catch (e) {
    console.error('ensureUser failed in POST /api/notes:', e);
    return NextResponse.json({ error: 'Failed to initialize user' }, { status: 500 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: userId,
      content,
      type: type ?? 'Unclassified',
      status: status ?? 'pending',
      title: title ?? null,
      processed_content: processed_content ?? null,
      tags: tags ?? [],
      suggested_action: suggested_action ?? null,
      deadline: deadline ?? null,
      position_x: position_x ?? 0,
      position_y: position_y ?? 0,
      z_index: z_index ?? 1,
      is_expanded: is_expanded ?? true,
      checked_items: checked_items ?? [],
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
