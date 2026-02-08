-- ============================================================================
-- FIX MISSING COLUMN (DISCOUNT)
-- ============================================================================
-- Run this script in Supabase SQL Editor to add the missing discount column
-- ============================================================================

-- Add discount column to paid_plans table if it doesn't exist
ALTER TABLE paid_plans 
ADD COLUMN IF NOT EXISTS discount INTEGER DEFAULT 0;

-- Refresh schema cache (optional but good practice)
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Discount Column Added Successfully!';
END $$;
