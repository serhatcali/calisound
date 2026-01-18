-- Create contacts table for contact form submissions
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated admins can read contacts
CREATE POLICY "Admins can read contacts"
  ON contacts
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Anyone can insert contacts (for contact form)
CREATE POLICY "Anyone can insert contacts"
  ON contacts
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only authenticated admins can delete contacts
CREATE POLICY "Admins can delete contacts"
  ON contacts
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS contacts_created_at_idx ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS contacts_email_idx ON contacts(email);
