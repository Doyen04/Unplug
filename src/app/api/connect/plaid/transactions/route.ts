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

const MONO_DEFAULT_BASE_URL = 'https://api.withmono.com/v2';

const RECONNECT_ERROR_CODES = new Set(['INVALID_ACCESS_TOKEN', 'ITEM_LOGIN_REQUIRED']);

const isoDateDaysAgo = (days: number): string => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - days);
    return date.toISOString().slice(0, 10);
};

/** Convert ISO yyyy-mm-dd to Mono's required dd-mm-yyyy format */
const toMonoDate = (isoDate: string): string => {
    const [year, month, day] = isoDate.split('-');
    return `${day}-${month}-${year}`;
};

type NormalizedTransaction = {
    transaction_id: string;
    name: string;
    amount: number;
    date: string;
    merchant_name: string | null;
    iso_currency_code: string | null;
    category: string[] | null;
};

const normalizeMonoTransactions = (input: unknown[]): NormalizedTransaction[] => {
    const today = new Date().toISOString().slice(0, 10);

    return input
        .map((entry, index) => {
            if (!entry || typeof entry !== 'object') return null;
            const item = entry as Record<string, unknown>;
            const merchant =
                (typeof item.merchant === 'string' ? item.merchant : null)
                ?? (typeof item.counterparty === 'string' ? item.counterparty : null);

            const rawAmount =
                typeof item.amount === 'number'
                    ? item.amount
                    : Number(item.amount ?? item.amount_in_minor_units ?? item.amount_minor ?? 0);

            const direction = String(item.type ?? item.direction ?? item.flow ?? '').toLowerCase();
            const normalizedAmount = Number.isFinite(rawAmount) ? Math.abs(rawAmount) : 0;
            const amount = direction.includes('credit') ? -normalizedAmount : normalizedAmount;

            const categoryValue = item.category;
            const category = Array.isArray(categoryValue)
                ? categoryValue.map((value) => String(value))
                : typeof categoryValue === 'string' && categoryValue.trim().length > 0
                    ? [categoryValue.trim()]
                    : null;

            const rawDate =
                (typeof item.date === 'string' ? item.date : null)
                ?? (typeof item.created_at === 'string' ? item.created_at : null)
                ?? (typeof item.timestamp === 'string' ? item.timestamp : null)
                ?? today;

            const date = rawDate.slice(0, 10);

            const name =
                (typeof item.narration === 'string' && item.narration.trim().length > 0
                    ? item.narration.trim()
                    : null)
                ?? (typeof item.description === 'string' && item.description.trim().length > 0
                    ? item.description.trim()
                    : null)
                ?? (typeof item.name === 'string' && item.name.trim().length > 0
                    ? item.name.trim()
                    : null)
                ?? merchant
                ?? 'Mono transaction';

            const transactionId =
                (typeof item.id === 'string' && item.id.trim().length > 0
                    ? item.id
                    : null)
                ?? (typeof item._id === 'string' && item._id.trim().length > 0
                    ? item._id
                    : null)
                ?? `mono-${date}-${index}`;

            return {
                transaction_id: transactionId,
                name,
                amount,
                date,
                merchant_name: merchant,
                iso_currency_code:
                    typeof item.currency === 'string'
                        ? item.currency
                        : typeof item.iso_currency_code === 'string'
                            ? item.iso_currency_code
                            : null,
                category,
            } satisfies NormalizedTransaction;
        })
        .filter((value): value is NormalizedTransaction => Boolean(value));
};

const extractMonoTransactions = (payload: Record<string, unknown>): unknown[] => {
    const payloadData = payload.data && typeof payload.data === 'object'
        ? (payload.data as Record<string, unknown>)
        : null;

    const candidates: unknown[] = [
        payload.transactions,
        payload.data,
        payload.items,
        payload.history,
        payloadData?.transactions,
        payloadData?.data,
        payloadData?.items,
        payloadData?.history,
    ];

    for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
            return candidate;
        }
    }

    return [];
};

export async function GET(request: Request) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionAny = session as { user?: { id?: string } };
    const userId = sessionAny.user?.id ?? 'local-user';

    const url = new URL(request.url);
    const accountId = url.searchParams.get('accountId');
    const days = Number(url.searchParams.get('days') ?? '30');
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');
    const providerParam = url.searchParams.get('provider');
    const requestedProvider =
        providerParam === 'plaid' || providerParam === 'mono'
            ? providerParam
            : null;

    const lookbackDays = Number.isFinite(days) ? Math.min(Math.max(days, 1), 365) : 30;
    const currentPage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
    const safePageSize = Number.isFinite(pageSize) ? Math.min(Math.max(Math.floor(pageSize), 1), 100) : 20;

    const allUserAccounts = await listConnectedAccountsByUser(userId);

    const connectedAccount = accountId
        ? await getConnectedAccountById(userId, accountId)
        : requestedProvider
            ? allUserAccounts.find((item) => item.provider === requestedProvider)
            : allUserAccounts[0] ?? null;

    if (!connectedAccount) {
        return NextResponse.json({ error: 'No connected account found' }, { status: 404 });
    }

    if (connectedAccount.provider === 'mono') {
        const monoSecretKey = process.env.MONO_SECRET_KEY;
        const monoBaseUrl = process.env.MONO_API_BASE_URL ?? MONO_DEFAULT_BASE_URL;

        if (!monoSecretKey) {
            return NextResponse.json({ error: 'Missing MONO_SECRET_KEY' }, { status: 500 });
        }

        const monoUrl = new URL(`${monoBaseUrl}/accounts/${connectedAccount.accountRef}/transactions`);
        monoUrl.searchParams.set('start', toMonoDate(isoDateDaysAgo(lookbackDays)));
        monoUrl.searchParams.set('end', toMonoDate(new Date().toISOString().slice(0, 10)));

        const monoResponse = await fetch(monoUrl.toString(), {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'mono-sec-key': monoSecretKey,
                authorization: `Bearer ${monoSecretKey}`,
            },
            cache: 'no-store',
        });

        if (!monoResponse.ok) {
            const errorBody = await monoResponse.text();
            console.error(
                `[Mono] Transactions API error (${monoResponse.status}):`,
                errorBody,
            );

            const shouldReconnect =
                monoResponse.status === 401
                || monoResponse.status === 403
                || monoResponse.status === 404
                || monoResponse.status === 422;

            if (shouldReconnect) {
                await markConnectedAccountAuthStatus(userId, 'mono', connectedAccount.accountRef, 'reconnect_required');
                return NextResponse.json(
                    { error: 'Mono connection requires relink', code: 'RECONNECT_REQUIRED' },
                    { status: 401 }
                );
            }

            return NextResponse.json(
                { error: errorBody || 'Failed to fetch Mono transactions' },
                { status: 502 }
            );
        }

        await markConnectedAccountAuthStatus(userId, 'mono', connectedAccount.accountRef, 'active');

        const monoPayload = (await monoResponse.json()) as Record<string, unknown>;
        const rawTransactions = extractMonoTransactions(monoPayload);

        const normalized = normalizeMonoTransactions(rawTransactions).sort((a, b) => b.date.localeCompare(a.date));
        const offset = (currentPage - 1) * safePageSize;
        const paged = normalized.slice(offset, offset + safePageSize);

        return NextResponse.json({
            provider: 'mono',
            total: normalized.length,
            page: currentPage,
            pageSize: safePageSize,
            pageCount: Math.max(1, Math.ceil(normalized.length / safePageSize)),
            transactions: paged,
        });
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
    const offset = (currentPage - 1) * safePageSize;

    const response = await fetch(`${baseUrl}/transactions/get`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            client_id: clientId,
            secret,
            access_token: accessToken,
            start_date: isoDateDaysAgo(lookbackDays),
            end_date: new Date().toISOString().slice(0, 10),
            options: {
                count: safePageSize,
                offset,
            },
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
            { error: payload?.error_message ?? 'Failed to fetch Plaid transactions' },
            { status: 502 }
        );
    }

    await markConnectedAccountAuthStatus(userId, 'plaid', connectedAccount.accountRef, 'active');

    const payload = (await response.json()) as {
        transactions: Array<{
            transaction_id: string;
            name: string;
            amount: number;
            date: string;
            merchant_name: string | null;
            iso_currency_code: string | null;
            category: string[] | null;
        }>;
        total_transactions: number;
    };

    return NextResponse.json({
        provider: 'plaid',
        total: payload.total_transactions,
        page: currentPage,
        pageSize: safePageSize,
        pageCount: Math.max(1, Math.ceil(payload.total_transactions / safePageSize)),
        transactions: payload.transactions,
    });
}
