import { NextRequest } from 'next/server';
import { handleAuthGuard } from './src/proxy';

export function proxy(request: NextRequest) {
    return handleAuthGuard(request);
}

export const config = {
    matcher: ['/dashboard/:path*', '/api/dashboard/:path*', '/api/debrief/:path*', '/api/subscriptions/:path*'],
};
