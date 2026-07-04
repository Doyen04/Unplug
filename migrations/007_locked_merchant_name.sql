-- Add locked_merchant_name to subscription_cards for first-use merchant locking
ALTER TABLE subscription_cards ADD COLUMN IF NOT EXISTS locked_merchant_name TEXT;
