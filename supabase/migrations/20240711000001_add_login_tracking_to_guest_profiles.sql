-- Add login tracking fields to guest_profiles table
ALTER TABLE guest_profiles
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Update existing records to have a login count of at least 1
UPDATE guest_profiles
SET login_count = 1
WHERE login_count IS NULL OR login_count = 0;

-- Set last_login to updated_at for existing records if it's null
UPDATE guest_profiles
SET last_login = updated_at
WHERE last_login IS NULL;
