'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';

interface FreezeCardDemoProps {
    merchant?: string;
    amount?: string;
    last4?: string;
}

export function FreezeCardDemo({ merchant = 'Streaming Plan', amount = '₦4,500/mo', last4 = '4471' }: FreezeCardDemoProps) {
    const [frozen, setFrozen] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    const toggle = () => setFrozen((value) => !value);

    return (
        <motion.button
            type="button"
            onClick={toggle}
            aria-pressed={frozen}
            className="group relative w-full max-w-[360px] rounded-[24px] border border-line bg-orange p-6 text-left text-ink outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 sm:p-7"
            animate={prefersReducedMotion ? undefined : { backgroundColor: frozen ? '#DCEEF5' : '#FF5C35' }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: 'easeOut' }}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/80">{frozen ? 'Frozen' : 'Active'}</p>
                    <p className="mt-2 font-display text-[clamp(28px,4vw,34px)] leading-none tracking-tight text-ink">{merchant}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-ink">
                    <span aria-hidden="true" className="text-xl">❄</span>
                </div>
            </div>

            <div className="mt-8 rounded-[20px] border border-white/30 bg-white/20 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between text-sm text-ink/85">
                    <span>Monthly charge</span>
                    <span className={frozen ? 'font-mono text-lg font-medium line-through tabular-nums' : 'font-mono text-lg font-medium tabular-nums'}>{amount}</span>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4 text-sm text-ink/85">
                    <div>
                        <p className="text-ink/70">Card number</p>
                        <p className="mt-1 font-mono tracking-[0.25em] tabular-nums">•••• •••• •••• {last4}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-ink/70">Status</p>
                        <p className="mt-1 font-semibold">{frozen ? '❄ Frozen' : 'Active'}</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-full border border-white/25 bg-white/15 px-4 py-3 text-sm font-medium backdrop-blur-sm">
                <span>{frozen ? 'Charge blocked. Unfreeze anytime.' : 'Tap to freeze this recurring charge.'}</span>
                <span aria-hidden="true">→</span>
            </div>

            <span aria-live="polite" className="sr-only">
                {frozen ? 'Card frozen. This subscription is now blocked.' : 'Card active.'}
            </span>
        </motion.button>
    );
}
