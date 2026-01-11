-- ============================================
-- Migration: Add admin_actions audit log table
-- Purpose: Track all admin actions for accountability
-- Date: 2026-01-11
-- ============================================

-- Create admin_actions table for audit logging
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id uuid REFERENCES public.profiles(id) NOT NULL,
  action_type text NOT NULL, -- 'approve_org', 'reject_org', 'ban_org', 'approve_campaign', 'freeze_campaign', etc.
  target_type text NOT NULL, -- 'organization', 'campaign', 'user'
  target_id uuid NOT NULL,
  details jsonb, -- Additional context (e.g., reason for rejection/ban)
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON public.admin_actions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON public.admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON public.admin_actions(action_type);

-- Enable Row Level Security
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Policy: Admin can view all actions
CREATE POLICY "Admin can view all actions"
  ON admin_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admin can insert actions
CREATE POLICY "Admin can insert actions"
  ON admin_actions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add comments for documentation
COMMENT ON TABLE public.admin_actions IS 'Audit log for all admin actions';
COMMENT ON COLUMN public.admin_actions.action_type IS 'Type of action performed (approve_org, reject_org, ban_org, etc.)';
COMMENT ON COLUMN public.admin_actions.target_type IS 'Type of entity targeted (organization, campaign, user)';
COMMENT ON COLUMN public.admin_actions.target_id IS 'UUID of the targeted entity';
COMMENT ON COLUMN public.admin_actions.details IS 'Additional context in JSON format (e.g., rejection reason)';

-- ============================================
-- VERIFICATION QUERY
-- Run this to verify the table was created:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'admin_actions'
-- ORDER BY ordinal_position;
-- ============================================
