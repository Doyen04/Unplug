'use client';

import { useEffect, useMemo, useState } from 'react';

const SUBSCRIPTION_PRESETS = [
    { id: 'netflix', label: 'Netflix', defaultAmount: 4400 },
    { id: 'spotify', label: 'Spotify', defaultAmount: 1900 },
    { id: 'chatgpt', label: 'ChatGPT Plus', defaultAmount: 31000 },
    { id: 'prime', label: 'Prime Video', defaultAmount: 2900 },
    { id: 'gym', label: 'Gym membership', defaultAmount: 15000 },
    { id: 'cloud', label: 'Cloud storage', defaultAmount: 2500 },
] as const;

type SelectedAmounts = Record<string, number>;

function AnimatedTotal({ value }: { value: number }) {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        let frame = 0;
        const start = displayValue;
        const diff = value - start;
        const duration = 320;
        const startedAt = performance.now();

        const step = (now: number) => {
            const progress = Math.min((now - startedAt) / duration, 1);
            setDisplayValue(Math.round(start + diff * progress));
            if (progress < 1) {
                frame = window.requestAnimationFrame(step);
            }
        };

        frame = window.requestAnimationFrame(step);
        return () => window.cancelAnimationFrame(frame);
    }, [value]);

    return <span className="font-display text-[clamp(40px,6vw,64px)] leading-none text-ink tabular-nums">₦{displayValue.toLocaleString()}</span>;
}

export function SubscriptionCreepCalculator() {
    const [selected, setSelected] = useState<SelectedAmounts>({});

    const monthlyTotal = useMemo(
        () => Object.values(selected).reduce((sum, amount) => sum + amount, 0),
        [selected],
    );

    const annualTotal = monthlyTotal * 12;

    return (
        <div className="rounded-[24px] border border-line bg-bg-surface p-6 shadow-[0_20px_60px_-35px_rgba(31,26,22,0.35)] sm:p-8">
            <div className="mb-8 max-w-2xl">
                <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-70">Subscription creep calculator</p>
                <h3 className="mt-3 font-display text-[clamp(28px,4vw,40px)] leading-tight text-ink">What&apos;s your subscription creep?</h3>
                <p className="mt-3 text-base leading-7 text-ink-70">Tap the services you actually pay for, adjust the numbers if they&apos;re off, watch the annual total add up.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {SUBSCRIPTION_PRESETS.map((preset) => {
                    const selectedAmount = selected[preset.id];
                    const isSelected = selectedAmount !== undefined;

                    return (
                        <button
                            key={preset.id}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() =>
                                setSelected((current) => {
                                    if (current[preset.id] !== undefined) {
                                        const next = { ...current };
                                        delete next[preset.id];
                                        return next;
                                    }
                                    return { ...current, [preset.id]: preset.defaultAmount };
                                })
                            }
                            className={[
                                'rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2',
                                isSelected ? 'border-orange bg-orange text-ink' : 'border-line bg-cream text-ink hover:border-ink',
                            ].join(' ')}
                        >
                            <span>{preset.label}</span>
                            <span className="mt-1 block font-mono text-xs text-ink-70 tabular-nums">₦{preset.defaultAmount.toLocaleString()}/mo</span>
                        </button>
                    );
                })}
            </div>

            {Object.keys(selected).length > 0 ? (
                <div className="mt-8 grid gap-5 rounded-[20px] border border-line bg-cream p-5 sm:p-6">
                    {Object.entries(selected).map(([id, amount]) => {
                        const preset = SUBSCRIPTION_PRESETS.find((item) => item.id === id);
                        if (!preset) return null;

                        return (
                            <div key={id} className="grid gap-3 sm:grid-cols-[1fr_220px] sm:items-center">
                                <div>
                                    <p className="font-medium text-ink">{preset.label}</p>
                                    <p className="mt-1 text-sm text-ink-70">Edit the amount if your bill is different.</p>
                                </div>
                                <label className="flex items-center rounded-xl border border-line bg-bg-surface px-4 py-3 text-sm text-ink">
                                    <span className="mr-2 font-semibold">₦</span>
                                    <input
                                        className="w-full bg-transparent font-mono tabular-nums outline-none"
                                        type="number"
                                        min={0}
                                        value={amount}
                                        onChange={(event) => {
                                            const nextValue = Number(event.target.value || 0);
                                            setSelected((current) => ({ ...current, [preset.id]: nextValue }));
                                        }}
                                    />
                                    <span className="ml-2 text-ink-70">/mo</span>
                                </label>
                            </div>
                        );
                    })}
                </div>
            ) : null}

            <div className="mt-8 rounded-[20px] border border-line bg-bg-muted p-6 text-center">
                <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-70">Monthly total</p>
                <div className="mt-3 flex justify-center">
                    <AnimatedTotal value={monthlyTotal} />
                </div>
                <p className="mt-3 font-mono text-sm text-ink-70 tabular-nums">₦{annualTotal.toLocaleString()} per year</p>
            </div>

            {Object.keys(selected).length > 0 ? (
                <div className="mt-6 flex flex-col items-start gap-4 rounded-[20px] border-l-4 border-orange bg-orange/5 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-2xl text-base leading-7 text-ink">
                        That&apos;s <span className="font-semibold text-orange">₦{annualTotal.toLocaleString()}</span> a year. Want to make sure none of it surprises you again?
                    </p>
                    <a href="/signup" className="inline-flex min-h-11 items-center justify-center rounded-full bg-orange px-5 text-sm font-semibold text-ink transition-colors hover:bg-orange-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2">
                        Get started free
                    </a>
                </div>
            ) : null}
        </div>
    );
}
