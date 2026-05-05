'use client';

import { useEffect, useState } from 'react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';

interface ConnectProviderButtonsProps {
    provider: 'plaid' | 'mono';
    preferredProvider: 'plaid' | 'mono';
    accountId?: string;
    compact?: boolean;
    monoPublicKey?: string;
}

declare global {
    interface Window {
        Plaid?: {
            create: (config: {
                token: string;
                onSuccess: (publicToken: string, metadata: unknown) => void | Promise<void>;
                onExit?: () => void;
            }) => {
                open: () => void;
            };
        };
        Connect?: new (config: {
            key: string;
            onSuccess: (payload: { code: string }) => void | Promise<void>;
            onClose?: () => void;
        }) => {
            setup?: () => void;
            open: () => void;
        };
    }
}

const PLAID_SCRIPT_ID = 'plaid-link-script';
const MONO_SCRIPT_ID = 'mono-connect-script';

const loadScript = (id: string, src: string): Promise<void> =>
    new Promise((resolve, reject) => {
        if (typeof document === 'undefined') return;
        if (document.getElementById(id)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(script);
    });

export const ConnectProviderButtons = ({
    provider,
    preferredProvider,
    accountId,
    compact = false,
    monoPublicKey = '',
}: ConnectProviderButtonsProps) => {
    const [plaidToken, setPlaidToken] = useState<string | null>(null);
    const [isBusy, setIsBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSdk = async () => {
            try {
                if (provider === 'plaid') {
                    await loadScript(PLAID_SCRIPT_ID, 'https://cdn.plaid.com/link/v2/stable/link-initialize.js');
                } else if (provider === 'mono') {
                    await loadScript(MONO_SCRIPT_ID, 'https://connect.withmono.com/connect.js');
                }
            } catch {
                // Handled at interaction
            }
        };
        void loadSdk();
    }, [provider]);

    const handlePlaidSetup = async () => {
        setError(null);
        if (!window.Plaid) {
            setError('Plaid SDK not loaded');
            return;
        }
        setIsBusy(true);
        try {
            let token = plaidToken;
            if (!token) {
                const res = await fetch('/api/connect/plaid/link-token', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(accountId ? { accountId } : {}),
                });
                if (!res.ok) throw new Error('Init failed');
                const payload = await res.json();
                token = payload.linkToken;
                setPlaidToken(token);
            }
            const handler = window.Plaid.create({
                token: token!,
                onSuccess: async (publicToken, metadata) => {
                    const res = await fetch('/api/connect/plaid/exchange', {
                        method: 'POST',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({ publicToken, metadata }),
                    });
                    if (!res.ok) {
                        setError('Exchange failed');
                        setIsBusy(false);
                        return;
                    }
                    window.location.assign('/dashboard/connect?connected=plaid');
                },
                onExit: () => setIsBusy(false),
            });
            handler.open();
        } catch {
            setError('Plaid initialization failed');
            setIsBusy(false);
        }
    };

    const handleMonoSetup = async () => {
        setError(null);
        if (!monoPublicKey) {
            setError('Mono key missing');
            return;
        }
        if (!window.Connect) {
            setError('Mono SDK not loaded');
            return;
        }
        setIsBusy(true);
        try {
            const mono = new window.Connect({
                key: monoPublicKey,
                onSuccess: async ({ code }) => {
                    const res = await fetch('/api/connect/mono/exchange', {
                        method: 'POST',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({ code }),
                    });
                    if (!res.ok) {
                        setError('Exchange failed');
                        setIsBusy(false);
                        return;
                    }
                    window.location.assign('/dashboard/connect?connected=mono');
                },
                onClose: () => setIsBusy(false),
            });
            if (mono.setup) mono.setup();
            mono.open();
        } catch {
            setError('Mono interaction failed');
            setIsBusy(false);
        }
    };

    const isPreferred = provider === preferredProvider;

    return (
        <div className={compact ? "" : "w-full"}>
            {error && (
                <Badge variant="danger" className="mb-3 w-full justify-center">
                    {error}
                </Badge>
            )}

            <Button
                type="button"
                variant={isPreferred ? 'primary' : 'secondary'}
                size={compact ? 'sm' : 'default'}
                onClick={provider === 'plaid' ? handlePlaidSetup : handleMonoSetup}
                disabled={isBusy}
                className={compact ? "h-8" : "w-full mt-4"}
            >
                {isBusy 
                    ? `Opening ${provider}...` 
                    : accountId ? `Reconnect ${provider}` : `Setup ${provider}`}
            </Button>
        </div>
    );
};
