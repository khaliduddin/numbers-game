-- Create guest_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS guest_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  email TEXT,
  telegram_id TEXT,
  wallet_address TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  join_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Enable row level security
ALTER TABLE guest_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for guest_profiles
DROP POLICY IF EXISTS "Allow public read access to guest_profiles" ON guest_profiles;
CREATE POLICY "Allow public read access to guest_profiles"
  ON guest_profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert to guest_profiles" ON guest_profiles;
CREATE POLICY "Allow public insert to guest_profiles"
  ON guest_profiles FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to guest_profiles" ON guest_profiles;
CREATE POLICY "Allow public update to guest_profiles"
  ON guest_profiles FOR UPDATE
  USING (true);

-- Enable realtime for guest_profiles
ALTER PUBLICATION supabase_realtime ADD TABLE guest_profiles;