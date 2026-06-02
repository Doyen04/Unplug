import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        return await auth.api.signOut({
            headers: request.headers as any,
        });
    } catch (err) {
        console.error("Sign out failed:", err);

        // fallback redirect if something breaks
        return Response.redirect(new URL("/login", request.url));
    }
}