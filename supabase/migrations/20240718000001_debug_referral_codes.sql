-- Function to find a referral code across all tables
CREATE OR REPLACE FUNCTION find_referral_code(code TEXT)
RETURNS TABLE (
  table_name TEXT,
  record_id TEXT,
  referral_code TEXT
) AS $$
BEGIN
  -- Check unified_profiles
  RETURN QUERY
  SELECT 
    'unified_profiles'::TEXT as table_name,
    id::TEXT as record_id,
    referral_code
  FROM unified_profiles
  WHERE referral_code = code;
  
  -- Check guest_profiles
  RETURN QUERY
  SELECT 
    'guest_profiles'::TEXT as table_name,
    guest_id::TEXT as record_id,
    referral_code
  FROM guest_profiles
  WHERE referral_code = code;
  
  -- Check referrals table
  RETURN QUERY
  SELECT 
    'referrals'::TEXT as table_name,
    id::TEXT as record_id,
    referral_code
  FROM referrals
  WHERE referral_code = code;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT * FROM find_referral_code('82DRLZF4XRR0');
