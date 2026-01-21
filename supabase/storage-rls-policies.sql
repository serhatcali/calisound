-- Storage RLS Policies for 'calisound' bucket
-- Run this in Supabase SQL Editor

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public Access for calisound bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to calisound" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update calisound files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete calisound files" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous can upload to calisound" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous can update calisound files" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous can delete calisound files" ON storage.objects;

-- Policy: Allow public read access to all files in calisound bucket
CREATE POLICY "Public Access for calisound bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'calisound');

-- Policy: Allow anonymous uploads to calisound bucket (simpler for admin panel)
CREATE POLICY "Anonymous can upload to calisound"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'calisound');

-- Policy: Allow anonymous updates to calisound bucket
CREATE POLICY "Anonymous can update calisound files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'calisound');

-- Policy: Allow anonymous deletes to calisound bucket
CREATE POLICY "Anonymous can delete calisound files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'calisound');

-- Note: The policies above allow anonymous access for simplicity.
-- If you want authenticated-only access, replace the INSERT/UPDATE/DELETE policies with:

/*
-- Policy: Allow authenticated users to upload files to calisound bucket
CREATE POLICY "Authenticated users can upload to calisound"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'calisound' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to update files in calisound bucket
CREATE POLICY "Authenticated users can update calisound files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'calisound' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to delete files in calisound bucket
CREATE POLICY "Authenticated users can delete calisound files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'calisound' 
  AND auth.role() = 'authenticated'
);
*/
