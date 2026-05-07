import { NextResponse } from 'next/server';

import { cancelSubscriptionById } from '@/lib/server/dashboard-data';
import { getServerSession } from '@/lib/server/auth-session';
import type { AuthSession } from '@/types/subscription';

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function POST(_: Request, context: RouteContext) {
    const session = (await getServerSession()) as AuthSession | null;
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const updated = await cancelSubscriptionById(id, session.user.id);

    if (!updated) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, subscription: updated });
}
