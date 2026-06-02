import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const COOKIE_NAMES = [
    'better-auth.session_token',
    'better-auth.session_data',
    'better-auth.dont_remember',
    'better-auth.account_data',
    '__Secure-better-auth.session_token',
    '__Secure-better-auth.session_data',
    '__Secure-better-auth.dont_remember',
    '__Secure-better-auth.account_data',
    'unplug_session',
];

export async function GET(request: Request) {
    // Revoke the session server-side so cookieCache doesn't keep it alive
    try {
        await auth.api.signOut({ headers: request.headers as any });
    } catch {
        // best-effort: continue to clear cookies even if sign-out call fails
    }

    const response = NextResponse.redirect(new URL('/login', request.url));

    COOKIE_NAMES.forEach((cookieName) => {
        response.cookies.set({
            name: cookieName,
            value: '',
            path: '/',
            maxAge: 0,
        });
    });

    return response;
}
