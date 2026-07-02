"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { dashboardKeys } from "@/lib/query-keys";

interface ConnectProviderButtonsProps {
    provider: "plaid" | "mono";
    preferredProvider: "plaid" | "mono";
    accountId?: string;
    compact?: boolean;
    monoPublicKey?: string;
}

declare global {
    interface Window {
        Plaid?: {
            create: (config: {
                token: string;
                onSuccess: (
                    publicToken: string,
                    metadata: unknown,
                ) => void | Promise<void>;
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

const PLAID_SCRIPT_ID = "plaid-link-script";
const MONO_SCRIPT_ID = "mono-connect-script";

const loadScript = (id: string, src: string): Promise<void> =>
    new Promise((resolve, reject) => {
        if (typeof document === "undefined") return;
        if (document.getElementById(id)) {
            resolve();
            return;
        }
        const script = document.createElement("script");
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
    monoPublicKey = "",
}: ConnectProviderButtonsProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [plaidToken, setPlaidToken] = useState<string | null>(null);
    const [isBusy, setIsBusy] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const sdkLoadRef = useRef<Promise<void> | null>(null);

    useEffect(() => {
        const loadSdk = async () => {
            try {
                if (provider === "plaid") {
                    await loadScript(
                        PLAID_SCRIPT_ID,
                        "https://cdn.plaid.com/link/v2/stable/link-initialize.js",
                    );
                } else if (provider === "mono") {
                    await loadScript(
                        MONO_SCRIPT_ID,
                        "https://connect.withmono.com/connect.js",
                    );
                }
            } catch {
                // Handled at interaction
            }
        };
        sdkLoadRef.current = loadSdk();
    }, [provider]);

    const waitForSdk = async (): Promise<boolean> => {
        try {
            await sdkLoadRef.current;
            return provider === "plaid"
                ? Boolean(window.Plaid)
                : Boolean(window.Connect);
        } catch {
            return false;
        }
    };

    const handlePlaidSetup = async () => {
        setError(null);
        setIsBusy(true);
        const ready = await waitForSdk();
        if (!ready) {
            setError("Plaid SDK not loaded — please try again");
            toast.error("Plaid did not load. Please try again.");
            setIsBusy(false);
            return;
        }
        try {
            let token = plaidToken;
            if (!token) {
                const res = await fetch("/api/connect/plaid/link-token", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify(accountId ? { accountId } : {}),
                });
                if (!res.ok) throw new Error("Init failed");
                const payload = await res.json();
                token = payload.linkToken;
                setPlaidToken(token);
            }
            const handler = window.Plaid!.create({
                token: token!,
                onSuccess: async (publicToken, metadata) => {
                    setIsPending(true);
                    try {
                        const res = await fetch("/api/connect/plaid/exchange", {
                            method: "POST",
                            headers: { "content-type": "application/json" },
                            body: JSON.stringify({ publicToken, metadata }),
                        });
                        if (!res.ok) {
                            setError("Exchange failed");
                            toast.error(
                                "Could not link your Plaid account. Try again.",
                            );
                            setIsBusy(false);
                            return;
                        }
                        await queryClient.invalidateQueries({
                            queryKey: dashboardKeys.connectedAccounts(),
                        });
                        await queryClient.invalidateQueries({
                            queryKey: dashboardKeys.payloads(),
                        });
                        await queryClient.refetchQueries({
                            queryKey: dashboardKeys.connectedAccounts(),
                            type: "active",
                        });
                        toast.success("Plaid account connected.");
                        router.push("/dashboard/connect?connected=plaid");
                        setIsBusy(false);
                        router.refresh();
                    } catch {
                        setError("Exchange error");
                        toast.error(
                            "Could not link your Plaid account. Try again.",
                        );
                        setIsBusy(false);
                    } finally {
                        setIsPending(false);
                    }
                },
                onExit: () => setIsBusy(false),
            });
            handler.open();
        } catch {
            setError("Plaid initialization failed");
            toast.error("Could not start Plaid. Try again.");
            setIsBusy(false);
        }
    };

    const handleMonoSetup = async () => {
        setError(null);
        if (!monoPublicKey) {
            setError("Mono key missing");
            toast.error("Mono is not configured. Try again later.");
            return;
        }
        setIsBusy(true);
        const ready = await waitForSdk();
        if (!ready) {
            setError("Mono SDK not loaded — please try again");
            toast.error("Mono did not load. Please try again.");
            setIsBusy(false);
            return;
        }
        try {
            const mono = new window.Connect!({
                key: monoPublicKey,
                onSuccess: async ({ code }) => {
                    setIsPending(true);
                    try {
                        const res = await fetch("/api/connect/mono/exchange", {
                            method: "POST",
                            headers: { "content-type": "application/json" },
                            body: JSON.stringify({ code }),
                        });
                        if (!res.ok) {
                            setError("Exchange failed");
                            toast.error(
                                "Could not link your Mono account. Try again.",
                            );
                            setIsBusy(false);
                            return;
                        }
                        await queryClient.invalidateQueries({
                            queryKey: dashboardKeys.connectedAccounts(),
                        });
                        await queryClient.invalidateQueries({
                            queryKey: dashboardKeys.payloads(),
                        });
                        await queryClient.refetchQueries({
                            queryKey: dashboardKeys.connectedAccounts(),
                            type: "active",
                        });
                        toast.success("Mono account connected.");
                        router.push("/dashboard/connect?connected=mono");
                        setIsBusy(false);
                        router.refresh();
                    } catch {
                        setError("Exchange error");
                        toast.error(
                            "Could not link your Mono account. Try again.",
                        );
                        setIsBusy(false);
                    } finally {
                        setIsPending(false);
                    }
                },
                onClose: () => setIsBusy(false),
            });
            if (mono.setup) mono.setup();
            mono.open();
        } catch {
            setError("Mono interaction failed");
            toast.error("Could not start Mono. Try again.");
            setIsBusy(false);
        }
    };

    const isPreferred = provider === preferredProvider;

    return (
        <div className={compact ? "" : "w-full"}>
            {isPending && (
                <div className="absolute inset-0 z-10 bg-bg-surface/60 backdrop-blur-xs flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 animate-pulse">
                        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand border-t-transparent" />
                        <p className="text-xs font-bold uppercase tracking-widest text-brand">
                            Connecting...
                        </p>
                    </div>
                </div>
            )}

            {error && (
                <Badge variant="danger" className="mb-3 w-full justify-center">
                    {error}
                </Badge>
            )}

            <Button
                type="button"
                variant={isPreferred ? "primary" : "secondary"}
                size={compact ? "sm" : "default"}
                onClick={
                    provider === "plaid" ? handlePlaidSetup : handleMonoSetup
                }
                disabled={isBusy || isPending}
                className={compact ? "h-8" : "w-full mt-4"}
            >
                {isBusy || isPending
                    ? `Opening ${provider}...`
                    : accountId
                      ? `Reconnect ${provider}`
                      : `Setup ${provider}`}
            </Button>
        </div>
    );
};
