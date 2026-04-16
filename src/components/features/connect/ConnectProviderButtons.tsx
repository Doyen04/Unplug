'use client';

import { useEffect, useMemo, useState } from 'react';

interface ConnectProviderButtonsProps {
    provider: 'plaid' | 'mono';
    preferredProvider: 'plaid' | 'mono';
    accountId?: string;
    compact?: boolean;
    monoPublicKey?: string;
    monoSandboxPublicKey?: string;
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
    monoSandboxPublicKey = '',
}: ConnectProviderButtonsProps) => {
    const [plaidToken, setPlaidToken] = useState<string | null>(null);
    const [isPlaidBusy, setIsPlaidBusy] = useState(false);
    const [isMonoBusy, setIsMonoBusy] = useState(false);
    const [activeMonoMode, setActiveMonoMode] = useState<'live' | 'sandbox' | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const bootstrap = async () => {
            try {
                if (provider === 'plaid') {
                    await loadScript(PLAID_SCRIPT_ID, 'https://cdn.plaid.com/link/v2/stable/link-initialize.js');

                    const response = await fetch('/api/connect/plaid/link-token', {
                        method: 'POST',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify(accountId ? { accountId } : {}),
                    });

                    if (!response.ok) {
                        throw new Error('Unable to initialize Plaid.');
                    }

                    const payload = (await response.json()) as { linkToken: string };
                    if (isMounted) {
                        setPlaidToken(payload.linkToken);
                    }
                }

                if (provider === 'mono') {
                    await loadScript(MONO_SCRIPT_ID, 'https://connect.withmono.com/connect.js');
                }
            } catch {
                if (isMounted) {
                    setError('Bank linking initialization failed. Check provider keys and try again.');
                }
            }
        };

        void bootstrap();

        return () => {
            isMounted = false;
        };
    }, [accountId, provider]);

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
        if (!plaidToken || !window.Plaid) {
            setError('Plaid is not ready yet. Refresh and try again.');
            return;
        }

        setIsPlaidBusy(true);

        const handler = window.Plaid.create({
            token: plaidToken,
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
    };

    const handleMonoSetup = async (mode: 'live' | 'sandbox' = 'live') => {
        setError(null);

        const monoKey = mode === 'sandbox' ? monoSandboxPublicKey || monoPublicKey : monoPublicKey;

        if (!monoKey) {
            setError(
                mode === 'sandbox'
                    ? 'Mono sandbox key is missing. Set MONO_SANDBOX_PUBLIC_KEY (or reuse MONO_PUBLIC_KEY).'
                    : 'Mono key is missing. Set MONO_PUBLIC_KEY.'
            );
            return;
        }

        if (!window.Connect) {
            setError('Mono is not ready yet. Refresh and try again.');
            return;
        }

        setIsMonoBusy(true);
        setActiveMonoMode(mode);

        const mono = new window.Connect({
            key: monoKey,
            onSuccess: async ({ code }) => {
                const response = await fetch('/api/connect/mono/exchange', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ code, mode }),
                });

                if (!response.ok) {
                    setError('Mono exchange failed. Try again.');
                    setIsMonoBusy(false);
                    setActiveMonoMode(null);
                    return;
                }

                window.location.assign('/dashboard/connect?connected=mono');
            },
            onClose: () => {
                setIsMonoBusy(false);
                setActiveMonoMode(null);
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
                        onClick={() => void handleMonoSetup('live')}
                        disabled={isMonoBusy}
                        className={`${monoButtonClasses} focus-visible:outline-2 focus-visible:outline-[#FF5C35] disabled:opacity-50`}
                    >
                        {isMonoBusy && activeMonoMode === 'live' ? 'Opening Mono...' : 'Setup Mono'}
                    </button>

                    {provider === 'mono' ? (
                        <button
                            type="button"
                            onClick={() => void handleMonoSetup('sandbox')}
                            disabled={isMonoBusy}
                            className={`${compact ? 'rounded-[10px] px-3 py-1' : 'w-full rounded-[10px] px-4 py-2'} border border-[#D0CFC7] bg-white text-xs font-semibold uppercase tracking-[0.08em] text-[#1A1A17] hover:border-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#FF5C35] disabled:opacity-50`}
                        >
                            {isMonoBusy && activeMonoMode === 'sandbox' ? 'Opening Sandbox...' : 'Setup Mono Sandbox'}
                        </button>
                    ) : null}
                </div>
            )}
        </>
    );
};
