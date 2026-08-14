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
        sm: 'h-6',
        md: 'h-8',
        lg: 'h-10',
    };

    const textSizes = {
        sm: 'text-base',
        md: 'text-xl sm:text-2xl',
        lg: 'text-2xl sm:text-3xl',
    };

    return (
        <div className={cn('inline-flex items-center gap-3 select-none group', className)}>
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