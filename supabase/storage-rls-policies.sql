-- Storage RLS Policies for 'calisound' bucket
-- ============================================
-- 
-- IMPORTANT: This SQL file is for REFERENCE ONLY.
-- You CANNOT run this SQL directly because storage.objects is a system table.
--
-- SOLUTION: Use Supabase Dashboard instead
-- ==========================================
--
-- OPTION 1: Make Bucket Public (EASIEST - RECOMMENDED)
-- -----------------------------------------------------
-- 1. Go to Supabase Dashboard > Storage > Buckets
-- 2. Click on 'calisound' bucket
-- 3. Go to Settings tab
-- 4. Enable "Public bucket" checkbox
-- 5. Click Save
--
-- OPTION 2: Create Policies via Dashboard
-- -----------------------------------------
-- 1. Go to Supabase Dashboard > Storage > Policies
-- 2. Select 'calisound' bucket from dropdown
-- 3. Click "New Policy" button
-- 4. For each policy, use the settings below:
--
-- Policy 1: Public Read Access
--   - Policy Name: "Public Access for calisound bucket"
--   - Allowed Operation: SELECT
--   - Policy Definition: bucket_id = 'calisound'
--
-- Policy 2: Anonymous Upload
--   - Policy Name: "Anonymous can upload to calisound"
--   - Allowed Operation: INSERT
--   - Policy Definition: bucket_id = 'calisound'
--
-- Policy 3: Anonymous Update
--   - Policy Name: "Anonymous can update calisound files"
--   - Allowed Operation: UPDATE
--   - Policy Definition: bucket_id = 'calisound'
--
-- Policy 4: Anonymous Delete
--   - Policy Name: "Anonymous can delete calisound files"
--   - Allowed Operation: DELETE
--   - Policy Definition: bucket_id = 'calisound'
--
-- See STORAGE_SETUP_GUIDE.md for detailed instructions.

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
