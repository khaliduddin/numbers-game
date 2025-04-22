-- Add xp and level columns to unified_profiles table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unified_profiles' AND column_name = 'xp') THEN
        ALTER TABLE unified_profiles ADD COLUMN xp JSONB DEFAULT '{"solo": 0, "duel": 0, "tournament": 0}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'unified_profiles' AND column_name = 'level') THEN
        ALTER TABLE unified_profiles ADD COLUMN level INTEGER DEFAULT 0;
    END IF;
END
$$;