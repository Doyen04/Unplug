-- One Sudo customer (cardholder) per Unplug user
-- Created once on first card request and reused for all cards
CREATE TABLE IF NOT EXISTS sudo_customers (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  sudo_customer_id  TEXT        NOT NULL UNIQUE,
  status            TEXT        NOT NULL DEFAULT 'active',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS sudo_customers_user_id_idx ON sudo_customers(user_id);

-- One virtual card per subscription
-- Only safe metadata stored. PAN and CVV never stored here.
CREATE TABLE IF NOT EXISTS subscription_cards (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id       UUID        NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  sudo_card_id          TEXT        NOT NULL UNIQUE,
  sudo_customer_id      TEXT        NOT NULL,
  currency              TEXT        NOT NULL,           -- 'NGN' or 'USD'
  last_four             TEXT        NOT NULL,           -- safe to store
  expiry_month          TEXT        NOT NULL,
  expiry_year           TEXT        NOT NULL,
  status                TEXT        NOT NULL DEFAULT 'active',  -- 'active' | 'inactive' | 'closed'
  spend_limit_kobo      BIGINT,
  migration_status      TEXT        NOT NULL DEFAULT 'pending',
  -- 'pending'   = card issued, user has not updated payment method yet
  -- 'user_done' = user marked done, awaiting verification
  -- 'confirmed' = verified: Sudo webhook shows virtual card was charged
  -- 'failed'    = next billing still hit old personal card (Mono detected)
  migration_confirmed_at TIMESTAMPTZ,
  next_billing_date     DATE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS subscription_cards_subscription_id_idx ON subscription_cards(subscription_id);
CREATE INDEX IF NOT EXISTS subscription_cards_sudo_card_id_idx ON subscription_cards(sudo_card_id);

-- Sudo Africa webhook events — your local ledger
-- Never query Sudo live for balance. Query this table.
CREATE TABLE IF NOT EXISTS card_transactions (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sudo_card_id         TEXT        NOT NULL,
  subscription_id      UUID        REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  sudo_transaction_id  TEXT        NOT NULL UNIQUE,
  type                 TEXT        NOT NULL,   -- 'authorization' | 'transaction' | 'refund'
  status               TEXT        NOT NULL,   -- 'pending' | 'approved' | 'declined' | 'closed'
  amount_kobo          BIGINT      NOT NULL,
  currency             TEXT        NOT NULL,
  merchant_name        TEXT,
  merchant_category    TEXT,
  channel              TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS card_transactions_subscription_id_idx ON card_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS card_transactions_sudo_card_id_idx ON card_transactions(sudo_card_id);

-- Paystack authorization codes saved after first Pro payment
-- Used for all future merchant-initiated wallet funding debits
CREATE TABLE IF NOT EXISTS user_funding_sources (
  id                           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                      TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  paystack_authorization_code  TEXT        NOT NULL,
  paystack_email               TEXT        NOT NULL,
  card_type                    TEXT,        -- 'visa' | 'mastercard' | 'verve'
  last_four                    TEXT,
  bank                         TEXT,
  status                       TEXT        NOT NULL DEFAULT 'active',
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_funding_sources_user_id_idx ON user_funding_sources(user_id);

-- Per-group funding records (one row per subscription per billing cycle)
-- Used by treasury sweep to know what to transfer to Safe Haven
CREATE TABLE IF NOT EXISTS card_funding_transactions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           TEXT        NOT NULL,
  subscription_id   UUID        REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  sudo_card_id      TEXT,
  amount_kobo       BIGINT      NOT NULL,   -- what was collected from user (with buffer)
  subscription_kobo BIGINT      NOT NULL,   -- what the subscription actually costs
  currency          TEXT        NOT NULL,
  billing_date      DATE        NOT NULL,
  paystack_ref      TEXT        NOT NULL,
  status            TEXT        NOT NULL DEFAULT 'collected',
  -- 'collected'   = Paystack charged successfully, money in transit to Safe Haven
  -- 'transferred' = included in treasury sweep, now in Safe Haven
  -- 'failed'      = Paystack charge failed
  -- 'refunded'    = reversed
  transferred_at    TIMESTAMPTZ,
  treasury_ref      TEXT,                   -- Safe Haven transfer reference
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS card_funding_transactions_user_id_idx ON card_funding_transactions(user_id);
CREATE INDEX IF NOT EXISTS card_funding_transactions_billing_date_idx ON card_funding_transactions(billing_date);
CREATE INDEX IF NOT EXISTS card_funding_transactions_transferred_at_idx ON card_funding_transactions(transferred_at);

-- Wallet credit from surplus buffer (difference between collected and actual charge)
-- Stored on user record for simplicity — subtract from next collection
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS wallet_credit_kobo BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS paystack_customer_code TEXT;

-- Add currency column to user_subscriptions table (used for USD vs NGN virtual cards detection)
ALTER TABLE "user_subscriptions" ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'NGN';
