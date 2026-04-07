'use client';

import { useEffect, useMemo, useState } from 'react';

interface ConnectProviderButtonsProps {
    provider: 'plaid' | 'mono';
    preferredProvider: 'plaid' | 'mono';
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

export const ConnectProviderButtons = ({ provider, preferredProvider }: ConnectProviderButtonsProps) => {
    const [plaidToken, setPlaidToken] = useState<string | null>(null);
    const [isPlaidBusy, setIsPlaidBusy] = useState(false);
    const [isMonoBusy, setIsMonoBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const monoPublicKey = process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY ?? '';

    useEffect(() => {
        let isMounted = true;

        const bootstrap = async () => {
            try {
                await Promise.all([
                    loadScript(PLAID_SCRIPT_ID, 'https://cdn.plaid.com/link/v2/stable/link-initialize.js'),
                    loadScript(MONO_SCRIPT_ID, 'https://connect.withmono.com/connect.js'),
                ]);

                const response = await fetch('/api/connect/plaid/link-token', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                });

                if (!response.ok) {
                    throw new Error('Unable to initialize Plaid.');
                }

                const payload = (await response.json()) as { linkToken: string };
                if (isMounted) {
                    setPlaidToken(payload.linkToken);
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
    }, []);

    const plaidButtonClasses = useMemo(
        () =>
            `mt-4 w-full border px-4 py-2 text-xs uppercase tracking-[0.08em] ${preferredProvider === 'plaid'
                ? 'border-acid-green bg-acid-green text-stone-950 hover:bg-acid-dim'
                : 'border-stone-600 text-stone-100 hover:border-stone-400'
            }`,
        [preferredProvider]
    );

    const monoButtonClasses = useMemo(
        () =>
            `mt-4 w-full border px-4 py-2 text-xs uppercase tracking-[0.08em] ${preferredProvider === 'mono'
                ? 'border-acid-green bg-acid-green text-stone-950 hover:bg-acid-dim'
                : 'border-stone-600 text-stone-100 hover:border-stone-400'
            }`,
        [preferredProvider]
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
                await fetch('/api/connect/plaid/exchange', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ publicToken, metadata }),
                });

                window.location.assign('/dashboard?connected=plaid');
            },
            onExit: () => {
                setIsPlaidBusy(false);
            },
        });

        handler.open();
    };

    const handleMonoSetup = async () => {
        setError(null);

        if (!monoPublicKey) {
            setError('Mono key is missing. Set NEXT_PUBLIC_MONO_PUBLIC_KEY.');
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
                await fetch('/api/connect/mono/exchange', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ code }),
                });

                window.location.assign('/dashboard?connected=mono');
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
                <div className="mb-3 border border-red-900 bg-red-950 p-3 text-xs uppercase tracking-[0.08em] text-red-400">
                    {error}
                </div>
            ) : null}

            {provider === 'plaid' ? (
                <button
                    type="button"
                    onClick={() => void handlePlaidSetup()}
                    disabled={isPlaidBusy}
                    className={`${plaidButtonClasses} disabled:opacity-50`}
                >
                    {isPlaidBusy ? 'Opening Plaid...' : 'Setup Plaid'}
                </button>
            ) : (
                <button
                    type="button"
                    onClick={() => void handleMonoSetup()}
                    disabled={isMonoBusy}
                    className={`${monoButtonClasses} disabled:opacity-50`}
                >
                    {isMonoBusy ? 'Opening Mono...' : 'Setup Mono'}
                </button>
            )}
        </>
    );
};
