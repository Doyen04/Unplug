'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Snowflake } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

interface FreezeCardDemoProps {
    merchant?: string;
    amount?: string;
    last4?: string;
}

/**
 * The brand signature: a real, tappable card rather than a video or a static
 * image. Deliberately uses a generic merchant name — never a real brand — so
 * nothing here implies an endorsement.
 */
export function FreezeCardDemo({
    merchant = 'Streaming Plan',
    amount = '₦4,500',
    last4 = '4471',
}: FreezeCardDemoProps) {
    const [frozen, setFrozen] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    return (
        <div className="w-full">
            <motion.button
                type="button"
                onClick={() => setFrozen((value) => !value)}
                aria-pressed={frozen}
                className="group relative block w-full overflow-hidden rounded-[24px] p-6 text-left text-ink shadow-[0_30px_70px_-40px_rgba(31,26,22,0.55)] outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-cream sm:p-7"
                animate={prefersReducedMotion ? undefined : { backgroundColor: frozen ? '#DCEEF5' : '#FF5C35' }}
                initial={false}
                style={prefersReducedMotion ? { backgroundColor: frozen ? '#DCEEF5' : '#FF5C35' } : undefined}
                transition={{ duration: 0.35, ease: 'easeOut' }}
            >
                {/* Frost texture, only present once frozen. */}
                <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.75),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.5),transparent_40%)]"
                    initial={false}
                    animate={{ opacity: frozen ? 1 : 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
                />

                <span className="relative block">
                    <span className="flex items-start justify-between gap-4">
                        <span className="block">
                            <span
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors',
                                    frozen ? 'bg-frost-deep text-frost-wash' : 'bg-ink/12 text-ink',
                                )}
                            >
                                {frozen ? <Snowflake aria-hidden="true" className="h-3 w-3" /> : null}
                                {frozen ? 'Frozen' : 'Active'}
                            </span>
                            <span className="mt-3 block font-display text-[clamp(26px,3.6vw,32px)] leading-tight tracking-tight">
                                {merchant}
                            </span>
                        </span>

                        <motion.span
                            aria-hidden="true"
                            className={cn(
                                'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors',
                                frozen ? 'bg-frost-deep text-frost-wash' : 'bg-ink/12 text-ink',
                            )}
                            animate={prefersReducedMotion ? undefined : { rotate: frozen ? 0 : -12, scale: frozen ? 1 : 0.94 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                        >
                            <Snowflake className="h-5 w-5" />
                        </motion.span>
                    </span>

                    <span className="mt-7 block rounded-[18px] border border-white/35 bg-white/25 p-4 backdrop-blur-sm">
                        <span className="flex items-center justify-between text-[14px]">
                            <span className="text-ink/75">Monthly charge</span>
                            <span
                                className={cn(
                                    'font-mono text-[17px] font-medium tabular-nums transition-opacity',
                                    frozen && 'line-through opacity-60',
                                )}
                            >
                                {amount}
                            </span>
                        </span>

                        <span className="mt-5 flex items-end justify-between border-t border-white/30 pt-4 text-[14px]">
                            <span className="block">
                                <span className="block text-[11px] uppercase tracking-[0.08em] text-ink/65">Card</span>
                                <span className="mt-1 block font-mono tabular-nums tracking-[0.18em]">•••• {last4}</span>
                            </span>
                            <span className="block text-right">
                                <span className="block text-[11px] uppercase tracking-[0.08em] text-ink/65">Next charge</span>
                                <span className="mt-1 block font-medium">{frozen ? 'Blocked' : '12 Aug'}</span>
                            </span>
                        </span>
                    </span>

                    <span
                        className={cn(
                            'mt-5 flex items-center justify-between gap-3 rounded-full px-4 py-3 text-[14px] font-medium transition-colors',
                            frozen ? 'bg-frost-deep text-frost-wash' : 'bg-ink text-cream',
                        )}
                    >
                        {frozen ? 'Charge blocked. Tap to unfreeze.' : 'Tap to freeze this charge.'}
                        <span aria-hidden="true">{frozen ? '↺' : '→'}</span>
                    </span>
                </span>
            </motion.button>

            <span role="status" aria-live="polite" className="sr-only">
                {frozen ? `${merchant} card frozen. The next charge will be declined.` : `${merchant} card active.`}
            </span>
        </div>
    );
}