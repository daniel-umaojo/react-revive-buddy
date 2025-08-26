-- Updated Database Schema for Supabase Auth Integration
-- Run this in your Supabase SQL Editor

-- First, drop existing tables to recreate with proper auth integration
DROP TABLE IF EXISTS tank_data CASCADE;
DROP TABLE IF EXISTS tank_settings CASCADE;
DROP TABLE IF EXISTS fluid_database CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create user_profiles table (optional - for additional user data beyond Supabase Auth)
CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    company_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(auth_user_id)
);

-- Tank Settings table - linked to auth.users via auth_user_id
CREATE TABLE tank_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_email TEXT NOT NULL, -- Keep for backward compatibility
    vessel_name TEXT NOT NULL,
    tank_name TEXT NOT NULL,
    shape TEXT NOT NULL CHECK (shape IN ('Cylindrical', 'Rectangular', 'Spherical')),
    max_level DECIMAL(10,2) NOT NULL,
    area DECIMAL(10,2) NOT NULL,
    height DECIMAL(10,2) NOT NULL,
    radius DECIMAL(10,2),
    length DECIMAL(10,2),
    breadth DECIMAL(10,2),
    low_fill_threshold JSONB NOT NULL,
    half_fill_threshold JSONB NOT NULL,
    high_fill_threshold JSONB NOT NULL,
    overflow_threshold JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(auth_user_id, vessel_name, tank_name)
);

-- Tank Data table - linked to auth.users via auth_user_id
CREATE TABLE tank_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_email TEXT NOT NULL, -- Keep for backward compatibility
    vessel_name TEXT NOT NULL,
    tank_name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    volume DECIMAL(10,2) NOT NULL,
    density DECIMAL(10,2) NOT NULL,
    fluid TEXT NOT NULL,
    temperature DECIMAL(10,2) NOT NULL,
    pressure DECIMAL(10,2) NOT NULL,
    fuel_level DECIMAL(10,2) NOT NULL,
    operator_name TEXT,
    area DECIMAL(10,2) NOT NULL,
    fill_percentage DECIMAL(5,2) NOT NULL,
    fill_status TEXT NOT NULL,
    detected_fluid TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fluid Database table - linked to auth.users via auth_user_id
CREATE TABLE fluid_database (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_email TEXT NOT NULL, -- Keep for backward compatibility
    fluid_name TEXT NOT NULL,
    density DECIMAL(10,2) NOT NULL,
    min_density DECIMAL(10,2), -- Store min/max separately for better precision
    max_density DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(auth_user_id, fluid_name)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tank_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tank_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE fluid_database ENABLE ROW LEVEL SECURITY;

-- User Profiles RLS Policies
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@glence.com'
  )
);

-- Tank Settings RLS Policies
CREATE POLICY "Users can view own tank settings" ON tank_settings
FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own tank settings" ON tank_settings
FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own tank settings" ON tank_settings
FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can delete own tank settings" ON tank_settings
FOR DELETE USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can view all tank settings" ON tank_settings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@glence.com'
  )
);

-- Tank Data RLS Policies
CREATE POLICY "Users can view own tank data" ON tank_data
FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own tank data" ON tank_data
FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own tank data" ON tank_data
FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can delete own tank data" ON tank_data
FOR DELETE USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can view all tank data" ON tank_data
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@glence.com'
  )
);

-- Fluid Database RLS Policies
CREATE POLICY "Users can view own fluid database" ON fluid_database
FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own fluid database" ON fluid_database
FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own fluid database" ON fluid_database
FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can delete own fluid database" ON fluid_database
FOR DELETE USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can view all fluid database" ON fluid_database
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@glence.com'
  )
);

-- Create indexes for better performance
CREATE INDEX idx_tank_settings_auth_user_id ON tank_settings(auth_user_id);
CREATE INDEX idx_tank_settings_user_email ON tank_settings(user_email);
CREATE INDEX idx_tank_data_auth_user_id ON tank_data(auth_user_id);
CREATE INDEX idx_tank_data_user_email ON tank_data(user_email);
CREATE INDEX idx_tank_data_created_at ON tank_data(created_at);
CREATE INDEX idx_fluid_database_auth_user_id ON fluid_database(auth_user_id);

-- Function to automatically create user profile after Supabase Auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (auth_user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up with Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create a view for admin to see user data with auth info
CREATE OR REPLACE VIEW admin_user_overview AS
SELECT 
  au.id as auth_user_id,
  au.email,
  au.created_at as auth_created_at,
  au.email_confirmed_at,
  au.last_sign_in_at,
  up.display_name,
  up.company_name,
  up.phone,
  COUNT(DISTINCT ts.id) as tank_settings_count,
  COUNT(DISTINCT td.id) as tank_data_count,
  COUNT(DISTINCT fd.id) as fluid_database_count
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.auth_user_id
LEFT JOIN tank_settings ts ON au.id = ts.auth_user_id
LEFT JOIN tank_data td ON au.id = td.auth_user_id  
LEFT JOIN fluid_database fd ON au.id = fd.auth_user_id
GROUP BY au.id, au.email, au.created_at, au.email_confirmed_at, au.last_sign_in_at, up.display_name, up.company_name, up.phone;

-- Grant access to the admin view (only for authenticated users)
GRANT SELECT ON admin_user_overview TO authenticated;

-- Test data for verification (optional)
-- Note: This will only work after you have registered users through Supabase Auth
-- You can run this after testing registration to verify the setup

-- Insert some test tank settings (replace with actual auth_user_id after registration)
/*
INSERT INTO tank_settings (auth_user_id, user_email, vessel_name, tank_name, shape, max_level, area, height, radius, low_fill_threshold, half_fill_threshold, high_fill_threshold, overflow_threshold)
VALUES (
  'YOUR_AUTH_USER_ID_HERE', -- Replace with actual user ID from auth.users
  'test@example.com',
  'Main Vessel',
  'Tank A',
  'Cylindrical',
  100.00,
  50.00,
  200.00,
  25.00,
  '{"min": 0, "max": 25}',
  '{"min": 25, "max": 75}',
  '{"min": 75, "max": 95}',
  '{"min": 95, "max": 100}'
);
*/

-- View to check auth.users (for admin debugging)
CREATE OR REPLACE VIEW auth_users_info AS
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at,
  CASE 
    WHEN email = 'admin@glence.com' THEN true 
    ELSE false 
  END as is_admin
FROM auth.users;

-- Grant access to auth users info view
GRANT SELECT ON auth_users_info TO authenticated;

COMMENT ON TABLE user_profiles IS 'Additional user profile data linked to Supabase Auth users';
COMMENT ON TABLE tank_settings IS 'Tank configuration settings for each authenticated user';
COMMENT ON TABLE tank_data IS 'Tank measurement data entries for each authenticated user';
COMMENT ON TABLE fluid_database IS 'User-specific fluid density database for tank calculations';
COMMENT ON VIEW admin_user_overview IS 'Admin view showing user statistics and data counts';
COMMENT ON VIEW auth_users_info IS 'Admin view showing Supabase Auth user information';
