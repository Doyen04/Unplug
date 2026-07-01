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
        .leftJoin('subscription_cards', 'subscription_cards.subscription_id', 'user_subscriptions.id')
        .select([
            'user_subscriptions.id as id',
            'user_subscriptions.service_name as service_name',
            'user_subscriptions.amount_monthly as amount_monthly',
            'user_subscriptions.currency as currency',
            'subscription_cards.status as card_status',
            'subscription_cards.sudo_card_id as sudo_card_id',
        ])
        .where('user_subscriptions.user_id', '=', (session as any).user.id)
        .orderBy('user_subscriptions.service_name', 'asc')
        .execute();

    const mappedSubscriptions = subscriptions.map((subscription) => ({
        id: subscription.id,
        serviceName: subscription.service_name,
        amountMonthly: Number(subscription.amount_monthly),
        frequencyLabel: 'monthly' as const,
        status: 'healthy' as const,
        confidence: 'high' as const,
        usageScore: 100,
        verdict: 'active' as const,
        cardStatus: subscription.card_status,
        cardId: subscription.sudo_card_id,
        currency: subscription.currency,
    }));

    return <BillingPageClient subscriptions={mappedSubscriptions} isPro={user?.plan === 'pro'} />;
}
