-- Add unique constraint to prevent multiple referrals for the same user
ALTER TABLE referrals
ADD CONSTRAINT unique_referred_user UNIQUE (referred_id);

-- Add index on referral_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON referrals (referral_code);

-- Add trigger to update XP when a referral is completed
CREATE OR REPLACE FUNCTION update_referrer_xp()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the referrer's XP
  UPDATE unified_profiles
  SET xp = jsonb_set(
    COALESCE(xp, '{"solo": 0, "duel": 0, "tournament": 0}'::jsonb),
    '{solo}',
    (COALESCE((xp->>'solo')::int, 0) + 50)::text::jsonb
  )
  WHERE id = NEW.referrer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS referral_completed_trigger ON referrals;
CREATE TRIGGER referral_completed_trigger
AFTER INSERT ON referrals
FOR EACH ROW
EXECUTE FUNCTION update_referrer_xp();
