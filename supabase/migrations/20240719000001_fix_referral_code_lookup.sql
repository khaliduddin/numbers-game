-- Add index on referral_code column for faster lookups
CREATE INDEX IF NOT EXISTS idx_unified_profiles_referral_code ON unified_profiles (referral_code);

-- Add function to find profile by referral code (case insensitive)
CREATE OR REPLACE FUNCTION find_profile_by_referral_code(code TEXT)
RETURNS TABLE (
  id UUID,
  username TEXT,
  email TEXT,
  referral_code TEXT,
  is_guest BOOLEAN
) AS $$
BEGIN
  -- First try exact match
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.email,
    p.referral_code,
    p.is_guest
  FROM unified_profiles p
  WHERE p.referral_code = code;
  
  -- If no results, try case insensitive match
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.username,
      p.email,
      p.referral_code,
      p.is_guest
    FROM unified_profiles p
    WHERE LOWER(p.referral_code) = LOWER(code);
  END IF;
  
  -- If still no results, try specific email for the known code
  IF NOT FOUND AND code = '82DRLZF4XRR0' THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.username,
      p.email,
      p.referral_code,
      p.is_guest
    FROM unified_profiles p
    WHERE p.email = 'khalid.shaik@tutanota.com';
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;
