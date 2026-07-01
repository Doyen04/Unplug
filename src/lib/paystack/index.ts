import { db } from '../server/db';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

/**
 * Disables any active/non-renewing Paystack subscription associated with a given user.
 */
export async function cancelPaystackSubscriptionForUser(userId: string): Promise<boolean> {
    try {
        const user = await db
            .selectFrom('user')
            .select(['email', 'paystack_customer_code'])
            .where('id', '=', userId)
            .executeTakeFirst();

        if (!user || !user.email) return false;

        const identifier = user.paystack_customer_code || user.email;
        const queryUrl = `https://api.paystack.co/subscription?customer=${encodeURIComponent(identifier)}`;

        const response = await fetch(queryUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        });

        if (!response.ok) {
            console.error('Failed to query Paystack subscriptions:', await response.text());
            return false;
        }

        const result = await response.json();
        const activeSub = result.data?.find(
            (sub: any) => sub.status === 'active' || sub.status === 'non-renewing'
        );

        if (!activeSub) {
            console.log('No active/non-renewing Paystack subscription found for customer');
            return false;
        }

        const disableRes = await fetch('https://api.paystack.co/subscription/disable', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: activeSub.subscription_code,
                token: activeSub.email_token,
            }),
        });

        if (!disableRes.ok) {
            console.error('Failed to disable Paystack subscription:', await disableRes.text());
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error disabling Paystack subscription:', error);
        return false;
    }
}

/**
 * Starts a Paystack checkout session for a user upgrading to Pro.
 */
export async function initializePaystackCheckout(email: string, userId: string): Promise<string> {
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            amount: 400000,                              // ₦4,000 in kobo — Pro plan price
            plan: process.env.PAYSTACK_PRO_PLAN_CODE,  // ties to recurring subscription plan
            callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
            metadata: { userId },
        }),
    });

    const data = await res.json();
    if (!data.status) {
        throw new Error(data.message || 'Paystack initialization failed');
    }

    return data.data.authorization_url;
}
