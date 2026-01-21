-- Storage RLS Policies for 'calisound' bucket
-- Run this in Supabase SQL Editor

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to all files in calisound bucket
CREATE POLICY IF NOT EXISTS "Public Access for calisound bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'calisound');

-- Policy: Allow authenticated users to upload files to calisound bucket
CREATE POLICY IF NOT EXISTS "Authenticated users can upload to calisound"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'calisound' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to update files in calisound bucket
CREATE POLICY IF NOT EXISTS "Authenticated users can update calisound files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'calisound' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to delete files in calisound bucket
CREATE POLICY IF NOT EXISTS "Authenticated users can delete calisound files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'calisound' 
  AND auth.role() = 'authenticated'
);

-- Alternative: If you want to allow anonymous uploads (less secure but simpler)
-- Uncomment the following policies and comment out the authenticated ones above:

/*
-- Policy: Allow anonymous uploads to calisound bucket
CREATE POLICY IF NOT EXISTS "Anonymous can upload to calisound"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'calisound');

-- Policy: Allow anonymous updates to calisound bucket
CREATE POLICY IF NOT EXISTS "Anonymous can update calisound files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'calisound');

-- Policy: Allow anonymous deletes to calisound bucket
CREATE POLICY IF NOT EXISTS "Anonymous can delete calisound files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'calisound');
*/
