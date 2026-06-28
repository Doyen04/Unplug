CREATE TABLE IF NOT EXISTS connected_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('plaid', 'mono')),
    account_ref TEXT NOT NULL,
    display_name TEXT NOT NULL DEFAULT '',
    connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    auth_status TEXT NOT NULL DEFAULT 'active' CHECK (auth_status IN ('active', 'reconnect_required')),
    encrypted_access_token TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (user_id, provider, account_ref)
);

CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id
ON connected_accounts (user_id);
