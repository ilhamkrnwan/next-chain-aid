-- ============================================
-- ALTER TABLE: organizations
-- Purpose: Add image profile for organizations
-- Date: 2026-01-10
-- ============================================

-- Add image_url column to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS image_url text;

-- Add comment to the column for documentation
COMMENT ON COLUMN public.organizations.image_url IS 'URL to organization profile image stored in Supabase Storage (bucket: avatars or organizations)';

-- Optional: Add index for better query performance if needed
-- CREATE INDEX IF NOT EXISTS idx_organizations_image_url ON public.organizations(image_url);

-- ============================================
-- VERIFICATION QUERY
-- Run this to verify the column was added:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'organizations' 
-- AND column_name = 'image_url';
-- ============================================
