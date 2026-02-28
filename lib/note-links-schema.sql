CREATE TABLE IF NOT EXISTS note_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
  source_note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  target_note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL DEFAULT 'spark',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_note_id, target_note_id)
);
