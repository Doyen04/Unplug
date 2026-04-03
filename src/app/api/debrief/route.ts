import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getDashboardPayload } from '../../../lib/server/dashboard-data';

const debriefSchema = z.object({
    month: z.string(),
    content: z.string(),
});

export async function GET() {
    try {
        const {
            summary: { monthlySpend, unusedCount, saveablePerYear },
        } = getDashboardPayload();

        const content =
            unusedCount > 0
                ? `You are still burning $${monthlySpend}/month while carrying ${unusedCount} likely unused subscriptions. Cancel the highest-cost dead weight first and protect up to $${saveablePerYear}/year.`
                : `You cut obvious waste this cycle and your spend is now at $${monthlySpend}/month. Keep the pressure on by auditing one high-cost subscription before month end.`;

        const parsed = debriefSchema.safeParse({ month: 'APR 2026', content });
        if (!parsed.success) {
            throw new Error('Invalid debrief payload');
        }

        return NextResponse.json(parsed.data);
    } catch {
        return NextResponse.json({
            month: 'APR 2026',
            content:
                'Debrief temporarily unavailable. Review your three most expensive subscriptions and cancel one you did not use this month.',
        });
    }
}
