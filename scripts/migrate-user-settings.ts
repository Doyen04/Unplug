/**
 * Migration script to create the user_settings table in PostgreSQL.
 *
 * Run with: npx tsx scripts/migrate-user-settings.ts
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
            CREATE TABLE IF NOT EXISTS user_settings (
                user_id TEXT PRIMARY KEY,
                new_subscriptions_alerts BOOLEAN NOT NULL DEFAULT true,
                monthly_summary BOOLEAN NOT NULL DEFAULT true,
                price_increase_alert BOOLEAN NOT NULL DEFAULT false,
                onboarding_completed BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );
        `);

        // Ensure onboarding flag exists for older installs
        await client.query(`ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;`);

        console.log('✓ user_settings table created (or already exists).');
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
