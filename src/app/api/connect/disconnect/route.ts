import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/server/auth-session';
import { disconnectConnectedAccount } from '@/lib/server/connected-accounts-store';

export async function POST(request: Request) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionAny = session as { user?: { id?: string } };
    const userId = sessionAny.user?.id ?? 'local-user';

    try {
        const formData = await request.formData();
        const accountId = String(formData.get('accountId') ?? '').trim();

        if (!accountId) {
            return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
        }

        const ok = await disconnectConnectedAccount(userId, accountId);
        if (!ok) {
            return NextResponse.json({ error: 'Disconnect failed' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
