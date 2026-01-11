-- ============================================
-- Migration: Add freeze fields to campaigns
-- Purpose: Support campaign freezing functionality
-- Date: 2026-01-11
-- ============================================

-- Add freeze-related columns to campaigns table
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS is_frozen boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS frozen_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS frozen_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS freeze_reason text;

-- Add comments for documentation
COMMENT ON COLUMN public.campaigns.is_frozen IS 'Whether campaign is frozen by admin';
COMMENT ON COLUMN public.campaigns.frozen_at IS 'Timestamp when campaign was frozen';
COMMENT ON COLUMN public.campaigns.frozen_by IS 'Admin ID who froze the campaign';
COMMENT ON COLUMN public.campaigns.freeze_reason IS 'Reason for freezing the campaign';

-- Create index for frozen campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_is_frozen ON public.campaigns(is_frozen) WHERE is_frozen = true;

-- Update campaign status to include frozen
-- Note: The campaign_status enum already exists, we just need to ensure 'frozen' is included
DO $$ 
BEGIN
  -- Check if 'frozen' status exists in enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'frozen' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'campaign_status')
  ) THEN
    -- Add 'frozen' to campaign_status enum
    ALTER TYPE campaign_status ADD VALUE 'frozen';
  END IF;
END $$;

-- ============================================
-- VERIFICATION QUERY
-- Run this to verify the columns were added:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'campaigns' 
-- AND column_name IN ('is_frozen', 'frozen_at', 'frozen_by', 'freeze_reason')
-- ORDER BY ordinal_position;
-- ============================================
