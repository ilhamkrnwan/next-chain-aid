-- ============================================
-- STORAGE POLICIES FOR CHAINAID
-- Purpose: Setup RLS policies for Supabase Storage buckets
-- Date: 2026-01-11
-- ============================================

-- ============================================
-- BUCKET: documents (for KTP & Legal Documents)
-- ============================================

-- Policy 1: Allow authenticated users to upload their own documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN ('ktp', 'legal') AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Policy 2: Allow users to read their own documents
CREATE POLICY "Users can read their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Policy 3: Allow admins to read all documents
CREATE POLICY "Admins can read all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- BUCKET: campaigns (for Campaign Images)
-- ============================================

-- Policy 1: Allow org users to upload campaign images
CREATE POLICY "Organizations can upload campaign images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'campaigns' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('org', 'admin')
  )
);

-- Policy 2: Public read access for campaign images
CREATE POLICY "Anyone can view campaign images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'campaigns');

-- ============================================
-- BUCKET: avatars (for Profile Pictures)
-- ============================================

-- Policy 1: Allow users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Public read access for avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check existing policies for documents bucket
-- SELECT * FROM storage.policies WHERE bucket_id = 'documents';

-- Check existing policies for campaigns bucket
-- SELECT * FROM storage.policies WHERE bucket_id = 'campaigns';

-- Check existing policies for avatars bucket
-- SELECT * FROM storage.policies WHERE bucket_id = 'avatars';

-- ============================================
-- NOTES:
-- ============================================
-- 1. Make sure buckets are created first in Supabase Dashboard:
--    - documents (private)
--    - campaigns (public)
--    - avatars (public)
--
-- 2. If policies already exist, drop them first:
--    DROP POLICY "policy_name" ON storage.objects;
--
-- 3. Folder structure:
--    - documents/ktp/{user_id}/filename.pdf
--    - documents/legal/{user_id}/filename.pdf
--    - campaigns/{user_id}-{timestamp}.jpg
--    - avatars/{user_id}/filename.jpg
-- ============================================
