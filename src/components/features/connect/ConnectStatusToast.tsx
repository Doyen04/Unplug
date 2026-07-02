"use client";

import { useEffect } from 'react';
import { toast } from 'sonner';

interface ConnectStatusToastProps {
    hasConnectSuccess: boolean;
    hasDisconnected: boolean;
    hasDisconnectError: boolean;
}

export const ConnectStatusToast = ({
    hasConnectSuccess,
    hasDisconnected,
    hasDisconnectError,
}: ConnectStatusToastProps) => {
    useEffect(() => {
        if (hasConnectSuccess) {
            toast.success('Account connected successfully.');
        }

        if (hasDisconnected) {
            toast.success('Account disconnected.');
        }

        if (hasDisconnectError) {
            toast.error('Could not disconnect account.');
        }
    }, [hasConnectSuccess, hasDisconnected, hasDisconnectError]);

    return null;
};
