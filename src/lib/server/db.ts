import { Kysely, PostgresDialect, ColumnType, Generated } from 'kysely';
import { Pool } from 'pg';

// ─── App tables ──────────────────────────────────────────────────────────────

interface UserSettingsTable {
    user_id: string;
    new_subscriptions_alerts: Generated<boolean>;
    monthly_summary: Generated<boolean>;
    price_increase_alert: Generated<boolean>;
    onboarding_completed: Generated<boolean>;
    created_at: Generated<Date>;
    updated_at: Generated<Date>;
}

interface ConnectedAccountsTable {
    id: Generated<string>;   // uuid
    user_id: string;
    provider: string;
    account_ref: string;
    display_name: string | null;
    connected_at: Date;
    auth_status: string;
    billing_day: number;
    created_at: Generated<Date>;
    updated_at: Generated<Date>;
}

interface UserSubscriptionsTable {
    id: Generated<string>;         // uuid
    user_id: string;
    provider: string;
    subscription_id: string | null;
    service_name: string;
    amount_monthly: number;
    frequency_label: string | null;
    billing_day: number;
    status: string;
    confidence: string;
    usage_score: number;
    verdict: string | null;
    alert: unknown | null;            // jsonb
    previous_status: string | null;
    currency: string;
    source: string;                    // 'mono_detected' | 'manual'
    card_id: string | null;            // references subscription_cards.id
    created_at: Generated<Date>;
    updated_at: Generated<Date>;
}

// ─── Better Auth tables (camelCase — matches BA's own migrations) ─────────────

interface UserTable {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Generated<Date>;
    updatedAt: Generated<Date>;
    wallet_credit_kobo: number;
    plan: string;
    plan_expires_at: Date | null;
    paystack_customer_code: string | null;
}

interface SessionTable {
    id: string;
    expiresAt: Date;
    token: string;
    createdAt: Generated<Date>;
    updatedAt: Generated<Date>;
    ipAddress: string | null;
    userAgent: string | null;
    userId: string;
}

interface AccountTable {
    id: string;
    accountId: string;
    providerId: string;
    userId: string;
    accessToken: string | null;
    refreshToken: string | null;
    idToken: string | null;
    accessTokenExpiresAt: Date | null;
    refreshTokenExpiresAt: Date | null;
    scope: string | null;
    password: string | null;
    createdAt: Generated<Date>;
    updatedAt: Generated<Date>;
}

interface VerificationTable {
    id: string;
    identifier: string;
    value: string;
    expiresAt: Date;
    createdAt: Generated<Date>;
    updatedAt: Generated<Date>;
}

// ─── Virtual Cards tables ───────────────────────────────────────────────────

interface SudoCustomersTable {
    id: Generated<string>;
    user_id: string;
    sudo_customer_id: string;
    status: string;
    created_at: Generated<Date>;
    updated_at: Date;
}

interface SubscriptionCardsTable {
    id: Generated<string>;
    subscription_id: string;
    sudo_card_id: string;
    sudo_customer_id: string;
    currency: string;
    last_four: string;
    expiry_month: string;
    expiry_year: string;
    status: string;
    spend_limit_kobo: number | null;
    migration_status: string;
    migration_confirmed_at: Date | null;
    next_billing_date: Date | null;
    created_at: Generated<Date>;
    updated_at: Date;
}

interface CardTransactionsTable {
    id: Generated<string>;
    sudo_card_id: string;
    subscription_id: string | null;
    sudo_transaction_id: string;
    type: string;
    status: string;
    amount_kobo: number;
    currency: string;
    merchant_name: string | null;
    merchant_category: string | null;
    channel: string | null;
    created_at: Generated<Date>;
}

interface UserFundingSourcesTable {
    id: Generated<string>;
    user_id: string;
    paystack_authorization_code: string;
    paystack_email: string;
    card_type: string | null;
    last_four: string | null;
    bank: string | null;
    status: string;
    created_at: Generated<Date>;
    updated_at: Date;
}

interface CardFundingTransactionsTable {
    id: Generated<string>;
    user_id: string;
    subscription_id: string | null;
    sudo_card_id: string | null;
    amount_kobo: number;
    subscription_kobo: number;
    currency: string;
    billing_date: Date;
    paystack_ref: string;
    status: string;
    transferred_at: Date | null;
    treasury_ref: string | null;
    created_at: Generated<Date>;
    updated_at: Date;
}

// ─── Database shape ───────────────────────────────────────────────────────────

export interface DbShape {
    // App tables
    user_settings: UserSettingsTable;
    connected_accounts: ConnectedAccountsTable;
    user_subscriptions: UserSubscriptionsTable;
    sudo_customers: SudoCustomersTable;
    subscription_cards: SubscriptionCardsTable;
    card_transactions: CardTransactionsTable;
    user_funding_sources: UserFundingSourcesTable;
    card_funding_transactions: CardFundingTransactionsTable;
    // Better Auth tables
    user: UserTable;
    session: SessionTable;
    account: AccountTable;
    verification: VerificationTable;
}

// ─── Pool + client ────────────────────────────────────────────────────────────

const resolveConnectionString = (): string => {
    const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

    if (!connectionString) {
        throw new Error('Missing DATABASE_URL or POSTGRES_URL for Better Auth database.');
    }

    const lower = connectionString.toLowerCase();
    const needsCompat =
        lower.includes('sslmode=require') &&
        !lower.includes('sslmode=verify-full') &&
        !lower.includes('uselibpqcompat=true');

    return needsCompat
        ? `${connectionString}${connectionString.includes('?') ? '&' : '?'}uselibpqcompat=true`
        : connectionString;
};

const connectionString = resolveConnectionString();

const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
});

export const db = new Kysely<DbShape>({
    dialect: new PostgresDialect({ pool }),
});