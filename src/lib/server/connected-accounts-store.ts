import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import { db } from './db';

export type ConnectedProvider = 'plaid' | 'mono';
export type ConnectedAccountAuthStatus = 'active' | 'reconnect_required';

export interface ConnectedAccount {
    id: string;
    userId: string;
    provider: ConnectedProvider;
    accountRef: string;
    displayName: string;
    connectedAt: string;
    authStatus?: ConnectedAccountAuthStatus;
    encryptedAccessToken?: string;
}

interface ConnectedAccountRow {
    id: string;
    user_id: string;
    provider: string;
    account_ref: string;
    display_name: string;
    connected_at: Date;
    auth_status: string;
    encrypted_access_token: string | null;
    created_at: Date;
    updated_at: Date;
}

interface ConnectedAccountsTable {
    connected_accounts: ConnectedAccountRow;
}

const connectedAccountSchema: z.ZodType<ConnectedAccount> = z.object({
    id: z.string(),
    userId: z.string(),
    provider: z.enum(['plaid', 'mono']),
    accountRef: z.string(),
    displayName: z.string(),
    connectedAt: z.string(),
    authStatus: z.enum(['active', 'reconnect_required']).optional(),
    encryptedAccessToken: z.string().optional(),
});

const rowToConnectedAccount = (row: ConnectedAccountRow): ConnectedAccount => {
    const raw: ConnectedAccount = {
        id: row.id,
        userId: row.user_id,
        provider: row.provider as ConnectedProvider,
        accountRef: row.account_ref,
        displayName: row.display_name,
        connectedAt: row.connected_at instanceof Date
            ? row.connected_at.toISOString()
            : String(row.connected_at),
        authStatus: row.auth_status as ConnectedAccountAuthStatus | undefined,
        encryptedAccessToken: row.encrypted_access_token ?? undefined,
    };

    const parsed = connectedAccountSchema.safeParse(raw);
    return parsed.success ? parsed.data : raw;
};

const typedDb = db as unknown as import('kysely').Kysely<ConnectedAccountsTable>;

export const listConnectedAccountsByUser = async (userId: string): Promise<ConnectedAccount[]> => {
    const rows = await typedDb
        .selectFrom('connected_accounts')
        .selectAll()
        .where('user_id', '=', userId)
        .orderBy('connected_at', 'desc')
        .execute();

    return rows.map(rowToConnectedAccount);
};

interface UpsertConnectedAccountInput {
    userId: string;
    provider: ConnectedProvider;
    accountRef: string;
    displayName: string;
    authStatus?: ConnectedAccountAuthStatus;
    encryptedAccessToken?: string;
}

export const upsertConnectedAccount = async (
    input: UpsertConnectedAccountInput
): Promise<ConnectedAccount> => {
    const now = new Date();

    // Check for existing account first
    const existing = await typedDb
        .selectFrom('connected_accounts')
        .selectAll()
        .where('user_id', '=', input.userId)
        .where('provider', '=', input.provider)
        .where('account_ref', '=', input.accountRef)
        .executeTakeFirst();

    if (existing) {
        const updateValues: Record<string, unknown> = {
            display_name: input.displayName,
            connected_at: now,
            auth_status: input.authStatus ?? existing.auth_status ?? 'active',
            updated_at: now,
        };

        if (input.encryptedAccessToken) {
            updateValues.encrypted_access_token = input.encryptedAccessToken;
        }

        await typedDb
            .updateTable('connected_accounts')
            .set(updateValues)
            .where('id', '=', existing.id)
            .execute();

        const updated = await typedDb
            .selectFrom('connected_accounts')
            .selectAll()
            .where('id', '=', existing.id)
            .executeTakeFirstOrThrow();

        return rowToConnectedAccount(updated);
    }

    const id = randomUUID();

    await typedDb
        .insertInto('connected_accounts')
        .values({
            id,
            user_id: input.userId,
            provider: input.provider,
            account_ref: input.accountRef,
            display_name: input.displayName,
            connected_at: now,
            auth_status: input.authStatus ?? 'active',
            encrypted_access_token: input.encryptedAccessToken ?? null,
            created_at: now,
            updated_at: now,
        })
        .execute();

    const inserted = await typedDb
        .selectFrom('connected_accounts')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirstOrThrow();

    return rowToConnectedAccount(inserted);
};

export const disconnectConnectedAccount = async (userId: string, id: string): Promise<boolean> => {
    const result = await typedDb
        .deleteFrom('connected_accounts')
        .where('user_id', '=', userId)
        .where('id', '=', id)
        .executeTakeFirst();

    return (result?.numDeletedRows ?? BigInt(0)) > BigInt(0);
};

export const getConnectedAccountById = async (
    userId: string,
    id: string
): Promise<ConnectedAccount | null> => {
    const row = await typedDb
        .selectFrom('connected_accounts')
        .selectAll()
        .where('user_id', '=', userId)
        .where('id', '=', id)
        .executeTakeFirst();

    return row ? rowToConnectedAccount(row) : null;
};

export const getConnectedAccountByRef = async (
    userId: string,
    provider: ConnectedProvider,
    accountRef: string
): Promise<ConnectedAccount | null> => {
    const row = await typedDb
        .selectFrom('connected_accounts')
        .selectAll()
        .where('user_id', '=', userId)
        .where('provider', '=', provider)
        .where('account_ref', '=', accountRef)
        .executeTakeFirst();

    return row ? rowToConnectedAccount(row) : null;
};

export const markConnectedAccountAuthStatus = async (
    userId: string,
    provider: ConnectedProvider,
    accountRef: string,
    authStatus: ConnectedAccountAuthStatus
): Promise<void> => {
    await typedDb
        .updateTable('connected_accounts')
        .set({
            auth_status: authStatus,
            updated_at: new Date(),
        })
        .where('user_id', '=', userId)
        .where('provider', '=', provider)
        .where('account_ref', '=', accountRef)
        .execute();
};
