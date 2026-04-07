import { NextResponse } from 'next/server';

import {
    getConnectedAccountById,
    listConnectedAccountsByUser,
    markConnectedAccountAuthStatus,
} from '../../../../../lib/server/connected-accounts-store';
import { getServerSession } from '../../../../../lib/server/auth-session';
import { decryptToken } from '../../../../../lib/server/token-crypto';

const PLAID_BASE_URLS: Record<string, string> = {
    sandbox: 'https://sandbox.plaid.com',
    development: 'https://development.plaid.com',
    production: 'https://production.plaid.com',
};

const RECONNECT_ERROR_CODES = new Set(['INVALID_ACCESS_TOKEN', 'ITEM_LOGIN_REQUIRED']);

export async function GET(request: Request) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionAny = session as { user?: { id?: string } };
    const userId = sessionAny.user?.id ?? 'local-user';

    const url = new URL(request.url);
    const accountId = url.searchParams.get('accountId');

    const connectedAccount = accountId
        ? await getConnectedAccountById(userId, accountId)
        : (await listConnectedAccountsByUser(userId)).find((item) => item.provider === 'plaid');

    if (!connectedAccount || connectedAccount.provider !== 'plaid') {
        return NextResponse.json({ error: 'No plaid account connected' }, { status: 404 });
    }

    if (!connectedAccount.encryptedAccessToken) {
        return NextResponse.json({ error: 'Missing Plaid access token' }, { status: 409 });
    }

    const clientId = process.env.PLAID_CLIENT_ID;
    const secret = process.env.PLAID_SECRET;
    const envName = process.env.PLAID_ENV ?? 'sandbox';
    const baseUrl = PLAID_BASE_URLS[envName] ?? PLAID_BASE_URLS.sandbox;

    if (!clientId || !secret) {
        return NextResponse.json({ error: 'Missing PLAID_CLIENT_ID or PLAID_SECRET' }, { status: 500 });
    }

    const accessToken = decryptToken(connectedAccount.encryptedAccessToken);

    const response = await fetch(`${baseUrl}/accounts/get`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            client_id: clientId,
            secret,
            access_token: accessToken,
        }),
        cache: 'no-store',
    });

    if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error_code?: string; error_message?: string } | null;
        const errorCode = payload?.error_code;

        if (errorCode && RECONNECT_ERROR_CODES.has(errorCode)) {
            await markConnectedAccountAuthStatus(userId, 'plaid', connectedAccount.accountRef, 'reconnect_required');
            return NextResponse.json(
                { error: 'Plaid connection requires relink', code: 'RECONNECT_REQUIRED' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: payload?.error_message ?? 'Failed to fetch Plaid accounts' },
            { status: 502 }
        );
    }

    await markConnectedAccountAuthStatus(userId, 'plaid', connectedAccount.accountRef, 'active');

    const payload = (await response.json()) as {
        item: { item_id: string };
        accounts: Array<{
            account_id: string;
            name: string;
            official_name: string | null;
            type: string;
            subtype: string | null;
            balances: {
                available: number | null;
                current: number | null;
                iso_currency_code: string | null;
            };
        }>;
    };

    return NextResponse.json({
        itemId: payload.item.item_id,
        accounts: payload.accounts,
    });
}
