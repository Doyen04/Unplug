import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Pairs of [cookieName, isSecurePrefixed].
// __Secure- cookies MUST be cleared with Secure:true or the browser ignores it.
const COOKIES: Array<[string, boolean]> = [
    ['better-auth.session_token',                   false],
    ['better-auth.session_data',                    false],
    ['better-auth.dont_remember',                   false],
    ['better-auth.account_data',                    false],
    ['__Secure-better-auth.session_token',          true],
    ['__Secure-better-auth.session_data',           true],
    ['__Secure-better-auth.dont_remember',          true],
    ['__Secure-better-auth.account_data',           true],
    ['unplug_session',                              false],
];

export async function GET(request: Request) {
    // Revoke the session server-side first
    try {
        await auth.api.signOut({ headers: request.headers as any });
    } catch {
        // best-effort — still clear cookies below
    }

    const response = NextResponse.redirect(new URL('/login', request.url));

    for (const [name, isSecure] of COOKIES) {
        response.cookies.set({
            name,
            value: '',
            path: '/',
            maxAge: 0,
            httpOnly: true,
            sameSite: 'lax',
            secure: isSecure,
        });
    }

    return response;
}
