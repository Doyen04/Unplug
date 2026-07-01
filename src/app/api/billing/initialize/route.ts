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
import { initializePaystackCheckout } from '@/lib/paystack';

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user || !session.user.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const authorizationUrl = await initializePaystackCheckout(session.user.email, session.user.id);
        return NextResponse.json({ url: authorizationUrl });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Paystack initialization failed' }, { status: 400 });
    }
}
