import { type NextRequest } from 'next/server';

import { proxy } from './src/proxy';

export function middleware(request: NextRequest) {
    return proxy(request);
}

export const config = {
    matcher: ['/dashboard/:path*', '/api/dashboard/:path*', '/api/debrief/:path*', '/api/subscriptions/:path*'],
};
