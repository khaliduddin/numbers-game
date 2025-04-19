-- Add referral_code column to guest_profiles table
ALTER TABLE public.guest_profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_guest_profiles_referral_code ON public.guest_profiles(referral_code);
