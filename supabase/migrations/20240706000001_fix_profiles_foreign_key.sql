-- This migration fixes the foreign key constraint issue with profiles table

-- First, let's check if the auth.users table exists and create it if not
CREATE SCHEMA IF NOT EXISTS auth;

-- Create the auth.users table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Drop the foreign key constraint if it exists
ALTER TABLE IF EXISTS profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Re-create the foreign key constraint with proper options
ALTER TABLE profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Create a trigger to automatically create a profile when a user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, avatar_url, join_date)
  VALUES (
    NEW.id,
    split_part(NEW.email, '@', 1),
    NEW.email,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || split_part(NEW.email, '@', 1),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
