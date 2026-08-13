'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Lock, Snowflake, Unlock, Wifi } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

interface FreezeCardDemoProps {
    merchant?: string;
    amount?: string;
    last4?: string;
    currency?: 'NGN' | 'USD';
    expiry?: string;
}

/**
 * FreezeCardDemo — Redesigned to mirror the exact VirtualCard component
 * used on Unplug's billing page for high fidelity & product accuracy.
 */
export function FreezeCardDemo({
    merchant = 'Streaming Plan',
    amount = '₦4,500',
    last4 = '4471',
    currency = 'NGN',
    expiry = '08/28',
}: FreezeCardDemoProps) {
    const [frozen, setFrozen] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    return (
        <div className="w-full max-w-sm sm:max-w-md mx-auto">
            {/* Card Shell Container */}
            <div className="relative rounded-[24px] border border-line bg-white p-3.5 sm:p-4 transition-all duration-300">

                {/* Main Credit Card Face (Aspect ratio matches real credit card) */}
                <div
                    className={cn(
                        'relative aspect-[1.586/1] w-full select-none overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-300',
                        frozen
                            ? 'bg-neutral-800 text-white'
                            : 'bg-linear-to-br from-ink via-[#2D2620] to-ink text-white',
                    )}
                >
                    {/* Frozen Dark Blur Overlay */}
                    {frozen && (
                        <motion.div
                            initial={prefersReducedMotion ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.25 }}
                            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs p-4 text-center"
                        >
                            <div className="flex items-center gap-2 rounded-full bg-black/60 border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white">
                                <Lock className="h-3.5 w-3.5 text-orange" />
                                <span>Card Frozen</span>
                            </div>
                            <p className="mt-2 text-[11px] text-white/80 font-medium">
                                Charges from {merchant} will be declined
                            </p>
                        </motion.div>
                    )}

                    {/* Card Content Layout */}
                    <div className="relative flex h-full flex-col justify-between z-10">
                        {/* Header: Merchant Name & Contactless Wifi */}
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <span className="block text-[10px] uppercase tracking-wider text-white/50 font-semibold">
                                    Merchant Card
                                </span>
                                <span className="mt-0.5 block truncate text-sm font-bold uppercase tracking-widest text-white">
                                    {merchant}
                                </span>
                            </div>
                            <Wifi className="h-4 w-4 shrink-0 rotate-90 text-white/60" />
                        </div>

                        {/* Middle: Masked PAN Number */}
                        <div className="my-auto py-1">
                            <div className="font-mono text-base sm:text-lg font-bold tracking-[0.22em] text-white/90">
                                •••• •••• •••• {last4}
                            </div>
                        </div>

                        {/* Footer: Expiry, Currency Tag & Mastercard Brand Circles */}
                        <div className="flex items-end justify-between border-t border-white/15 pt-2.5">
                            <div>
                                <span className="block text-[9px] uppercase tracking-widest text-white/50">
                                    EXP / CURRENCY
                                </span>
                                <span className="mt-0.5 block font-mono text-[11px] font-semibold tracking-wider text-white/80">
                                    {expiry} · {currency} VIRTUAL
                                </span>
                            </div>

                            {/* Mastercard Red & Amber Circles */}
                            <div className="flex items-center -space-x-2">
                                <div className="h-6 w-6 rounded-full bg-red-500/90" />
                                <div className="h-6 w-6 rounded-full bg-amber-400/90" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sub-Card Charge & Control Panel */}
                <div className="mt-3 rounded-xl border border-line bg-bg-surface p-3 sm:p-3.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-ink-70 font-medium">Monthly Charge</span>
                        <span className={cn('font-mono font-semibold text-ink', frozen && 'line-through text-ink-70')}>
                            {amount}/mo
                        </span>
                    </div>

                    {/* Interactive Freeze / Unfreeze Action Button */}
                    <button
                        type="button"
                        onClick={() => setFrozen((prev) => !prev)}
                        aria-pressed={frozen}
                        className={cn(
                            'mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
                            frozen
                                ? 'bg-orange text-ink hover:bg-orange-deep'
                                : 'border border-line bg-white text-ink hover:border-ink',
                        )}
                    >
                        {frozen ? (
                            <>
                                <Unlock className="h-3.5 w-3.5" />
                                <span>Unfreeze Card (Allow Charges)</span>
                            </>
                        ) : (
                            <>
                                <Snowflake className="h-3.5 w-3.5 text-orange" />
                                <span>Freeze Card (Block Charges)</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <span role="status" aria-live="polite" className="sr-only">
                {frozen ? `${merchant} card frozen. Next charge blocked.` : `${merchant} card active.`}
            </span>
        </div>
    );
}