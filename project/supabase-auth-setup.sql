-- Supabase Auth Setup with Optional User Profiles
-- Run this in your Supabase SQL Editor

-- STEP 1: Enable Supabase Auth (if not already enabled)
-- This is usually enabled by default in new projects

-- STEP 2: Optional - Create user_profiles table for additional user info
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Enable RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- STEP 5: Update your existing tables to work with Supabase Auth
-- Update tank_settings to use auth user ID
ALTER TABLE tank_settings ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- Update tank_data to use auth user ID  
ALTER TABLE tank_data ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- Update fluid_database to use auth user ID
ALTER TABLE fluid_database ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- STEP 6: Update RLS policies for your existing tables
DROP POLICY IF EXISTS "Users can manage own tank settings" ON tank_settings;
DROP POLICY IF EXISTS "Users can manage own tank data" ON tank_data;
DROP POLICY IF EXISTS "Users can manage own fluid database" ON fluid_database;

-- Enable RLS for existing tables
ALTER TABLE tank_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tank_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE fluid_database ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies using Supabase Auth
CREATE POLICY "Authenticated users can manage own tank settings" ON tank_settings
  FOR ALL USING (auth.uid() = auth_user_id OR auth.uid()::text = user_email);

CREATE POLICY "Authenticated users can manage own tank data" ON tank_data
  FOR ALL USING (auth.uid() = auth_user_id OR auth.uid()::text = user_email);

CREATE POLICY "Authenticated users can manage own fluid database" ON fluid_database
  FOR ALL USING (auth.uid() = auth_user_id OR auth.uid()::text = user_email);

-- STEP 7: Create a function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (auth_user_id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 8: Create trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Test that everything works
SELECT 'Supabase Auth setup completed successfully!' as status;
