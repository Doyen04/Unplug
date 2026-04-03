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
