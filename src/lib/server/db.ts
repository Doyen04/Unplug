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
    encrypted_access_token: string | null;
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
    status: string;
    confidence: number;
    usage_score: number;
    verdict: string | null;
    alert: unknown | null;            // jsonb
    previous_status: string | null;
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

// ─── Database shape ───────────────────────────────────────────────────────────

export interface DbShape {
    // App tables
    user_settings: UserSettingsTable;
    connected_accounts: ConnectedAccountsTable;
    user_subscriptions: UserSubscriptionsTable;
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