import { redirect } from 'next/navigation';

import { getServerSession } from '@/lib/server/auth-session';
import { db } from '@/lib/server/db';
import BillingPageClient from './BillingPageClient';
import type { Subscription } from '@/types/subscription';

export default async function BillingPage() {
    const session = await getServerSession();
    if (!session) {
        redirect('/login');
    }

    const user = await db
        .selectFrom('user')
        .select(['plan'])
        .where('id', '=', (session as any).user.id)
        .executeTakeFirst();

    const subscriptions = await db
        .selectFrom('user_subscriptions')
        .select(['id', 'service_name', 'amount_monthly', 'currency'])
        .where('user_id', '=', (session as any).user.id)
        .orderBy('service_name', 'asc')
        .execute();

    const mappedSubscriptions: Subscription[] = subscriptions.map((subscription) => ({
        id: subscription.id,
        serviceName: subscription.service_name,
        amountMonthly: Number(subscription.amount_monthly),
        frequencyLabel: 'monthly',
        status: 'healthy',
        confidence: 'high',
        usageScore: 100,
        verdict: 'active',
    }));

    return <BillingPageClient subscriptions={mappedSubscriptions} isPro={user?.plan === 'pro'} />;
}
