-- Add referral_code column to guest_profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'guest_profiles' 
                   AND column_name = 'referral_code') THEN
        ALTER TABLE guest_profiles ADD COLUMN referral_code TEXT;
    END IF;
END $$;

-- Create index on referral_code for faster lookups
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                   WHERE tablename = 'guest_profiles' 
                   AND indexname = 'guest_profiles_referral_code_idx') THEN
        CREATE INDEX guest_profiles_referral_code_idx ON guest_profiles(referral_code);
    END IF;
END $$;

-- Add constraint to ensure referral codes are unique when not null
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                   WHERE conname = 'guest_profiles_referral_code_unique') THEN
        ALTER TABLE guest_profiles ADD CONSTRAINT guest_profiles_referral_code_unique UNIQUE (referral_code) DEFERRABLE INITIALLY DEFERRED;
    END IF;
END $$;
