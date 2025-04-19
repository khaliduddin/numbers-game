-- First, ensure we have a unified_profiles table with all the necessary columns
CREATE TABLE IF NOT EXISTS unified_profiles (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT,
  telegram_id TEXT,
  wallet_address TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  login_count INTEGER DEFAULT 1,
  referral_code TEXT,
  is_guest BOOLEAN DEFAULT FALSE,
  guest_id TEXT,
  stats JSONB DEFAULT '{"wins": 0, "losses": 0, "totalGames": 0, "averageScore": 0, "bestScore": 0, "accuracy": 0}'::JSONB
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS unified_profiles_email_idx ON unified_profiles(email);

-- Create index on guest_id for faster lookups
CREATE INDEX IF NOT EXISTS unified_profiles_guest_id_idx ON unified_profiles(guest_id);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS unified_profiles_username_idx ON unified_profiles(username);

-- Enable row level security
ALTER TABLE unified_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for unified_profiles
DROP POLICY IF EXISTS "Public read access" ON unified_profiles;
CREATE POLICY "Public read access"
  ON unified_profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profiles" ON unified_profiles;
CREATE POLICY "Users can update their own profiles"
  ON unified_profiles FOR UPDATE
  USING (auth.uid() = id OR is_guest = true);

DROP POLICY IF EXISTS "Users can insert their own profiles" ON unified_profiles;
CREATE POLICY "Users can insert their own profiles"
  ON unified_profiles FOR INSERT
  WITH CHECK (true);

-- Enable realtime for unified_profiles
ALTER PUBLICATION supabase_realtime ADD TABLE unified_profiles;
