-- Create guest_profiles table for storing guest user data
CREATE TABLE IF NOT EXISTS guest_profiles (
  id BIGSERIAL PRIMARY KEY,
  guest_id TEXT NOT NULL UNIQUE,
  username TEXT,
  email TEXT,
  telegram_id TEXT,
  wallet_address TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  join_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on guest_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_guest_profiles_guest_id ON guest_profiles(guest_id);

-- Create index on username for uniqueness checks
CREATE INDEX IF NOT EXISTS idx_guest_profiles_username ON guest_profiles(username);

-- Enable row level security
ALTER TABLE guest_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for guest_profiles
DROP POLICY IF EXISTS "Allow anonymous read access" ON guest_profiles;
CREATE POLICY "Allow anonymous read access"
  ON guest_profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow anonymous insert access" ON guest_profiles;
CREATE POLICY "Allow anonymous insert access"
  ON guest_profiles FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous update access" ON guest_profiles;
CREATE POLICY "Allow anonymous update access"
  ON guest_profiles FOR UPDATE
  USING (true);

-- Enable realtime
alter publication supabase_realtime add table guest_profiles;