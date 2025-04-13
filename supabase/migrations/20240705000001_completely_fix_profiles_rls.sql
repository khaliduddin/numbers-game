-- First disable RLS to ensure we can make changes
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON profiles;

-- Create a policy that allows anyone to insert profiles
-- This is critical for the signup flow
CREATE POLICY "Anyone can insert profiles"
ON profiles FOR INSERT
WITH CHECK (true);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- Create policy to allow users to read all profiles
CREATE POLICY "Users can read profiles"
ON profiles
FOR SELECT
USING (true);

-- Re-enable RLS but ensure the policies we just created are in effect
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
