'use client';

import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface Testimonial {
    quote: string;
    name: string;
    title: string;
    initials: string;
    rating: number;
}

const testimonials: readonly Testimonial[] = [
    {
        quote: "I was paying ₦47,000/month on subscriptions I'd forgotten. Unplug found all of them in under a minute.",
        name: 'Adaeze O.',
        title: 'Product Designer, Lagos',
        initials: 'AO',
        rating: 5,
    },
    {
        quote: "Froze my ChatGPT card during a tight month. Unfroze it two weeks later. No drama.",
        name: 'Emeka K.',
        title: 'Software Engineer, Abuja',
        initials: 'EK',
        rating: 5,
    },
    {
        quote: "The 3-day warning before charges is the feature I didn't know I needed.",
        name: 'Funke A.',
        title: 'Content Creator, Ibadan',
        initials: 'FA',
        rating: 5,
    },
    {
        quote: "I've tried three subscription trackers. Unplug is the only one that actually stops the charge.",
        name: 'Tunde M.',
        title: 'Freelancer, Lagos',
        initials: 'TM',
        rating: 5,
    },
] as const;

function Stars({ count }: { count: number }) {
    return (
        <span className="flex gap-0.5">
            {Array.from({ length: count }).map((_, i) => (
                <Star key={i} aria-hidden="true" className="h-4 w-4 fill-orange text-orange" />
            ))}
        </span>
    );
}

export function Testimonials() {
    const [active, setActive] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isPaused = useRef(false);

    const goTo = useCallback((index: number) => {
        setActive((index + testimonials.length) % testimonials.length);
    }, []);

    /* Auto-rotate every 5 seconds, pause on hover. */
    useEffect(() => {
        const tick = () => {
            if (!isPaused.current) {
                setActive((prev) => (prev + 1) % testimonials.length);
            }
        };
        timerRef.current = setInterval(tick, 5000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const t = testimonials[active];

    return (
        <div
            className="relative"
            onMouseEnter={() => { isPaused.current = true; }}
            onMouseLeave={() => { isPaused.current = false; }}
        >
            <div className="mx-auto max-w-3xl text-center">
                {/* Card */}
                <div className="rounded-[24px] border border-line bg-bg-surface p-8 sm:p-10 transition-all duration-300">
                    <Stars count={t.rating} />

                    <blockquote className="mt-6 font-display text-[clamp(20px,3vw,28px)] leading-[1.4] tracking-tight text-ink text-balance">
                        &ldquo;{t.quote}&rdquo;
                    </blockquote>

                    <div className="mt-6 flex items-center justify-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange text-[13px] font-bold text-ink">
                            {t.initials}
                        </span>
                        <div className="text-left">
                            <p className="text-[15px] font-semibold text-ink">{t.name}</p>
                            <p className="text-[13px] text-ink-70">{t.title}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="mt-6 flex items-center justify-center gap-4">
                    <button
                        type="button"
                        onClick={() => goTo(active - 1)}
                        aria-label="Previous testimonial"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex gap-2">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => goTo(i)}
                                aria-label={`Go to testimonial ${i + 1}`}
                                className={cn(
                                    'h-2 w-2 rounded-full transition-all duration-300',
                                    i === active ? 'w-6 bg-orange' : 'bg-line hover:bg-ink-70',
                                )}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => goTo(active + 1)}
                        aria-label="Next testimonial"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
