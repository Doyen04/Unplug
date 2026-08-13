import { cn } from '@/lib/utils';

interface UnplugLogoProps {
    className?: string;
    iconOnly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    tone?: 'default' | 'inverse';
}

/**
 * UnplugLogo — Dual-tone Unplug Icon & Wordmark.
 * Features the electric power plug on the left in dark ink (#1F1A16)
 * unplugging from the credit card EMV chip on the right in brand orange (#FF5C35),
 * with NO background container box.
 */
export function UnplugLogo({
    className,
    iconOnly = false,
    size = 'md',
    tone = 'default',
}: UnplugLogoProps) {
    const isInverse = tone === 'inverse';

    const iconSizes = {
        sm: 'h-6 w-7',
        md: 'h-8 w-9',
        lg: 'h-10 w-11',
    };

    const textSizes = {
        sm: 'text-base',
        md: 'text-xl sm:text-2xl',
        lg: 'text-2xl sm:text-3xl',
    };

    const darkColor = isInverse ? '#FFFFFF' : '#1F1A16';
    const brandOrange = '#FF5C35';

    return (
        <div className={cn('inline-flex items-center gap-3 select-none group', className)}>
            {/* Dual-Tone Logo Mark: Black Plug (Left) + Orange EMV Chip (Right) */}
            <div className={cn('flex shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105', iconSizes[size])}>
                <svg
                    viewBox="0 0 32 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-full w-full"
                >
                    {/* LEFT SIDE: Electric Power Plug in Dark Ink */}
                    <g stroke={darkColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        {/* Power Cable coming from left */}
                        <path d="M2 12h5" />
                        {/* Plug Head Body */}
                        <path d="M7 6h6v12H7z" fill={darkColor} fillOpacity="0.08" />
                        {/* Plug Prongs extending right */}
                        <path d="M13 9h4" />
                        <path d="M13 15h4" />
                    </g>

                    {/* RIGHT SIDE: Credit Card EMV Chip in BRAND ORANGE (#FF5C35) */}
                    <g stroke={brandOrange} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        {/* EMV Chip Outer Shell */}
                        <rect x="20" y="6" width="10" height="12" rx="2" fill={brandOrange} fillOpacity="0.15" />
                        {/* Internal EMV Contact Lines */}
                        <path d="M20 12h10" />
                        <path d="M25 6v12" />
                        <path d="M20 9.5h10" />
                        <path d="M20 14.5h10" />
                    </g>
                </svg>
            </div>

            {/* Typography */}
            {!iconOnly && (
                <span
                    className={cn(
                        'font-display font-extrabold tracking-tight transition-colors',
                        textSizes[size],
                        isInverse ? 'text-white' : 'text-ink',
                    )}
                >
                    Unplug<span className="text-orange">.</span>
                </span>
            )}
        </div>
    );
}
