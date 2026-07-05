"use client";

import { useState, type FormEvent } from "react";
import { Lock, Unlock, Wifi } from "lucide-react";
import { toast } from "sonner";
import { CardSensitiveData } from "@/components/cards/CardSensitiveData";
import { Input } from "@/components/ui/Input";

interface CardData {
    sudo_card_id: string;
    currency: "NGN" | "USD";
    last_four: string;
    expiry_month: string;
    expiry_year: string;
    status: "active" | "inactive" | "closed";
    migration_status: string;
}

interface VirtualCardProps {
    subscriptionId: string;
    serviceName: string;
    card: CardData;
    onStatusChange?: (newStatus: string) => void;
}

export function VirtualCard({
    subscriptionId,
    serviceName,
    card,
    onStatusChange,
}: VirtualCardProps) {
    const [isTogglingFreeze, setIsTogglingFreeze] = useState(false);
    const [isChangingPin, setIsChangingPin] = useState(false);
    const [oldPin, setOldPin] = useState("");
    const [newPin, setNewPin] = useState("");

    const isFrozen = card.status === "inactive";
    const expiry = `${card.expiry_month.padStart(2, "0")}/${card.expiry_year.slice(-2)}`;

    async function handleChangePin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!oldPin || !newPin) {
            toast.error("Both PIN fields are required.");
            return;
        }

        setIsChangingPin(true);
        try {
            const res = await fetch(`/api/cards/${subscriptionId}/pin`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ oldPin, newPin }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? "Could not change PIN.");
            }

            toast.success("PIN updated successfully.");
            setOldPin("");
            setNewPin("");
        } catch (err: any) {
            toast.error(err.message ?? "Could not change PIN.");
        } finally {
            setIsChangingPin(false);
        }
    }

    async function handleFreezeToggle() {
        setIsTogglingFreeze(true);
        const action = isFrozen ? "unfreeze" : "freeze";
        try {
            const res = await fetch(`/api/cards/${subscriptionId}/freeze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(
                    err.error ?? "Could not update card. Try again.",
                );
            }
            const data = await res.json();
            onStatusChange?.(data.status);
            toast.success(
                action === "freeze"
                    ? "Card frozen — no charges will go through"
                    : "Card unfrozen",
            );
        } catch (err: any) {
            toast.error(err.message ?? "Could not update card. Try again.");
        } finally {
            setIsTogglingFreeze(false);
        }
    }

    return (
        <div className="mx-auto w-full max-w-sm space-y-3">
            {/* Card face — a fixed aspect ratio keeps it looking like a real card at any width */}
            <div
                className={`
                    relative aspect-[1.586/1] w-full select-none overflow-hidden rounded-2xl
                    p-4 shadow-lg shadow-black/10 ring-1 ring-black/5 transition-all duration-300 sm:p-5
                    ${
                        isFrozen
                            ? "bg-linear-to-br from-text-muted to-text-secondary grayscale"
                            : card.currency === "USD"
                              ? "bg-linear-to-br from-[#232219] to-text-primary"
                              : "bg-linear-to-br from-brand to-brand-dark"
                    }
                `}
            >
                {isFrozen && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                        <div className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                            <Lock className="h-3.5 w-3.5" />
                            Card frozen
                        </div>
                    </div>
                )}

                <div className="relative flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                        <span className="truncate text-xs font-bold uppercase tracking-widest text-white/70 sm:text-sm">
                            {serviceName}
                        </span>
                        <Wifi className="h-4 w-4 shrink-0 rotate-90 text-white/50" />
                    </div>

                    <div className="space-y-2.5">
                        <CardSensitiveData
                            subscriptionId={subscriptionId}
                            lastFour={card.last_four}
                            expiry={expiry}
                            disabled={isFrozen}
                        />

                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                                {card.currency} · Virtual
                            </span>
                            <div className="flex -space-x-2.5">
                                <div className="h-5 w-5 rounded-full bg-red-500/90" />
                                <div className="h-5 w-5 rounded-full bg-amber-400/90" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleFreezeToggle}
                disabled={isTogglingFreeze}
                className={`
                    flex w-full items-center justify-center gap-1.5 rounded-btn border py-2.5 text-sm font-semibold
                    transition-all disabled:cursor-not-allowed disabled:opacity-40
                    ${
                        isFrozen
                            ? "border-success/30 bg-success-light text-success hover:bg-success-light"
                            : "border-border-strong bg-bg-surface text-text-secondary hover:border-text-muted hover:text-text-primary"
                    }
                `}
            >
                {isTogglingFreeze ? (
                    <span className="animate-pulse">
                        {isFrozen ? "Unfreezing…" : "Freezing…"}
                    </span>
                ) : isFrozen ? (
                    <>
                        <Unlock className="h-3.5 w-3.5" /> Unfreeze card
                    </>
                ) : (
                    <>
                        <Lock className="h-3.5 w-3.5" /> Freeze card
                    </>
                )}
            </button>

            <form onSubmit={handleChangePin} className="space-y-3">
                <div className="rounded-2xl border border-border bg-bg-base p-4">
                    <div className="mb-3">
                        <p className="text-sm font-semibold text-text-primary">
                            Change card PIN
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                            Use the current PIN and choose a new one.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-text-secondary">
                                Current PIN
                            </label>
                            <Input
                                type="password"
                                value={oldPin}
                                onChange={(event) => setOldPin(event.target.value)}
                                placeholder="Enter current PIN"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-text-secondary">
                                New PIN
                            </label>
                            <Input
                                type="password"
                                value={newPin}
                                onChange={(event) => setNewPin(event.target.value)}
                                placeholder="Enter new PIN"
                                required
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isChangingPin || isTogglingFreeze}
                    className="inline-flex w-full items-center justify-center rounded-btn bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isChangingPin ? "Updating PIN…" : "Update PIN"}
                </button>
            </form>
        </div>
    );
}
