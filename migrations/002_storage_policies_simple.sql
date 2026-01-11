-- ============================================
-- SIMPLE STORAGE POLICIES (For Development)
-- Purpose: Allow authenticated users to upload files
-- Date: 2026-01-11
-- ============================================

-- ============================================
-- BUCKET: documents
-- ============================================

-- Allow authenticated users to INSERT (upload)
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Allow authenticated users to SELECT (read)
CREATE POLICY "Authenticated users can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Allow authenticated users to UPDATE
CREATE POLICY "Authenticated users can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents');

-- Allow authenticated users to DELETE
CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');

-- ============================================
-- BUCKET: campaigns
-- ============================================

-- Allow authenticated users to upload campaigns
CREATE POLICY "Authenticated users can upload campaigns"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'campaigns');

-- Allow everyone to read campaigns (public)
CREATE POLICY "Anyone can read campaigns"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'campaigns');

-- ============================================
-- BUCKET: avatars
-- ============================================

-- Allow authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow everyone to read avatars (public)
CREATE POLICY "Anyone can read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to check policies:
-- SELECT * FROM storage.policies WHERE bucket_id IN ('documents', 'campaigns', 'avatars');
