#!/usr/bin/env node

const { readdirSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { Pool } = require('pg');
const { execSync } = require('child_process');


function loadEnvFile() {
    const envPath = resolve(process.cwd(), '.env.local');
    try {
        const envContent = readFileSync(envPath, 'utf8');
        for (const line of envContent.split(/\r?\n/)) {
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
        // Ignore if .env.local does not exist.
    }
}

loadEnvFile();

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
    console.error('Missing DATABASE_URL or POSTGRES_URL.');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
});

async function runMigrationFile(client, fileName) {
    const filePath = resolve(process.cwd(), 'migrations', fileName);
    const sql = readFileSync(filePath, 'utf8');
    console.log(`Running ${fileName}...`);
    await client.query(sql);
    console.log(`✓ ${fileName}`);
}

async function main() {
    console.log('Running Better Auth migrations...');
    execSync('npx auth@latest migrate --yes', { stdio: 'inherit' });
    console.log('✓ Better Auth tables ready');
    
    const client = await pool.connect();

    try {
        const migrationDir = resolve(process.cwd(), 'migrations');
        const migrationFiles = readdirSync(migrationDir)
            .filter((fileName) => fileName.endsWith('.sql'))
            .sort();


        if (migrationFiles.length === 0) {
            console.log('No SQL migration files found.');
            return;
        }

        for (const fileName of migrationFiles) {
            await runMigrationFile(client, fileName);
        }

        console.log('All migrations completed.');
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
});
