import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getServerSession } from '../../../../../lib/server/auth-session';

const monoSchema = z.object({
    code: z.string(),
});

export async function POST(request: Request) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = monoSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // TODO: Exchange Mono code for account data and persist linked account.
    return NextResponse.json({ ok: true, provider: 'mono', codeReceived: true });
}
