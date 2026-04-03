import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'unplug_session';
const SESSION_COOKIE_VALUE = 'active';

const isProtectedPath = (pathname: string): boolean =>
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/api/dashboard') ||
    pathname.startsWith('/api/debrief') ||
    pathname.startsWith('/api/subscriptions');

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (!isProtectedPath(pathname)) {
        return NextResponse.next();
    }

    const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (session === SESSION_COOKIE_VALUE) {
        return NextResponse.next();
    }

    if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
}

export const config = {
    matcher: ['/dashboard/:path*', '/api/dashboard/:path*', '/api/debrief/:path*', '/api/subscriptions/:path*'],
};
