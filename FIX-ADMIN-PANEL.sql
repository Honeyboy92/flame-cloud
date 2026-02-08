-- ============================================================================
-- FIX ADMIN PANEL ISSUES (DISABLE RLS)
-- ============================================================================
-- Run this script in Supabase SQL Editor to fix permission errors
-- ============================================================================

-- Disable Row Level Security on all tables to allow admin edits
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE location_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE paid_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE free_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE yt_partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

-- Add any missing policies if RLS *must* be on later (optional cleanup)
DROP POLICY IF EXISTS "Admins can manage plans" ON paid_plans;
DROP POLICY IF EXISTS "Admins can manage free plans" ON free_plans;
DROP POLICY IF EXISTS "Admins can manage locations" ON location_settings;
DROP POLICY IF EXISTS "Admins can data" ON site_settings;
DROP POLICY IF EXISTS "Admins can manage YT partners" ON yt_partners;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Admin Panel Permissions Fixed! (RLS Disabled)';
END $$;
