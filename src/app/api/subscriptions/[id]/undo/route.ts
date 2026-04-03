import { NextResponse } from 'next/server';

import { undoCancelSubscriptionById } from '../../../../../lib/server/dashboard-data';

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function POST(_: Request, context: RouteContext) {
    const { id } = await context.params;
    const updated = undoCancelSubscriptionById(id);

    if (!updated) {
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, subscription: updated });
}
