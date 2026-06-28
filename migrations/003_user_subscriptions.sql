CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    subscription_id TEXT NOT NULL,
    service_name TEXT NOT NULL,
    amount_monthly NUMERIC NOT NULL,
    frequency_label TEXT NOT NULL,
    status TEXT NOT NULL,
    confidence TEXT NOT NULL,
    usage_score NUMERIC NOT NULL,
    verdict TEXT NOT NULL,
    alert JSONB,
    previous_status TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (user_id, subscription_id)
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id
ON user_subscriptions (user_id);
