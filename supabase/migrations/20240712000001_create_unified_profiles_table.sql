-- Create a unified profiles table for both authenticated and guest users
CREATE TABLE IF NOT EXISTS unified_profiles (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT,
  telegram_id TEXT,
  wallet_address TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  join_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT now(),
  login_count INTEGER DEFAULT 1,
  referral_code TEXT,
  is_guest BOOLEAN DEFAULT FALSE,
  guest_id TEXT,
  stats JSONB DEFAULT '{"wins": 0, "losses": 0, "totalGames": 0, "averageScore": 0, "bestScore": 0, "accuracy": 0}'::jsonb
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_unified_profiles_email ON unified_profiles(email);
CREATE INDEX IF NOT EXISTS idx_unified_profiles_guest_id ON unified_profiles(guest_id);

-- Migrate existing profiles data
INSERT INTO unified_profiles (id, username, email, wallet_address, avatar_url, join_date, updated_at, is_guest)
SELECT 
  id, 
  username, 
  email,
  wallet_address, 
  avatar_url, 
  join_date, 
  updated_at,
  FALSE
FROM profiles
ON CONFLICT (id) DO NOTHING;

-- Migrate existing guest profiles data
INSERT INTO unified_profiles (id, username, email, telegram_id, wallet_address, phone_number, avatar_url, join_date, updated_at, last_login, login_count, referral_code, is_guest, guest_id)
SELECT 
  gen_random_uuid(), 
  username, 
  email, 
  telegram_id, 
  wallet_address, 
  phone_number, 
  avatar_url, 
  join_date, 
  updated_at,
  last_login,
  login_count,
  referral_code,
  TRUE,
  guest_id
FROM guest_profiles
ON CONFLICT (id) DO NOTHING;

-- Enable row level security
ALTER TABLE unified_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own profile" ON unified_profiles;
CREATE POLICY "Users can view their own profile"
ON unified_profiles FOR SELECT
USING (auth.uid() = id OR is_guest = TRUE);

DROP POLICY IF EXISTS "Users can update their own profile" ON unified_profiles;
CREATE POLICY "Users can update their own profile"
ON unified_profiles FOR UPDATE
USING (auth.uid() = id OR is_guest = TRUE);

-- Add to realtime publication
alter publication supabase_realtime add table unified_profiles;
