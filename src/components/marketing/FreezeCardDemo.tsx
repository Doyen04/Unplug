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
 * FreezeCardDemo — Crafted with authentic 100% real-life credit card details:
 * Metallic golden EMV chip, contactless wifi wave, embossed PAN typography,
 * metallic glare finish, and official Mastercard branding.
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
            {/* Card Outer Shell */}
            <div className="relative rounded-[24px] border border-line bg-white p-3.5 sm:p-4 transition-all duration-300">

                {/* Authentic Real-Life Credit Card Face */}
                <div
                    className={cn(
                        'relative aspect-[1.586/1] w-full select-none overflow-hidden rounded-[16px] p-5 sm:p-6 border border-white/20 shadow-xl transition-all duration-300',
                        frozen
                            ? 'bg-gradient-to-br from-[#262626] via-[#1A1A1A] to-[#121212] text-white grayscale'
                            : 'bg-gradient-to-br from-[#1C1A17] via-[#2D2620] to-[#12100E] text-white',
                    )}
                >
                    {/* Glossy Metallic Light Reflective Sheen */}
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15" />

                    {/* Frozen Dark Blur Overlay */}
                    {frozen && (
                        <motion.div
                            initial={prefersReducedMotion ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.25 }}
                            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xs p-4 text-center"
                        >
                            <div className="flex items-center gap-2 rounded-full bg-black/70 border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white">
                                <Lock className="h-3.5 w-3.5 text-orange" />
                                <span>Card Frozen</span>
                            </div>
                            <p className="mt-2 text-[11px] text-white/80 font-medium">
                                Charges from {merchant} will be declined
                            </p>
                        </motion.div>
                    )}

                    {/* Card Content Layer */}
                    <div className="relative flex h-full flex-col justify-between z-10">
                        {/* Header: Merchant Title & Contactless Wifi */}
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-white/50 font-bold">
                                    MERCHANT VIRTUAL CARD
                                </span>
                                <span className="mt-0.5 block truncate font-display text-sm font-bold uppercase tracking-widest text-white">
                                    {merchant}
                                </span>
                            </div>
                            <Wifi className="h-4 w-4 shrink-0 rotate-90 text-white/70" />
                        </div>

                        {/* Middle Row: Realistic EMV Golden Chip & Masked PAN Number */}
                        <div className="my-auto flex items-center gap-4 py-1">
                            {/* Metallic Golden EMV Smart Chip */}
                            <div className="relative h-7 w-9 shrink-0 rounded-[5px] bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 p-[1px] border border-amber-600/40 shadow-xs overflow-hidden">
                                <div className="h-full w-full rounded-[4px] border border-amber-800/30 grid grid-cols-2 gap-0.5 p-[2px]">
                                    <div className="border-r border-b border-amber-800/30" />
                                    <div className="border-b border-amber-800/30" />
                                    <div className="border-r border-amber-800/30" />
                                    <div />
                                </div>
                            </div>

                            {/* Masked Card PAN */}
                            <div className="font-mono text-base sm:text-lg font-bold tracking-[0.22em] text-white/95 drop-shadow-sm">
                                •••• •••• •••• {last4}
                            </div>
                        </div>

                        {/* Footer: Expiry, Currency & Mastercard Brand Circles */}
                        <div className="flex items-end justify-between border-t border-white/15 pt-2.5">
                            <div>
                                <span className="block font-mono text-[8px] uppercase tracking-widest text-white/50 font-bold">
                                    VALID THRU / CURRENCY
                                </span>
                                <span className="mt-0.5 block font-mono text-[11px] font-bold tracking-wider text-white/90">
                                    {expiry} · {currency} VIRTUAL
                                </span>
                            </div>

                            {/* Official Mastercard Red & Yellow Overlapping Circles */}
                            <div className="flex items-center -space-x-2.5">
                                <div className="h-6 sm:h-7 w-6 sm:w-7 rounded-full bg-[#EB001B]" />
                                <div className="h-6 sm:h-7 w-6 sm:w-7 rounded-full bg-[#F79E1B] mix-blend-screen opacity-95" />
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

                    {/* Freeze / Unfreeze Interactive Button */}
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