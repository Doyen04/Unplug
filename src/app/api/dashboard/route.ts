import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getDashboardPayload } from '@/lib/server/dashboard-data';
import { getServerSession } from '@/lib/server/auth-session';
import type { AuthSession } from '@/types/subscription';

const filterSchema = z.enum(['all', 'at-risk', 'active', 'cancelled', 'unused']);
const providerSchema = z.enum(['plaid', 'mono']);

export async function GET(request: Request) {
    let session;
    try {
        session = await getServerSession();
    } catch (error: any) {
        if (error.code === 'ECONNRESET' || error.errno === -4077) {
            return NextResponse.json({ error: 'Database Connection Error', offline: true }, { status: 503 });
        }
        throw error;
    }

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionTyped = session as AuthSession | null;
    if (!sessionTyped?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = sessionTyped.user.id;

    const url = new URL(request.url);
    const filterParam = url.searchParams.get('filter');
    const providerParam = url.searchParams.get('provider');
    const searchParam = url.searchParams.get('q') ?? url.searchParams.get('search') ?? undefined;
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
        search: searchParam,
        page: Number.isFinite(pageParam) ? pageParam : 1,
        pageSize: Number.isFinite(pageSizeParam) ? pageSizeParam : 4,
        userId,
    });

    return NextResponse.json(payload);
}
