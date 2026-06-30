'use client';

import { useState, useRef, useId } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

declare global {
    interface Window {
        SecureProxy: {
            create: (vaultId: string) => SecureProxyInstance;
        };
    }
}

interface SecureProxyInstance {
    request: (config: {
        name: string;
        method: string;
        path: string;
        headers: Record<string, string>;
        htmlWrapper: string;
        jsonPathSelector: string;
        serializers: unknown[];
    }) => { render: (selector: string) => void };
    SERIALIZERS: {
        replace: (pattern: string, replacement: string) => unknown;
    };
}

const SECURE_PROXY_SCRIPT =
    'https://js.securepro.xyz/sudo-show/1.1/ACiWvWF9tYAez4M498DHs.min.js';
const VAULT_ID = process.env.NEXT_PUBLIC_SUDO_VAULT_ID ?? 'we0dsa28s';

function loadSecureProxyScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof window.SecureProxy !== 'undefined') {
            resolve();
            return;
        }

        const existing = document.querySelector<HTMLScriptElement>(
            `script[src="${SECURE_PROXY_SCRIPT}"]`
        );
        if (existing) {
            existing.addEventListener('load', () => resolve());
            existing.addEventListener('error', () => reject(new Error('SecureProxy load failed')));
            return;
        }

        const script = document.createElement('script');
        script.src = SECURE_PROXY_SCRIPT;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('SecureProxy load failed'));
        document.head.appendChild(script);
    });
}

interface CardSensitiveDataProps {
    subscriptionId: string;
    lastFour?: string;
    disabled?: boolean;
}

export function CardSensitiveData({ subscriptionId, lastFour, disabled }: CardSensitiveDataProps) {
    const uid = useId().replace(/:/g, '-');
    const [revealed, setRevealed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const didRender = useRef(false);

    const panId = `sudo-pan-${uid}`;
    const cvvId = `sudo-cvv-${uid}`;

    async function handleReveal() {
        if (disabled) return;
        if (didRender.current) {
            setRevealed((v) => !v);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await loadSecureProxyScript();

            const res = await fetch(`/api/cards/${subscriptionId}/pan`);
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(body.error ?? 'Failed to fetch card token');
            }

            const { token, sudoCardId } = body;
            const panProxy = window.SecureProxy.create(VAULT_ID);
            panProxy
                .request({
                    name: `pan-${uid}`,
                    method: 'GET',
                    path: `/cards/${sudoCardId}/secure-data/number`,
                    headers: { Authorization: `Bearer ${token}` },
                    htmlWrapper: 'text',
                    jsonPathSelector: 'data.number',
                    serializers: [
                        panProxy.SERIALIZERS.replace(
                            '(\\d{4})(\\d{4})(\\d{4})(\\d{4})',
                            '$1 $2 $3 $4'
                        ),
                    ],
                })
                .render(`#${panId}`);

            const cvvProxy = window.SecureProxy.create(VAULT_ID);
            cvvProxy
                .request({
                    name: `cvv-${uid}`,
                    method: 'GET',
                    path: `/cards/${sudoCardId}/secure-data/cvv2`,
                    headers: { Authorization: `Bearer ${token}` },
                    htmlWrapper: 'text',
                    jsonPathSelector: 'data.cvv2',
                    serializers: [],
                })
                .render(`#${cvvId}`);

            didRender.current = true;
            setRevealed(true);
        } catch (err) {
            console.error('[CardSensitiveData]', err);
            setError('Could not load card details. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-3">
            <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Card Number</p>
                {!revealed && (
                    <p className="font-mono text-sm tracking-widest text-foreground">
                        •••• •••• •••• {lastFour ?? '••••'}
                    </p>
                )}
                <div
                    id={panId}
                    className="font-mono text-sm"
                    style={{ display: revealed ? 'block' : 'none' }}
                />
            </div>

            <div className="space-y-1">
                <p className="text-xs text-muted-foreground">CVV</p>
                {!revealed && (
                    <p className="font-mono text-sm tracking-widest text-foreground">•••</p>
                )}
                <div
                    id={cvvId}
                    className="font-mono text-sm"
                    style={{ display: revealed ? 'block' : 'none' }}
                />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button size="sm" variant="outline" onClick={handleReveal} disabled={loading || disabled} className="gap-2">
                {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : revealed ? (
                    <EyeOff className="h-3 w-3" />
                ) : (
                    <Eye className="h-3 w-3" />
                )}
                {loading ? 'Loading…' : revealed ? 'Hide' : 'Reveal card details'}
            </Button>
        </div>
    );
}
