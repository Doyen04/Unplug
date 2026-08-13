import Link from 'next/link';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

const base =
    'inline-flex items-center justify-center rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-cream';

const variants = {
    /** Orange pill. Ink-on-orange is 5.6:1 — white would only reach 3.1:1. */
    primary: 'min-h-12 bg-orange px-7 text-ink hover:bg-orange-deep',
    secondary: 'min-h-12 border border-line bg-bg-surface px-7 text-ink hover:border-ink',
    /** For use on the dark security section. */
    inverse: 'min-h-12 bg-white px-7 text-ink hover:bg-slate-100',
    quiet: 'min-h-12 gap-2 px-1 text-ink hover:text-orange',
} as const;

interface CtaLinkProps extends Omit<ComponentProps<typeof Link>, 'className'> {
    variant?: keyof typeof variants;
    className?: string;
}

/**
 * The single "Get started free" pill used across the marketing pages.

 */
export function CtaLink({ variant = 'primary', className, ...props }: CtaLinkProps) {
    return <Link className={cn(base, variants[variant], className)} {...props} />;
}
