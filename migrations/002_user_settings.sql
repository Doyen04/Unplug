CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY,
    new_subscriptions_alerts BOOLEAN NOT NULL DEFAULT true,
    monthly_summary BOOLEAN NOT NULL DEFAULT true,
    price_increase_alert BOOLEAN NOT NULL DEFAULT false,
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;
