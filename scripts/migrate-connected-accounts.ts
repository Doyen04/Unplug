/**
 * Migration script to create the connected_accounts table in PostgreSQL.
 *
 * Run with: npx tsx scripts/migrate-connected-accounts.ts
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pool } from 'pg';

// Load .env.local manually (no dotenv dependency)
const envPath = resolve(process.cwd(), '.env.local');
try {
    const envContent = readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex === -1) continue;
        const key = trimmed.slice(0, eqIndex).trim();
        const value = trimmed.slice(eqIndex + 1).trim();
        if (!process.env[key]) {
            process.env[key] = value;
        }
    }
} catch {
    // .env.local may not exist, rely on existing env vars
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('Missing DATABASE_URL environment variable.');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
});

const migrate = async () => {
    const client = await pool.connect();

    try {
        await client.query(`
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
        `);

        console.log('✓ connected_accounts table created (or already exists).');

        // Create index for fast per-user lookups
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id
            ON connected_accounts (user_id);
        `);

        console.log('✓ Index on user_id created (or already exists).');
        console.log('Migration complete.');
    } finally {
        client.release();
        await pool.end();
    }
};

migrate().catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
});
