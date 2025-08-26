import { createClient } from '@supabase/supabase-js'

// These would be your actual Supabase project credentials
// For demo purposes, using placeholder values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kqmkcrwqyamfgihdktrs.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxbWtjcndxeWFtZmdpaGRrdHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxOTY1MzgsImV4cCI6MjA3MTc3MjUzOH0.y5ehdqwf8J5A0SsO1b4ac3Rte_o5XK3D6dSo68MBAzU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database schema setup (run this in Supabase SQL editor)
/*
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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tank_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tank_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE fluid_database ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid()::text = email);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid()::text = email);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = email);

CREATE POLICY "Users can manage own tank settings" ON tank_settings FOR ALL USING (auth.uid()::text = user_email);
CREATE POLICY "Users can manage own tank data" ON tank_data FOR ALL USING (auth.uid()::text = user_email);
CREATE POLICY "Users can manage own fluid database" ON fluid_database FOR ALL USING (auth.uid()::text = user_email);

-- Admin policies (for admin panel access)
CREATE POLICY "Admins can read all data" ON users FOR SELECT USING (auth.uid()::text = 'admin@glence.com');
CREATE POLICY "Admins can read all tank settings" ON tank_settings FOR SELECT USING (auth.uid()::text = 'admin@glence.com');
CREATE POLICY "Admins can read all tank data" ON tank_data FOR SELECT USING (auth.uid()::text = 'admin@glence.com');
CREATE POLICY "Admins can read all fluid data" ON fluid_database FOR SELECT USING (auth.uid()::text = 'admin@glence.com');
*/