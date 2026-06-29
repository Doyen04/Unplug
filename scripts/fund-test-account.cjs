// scripts/fund-sudo-sandbox.ts
const { readFileSync } = require('fs');
const { resolve } = require('path');

// Load .env.local
function loadEnv() {
    try {
        const content = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
        for (const line of content.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eq = trimmed.indexOf('=');
            if (eq === -1) continue;
            const key = trimmed.slice(0, eq).trim();
            const val = trimmed.slice(eq + 1).trim();
            if (!process.env[key]) process.env[key] = val;
        }
    } catch { }
}

loadEnv();


const SUDO_API_KEY = process.env.SUDO_AFRICA_API_KEY;
const BASE_URL = 'https://api.sandbox.sudo.cards';

async function main() {
    // Step 1: get pool account
    const accountsRes = await fetch(`${BASE_URL}/accounts?page=0&limit=25`, {
        headers: { Authorization: `Bearer ${SUDO_API_KEY}` },
    });
    const accounts = await accountsRes.json();
    console.log('Accounts:', accounts, 'accountsRes:', accountsRes);
    const pool = accounts.data.find((a) => a.isDefault);
    console.log('Pool account:', pool._id, '| Balance:', pool.availableBalance);

    // Step 2: fund it
    const fundRes = await fetch(`${BASE_URL}/accounts/simulator/fund`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${SUDO_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            accountId: pool._id,
            amount: 10_000_000, // ₦100,000 in kobo
        }),
    });
    const result = await fundRes.json();
    console.log('Funded:', result);
}

main();