-- Add phone_number field to user table (required)
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS phone_number TEXT NOT NULL DEFAULT '';

-- Create index for phone_number lookups if needed
CREATE INDEX IF NOT EXISTS idx_user_phone_number ON "user" (phone_number);
