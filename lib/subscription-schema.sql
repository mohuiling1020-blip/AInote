-- Add subscription fields to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_order_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_updated_at TIMESTAMPTZ;

-- Usage tracking table for daily limits
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('note_create', 'ai_process', 'daily_review')),
  action_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast daily count queries
CREATE INDEX IF NOT EXISTS idx_usage_logs_daily
  ON usage_logs (user_id, action_type, action_date);
