-- Verify Database Setup
-- Run this in Supabase SQL Editor to check if everything is working

-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'tank_settings', 'tank_data', 'fluid_database')
ORDER BY table_name;

-- Check table structures
\d users;
\d tank_settings;
\d tank_data;
\d fluid_database;

-- Test inserting a sample user (for testing)
INSERT INTO users (email, hashed_password, is_verified) 
VALUES ('debug@test.com', 'test_hash', false)
ON CONFLICT (email) 
DO UPDATE SET hashed_password = 'test_hash'
RETURNING *;

-- Check if the user was inserted
SELECT * FROM users WHERE email = 'debug@test.com';

-- Clean up test data
DELETE FROM users WHERE email = 'debug@test.com';
