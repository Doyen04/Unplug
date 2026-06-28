/**
 * POST /api/billing/initialize
 *
 * Starts a Paystack checkout session for a user upgrading to Pro.
 *
 * FLOW:
 *  1. User clicks "Upgrade to Pro" in the UI
 *  2. Frontend calls this endpoint
 *  3. We ask Paystack to create a checkout URL for the Pro plan
 *  4. Frontend redirects to that URL
 *  5. User completes payment on Paystack's hosted page
 *  6. Paystack redirects user back to /dashboard?upgraded=true
 *  7. Paystack also fires a subscription.create webhook → our handler sets plan='pro'
 *
 * PLAN CODE:
 * The PAYSTACK_PRO_PLAN_CODE ties the charge to Paystack's recurring plan.
 * This means Paystack handles all future monthly billing automatically —
 * no cron needed for the subscription itself.
 *
 * AMOUNT:
 * ₦4,000 = 400,000 kobo. This is the first payment amount.
 * Subsequent charges are handled by Paystack's plan on the same billing day each month.
 *
 * AUTHORIZATION CODE CAPTURE:
 * When the user pays, Paystack fires charge.success to our webhook.
 * The webhook saves the authorization_code for future merchant-initiated charges
 * (wallet funding for virtual cards). This is why the first Pro payment also
 * enables the virtual card funding system.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: session.user.email,
            amount: 400000,                              // ₦4,000 in kobo — Pro plan price
            plan: process.env.PAYSTACK_PRO_PLAN_CODE,  // ties to recurring subscription plan
            callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
            metadata: { userId: session.user.id },
        }),
    });

    const data = await res.json();
    if (!data.status) {
        return NextResponse.json({ error: data.message || 'Paystack initialization failed' }, { status: 400 });
    }

    // Return the checkout URL — frontend redirects user to it
    return NextResponse.json({ url: data.data.authorization_url });
}
