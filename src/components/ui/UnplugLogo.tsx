import { cn } from '@/lib/utils';

interface UnplugLogoProps {
    className?: string;
    iconOnly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    tone?: 'default' | 'inverse';
}

/**
 * UnplugLogo — Modern, iconic brand mark for Unplug.
 * Features a power plug disconnect symbol fused inside a credit card silhouette.
 */
export function UnplugLogo({
    className,
    iconOnly = false,
    size = 'md',
    tone = 'default',
}: UnplugLogoProps) {
    const isInverse = tone === 'inverse';

    const iconSizes = {
        sm: 'h-8 w-8 rounded-lg',
        md: 'h-9 w-9 rounded-xl',
        lg: 'h-11 w-11 rounded-2xl',
    };

    const textSizes = {
        sm: 'text-lg',
        md: 'text-xl sm:text-2xl',
        lg: 'text-2xl sm:text-3xl',
    };

    return (
        <div className={cn('inline-flex items-center gap-2.5 select-none group', className)}>
            {/* Iconic Brand Mark */}
            <div
                className={cn(
                    'flex shrink-0 items-center justify-center bg-orange text-ink font-bold transition-transform duration-300 group-hover:scale-105',
                    iconSizes[size],
                )}
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-ink"
                >
                    {/* Power Plug Prongs */}
                    <path d="M9 3v4" />
                    <path d="M15 3v4" />
                    {/* Main Plug Body */}
                    <path d="M7 7h10v3a5 5 0 0 1-10 0V7z" />
                    {/* Disconnect Cable */}
                    <path d="M12 15v6" />
                    {/* Instant Disconnect Slash */}
                    <path d="M4 20L20 4" className="stroke-ink stroke-[3]" />
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
