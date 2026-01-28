-- OAuth States Table
-- Temporary storage for OAuth state verification
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS social_oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_social_oauth_states_state ON social_oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_social_oauth_states_expires_at ON social_oauth_states(expires_at);

-- RLS Policy
ALTER TABLE social_oauth_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin only access" ON social_oauth_states FOR ALL USING (true);

-- Cleanup expired states (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM social_oauth_states WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
