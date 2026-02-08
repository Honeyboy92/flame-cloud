-- ╔══════════════════════════════════════════════════════════════════╗
-- ║                                                                  ║
-- ║         🔒 FLAME CLOUD - OPTIONAL SECURITY POLICIES 🔒          ║
-- ║                                                                  ║
-- ║  Run this AFTER COMPLETE-BACKEND-SETUP.sql                      ║
-- ║  Only if you want to enable Row Level Security (RLS)            ║
-- ║                                                                  ║
-- ║  ⚠️ WARNING: This will restrict database access                 ║
-- ║  Make sure your app is configured to handle RLS                 ║
-- ║                                                                  ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ============================================================================
-- STEP 1: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE paid_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE yt_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: USERS TABLE POLICIES
-- ============================================================================

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Allow admins to view all users
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND is_admin = 1
    )
);

-- Allow admins to update any user
CREATE POLICY "Admins can update any user"
ON users FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND is_admin = 1
    )
);

-- Allow admins to delete users
CREATE POLICY "Admins can delete users"
ON users FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND is_admin = 1
    )
);

-- Allow new user registration
CREATE POLICY "Allow user registration"
ON users FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- STEP 3: PAID PLANS POLICIES
-- ============================================================================

-- Everyone can view active plans
CREATE POLICY "Anyone can view active plans"
ON paid_plans FOR SELECT
USING (is_active = 1);

-- Admins can manage plans
CREATE POLICY "Admins can manage plans"
ON paid_plans FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND is_admin = 1
    )
);

-- ============================================================================
-- STEP 4: FREE PLANS POLICIES
-- ============================================================================

-- Everyone can view active free plans
CREATE POLICY "Anyone can view free plans"
ON free_plans FOR SELECT
USING (is_active = 1);

-- Admins can manage free plans
CREATE POLICY "Admins can manage free plans"
ON free_plans FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND is_admin = 1
    )
);

-- ============================================================================
-- STEP 5: LOCATION SETTINGS POLICIES
-- ============================================================================

-- Everyone can view available locations
CREATE POLICY "Anyone can view locations"
ON location_settings FOR SELECT
USING (true);

-- Admins can manage locations
CREATE POLICY "Admins can manage locations"
ON location_settings FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND is_admin = 1
    )
);

-- ============================================================================
-- STEP 6: SITE SETTINGS POLICIES
-- ============================================================================

-- Everyone can read site settings
CREATE POLICY "Anyone can read site settings"
ON site_settings FOR SELECT
USING (true);

-- Only admins can modify site settings
CREATE POLICY "Admins can modify site settings"
ON site_settings FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND is_admin = 1
    )
);

-- ============================================================================
-- STEP 7: YT PARTNERS POLICIES
-- ============================================================================

-- Everyone can view active partners
CREATE POLICY "Anyone can view YT partners"
ON yt_partners FOR SELECT
USING (is_active = 1);

-- Admins can manage partners
CREATE POLICY "Admins can manage YT partners"
ON yt_partners FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND is_admin = 1
    )
);

-- ============================================================================
-- STEP 8: TICKETS POLICIES
-- ============================================================================

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
ON tickets FOR SELECT
USING (user_id = auth.uid());

-- Users can create tickets
CREATE POLICY "Users can create tickets"
ON tickets FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own pending tickets
CREATE POLICY "Users can update own pending tickets"
ON tickets FOR UPDATE
USING (user_id = auth.uid() AND status = 'pending');

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
ON tickets FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND is_admin = 1
    )
);

-- Admins can update any ticket
CREATE POLICY "Admins can update any ticket"
ON tickets FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND is_admin = 1
    )
);

-- Admins can delete tickets
CREATE POLICY "Admins can delete tickets"
ON tickets FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND is_admin = 1
    )
);

-- ============================================================================
-- STEP 9: CHAT MESSAGES POLICIES
-- ============================================================================

-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages"
ON chat_messages FOR SELECT
USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
);

-- Users can send messages
CREATE POLICY "Users can send messages"
ON chat_messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- Users can mark their received messages as read
CREATE POLICY "Users can mark messages as read"
ON chat_messages FOR UPDATE
USING (receiver_id = auth.uid());

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
ON chat_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND is_admin = 1
    )
);

-- Admins can send messages to anyone
CREATE POLICY "Admins can send messages"
ON chat_messages FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND is_admin = 1
    )
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '╔══════════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║                                                                  ║';
    RAISE NOTICE '║         🔒 SECURITY POLICIES ENABLED! 🔒                         ║';
    RAISE NOTICE '║                                                                  ║';
    RAISE NOTICE '║  ✅ Row Level Security Enabled                                   ║';
    RAISE NOTICE '║  ✅ User Policies Created                                        ║';
    RAISE NOTICE '║  ✅ Admin Policies Created                                       ║';
    RAISE NOTICE '║  ✅ Data Access Restricted                                       ║';
    RAISE NOTICE '║                                                                  ║';
    RAISE NOTICE '║  ⚠️ IMPORTANT:                                                   ║';
    RAISE NOTICE '║  Make sure your app uses Supabase Auth properly                 ║';
    RAISE NOTICE '║  Test all features after enabling RLS                           ║';
    RAISE NOTICE '║                                                                  ║';
    RAISE NOTICE '╚══════════════════════════════════════════════════════════════════╝';
END $$;

-- ============================================================================
-- TO DISABLE RLS (If needed)
-- ============================================================================

-- Uncomment these lines if you need to disable RLS:

-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE location_settings DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE paid_plans DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE free_plans DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE yt_partners DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
