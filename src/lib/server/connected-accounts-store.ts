import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

export type ConnectedProvider = 'plaid' | 'mono';

export interface ConnectedAccount {
    id: string;
    userId: string;
    provider: ConnectedProvider;
    accountRef: string;
    displayName: string;
    connectedAt: string;
}

const dataFilePath = join(process.cwd(), 'data', 'connected-accounts.json');

const connectedAccountSchema: z.ZodType<ConnectedAccount> = z.object({
    id: z.string(),
    userId: z.string(),
    provider: z.enum(['plaid', 'mono']),
    accountRef: z.string(),
    displayName: z.string(),
    connectedAt: z.string(),
});

const connectedAccountsSchema = z.array(connectedAccountSchema);

const ensureDataFile = async (): Promise<void> => {
    await mkdir(dirname(dataFilePath), { recursive: true });

    try {
        await readFile(dataFilePath, 'utf-8');
    } catch {
        await writeFile(dataFilePath, JSON.stringify([], null, 2), 'utf-8');
    }
};

const readAllConnectedAccounts = async (): Promise<ConnectedAccount[]> => {
    await ensureDataFile();

    const raw = await readFile(dataFilePath, 'utf-8');
    const parsed = connectedAccountsSchema.safeParse(JSON.parse(raw) as unknown);

    if (!parsed.success) {
        await writeFile(dataFilePath, JSON.stringify([], null, 2), 'utf-8');
        return [];
    }

    return parsed.data;
};

const writeAllConnectedAccounts = async (accounts: ConnectedAccount[]): Promise<void> => {
    await ensureDataFile();
    await writeFile(dataFilePath, JSON.stringify(accounts, null, 2), 'utf-8');
};

export const listConnectedAccountsByUser = async (userId: string): Promise<ConnectedAccount[]> => {
    const accounts = await readAllConnectedAccounts();

    return accounts
        .filter((account) => account.userId === userId)
        .sort((a, b) => b.connectedAt.localeCompare(a.connectedAt));
};

interface UpsertConnectedAccountInput {
    userId: string;
    provider: ConnectedProvider;
    accountRef: string;
    displayName: string;
}

export const upsertConnectedAccount = async (
    input: UpsertConnectedAccountInput
): Promise<ConnectedAccount> => {
    const accounts = await readAllConnectedAccounts();

    const existing = accounts.find(
        (account) =>
            account.userId === input.userId
            && account.provider === input.provider
            && account.accountRef === input.accountRef
    );

    if (existing) {
        existing.displayName = input.displayName;
        existing.connectedAt = new Date().toISOString();
        await writeAllConnectedAccounts(accounts);
        return existing;
    }

    const next: ConnectedAccount = {
        id: randomUUID(),
        userId: input.userId,
        provider: input.provider,
        accountRef: input.accountRef,
        displayName: input.displayName,
        connectedAt: new Date().toISOString(),
    };

    accounts.push(next);
    await writeAllConnectedAccounts(accounts);
    return next;
};

export const disconnectConnectedAccount = async (userId: string, id: string): Promise<boolean> => {
    const accounts = await readAllConnectedAccounts();
    const before = accounts.length;

    const next = accounts.filter((account) => !(account.userId === userId && account.id === id));

    if (next.length === before) {
        return false;
    }

    await writeAllConnectedAccounts(next);
    return true;
};
