import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from 'next/headers';

export async function GET(request: NextRequest): Promise<Response> {
    // Revoke the server-side session (best-effort).
    console.log('touched logout button');
    
    try {
        const response = await auth.api.signOut({ headers: await headers(), });
    } catch (err) {
        console.error("Sign out failed:", err);
    }

    // Delete every cookie present in the request, then redirect.
    const response = NextResponse.redirect(new URL("/login", request.url));

    return response;
}