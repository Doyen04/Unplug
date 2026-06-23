import { NextResponse } from 'next/server';

import { cancelSubscriptionById } from '@/lib/server/dashboard-data';
import { getServerSession } from '@/lib/server/auth-session';
import { sendSubscriptionCancelledEmail } from '@/lib/server/mailer';
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

    if (session.user.email) {
        void sendSubscriptionCancelledEmail(
            session.user.email,
            updated.serviceName,
            updated.amountMonthly,
            updated.frequencyLabel
        );
    }

    return NextResponse.json({ success: true, subscription: updated });
}

