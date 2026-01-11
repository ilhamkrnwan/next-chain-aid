-- ============================================
-- Migration: Add image_url to organizations
-- Purpose: Support organization logo/avatar
-- Date: 2026-01-11
-- ============================================

-- Add image_url column to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS image_url text;

-- Add comment for documentation
COMMENT ON COLUMN public.organizations.image_url IS 'Organization logo/avatar URL from storage';

-- ============================================
-- VERIFICATION QUERY
-- Run this to verify the column was added:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'organizations' AND column_name = 'image_url';
-- ============================================
