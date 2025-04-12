-- Temporarily disable RLS to allow initial profile creation
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Create a policy that allows the service role to insert profiles
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
CREATE POLICY "Service role can insert profiles"
ON profiles FOR INSERT
WITH CHECK (true);

-- Create a policy that allows authenticated users to view all profiles
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;
CREATE POLICY "Authenticated users can view all profiles"
ON profiles FOR SELECT
USING (true);

-- Check if table is already in the publication before adding it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    alter publication supabase_realtime add table profiles;
  END IF;
END
$$;