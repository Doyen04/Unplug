'use client';

import { useEffect, useMemo, useState } from 'react';

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
    const [isPlaidBusy, setIsPlaidBusy] = useState(false);
    const [isMonoBusy, setIsMonoBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSdk = async () => {
            try {
                if (provider === 'plaid') {
                    await loadScript(PLAID_SCRIPT_ID, 'https://cdn.plaid.com/link/v2/stable/link-initialize.js');
                }

                if (provider === 'mono') {
                    await loadScript(MONO_SCRIPT_ID, 'https://connect.withmono.com/connect.js');
                }
            } catch {
                // SDK script load failures are handled at interaction time
            }
        };

        void loadSdk();
    }, [provider]);

    const plaidButtonClasses = useMemo(
        () =>
            `${compact ? 'rounded-[10px] px-3 py-1' : 'mt-4 w-full rounded-[10px] px-4 py-2'} border text-xs font-semibold uppercase tracking-[0.08em] ${preferredProvider === 'plaid'
                ? 'border-[#FF5C35] bg-[#FF5C35] text-white hover:bg-[#C93A1A]'
                : 'border-[#D0CFC7] bg-white text-[#1A1A17] hover:border-[#1A1A17]'
            }`,
        [compact, preferredProvider]
    );

    const monoButtonClasses = useMemo(
        () =>
            `${compact ? 'rounded-[10px] px-3 py-1' : 'mt-4 w-full rounded-[10px] px-4 py-2'} border text-xs font-semibold uppercase tracking-[0.08em] ${preferredProvider === 'mono'
                ? 'border-[#FF5C35] bg-[#FF5C35] text-white hover:bg-[#C93A1A]'
                : 'border-[#D0CFC7] bg-white text-[#1A1A17] hover:border-[#1A1A17]'
            }`,
        [compact, preferredProvider]
    );

    const handlePlaidSetup = async () => {
        setError(null);

        if (!window.Plaid) {
            setError('Plaid is not ready yet. Refresh and try again.');
            return;
        }

        setIsPlaidBusy(true);

        try {
            let token = plaidToken;

            if (!token) {
                const tokenResponse = await fetch('/api/connect/plaid/link-token', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(accountId ? { accountId } : {}),
                });

                if (!tokenResponse.ok) {
                    throw new Error('Unable to initialize Plaid.');
                }

                const payload = (await tokenResponse.json()) as { linkToken: string };
                token = payload.linkToken;
                setPlaidToken(token);
            }

            const handler = window.Plaid.create({
                token,
                onSuccess: async (publicToken, metadata) => {
                    const response = await fetch('/api/connect/plaid/exchange', {
                        method: 'POST',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({ publicToken, metadata }),
                    });

                    if (!response.ok) {
                        setError('Plaid exchange failed. Try again.');
                        setIsPlaidBusy(false);
                        return;
                    }

                    window.location.assign('/dashboard/connect?connected=plaid');
                },
                onExit: () => {
                    setIsPlaidBusy(false);
                },
            });

            handler.open();
        } catch {
            setError('Unable to initialize Plaid. Try again.');
            setIsPlaidBusy(false);
        }
    };

    const handleMonoSetup = async () => {
        setError(null);

        if (!monoPublicKey) {
            setError('Mono key is missing. Set MONO_PUBLIC_KEY.');
            return;
        }

        if (!window.Connect) {
            setError('Mono is not ready yet. Refresh and try again.');
            return;
        }

        setIsMonoBusy(true);

        const mono = new window.Connect({
            key: monoPublicKey,
            onSuccess: async ({ code }) => {
                const response = await fetch('/api/connect/mono/exchange', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ code }),
                });

                if (!response.ok) {
                    setError('Mono exchange failed. Try again.');
                    setIsMonoBusy(false);
                    return;
                }

                window.location.assign('/dashboard/connect?connected=mono');
            },
            onClose: () => {
                setIsMonoBusy(false);
            },
        });

        if (mono.setup) {
            mono.setup();
        }

        mono.open();
    };

    return (
        <>
            {error ? (
                <div className="mb-3 rounded-[10px] border border-[#E53434] bg-[#FEF0F0] p-3 text-xs uppercase tracking-[0.08em] text-[#E53434]">
                    {error}
                </div>
            ) : null}

            {provider === 'plaid' ? (
                <button
                    type="button"
                    onClick={() => void handlePlaidSetup()}
                    disabled={isPlaidBusy}
                    className={`${plaidButtonClasses} focus-visible:outline-2 focus-visible:outline-[#FF5C35] disabled:opacity-50`}
                >
                    {isPlaidBusy ? 'Opening Plaid...' : accountId ? 'Reconnect Plaid' : 'Setup Plaid'}
                </button>
            ) : (
                <div className={compact ? 'flex items-center gap-2' : 'space-y-2'}>
                    <button
                        type="button"
                        onClick={() => void handleMonoSetup()}
                        disabled={isMonoBusy}
                        className={`${monoButtonClasses} focus-visible:outline-2 focus-visible:outline-[#FF5C35] disabled:opacity-50`}
                    >
                        {isMonoBusy ? 'Opening Mono...' : 'Setup Mono'}
                    </button>
                </div>
            )}
        </>
    );
};
