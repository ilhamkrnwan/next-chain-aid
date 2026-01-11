-- ============================================
-- Migration: Add campaign_update_images table
-- Purpose: Support multiple images for campaign updates
-- Date: 2026-01-11
-- ============================================

-- Create campaign_updates table if not exists
CREATE TABLE IF NOT EXISTS public.campaign_updates (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_by uuid REFERENCES public.profiles(id) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on campaign_updates
ALTER TABLE public.campaign_updates ENABLE ROW LEVEL SECURITY;

-- Policies for campaign_updates
CREATE POLICY IF NOT EXISTS "Campaign updates are viewable by everyone"
  ON campaign_updates FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Org can create updates for their campaigns"
  ON campaign_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE id = campaign_id AND creator_id = auth.uid()
    )
  );

-- Create campaign_update_images table
CREATE TABLE IF NOT EXISTS public.campaign_update_images (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_update_id uuid REFERENCES public.campaign_updates(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  display_order int DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.campaign_update_images ENABLE ROW LEVEL SECURITY;

-- Policies for campaign_update_images
CREATE POLICY IF NOT EXISTS "Campaign update images are viewable by everyone"
  ON campaign_update_images FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Org can insert images for their campaign updates"
  ON campaign_update_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaign_updates cu
      JOIN campaigns c ON cu.campaign_id = c.id
      WHERE cu.id = campaign_update_id AND c.creator_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Org can delete images for their campaign updates"
  ON campaign_update_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM campaign_updates cu
      JOIN campaigns c ON cu.campaign_id = c.id
      WHERE cu.id = campaign_update_id AND c.creator_id = auth.uid()
    )
  );

-- Add comments for documentation
COMMENT ON TABLE public.campaign_updates IS 'Campaign progress updates posted by organizations';
COMMENT ON TABLE public.campaign_update_images IS 'Multiple images for campaign updates';
COMMENT ON COLUMN public.campaign_update_images.display_order IS 'Order in which images should be displayed';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_campaign_updates_campaign_id ON public.campaign_updates(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_update_images_update_id ON public.campaign_update_images(campaign_update_id);

-- ============================================
-- VERIFICATION QUERY
-- Run this to verify the tables were created:
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name IN ('campaign_updates', 'campaign_update_images')
-- ORDER BY table_name, ordinal_position;
-- ============================================
