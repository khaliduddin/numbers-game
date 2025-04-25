-- Create referrals table to track user referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_code TEXT NOT NULL,
  referrer_id UUID REFERENCES unified_profiles(id),
  referred_id UUID REFERENCES unified_profiles(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  reward_claimed BOOLEAN DEFAULT FALSE,
  reward_amount INTEGER DEFAULT 0
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);

-- Enable row level security
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Referrals are viewable by the referrer and referred users" ON referrals;
CREATE POLICY "Referrals are viewable by the referrer and referred users"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

DROP POLICY IF EXISTS "Referrals can be inserted by anyone" ON referrals;
CREATE POLICY "Referrals can be inserted by anyone"
  ON referrals FOR INSERT
  WITH CHECK (true);

-- Add to realtime publication
alter publication supabase_realtime add table referrals;