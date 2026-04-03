import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getDashboardPayload } from '../../../lib/server/dashboard-data';

const filterSchema = z.enum(['all', 'at-risk', 'active', 'cancelled', 'unused']);

export async function GET(request: Request) {
    const url = new URL(request.url);
    const filterParam = url.searchParams.get('filter');
    const pageParam = Number(url.searchParams.get('page') ?? '1');
    const pageSizeParam = Number(url.searchParams.get('pageSize') ?? '4');

    const filter = filterSchema.safeParse(filterParam).success
        ? filterSchema.parse(filterParam)
        : 'all';

    const payload = await getDashboardPayload({
        filter,
        page: Number.isFinite(pageParam) ? pageParam : 1,
        pageSize: Number.isFinite(pageSizeParam) ? pageSizeParam : 4,
    });

    return NextResponse.json(payload);
}
