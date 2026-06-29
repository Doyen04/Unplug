import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/server/db';
import { getOrCreateSudoCustomer } from '@/lib/sudo/get-or-create-customer';
import { issueCardForSubscription } from '@/lib/sudo/issue-card';
import { resolveCardCurrency } from '@/lib/sudo/currency';

interface CreateSubscriptionBody {
    serviceName?: string;
    service_name?: string;
    amountMonthly?: number;
    amount_monthly?: number;
    amount?: number;
    currency?: string;
    billingDay?: number;
    billing_day?: number;
}

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: CreateSubscriptionBody;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const serviceName = body.serviceName ?? body.service_name;
    const amountMonthly = Number(body.amountMonthly ?? body.amount_monthly ?? body.amount ?? 0);
    const currency = (body.currency ?? 'NGN') as 'NGN' | 'USD';
    const billingDay = Number(body.billingDay ?? body.billing_day ?? 0);

    if (!serviceName || typeof serviceName !== 'string') {
        return NextResponse.json({ error: 'serviceName required' }, { status: 400 });
    }

    if (!Number.isFinite(amountMonthly) || amountMonthly <= 0) {
        return NextResponse.json({ error: 'amountMonthly must be a positive number' }, { status: 400 });
    }

    if (!['NGN', 'USD'].includes(currency)) {
        return NextResponse.json({ error: 'currency must be NGN or USD' }, { status: 400 });
    }

    if (!Number.isInteger(billingDay) || billingDay < 1 || billingDay > 31) {
        return NextResponse.json({ error: 'billingDay must be between 1 and 31' }, { status: 400 });
    }

    const user = await db
        .selectFrom('user')
        .select(['plan'])
        .where('id', '=', session.user.id)
        .executeTakeFirstOrThrow();

    if (user.plan !== 'pro') {
        return NextResponse.json({ error: 'Virtual cards require a Pro plan' }, { status: 403 });
    }

    const subscriptionId = randomUUID();

    await db
        .insertInto('user_subscriptions')
        .values({
            id: subscriptionId,
            user_id: session.user.id,
            provider: 'manual',
            subscription_id: null,
            service_name: serviceName,
            amount_monthly: amountMonthly,
            frequency_label: 'monthly',
            billing_day: billingDay,
            status: 'pending_card',
            confidence: 'manual',
            usage_score: 0,
            verdict: null,
            alert: null,
            previous_status: null,
            currency,
            source: 'manual',
            card_id: null,
            created_at: new Date(),
            updated_at: new Date(),
        })
        .execute();

    const userForSudo = await db
        .selectFrom('user')
        .select(['id', 'name', 'email as emailAddress', 'phoneNumber'])
        .where('id', '=', session.user.id)
        .executeTakeFirstOrThrow();

    const sudoCustomerId = await getOrCreateSudoCustomer(userForSudo);

    try {
        await issueCardForSubscription({
            subscriptionId,
            sudoCustomerId,
            serviceName,
            billingAmount: amountMonthly,
            currency: resolveCardCurrency(currency),
            billingDay,
        });
    } catch (err) {
        console.error('[subscriptions] failed to issue card for subscription', subscriptionId, err);
        await db
            .updateTable('user_subscriptions')
            .set({ status: 'card_failed', updated_at: new Date() })
            .where('id', '=', subscriptionId)
            .execute();

        return NextResponse.json({ error: 'Failed to issue card' }, { status: 500 });
    }

    return NextResponse.json(
        {
            subscriptionId,
            message: 'Subscription created and card issued successfully.',
        },
        { status: 200 }
    );
}
