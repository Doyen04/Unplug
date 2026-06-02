import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest): Promise<Response> {
    // Revoke the server-side session (best-effort).
    try {
        await auth.api.signOut({ headers: request.headers as any });
    } catch (err) {
        console.error("Sign out failed:", err);
    }

    // Delete every cookie present in the request, then redirect.
    const response = NextResponse.redirect(new URL("/login", request.url));

    return response;
}