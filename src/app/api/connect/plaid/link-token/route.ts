import { NextResponse } from 'next/server';

import { getServerSession } from '../../../../../lib/server/auth-session';

const PLAID_BASE_URLS: Record<string, string> = {
    sandbox: 'https://sandbox.plaid.com',
    development: 'https://development.plaid.com',
    production: 'https://production.plaid.com',
};

export async function POST() {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.PLAID_CLIENT_ID;
    const secret = process.env.PLAID_SECRET;
    const envName = process.env.PLAID_ENV ?? 'sandbox';
    const baseUrl = PLAID_BASE_URLS[envName] ?? PLAID_BASE_URLS.sandbox;

    if (!clientId || !secret) {
        return NextResponse.json(
            { error: 'Missing PLAID_CLIENT_ID or PLAID_SECRET' },
            { status: 500 }
        );
    }

    const sessionAny = session as { user?: { id?: string } };
    const userId = sessionAny.user?.id ?? 'local-user';

    const response = await fetch(`${baseUrl}/link/token/create`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            client_id: clientId,
            secret,
            client_name: 'Unplug',
            language: 'en',
            country_codes: ['US'],
            user: {
                client_user_id: userId,
            },
            products: ['transactions'],
        }),
        cache: 'no-store',
    });

    if (!response.ok) {
        const payload = await response.text();
        return NextResponse.json({ error: payload || 'Plaid link token failed' }, { status: 502 });
    }

    const payload = (await response.json()) as { link_token: string };

    return NextResponse.json({ linkToken: payload.link_token });
}
