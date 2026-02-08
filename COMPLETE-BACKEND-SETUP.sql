-- ============================================================================
-- FLAME CLOUD - COMPLETE BACKEND SETUP SQL
-- ============================================================================
-- This file contains EVERYTHING for your backend
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================================

-- STEP 1: CLEAN UP (Remove existing tables if any)
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS yt_partners CASCADE;
DROP TABLE IF EXISTS location_settings CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS free_plans CASCADE;
DROP TABLE IF EXISTS paid_plans CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- STEP 2: CREATE ALL TABLES

-- TABLE 1: USERS
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    avatar TEXT DEFAULT 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
    is_admin INTEGER DEFAULT 0,
    has_claimed_free_plan INTEGER DEFAULT 0,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 2: SITE SETTINGS
CREATE TABLE site_settings (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 3: LOCATION SETTINGS
CREATE TABLE location_settings (
    id SERIAL PRIMARY KEY,
    location TEXT UNIQUE NOT NULL,
    country_code TEXT,
    is_available INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 4: PAID PLANS
CREATE TABLE paid_plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    ram TEXT NOT NULL,
    cpu TEXT NOT NULL,
    storage TEXT NOT NULL,
    location TEXT NOT NULL,
    price TEXT NOT NULL,
    features TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 5: FREE PLANS
CREATE TABLE free_plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    ram TEXT NOT NULL,
    cpu TEXT NOT NULL,
    storage TEXT NOT NULL,
    location TEXT NOT NULL,
    duration TEXT DEFAULT '7 days',
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 6: YT PARTNERS
CREATE TABLE yt_partners (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    channel_url TEXT,
    logo TEXT,
    description TEXT,
    subscribers TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 7: TICKETS
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    screenshot TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'normal',
    admin_response TEXT,
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 8: CHAT MESSAGES
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: CREATE INDEXES FOR PERFORMANCE
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_admin ON users(is_admin);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_chat_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_receiver ON chat_messages(receiver_id);
CREATE INDEX idx_chat_is_read ON chat_messages(is_read);
CREATE INDEX idx_chat_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_paid_plans_location ON paid_plans(location);
CREATE INDEX idx_paid_plans_is_active ON paid_plans(is_active);
CREATE INDEX idx_paid_plans_sort_order ON paid_plans(sort_order);

-- STEP 4: INSERT INITIAL DATA

-- Admin User
INSERT INTO users (username, email, is_admin, avatar) VALUES 
('Flame Cloud Admin', 'flamecloud@gmail.com', 1, 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin');

-- Site Settings
INSERT INTO site_settings (key, value, description) VALUES 
('yt_partners_enabled', '1', 'Enable/disable YouTube partners section'),
('discord_members', '400+', 'Discord server member count'),
('maintenance_mode', '0', 'Enable/disable maintenance mode'),
('site_name', 'Flame Cloud', 'Website name'),
('support_email', 'support@flamecloud.site', 'Support email address'),
('max_free_plans_per_user', '1', 'Maximum free plans per user');

-- Location Settings
INSERT INTO location_settings (location, country_code, is_available, sort_order) VALUES 
('UAE', 'AE', 1, 1),
('France', 'FR', 0, 2),
('Singapore', 'SG', 0, 3);

-- Free Plans
INSERT INTO free_plans (name, ram, cpu, storage, location, duration, sort_order) VALUES
('Free Trial', '1GB', '50%', '5 GB SSD', 'UAE', '7 days', 1),
('Starter Free', '512MB', '25%', '2 GB SSD', 'UAE', '3 days', 2);

-- Paid Plans (9 Plans)
INSERT INTO paid_plans (name, ram, cpu, storage, location, price, sort_order) VALUES
('Bronze Plan', '2GB', '100%', '10 GB SSD', 'UAE', '200 PKR', 1),
('Silver Plan', '4GB', '150%', '20 GB SSD', 'UAE', '400 PKR', 2),
('Gold Plan', '8GB', '250%', '30 GB SSD', 'UAE', '600 PKR', 3),
('Platinum Plan', '10GB', '300%', '40 GB SSD', 'UAE', '800 PKR', 4),
('Emerald Plan', '12GB', '350%', '50 GB SSD', 'UAE', '1200 PKR', 5),
('Amethyst Plan', '14GB', '400%', '60 GB SSD', 'UAE', '3600 PKR', 6),
('Diamond Plan', '16GB', '500%', '80 GB SSD', 'UAE', '1600 PKR', 7),
('Ruby Plan', '32GB', '1000%', '100 GB SSD', 'UAE', '3200 PKR', 8),
('Black Ruby Plan', '34GB', '2000%', '200 GB SSD', 'UAE', '3400 PKR', 9);

-- YouTube Partners
INSERT INTO yt_partners (name, channel_url, description, subscribers, sort_order) VALUES
('Rameez Gaming', 'https://youtube.com/@rameezgaming', 'Minecraft content creator', '50K+', 1),
('TGK FLEX', 'https://youtube.com/@tgkflex', 'Gaming and tech reviews', '100K+', 2),
('Pie Legend', 'https://youtube.com/@pielegend', 'Minecraft tutorials', '75K+', 3);

-- STEP 5: DISABLE ROW LEVEL SECURITY
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE location_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE paid_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE free_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE yt_partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Next Step: Create admin user in Supabase Authentication
-- Email: flamecloud@gmail.com
-- Password: GSFY!25V$
-- Auto Confirm User: YES
-- ============================================================================
