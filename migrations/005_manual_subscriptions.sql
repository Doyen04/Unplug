-- Add support for manual subscription creation (vs Mono-detected only)
-- source: 'mono_detected' | 'manual' tracks the origin
-- card_id: references the virtual card issued for this subscription (once card_issuance succeeds)

ALTER TABLE user_subscriptions
  ADD COLUMN source TEXT DEFAULT 'mono_detected',
  ADD COLUMN card_id UUID REFERENCES subscription_cards(id) ON DELETE SET NULL;

-- Manual subscriptions bypass the migration state machine entirely
-- They skip straight to 'active' once the card is issued
CREATE INDEX IF NOT EXISTS user_subscriptions_source_idx ON user_subscriptions(source);
CREATE INDEX IF NOT EXISTS user_subscriptions_card_id_idx ON user_subscriptions(card_id);
