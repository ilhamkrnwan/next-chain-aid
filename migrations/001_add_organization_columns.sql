-- ============================================
-- ALTER TABLE: organizations
-- Purpose: Add missing columns to match TypeScript types
-- Date: 2026-01-10
-- ============================================

-- Add missing columns to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS verified_by uuid references public.profiles(id),
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Add comments for documentation
COMMENT ON COLUMN public.organizations.address IS 'Physical address of the organization';
COMMENT ON COLUMN public.organizations.website IS 'Organization website URL';
COMMENT ON COLUMN public.organizations.verified_at IS 'Timestamp when organization was verified';
COMMENT ON COLUMN public.organizations.verified_by IS 'Admin ID who verified the organization';
COMMENT ON COLUMN public.organizations.rejection_reason IS 'Reason for rejection if status is rejected';
COMMENT ON COLUMN public.organizations.updated_at IS 'Last update timestamp';

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION QUERY
-- Run this to verify the columns were added:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'organizations' 
-- ORDER BY ordinal_position;
-- ============================================
