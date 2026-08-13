'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

import { TOUR_PANELS } from '@/lib/constants/marketing';
import { cn } from '@/lib/utils';

import { TourPanelMock } from './TourPanelMock';

const AUTO_ADVANCE_MS = 5000;
const IDLE_RESUME_MS = 10000;

/**
 * Vertical tab interface following the WAI-ARIA tabs pattern: roving tabindex,
 * arrow-key navigation, and manual activation on mobile where the rail becomes
 * a horizontal scroller. Now with auto-advance and a progress indicator.
 */
export function ProductTour() {
    const [active, setActive] = useState(0);
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const prefersReducedMotion = useReducedMotion();
    const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isPaused = useRef(false);
    const [progressKey, setProgressKey] = useState(0);

    const clearTimers = useCallback(() => {
        if (autoRef.current) clearInterval(autoRef.current);
        if (idleRef.current) clearTimeout(idleRef.current);
    }, []);

    const startAutoAdvance = useCallback(() => {
        clearTimers();
        isPaused.current = false;
        setProgressKey((k) => k + 1);
        autoRef.current = setInterval(() => {
            if (!isPaused.current) {
                setActive((prev) => (prev + 1) % TOUR_PANELS.length);
                setProgressKey((k) => k + 1);
            }
        }, AUTO_ADVANCE_MS);
    }, [clearTimers]);

    /* Start auto-advance on mount. */
    useEffect(() => {
        startAutoAdvance();
        return clearTimers;
    }, [startAutoAdvance, clearTimers]);

    const handleUserInteraction = useCallback(
        (index: number) => {
            setActive(index);
            isPaused.current = true;
            clearTimers();
            setProgressKey((k) => k + 1);

            idleRef.current = setTimeout(() => {
                startAutoAdvance();
            }, IDLE_RESUME_MS);
        },
        [clearTimers, startAutoAdvance],
    );

    const focusTab = (index: number) => {
        handleUserInteraction(index);
        tabRefs.current[index]?.focus();
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
        const last = TOUR_PANELS.length - 1;

        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                event.preventDefault();
                focusTab(index === last ? 0 : index + 1);
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                event.preventDefault();
                focusTab(index === 0 ? last : index - 1);
                break;
            case 'Home':
                event.preventDefault();
                focusTab(0);
                break;
            case 'End':
                event.preventDefault();
                focusTab(last);
                break;
            default:
                break;
        }
    };

    const activePanel = TOUR_PANELS[active];

    return (
        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)] lg:gap-8">
            <div
                role="tablist"
                aria-label="Product tour"
                aria-orientation="vertical"
                className="scrollbar-hidden -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
            >
                {TOUR_PANELS.map((panel, index) => {
                    const Icon = panel.icon;
                    const selected = index === active;

                    return (
                        <button
                            key={panel.id}
                            ref={(node) => {
                                tabRefs.current[index] = node;
                            }}
                            type="button"
                            role="tab"
                            id={`tour-tab-${panel.id}`}
                            aria-selected={selected}
                            aria-controls={`tour-panel-${panel.id}`}
                            tabIndex={selected ? 0 : -1}
                            onClick={() => handleUserInteraction(index)}
                            onKeyDown={(event) => onKeyDown(event, index)}
                            className={cn(
                                'relative flex shrink-0 items-center gap-3 rounded-[18px] border px-4 py-3.5 text-left text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-cream lg:w-full lg:shrink overflow-hidden',
                                selected
                                    ? 'border-orange/40 bg-orange/8 text-ink'
                                    : 'border-transparent text-ink-70 hover:border-line hover:bg-bg-surface hover:text-ink',
                            )}
                        >
                            {/* Animated tab indicator */}
                            {selected ? (
                                <motion.span
                                    layoutId="tour-active-indicator"
                                    className="absolute inset-0 rounded-[18px] border-2 border-orange"
                                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                                />
                            ) : null}

                            {/* Progress bar inside active tab */}
                            {selected && !isPaused.current ? (
                                <span
                                    key={progressKey}
                                    className="absolute bottom-0 left-0 h-[2px] bg-orange animate-progress"
                                />
                            ) : null}

                            <Icon
                                aria-hidden="true"
                                className={cn('h-[18px] w-[18px] shrink-0 relative z-10', selected ? 'text-orange' : 'text-ink-70')}
                            />
                            <span className="whitespace-nowrap relative z-10">{panel.label}</span>
                        </button>
                    );
                })}
            </div>

            <div
                role="tabpanel"
                id={`tour-panel-${activePanel.id}`}
                aria-labelledby={`tour-tab-${activePanel.id}`}
                tabIndex={0}
                className="rounded-[24px] border border-line bg-bg-surface p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-cream sm:p-8"
            >
                <motion.div
                    key={activePanel.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: 'easeOut' }}
                >
                    <h3 className="font-display text-[clamp(22px,2.6vw,30px)] leading-tight tracking-tight text-ink text-balance">
                        {activePanel.headline}
                    </h3>
                    <p className="mt-3 max-w-xl text-[16px] leading-7 text-ink-70">{activePanel.body}</p>

                    <div className="mt-7">
                        <TourPanelMock id={activePanel.id} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
