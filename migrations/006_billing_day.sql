-- Add billing_day to user_subscriptions
-- Stores the day of month (1-28/29/30/31) when the subscription bills
-- Default to 1 to avoid nulls for existing rows; application will set correct values

ALTER TABLE user_subscriptions
  ADD COLUMN IF NOT EXISTS billing_day INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS user_subscriptions_billing_day_idx ON user_subscriptions(billing_day);
