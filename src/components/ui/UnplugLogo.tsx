import Image from 'next/image';
import { cn } from '@/lib/utils';

interface UnplugLogoProps {
    className?: string;
    iconOnly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    tone?: 'default' | 'inverse';
}

/**
 * UnplugLogo — Dual-tone plug & chip mark on a light base (public/images/logo.png)
 * with the "Unplug" wordmark. On dark backgrounds pass tone="inverse", which inverts
 * the mark so the light base becomes dark.
 */
export function UnplugLogo({
    className,
    iconOnly = false,
    size = 'md',
    tone = 'default',
}: UnplugLogoProps) {
    const isInverse = tone === 'inverse';

    const iconHeights = {
        sm: 'h-8 sm:h-9',
        md: 'h-11 sm:h-12',
        lg: 'h-14 sm:h-16',
    };

    const textSizes = {
        sm: 'text-xs sm:text-sm',
        md: 'text-sm sm:text-base',
        lg: 'text-base sm:text-lg',
    };

    return (
        <div className={cn('inline-flex items-center gap-2 sm:gap-2.5 select-none group', className)}>
            <div className={cn('shrink-0 transition-transform duration-300 group-hover:scale-105', iconHeights[size])}>
                <Image
                    src="/images/unplug-logo.svg"
                    alt=""
                    width={500}
                    height={500}
                    className={cn('h-full w-auto', isInverse && 'invert')}
                />
            </div>

            {!iconOnly && (
                <span
                    className={cn(
                        'font-display font-bold tracking-tight transition-colors',
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