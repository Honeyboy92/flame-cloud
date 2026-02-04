-- FLAME CLOUD SUPABASE SECURITY FIXES
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Enable Row Level Security for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE paid_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE yt_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 2. Define Policies

-- SITE SETTINGS, PLANS, PARTNERS, LOCATIONS (Public Read, Admin Write)
CREATE POLICY "Public Read Access" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON location_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON paid_plans FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON free_plans FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON yt_partners FOR SELECT USING (true);

-- Admin access (based on is_admin column in users table)
CREATE POLICY "Admin All Access" ON site_settings FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = 1)
);
CREATE POLICY "Admin All Access" ON location_settings FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = 1)
);
CREATE POLICY "Admin All Access" ON paid_plans FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = 1)
);
CREATE POLICY "Admin All Access" ON free_plans FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = 1)
);
CREATE POLICY "Admin All Access" ON yt_partners FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = 1)
);

-- USERS Table
CREATE POLICY "Users see own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins see all users" ON users FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.is_admin = 1)
);
CREATE POLICY "Public see username and avatar" ON users FOR SELECT USING (true); -- Optional: for chat/public profiles
CREATE POLICY "Users update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- TICKETS Table
CREATE POLICY "Users see own tickets" ON tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create tickets" ON tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all tickets" ON tickets FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = 1)
);

-- CHAT MESSAGES Table
CREATE POLICY "Users see own messages" ON chat_messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "Users send messages" ON chat_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id
);
