-- Storage RLS Policies for 'calisound' bucket
-- NOTE: This SQL cannot be run directly because storage.objects is a system table.
-- Use Supabase Dashboard > Storage > Policies instead, or see STORAGE_SETUP_GUIDE.md

-- Alternative: Use Supabase Dashboard
-- 1. Go to Storage > Policies
-- 2. Select 'calisound' bucket
-- 3. Create policies using the Policy Definition below

-- Policy Definitions (use these in Dashboard):

-- Policy 1: Public Read Access
-- Name: "Public Access for calisound bucket"
-- Operation: SELECT
-- Definition:
bucket_id = 'calisound'

-- Policy 2: Anonymous Upload
-- Name: "Anonymous can upload to calisound"
-- Operation: INSERT
-- Definition:
bucket_id = 'calisound'

-- Policy 3: Anonymous Update
-- Name: "Anonymous can update calisound files"
-- Operation: UPDATE
-- Definition:
bucket_id = 'calisound'

-- Policy 4: Anonymous Delete
-- Name: "Anonymous can delete calisound files"
-- Operation: DELETE
-- Definition:
bucket_id = 'calisound'

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
