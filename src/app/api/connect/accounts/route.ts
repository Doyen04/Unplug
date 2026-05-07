import { getServerSession } from '@/lib/server/auth-session';
import { listConnectedAccountsByUser } from '@/lib/server/connected-accounts-store';
import type { AuthSession } from '@/types/subscription';

export interface ConnectedAccount {
    id: string;
    displayName: string;
    provider: 'plaid' | 'mono';
    accountRef: string;
    authStatus: 'active' | 'reconnect_required' | 'disconnected';
}

export async function GET() {
    const session = (await getServerSession()) as AuthSession | null;

    if (!session?.user?.id) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        const accounts = await listConnectedAccountsByUser(userId);

        const transformedAccounts: ConnectedAccount[] = accounts.map(account => ({
            id: account.id,
            displayName: account.displayName,
            provider: account.provider,
            accountRef: account.accountRef,
            authStatus: (account.authStatus as 'active' | 'reconnect_required') || 'disconnected',
        }));

        return Response.json(transformedAccounts);
    } catch (error) {
        console.error('Failed to fetch connected accounts:', error);
        return Response.json({ error: 'Failed to fetch accounts' }, { status: 500 });
    }
}
