import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface SectionTitleProps {
    eyebrow: string;
    title: ReactNode;
    description?: ReactNode;
    /** Use on the dark security section, where ink-on-cream inverts. */
    tone?: 'default' | 'inverse';
    align?: 'left' | 'center';
    className?: string;
}

export function SectionTitle({
    eyebrow,
    title,
    description,
    tone = 'default',
    align = 'left',
    className,
}: SectionTitleProps) {
    const inverse = tone === 'inverse';

    return (
        <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
            <p
                className={cn(
                    'text-[13px] font-semibold uppercase tracking-[0.08em]',
                    inverse ? 'text-frost-wash' : 'text-orange',
                )}
            >
                {eyebrow}
            </p>
            <h2
                className={cn(
                    'mt-4 font-display text-[clamp(30px,4.4vw,50px)] leading-[1.06] tracking-tight text-balance',
                    inverse ? 'text-cream' : 'text-ink',
                )}
            >
                {title}
            </h2>
            {description ? (
                <p
                    className={cn(
                        'mt-5 max-w-2xl text-[17px] leading-8',
                        align === 'center' && 'mx-auto',
                        inverse ? 'text-cream/75' : 'text-ink-70',
                    )}
                >
                    {description}
                </p>
            ) : null}
        </div>
    );
}
