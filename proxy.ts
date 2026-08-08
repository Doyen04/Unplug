import { getSessionCookie } from 'better-auth/cookies';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Next 16 middleware entrypoint.
 *
 * `config.matcher` is the single source of truth for what is guarded. Next
 * requires it to be a statically analysable literal, so it cannot be derived
 * from a shared constant — and re-checking the same prefixes at runtime would
 * mean two lists that silently disagree. A route added to the matcher but
 * missing from a runtime prefix check would fall straight through to
 * `NextResponse.next()`, which reads as "guarded" but is an auth bypass. So
 * anything reaching this function is protected by definition.
 *
 * This only checks that a session cookie is *present* — it does not validate
 * it. Every route handler must still call `auth.api.getSession()` and scope its
 * query by `user_id`; that is where authorization actually happens. Note the
 * matcher deliberately omits `/api/cards` and `/api/billing`, which rely solely
 * on their own session checks.
 */
export function proxy(request: NextRequest) {
    if (getSessionCookie(request)) {
        return NextResponse.next();
    }

    if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/dashboard/:path*',
        '/api/debrief/:path*',
        '/api/subscriptions/:path*',
        '/api/user/:path*',
        '/api/connect/:path*',
    ],
};
