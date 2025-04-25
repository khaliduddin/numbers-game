-- Function to drop test users and their related data
CREATE OR REPLACE FUNCTION drop_test_user(email_pattern TEXT)
RETURNS TEXT AS $$
DECLARE
  user_id UUID;
  users_deleted INTEGER := 0;
  referrals_deleted INTEGER := 0;
  profiles_deleted INTEGER := 0;
  result TEXT;
BEGIN
  -- Find and process each matching user
  FOR user_id IN 
    SELECT id FROM auth.users WHERE email LIKE email_pattern
  LOOP
    -- Delete related referrals where user is referrer
    DELETE FROM referrals WHERE referrer_id = user_id;
    GET DIAGNOSTICS referrals_deleted = referrals_deleted + ROW_COUNT;
    
    -- Delete related referrals where user is referred
    DELETE FROM referrals WHERE referred_id = user_id;
    GET DIAGNOSTICS referrals_deleted = referrals_deleted + ROW_COUNT;
    
    -- Delete from unified_profiles
    DELETE FROM unified_profiles WHERE id = user_id;
    GET DIAGNOSTICS profiles_deleted = ROW_COUNT;
    
    -- Delete the user from auth.users
    DELETE FROM auth.users WHERE id = user_id;
    GET DIAGNOSTICS users_deleted = ROW_COUNT;
  END LOOP;
  
  result := 'Deleted ' || users_deleted || ' users, ' || 
            profiles_deleted || ' profiles, and ' || 
            referrals_deleted || ' referrals';
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage:
-- SELECT drop_test_user('test%@example.com');
