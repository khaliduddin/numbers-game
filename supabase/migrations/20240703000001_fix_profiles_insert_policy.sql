-- Fix the row-level security policy for the profiles table to allow inserts

-- First, let's create a policy that allows authenticated users to insert their own profiles
DROP POLICY IF EXISTS "Users can insert their own profiles" ON profiles;
CREATE POLICY "Users can insert their own profiles"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Also ensure the service role can insert profiles
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
CREATE POLICY "Service role can insert profiles"
ON profiles FOR INSERT
TO service_role
USING (true);
