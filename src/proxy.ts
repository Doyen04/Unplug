import { getSessionCookie } from 'better-auth/cookies';
import { NextRequest, NextResponse } from 'next/server';

const isProtectedPath = (pathname: string): boolean =>
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/api/dashboard') ||
    pathname.startsWith('/api/debrief') ||
    pathname.startsWith('/api/subscriptions');

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (!isProtectedPath(pathname)) {
        return NextResponse.next();
    }

    const sessionCookie = getSessionCookie(request);
    if (sessionCookie) {
        return NextResponse.next();
    }

    if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
    matcher: ['/dashboard/:path*', '/api/dashboard/:path*', '/api/debrief/:path*', '/api/subscriptions/:path*'],
};
