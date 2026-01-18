-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'city' or 'set'
  entity_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to read approved comments
CREATE POLICY "Public can read approved comments" ON comments
FOR SELECT
USING (status = 'approved');

-- Policy: Allow public to insert comments
CREATE POLICY "Public can insert comments" ON comments
FOR INSERT
WITH CHECK (true);

-- Policy: Allow authenticated users to update comments (for moderation)
CREATE POLICY "Authenticated can update comments" ON comments
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to delete comments
CREATE POLICY "Authenticated can delete comments" ON comments
FOR DELETE
USING (auth.role() = 'authenticated');
