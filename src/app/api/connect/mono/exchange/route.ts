import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getServerSession } from '../../../../../lib/server/auth-session';
import { upsertConnectedAccount } from '../../../../../lib/server/connected-accounts-store';

const monoSchema = z.object({
    code: z.string(),
});

const MONO_DEFAULT_BASE_URL = 'https://api.withmono.com/v2';

const toStringOrNull = (value: unknown): string | null =>
    typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const toRecordOrNull = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === 'object' ? (value as Record<string, unknown>) : null;

const readNestedString = (record: Record<string, unknown>, keys: string[]): string | null => {
    for (const key of keys) {
        const value = toStringOrNull(record[key]);
        if (value) return value;
    }
    return null;
};

export async function POST(request: Request) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionAny = session as { user?: { id?: string } };
    const userId = sessionAny.user?.id ?? 'local-user';

    const body = await request.json();
    const parsed = monoSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const monoSecretKey = process.env.MONO_SECRET_KEY;
    const monoBaseUrl = process.env.MONO_API_BASE_URL ?? MONO_DEFAULT_BASE_URL;

    if (!monoSecretKey) {
        return NextResponse.json({ error: 'Missing MONO_SECRET_KEY' }, { status: 500 });
    }

    const exchangeResponse = await fetch(`${monoBaseUrl}/accounts/auth`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
            'mono-sec-key': monoSecretKey,
            authorization: `Bearer ${monoSecretKey}`,
        },
        body: JSON.stringify({ code: parsed.data.code }),
        cache: 'no-store',
    });

    if (!exchangeResponse.ok) {
        const payload = await exchangeResponse.text();
        return NextResponse.json({ error: payload || 'Mono exchange failed' }, { status: 502 });
    }

    const payload = (await exchangeResponse.json()) as Record<string, unknown>;
    console.log('[Mono] Exchange response payload:', JSON.stringify(payload));
    const payloadData = toRecordOrNull(payload.data);
    const exchangePayload = payloadData ?? payload;

    const accountObject =
        toRecordOrNull(exchangePayload.account)
        ?? toRecordOrNull(payload.account);

    const institutionObject =
        toRecordOrNull(exchangePayload.institution)
        ?? toRecordOrNull(payload.institution);

    const accountRef =
        (accountObject ? readNestedString(accountObject, ['id', '_id', 'account_id', 'accountId']) : null)
        ?? readNestedString(exchangePayload, ['account_id', 'accountId'])
        ?? readNestedString(payload, ['account_id', 'accountId'])
        ?? readNestedString(exchangePayload, ['_id', 'id'])
        ?? readNestedString(payload, ['_id', 'id']);

    if (!accountRef) {
        return NextResponse.json({ error: 'Mono exchange succeeded but no account reference was returned' }, { status: 502 });
    }

    const accountName = accountObject ? readNestedString(accountObject, ['name']) : null;
    const institutionName = institutionObject ? readNestedString(institutionObject, ['name']) : null;
    const displayName = accountName || institutionName || 'Mono linked account';

    await upsertConnectedAccount({
        userId,
        provider: 'mono',
        accountRef,
        displayName,
        authStatus: 'active',
    });

    return NextResponse.json({ ok: true, provider: 'mono', accountRef, displayName });
}
