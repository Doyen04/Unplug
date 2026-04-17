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

    const exchangeResponse = await fetch(`${monoBaseUrl}/account/auth`, {
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
    const accountObject =
        payload.account && typeof payload.account === 'object'
            ? (payload.account as Record<string, unknown>)
            : null;
    const institutionObject =
        payload.institution && typeof payload.institution === 'object'
            ? (payload.institution as Record<string, unknown>)
            : null;

    const accountRef =
        readNestedString(payload, ['account_id', 'accountId', '_id', 'id'])
        ?? (accountObject ? readNestedString(accountObject, ['id', '_id']) : null);

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
