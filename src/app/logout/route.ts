import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';


export async function GET(request: NextRequest) {
    // Revoke the server-side session so cookieCache doesn't keep it alive.
    try {
        await auth.api.signOut({ headers: request.headers as any });
    } catch {
        // best-effort — still clear cookies below
    }

    const response = NextResponse.redirect(new URL('/login', request.url));

    // Delete every cookie that is actually present in the request — no hardcoded list.
    for (const cookie of request.cookies.getAll()) {
        response.cookies.delete(cookie.name);
    }

    return response;
}
