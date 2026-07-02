"use client";

import { useState, useRef, useId } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
    "https://js.securepro.xyz/sudo-show/1.1/ACiWvWF9tYAez4M498DHs.min.js";
const VAULT_ID = process.env.NEXT_PUBLIC_SUDO_VAULT_ID ?? "we0dsa28s";

function loadSecureProxyScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof window.SecureProxy !== "undefined") {
            resolve();
            return;
        }

        const existing = document.querySelector<HTMLScriptElement>(
            `script[src="${SECURE_PROXY_SCRIPT}"]`,
        );
        if (existing) {
            existing.addEventListener("load", () => resolve());
            existing.addEventListener("error", () =>
                reject(new Error("SecureProxy load failed")),
            );
            return;
        }

        const script = document.createElement("script");
        script.src = SECURE_PROXY_SCRIPT;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("SecureProxy load failed"));
        document.head.appendChild(script);
    });
}

interface CardSensitiveDataProps {
    subscriptionId: string;
    lastFour?: string;
    expiry?: string;
    disabled?: boolean;
}

/**
 * Renders the front-of-card sensitive fields (number, expiry, CVV) on top
 * of the branded, colored virtual card face in <VirtualCard />.
 *
 * IMPORTANT — Secure Proxy Show renders revealed values inside a real
 * cross-origin <iframe> (docs.sudo.africa/docs/displaying-sensitive-card-data).
 * That means:
 *   - We CAN size/position the <iframe> element itself via CSS — it's a
 *     normal DOM node in our own document.
 *   - We CANNOT change the text color/font *inside* it. No CSS reaches
 *     across that boundary. Revealed digits render in Secure Proxy's own
 *     default color, not ours.
 * Only the masked dot placeholder below is our own markup and fully
 * stylable — that's why it can be pure white while the revealed value
 * may not be.
 *
 * This must stay ONE request per field (matches Sudo's documented
 * example exactly). Splitting the PAN into multiple per-group requests
 * is not a supported pattern — every iframe ends up rendering the full
 * unfiltered value and they overlap.
 */
export function CardSensitiveData({
    subscriptionId,
    lastFour,
    expiry,
    disabled,
}: CardSensitiveDataProps) {
    const uid = useId().replace(/:/g, "-");
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
                throw new Error(body.error ?? "Failed to fetch card token");
            }

            const { token, sudoCardId } = body;

            // Single request, single target — the replace serializer
            // inserts the group spaces itself in one pass.
            const panProxy = window.SecureProxy.create(VAULT_ID);
            panProxy
                .request({
                    name: `pan-${uid}`,
                    method: "GET",
                    path: `/cards/${sudoCardId}/secure-data/number`,
                    headers: { Authorization: `Bearer ${token}` },
                    htmlWrapper: "text",
                    jsonPathSelector: "data.number",
                    serializers: [
                        panProxy.SERIALIZERS.replace(
                            "(\\d{4})(\\d{4})(\\d{4})(\\d{4})",
                            "$1 $2 $3 $4 ",
                        ),
                    ],
                })
                .render(`#${panId}`);

            const cvvProxy = window.SecureProxy.create(VAULT_ID);
            cvvProxy
                .request({
                    name: `cvv-${uid}`,
                    method: "GET",
                    path: `/cards/${sudoCardId}/secure-data/cvv2`,
                    headers: { Authorization: `Bearer ${token}` },
                    htmlWrapper: "text",
                    jsonPathSelector: "data.cvv2",
                    serializers: [],
                })
                .render(`#${cvvId}`);

            didRender.current = true;
            setRevealed(true);
        } catch (err) {
            console.error("[CardSensitiveData]", err);
            const message = "Could not load card details. Try again.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-3">
            <style>{`
                /*
                 * Controls the OUTER <iframe> box only — width, height,
                 * border, background. Never its internal text/font/color;
                 * that's owned by Secure Proxy and not reachable from here.
                 * Sudo's own basic example needed an explicit iframe height
                 * override too, so this isn't optional — an unconstrained
                 * iframe is what blew the layout out in your screenshot.
                 */
                #${panId} iframe {
                    display: block;
                    width: 100%;
                    max-width: 210px;
                    height: 22px;
                    border: none;
                    background: transparent;
                }
                #${cvvId} iframe {
                    display: block;
                    width: 44px;
                    height: 18px;
                    border: none;
                    background: transparent;
                }
            `}</style>
            <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-white/50">
                        Card number
                    </p>
                    {!revealed && (
                        <p className="truncate font-mono text-base tracking-[0.15em] text-white sm:text-lg">
                            •••• •••• •••• {lastFour ?? "••••"}
                        </p>
                    )}
                    <div
                        id={panId}
                        className="font-mono text-base sm:text-lg"
                        style={{ display: revealed ? "block" : "none" }}
                    />
                </div>

                <button
                    type="button"
                    onClick={handleReveal}
                    disabled={loading || disabled}
                    aria-label={
                        revealed ? "Hide card details" : "Reveal card details"
                    }
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {loading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : revealed ? (
                        <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                        <Eye className="h-3.5 w-3.5" />
                    )}
                </button>
            </div>

            <div className="flex items-end justify-between gap-3">
                {expiry && (
                    <div>
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-white/50">
                            Expires
                        </p>
                        <p className="font-mono text-xs text-white/90 sm:text-sm">
                            {expiry}
                        </p>
                    </div>
                )}

                <div>
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-white/50">
                        CVV
                    </p>
                    {!revealed && (
                        <p className="font-mono text-xs tracking-widest text-white sm:text-sm">
                            •••
                        </p>
                    )}
                    <div
                        id={cvvId}
                        className="font-mono text-xs sm:text-sm"
                        style={{ display: revealed ? "block" : "none" }}
                    />
                </div>
            </div>

            {error && (
                <p className="rounded-lg bg-black/30 px-2.5 py-1.5 text-xs text-red-200">
                    {error}
                </p>
            )}
        </div>
    );
}