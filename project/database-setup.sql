-- GlenceGaugeApp Database Schema Setup
-- Run this in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  hashed_password TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tank_settings table
CREATE TABLE IF NOT EXISTS tank_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  vessel_name TEXT NOT NULL,
  tank_name TEXT NOT NULL,
  shape TEXT NOT NULL,
  max_level DECIMAL NOT NULL,
  area DECIMAL NOT NULL,
  height DECIMAL NOT NULL,
  radius DECIMAL,
  length DECIMAL,
  breadth DECIMAL,
  low_fill_threshold JSONB NOT NULL,
  half_fill_threshold JSONB NOT NULL,
  high_fill_threshold JSONB NOT NULL,
  overflow_threshold JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tank_data table
CREATE TABLE IF NOT EXISTS tank_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  vessel_name TEXT NOT NULL,
  tank_name TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  volume DECIMAL NOT NULL,
  density DECIMAL NOT NULL,
  fluid TEXT NOT NULL,
  temperature DECIMAL NOT NULL,
  pressure DECIMAL NOT NULL,
  fuel_level DECIMAL NOT NULL,
  operator_name TEXT,
  area DECIMAL NOT NULL,
  fill_percentage DECIMAL NOT NULL,
  fill_status TEXT NOT NULL,
  detected_fluid TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fluid_database table
CREATE TABLE IF NOT EXISTS fluid_database (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  fluid_name TEXT NOT NULL,
  density DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_email, fluid_name)
);

-- For now, we'll disable Row Level Security since we're using custom auth
-- You can enable this later when you want to add more security

-- Uncomment these lines if you want to enable RLS later:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tank_settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tank_data ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE fluid_database ENABLE ROW LEVEL SECURITY;

-- Uncomment and modify these policies if you enable RLS:
-- CREATE POLICY "Users can read own data" ON users FOR SELECT USING (true);
-- CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (true);
-- CREATE POLICY "Users can manage own tank settings" ON tank_settings FOR ALL USING (true);
-- CREATE POLICY "Users can manage own tank data" ON tank_data FOR ALL USING (true);
-- CREATE POLICY "Users can manage own fluid database" ON fluid_database FOR ALL USING (true);

-- Insert some test data to verify the setup works
INSERT INTO users (email, hashed_password, is_verified) VALUES 
('test@example.com', 'hashed_password_here', true)
ON CONFLICT (email) DO NOTHING;
