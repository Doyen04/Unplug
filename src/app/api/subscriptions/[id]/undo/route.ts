import { NextResponse } from 'next/server';

import { undoCancelSubscriptionById } from '../../../../../lib/server/dashboard-data';
import { getServerSession } from '../../../../../lib/server/auth-session';

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function POST(_: Request, context: RouteContext) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const updated = await undoCancelSubscriptionById(id);

    if (!updated) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, subscription: updated });
}
