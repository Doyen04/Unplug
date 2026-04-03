import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

type DbShape = Record<string, unknown>;

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
