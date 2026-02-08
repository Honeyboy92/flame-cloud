-- ============================================================================
-- FIX YT PARTNERS (MISSING COLUMN)
-- ============================================================================
-- Run this script in Supabase SQL Editor to fix YT Partners changes
-- ============================================================================

-- Add is_featured column if missing (Integer 0/1 for boolean)
ALTER TABLE yt_partners 
ADD COLUMN IF NOT EXISTS is_featured INTEGER DEFAULT 0;

-- Disable RLS for this table to ensure Admin can edit
ALTER TABLE yt_partners DISABLE ROW LEVEL SECURITY;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'YT Partners Fixed! (Column Added & RLS Disabled)';
END $$;
