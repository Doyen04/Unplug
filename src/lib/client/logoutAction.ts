"use client";

import { authClient } from "@/lib/auth-client";

export const signOutAction = async (onSuccess?: () => void) => {
    try {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    if (onSuccess) onSuccess();
                    window.location.href = "/login";
                },
            },
        });
    } catch {
        // no-op: proceed to redirect regardless
    } finally {
        window.location.href = "/login";
    }
};