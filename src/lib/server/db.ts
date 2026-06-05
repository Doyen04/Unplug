import { Kysely, PostgresDialect, ColumnType, Generated  } from 'kysely';
import { Pool } from 'pg';


interface UserSettingsTable {
    user_id: string;
    new_subscriptions_alerts: Generated<boolean>;
    monthly_summary: Generated<boolean>;
    price_increase_alert: Generated<boolean>;
    onboarding_completed: Generated<boolean>;
    created_at: Generated<Date>;  // ← was ColumnType<Date, never, never>
    updated_at: Generated<Date>;
}

interface DbShape {
    user_settings: UserSettingsTable;
}

const resolveConnectionString = (): string => {
    const fromDatabaseUrl = process.env.DATABASE_URL;
    const fromVercelPostgres = process.env.POSTGRES_URL;
    const connectionString = fromDatabaseUrl ?? fromVercelPostgres;

    if (!connectionString) {
        throw new Error('Missing DATABASE_URL or POSTGRES_URL for Better Auth database.');
    }

    const lower = connectionString.toLowerCase();
    const hasSslRequire = lower.includes('sslmode=require');
    const hasVerifyFull = lower.includes('sslmode=verify-full');
    const hasLibpqCompat = lower.includes('uselibpqcompat=true');

    if (hasSslRequire && !hasVerifyFull && !hasLibpqCompat) {
        return `${connectionString}${connectionString.includes('?') ? '&' : '?'}uselibpqcompat=true`;
    }

    return connectionString;
};

const connectionString = resolveConnectionString();

const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
});

export const db = new Kysely<DbShape>({
    dialect: new PostgresDialect({ pool }),
});
