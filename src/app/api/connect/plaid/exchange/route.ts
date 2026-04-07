import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getServerSession } from '../../../../../lib/server/auth-session';

const exchangeSchema = z.object({
    publicToken: z.string(),
    metadata: z.unknown().optional(),
});

const PLAID_BASE_URLS: Record<string, string> = {
    sandbox: 'https://sandbox.plaid.com',
    development: 'https://development.plaid.com',
    production: 'https://production.plaid.com',
};

export async function POST(request: Request) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = exchangeSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
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

    const response = await fetch(`${baseUrl}/item/public_token/exchange`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            client_id: clientId,
            secret,
            public_token: parsed.data.publicToken,
        }),
        cache: 'no-store',
    });

    if (!response.ok) {
        const payload = await response.text();
        return NextResponse.json({ error: payload || 'Plaid exchange failed' }, { status: 502 });
    }

    const payload = (await response.json()) as {
        item_id: string;
        access_token: string;
    };

    // TODO: Persist encrypted access token by user in database.
    return NextResponse.json({ ok: true, itemId: payload.item_id, hasAccessToken: Boolean(payload.access_token) });
}
