-- Create table for storing OTP verification codes
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);

-- Add function to clean up expired verification codes
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM verification_codes
  WHERE expires_at < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to clean up expired codes
DROP TRIGGER IF EXISTS cleanup_expired_codes_trigger ON verification_codes;
CREATE TRIGGER cleanup_expired_codes_trigger
AFTER INSERT ON verification_codes
FOR EACH STATEMENT
EXECUTE FUNCTION cleanup_expired_verification_codes();
