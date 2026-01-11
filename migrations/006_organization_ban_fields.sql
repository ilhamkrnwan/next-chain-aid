-- ============================================
-- Migration: Add ban fields to organizations
-- Purpose: Support organization banning functionality
-- Date: 2026-01-11
-- ============================================

-- Add ban-related columns to organizations table
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS banned_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS banned_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS ban_reason text;

-- Add comments for documentation
COMMENT ON COLUMN public.organizations.is_banned IS 'Whether organization is banned from the platform';
COMMENT ON COLUMN public.organizations.banned_at IS 'Timestamp when organization was banned';
COMMENT ON COLUMN public.organizations.banned_by IS 'Admin ID who banned the organization';
COMMENT ON COLUMN public.organizations.ban_reason IS 'Reason for banning the organization';

-- Create index for banned organizations
CREATE INDEX IF NOT EXISTS idx_organizations_is_banned ON public.organizations(is_banned) WHERE is_banned = true;

-- Update RLS policy to prevent banned orgs from creating campaigns
DROP POLICY IF EXISTS "Banned orgs cannot create campaigns" ON campaigns;
CREATE POLICY "Banned orgs cannot create campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM organizations
      WHERE id = auth.uid() AND is_banned = true
    )
  );

-- ============================================
-- VERIFICATION QUERY
-- Run this to verify the columns were added:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'organizations' 
-- AND column_name IN ('is_banned', 'banned_at', 'banned_by', 'ban_reason')
-- ORDER BY ordinal_position;
-- ============================================
