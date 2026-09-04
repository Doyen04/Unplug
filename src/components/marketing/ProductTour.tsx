'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

import { TOUR_PANELS } from '@/lib/constants/marketing';
import { cn } from '@/lib/utils';

import { TourPanelMock } from './TourPanelMock';

const AUTO_ADVANCE_MS = 5000;
const IDLE_RESUME_MS = 10000;

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
        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)] lg:gap-10 w-full max-w-full overflow-hidden lg:overflow-visible">
            {/* Tab Rail */}
            <div
                role="tablist"
                aria-label="Product tour"
                aria-orientation="vertical"
                className="scrollbar-hidden -mx-6 flex gap-2 overflow-x-auto px-6 lg:mx-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:px-0"
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
                                'relative flex shrink-0 items-center gap-3.5 rounded-2xl px-4 py-3.5 text-left text-[14px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink overflow-hidden lg:w-full lg:shrink',
                                selected
                                    ? 'bg-ink text-white'
                                    : 'text-ink-70 hover:bg-slate-50 hover:text-ink',
                            )}
                        >
                            {/* Step Number */}
                            <span
                                className={cn(
                                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-extrabold tracking-wide transition-colors',
                                    selected
                                        ? 'bg-orange text-ink'
                                        : 'bg-slate-100 text-ink-70',
                                )}
                            >
                                {index + 1}
                            </span>

                            <span className="flex flex-col gap-0.5 min-w-0">
                                <span className="whitespace-nowrap font-semibold">{panel.label}</span>
                                {selected && (
                                    <span className="hidden text-[11px] font-normal text-white/70 lg:block truncate">
                                        {activePanel.headline}
                                    </span>
                                )}
                            </span>

                            <Icon
                                aria-hidden="true"
                                className={cn(
                                    'ml-auto h-4 w-4 shrink-0',
                                    selected ? 'text-orange' : 'text-ink-70/40',
                                )}
                            />

                            {/* Progress bar inside active tab */}
                            {selected && !isPaused.current ? (
                                <span
                                    key={progressKey}
                                    className="absolute bottom-0 left-0 h-0.5 bg-orange animate-progress"
                                />
                            ) : null}
                        </button>
                    );
                })}

                {/* Step Counter */}
                <div className="hidden lg:flex items-center justify-between mt-3 px-1 text-[11px] font-bold uppercase tracking-wider text-ink-70">
                    <span>Step {active + 1} of {TOUR_PANELS.length}</span>
                    <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
                        Auto-playing
                    </span>
                </div>
            </div>

            {/* Panel Content */}
            <div
                role="tabpanel"
                id={`tour-panel-${activePanel.id}`}
                aria-labelledby={`tour-tab-${activePanel.id}`}
                tabIndex={0}
                className="rounded-[24px] border border-line bg-white p-4 sm:p-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink w-full min-w-0 max-w-full overflow-hidden"
            >
                <motion.div
                    key={activePanel.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: 'easeOut' }}
                >
                    {/* Panel Header */}
                    <div className="flex items-start justify-between gap-4 border-b border-line pb-5 mb-5">
                        <div>
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange">
                                <span className="h-1.5 w-1.5 rounded-full bg-orange" />
                                Step {active + 1}
                            </span>
                            <h3 className="mt-1.5 font-display text-[clamp(20px,2.4vw,28px)] font-bold leading-tight tracking-tight text-ink text-balance">
                                {activePanel.headline}
                            </h3>
                        </div>
                    </div>

                    <p className="max-w-xl text-[15px] leading-7 text-ink-70">{activePanel.body}</p>

                    <div className="mt-6">
                        <TourPanelMock id={activePanel.id} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
