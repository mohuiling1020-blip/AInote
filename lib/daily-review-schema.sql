-- Daily Review feature tables
-- Run this in Supabase SQL Editor after the base schema

-- Daily reviews table
CREATE TABLE IF NOT EXISTS daily_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
  review_date DATE NOT NULL,
  title TEXT,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  provocative_question TEXT,
  clusters JSONB DEFAULT '[]',
  historical_note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
  historical_hook TEXT,
  note_count INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'generating',
  is_completed BOOLEAN DEFAULT false,
  streak_count INT DEFAULT 0,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, review_date)
);

-- Insight interactions table (Spark/Merge/Dismiss actions)
CREATE TABLE IF NOT EXISTS insight_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
  review_id UUID NOT NULL REFERENCES daily_reviews(id) ON DELETE CASCADE,
  note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('spark', 'merge', 'dismiss')),
  spark_content TEXT,
  spark_note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_reviews_user_id ON daily_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_reviews_user_date ON daily_reviews(user_id, review_date);
CREATE INDEX IF NOT EXISTS idx_insight_interactions_review_id ON insight_interactions(review_id);
CREATE INDEX IF NOT EXISTS idx_insight_interactions_user_id ON insight_interactions(user_id);

-- Row Level Security
ALTER TABLE daily_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: deny all access via anon key (service role bypasses RLS)
CREATE POLICY "Deny anon access to daily_reviews" ON daily_reviews
  FOR ALL USING (false);

CREATE POLICY "Deny anon access to insight_interactions" ON insight_interactions
  FOR ALL USING (false);

-- Updated_at triggers (reuse existing function from base schema)
CREATE TRIGGER daily_reviews_updated_at
  BEFORE UPDATE ON daily_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER insight_interactions_updated_at
  BEFORE UPDATE ON insight_interactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
