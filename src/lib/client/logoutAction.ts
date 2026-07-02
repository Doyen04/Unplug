"use client";

import { authClient } from "@/lib/auth-client";

export const signOutAction = async (onSuccess?: () => void) => {
    await authClient.signOut({
        fetchOptions: { onSuccess },
    });
};