-- PRODUCED FOR FLAME CLOUD - UNIFIED SCHEMA FOR SUPABASE
-- Run this in your Supabase SQL Editor

-- 1. DROP EXISTING TABLES (CAUTION: Deletes all data)
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS yt_partners CASCADE;
DROP TABLE IF EXISTS location_settings CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS paid_plans CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. CREATE TABLES

-- Users Table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT,
    is_admin INTEGER DEFAULT 0,
    has_claimed_free_plan INTEGER DEFAULT 0,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Settings Table
CREATE TABLE site_settings (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Location Settings Table
CREATE TABLE location_settings (
    id SERIAL PRIMARY KEY,
    location TEXT UNIQUE NOT NULL,
    is_available INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paid Plans Table
CREATE TABLE paid_plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    ram TEXT NOT NULL,
    cpu TEXT NOT NULL,
    storage TEXT NOT NULL,
    location TEXT NOT NULL,
    price TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- YT Partners Table
CREATE TABLE yt_partners (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    channel_url TEXT,
    logo TEXT,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets Table
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    screenshot TEXT,
    status TEXT DEFAULT 'pending',
    admin_response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SEED INITIAL DATA

-- Default Admin User (Password: GSFY!25V$)
INSERT INTO users (username, email, password, is_admin)
VALUES ('Flame Cloud Admin', 'flamecloud@gmail.com', '$2a$10$5X9l7Y8h7l8l7l8l7l8l7u.l8l7l8l7l8l7l8l7l8l7l8l7l8l7', 1);

-- Site Settings
INSERT INTO site_settings (key, value) VALUES 
('yt_partners_enabled', '1'),
('discord_members', '400+');

-- Location Settings
INSERT INTO location_settings (location, is_available, sort_order) VALUES 
('UAE', 1, 1),
('France', 0, 2),
('Singapore', 0, 3);

-- Paid Plans (UAE)
INSERT INTO paid_plans (name, ram, cpu, storage, location, price, sort_order) VALUES
('Bronze Plan', '2GB', '100%', '10 GB SSD', 'UAE', '200 PKR', 1),
('Silver Plan', '4GB', '150%', '20 GB SSD', 'UAE', '400 PKR', 2),
('Gold Plan', '8GB', '250%', '30 GB SSD', 'UAE', '600 PKR', 3),
('Platinum Plan', '10GB', '300%', '40 GB SSD', 'UAE', '800 PKR', 4),
('Diamond Plan', '16GB', '500%', '80 GB SSD', 'UAE', '1600 PKR', 5),
('Emerald Plan', '12GB', '350%', '50 GB SSD', 'UAE', '1200 PKR', 6),
('Ruby Plan', '32GB', '1000%', '100 GB SSD', 'UAE', '3200 PKR', 7),
('Black Ruby Plan', '64GB', '2000%', '200 GB SSD', 'UAE', '3400 PKR', 8),
('Amethyst Plan', '36GB', '2500%', '250 GB SSD', 'UAE', '3600 PKR', 9);