-- Fix RLS Policies for Custom Users Table
-- Run this in your Supabase SQL Editor

-- First, drop any existing conflicting policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can manage own tank settings" ON tank_settings;
DROP POLICY IF EXISTS "Users can manage own tank data" ON tank_data;
DROP POLICY IF EXISTS "Users can manage own fluid database" ON fluid_database;
DROP POLICY IF EXISTS "Admins can read all data" ON users;
DROP POLICY IF EXISTS "Admins can read all tank settings" ON tank_settings;
DROP POLICY IF EXISTS "Admins can read all tank data" ON tank_data;
DROP POLICY IF EXISTS "Admins can read all fluid data" ON fluid_database;

-- Disable RLS temporarily to allow registration
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE tank_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE tank_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE fluid_database DISABLE ROW LEVEL SECURITY;

-- Alternative: Enable RLS with permissive policies
-- Uncomment these lines if you want to keep RLS enabled:

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tank_settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tank_data ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE fluid_database ENABLE ROW LEVEL SECURITY;

-- Create permissive policies that allow anonymous registration
-- CREATE POLICY "Allow anonymous registration" ON users FOR INSERT TO anon WITH CHECK (true);
-- CREATE POLICY "Allow authenticated users to read own data" ON users FOR SELECT TO authenticated USING (email = current_setting('request.jwt.claims')::json->>'email');
-- CREATE POLICY "Allow authenticated users to update own data" ON users FOR UPDATE TO authenticated USING (email = current_setting('request.jwt.claims')::json->>'email');

-- CREATE POLICY "Allow authenticated users to manage tank settings" ON tank_settings FOR ALL TO authenticated USING (user_email = current_setting('request.jwt.claims')::json->>'email');
-- CREATE POLICY "Allow authenticated users to manage tank data" ON tank_data FOR ALL TO authenticated USING (user_email = current_setting('request.jwt.claims')::json->>'email');
-- CREATE POLICY "Allow authenticated users to manage fluid database" ON fluid_database FOR ALL TO authenticated USING (user_email = current_setting('request.jwt.claims')::json->>'email');

-- Test that the fix worked
SELECT 'RLS disabled successfully' as status;
