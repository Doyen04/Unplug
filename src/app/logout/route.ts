import { NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'unplug_session';

export async function GET(request: Request) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: '',
        path: '/',
        maxAge: 0,
    });

    return response;
}
