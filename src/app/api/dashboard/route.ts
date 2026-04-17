import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getDashboardPayload } from '../../../lib/server/dashboard-data';
import { getServerSession } from '../../../lib/server/auth-session';

const filterSchema = z.enum(['all', 'at-risk', 'active', 'cancelled', 'unused']);
const providerSchema = z.enum(['plaid', 'mono']);

export async function GET(request: Request) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionAny = session as { user?: { id?: string } };
    const userId = sessionAny.user?.id ?? 'local-user';

    const url = new URL(request.url);
    const filterParam = url.searchParams.get('filter');
    const providerParam = url.searchParams.get('provider');
    const pageParam = Number(url.searchParams.get('page') ?? '1');
    const pageSizeParam = Number(url.searchParams.get('pageSize') ?? '4');

    const filter = filterSchema.safeParse(filterParam).success
        ? filterSchema.parse(filterParam)
        : 'all';

    const provider = providerSchema.safeParse(providerParam).success
        ? providerSchema.parse(providerParam)
        : undefined;

    const payload = await getDashboardPayload({
        filter,
        provider,
        page: Number.isFinite(pageParam) ? pageParam : 1,
        pageSize: Number.isFinite(pageSizeParam) ? pageSizeParam : 4,
        userId,
    });

    return NextResponse.json(payload);
}
