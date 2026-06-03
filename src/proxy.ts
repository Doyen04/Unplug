import { getSessionCookie } from 'better-auth/cookies';
import { NextRequest, NextResponse } from 'next/server';

const isProtectedPath = (pathname: string): boolean =>
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/api/dashboard') ||
    pathname.startsWith('/api/debrief') ||
    pathname.startsWith('/api/subscriptions') ||
    pathname.startsWith('/api/user') ||
    pathname.startsWith('/api/connect');

export function handleAuthGuard(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (!isProtectedPath(pathname)) {
        return NextResponse.next();
    }

    const sessionCookie = getSessionCookie(request);

    console.log(sessionCookie, 'cookie', request.headers.get('cookie'), request.headers);
    
    if (sessionCookie) {
        return NextResponse.next();
    }

    if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.redirect(new URL('/login', request.url));
}
