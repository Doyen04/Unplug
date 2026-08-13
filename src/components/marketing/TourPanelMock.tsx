import { Bell, CreditCard, Search, Snowflake } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * TourPanelMock — Polished, professional mock UI panels for each product tour step.
 * Features realistic app chrome, status indicators, and brand green/orange accents.
 */

const rows = [
    { name: 'Netflix', meta: 'Streaming · card 4471', amount: '₦4,400', frozen: false },
    { name: 'Spotify', meta: 'Music · card 2810', amount: '₦1,900', frozen: false },
    { name: 'ChatGPT Plus', meta: 'Software · card 9032', amount: '$20.00', frozen: true },
    { name: 'Cloud storage', meta: 'Storage · card 5518', amount: '₦2,500', frozen: false },
] as const;

function Chrome({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="flex items-center gap-2.5 border-b border-line bg-slate-50/80 px-4 py-2.5">
                <div className="flex gap-1.5">
                    <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                    <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                    <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-green/50" />
                </div>
                <span className="ml-1 text-[11px] font-bold uppercase tracking-widest text-ink-70">{title}</span>
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

function Stat({ label, value, accent, sub }: { label: string; value: string; accent?: boolean; sub?: string }) {
    return (
        <div className="rounded-xl border border-line bg-white p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-70">{label}</p>
            <p className={cn('mt-1.5 font-mono text-[20px] font-bold tabular-nums', accent ? 'text-orange' : 'text-ink')}>{value}</p>
            {sub ? <p className="mt-0.5 text-[10px] font-medium text-ink-70">{sub}</p> : null}
        </div>
    );
}

function SubscriptionRow({ name, meta, amount, frozen }: (typeof rows)[number]) {
    return (
        <li className="flex items-center justify-between gap-3 border-b border-line/60 py-3 last:border-0 last:pb-0 first:pt-0">
            <div className="flex items-center gap-3 min-w-0">
                {/* App icon placeholder */}
                <div className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold uppercase',
                    frozen ? 'bg-frost-wash text-frost-deep' : 'bg-green-light text-green',
                )}>
                    {name.charAt(0)}
                </div>
                <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-ink">{name}</p>
                    <p className="truncate text-[11px] text-ink-70">{meta}</p>
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
                <span className={cn('font-mono text-[13px] font-semibold tabular-nums', frozen ? 'text-ink-70 line-through' : 'text-ink')}>
                    {amount}
                </span>
                <span
                    className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]',
                        frozen ? 'bg-frost-wash text-frost-deep' : 'bg-green-light text-green',
                    )}
                >
                    {frozen ? <Snowflake aria-hidden="true" className="h-2.5 w-2.5" /> : null}
                    {frozen ? 'Frozen' : 'Active'}
                </span>
            </div>
        </li>
    );
}

export function TourPanelMock({ id }: { id: string }) {
    if (id === 'dashboard') {
        return (
            <Chrome title="Dashboard">
                <div className="grid gap-3 sm:grid-cols-3">
                    <Stat label="Monthly spend" value="₦38,200" sub="↓ 12% from last month" />
                    <Stat label="Frozen cards" value="2" accent />
                    <Stat label="Due this week" value="3" sub="Next: Netflix, Aug 15" />
                </div>
                <ul className="mt-4">
                    {rows.slice(0, 3).map((row) => (
                        <SubscriptionRow key={row.name} {...row} />
                    ))}
                </ul>
            </Chrome>
        );
    }

    if (id === 'subscriptions') {
        return (
            <Chrome title="Subscriptions">
                {/* Quick filter chips */}
                <div className="flex gap-2 mb-3">
                    {['All', 'Active', 'Frozen'].map((f, i) => (
                        <span
                            key={f}
                            className={cn(
                                'rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider',
                                i === 0 ? 'bg-ink text-white' : 'bg-slate-100 text-ink-70',
                            )}
                        >
                            {f}
                        </span>
                    ))}
                </div>
                <ul>
                    {rows.map((row) => (
                        <SubscriptionRow key={row.name} {...row} />
                    ))}
                </ul>
            </Chrome>
        );
    }

    if (id === 'billing') {
        return (
            <Chrome title="Billing">
                {/* Upcoming charge alert */}
                <div className="flex items-start gap-3 rounded-xl border border-orange/30 bg-orange/5 p-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange/15 text-orange">
                        <Bell className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-orange">Charging in 3 days</p>
                        <p className="mt-1 text-[13px] leading-5 text-ink">
                            Netflix will charge <span className="font-mono font-bold tabular-nums">₦4,400</span> to card ending 4471.
                        </p>
                    </div>
                </div>

                {/* Upcoming schedule */}
                <div className="mt-3.5 space-y-1.5">
                    {[
                        ['12 Aug', 'Spotify', '₦1,900', false],
                        ['15 Aug', 'Cloud storage', '₦2,500', false],
                        ['21 Aug', 'ChatGPT Plus', '$20.00', true],
                    ].map(([date, name, amount, isFrozen]) => (
                        <div key={name as string} className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5">
                            <div className="flex items-center gap-2.5">
                                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-70 w-10">{date as string}</span>
                                <span className="text-[13px] font-medium text-ink">{name as string}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={cn('font-mono text-[13px] font-semibold tabular-nums', isFrozen ? 'text-ink-70 line-through' : 'text-ink')}>
                                    {amount as string}
                                </span>
                                {isFrozen ? (
                                    <span className="rounded-full bg-frost-wash px-1.5 py-0.5 text-[9px] font-bold text-frost-deep">
                                        FROZEN
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            </Chrome>
        );
    }

    if (id === 'transactions') {
        return (
            <Chrome title="Transactions">
                {/* Search bar */}
                <div className="flex items-center gap-2 rounded-xl border border-line bg-slate-50 px-3.5 py-2.5 text-[13px] text-ink-70">
                    <Search aria-hidden="true" className="h-3.5 w-3.5 text-ink-70/60" />
                    <span>Search by merchant or card...</span>
                </div>

                {/* Transaction list with dates */}
                <ul className="mt-3">
                    {rows.map((row) => (
                        <SubscriptionRow key={row.name} {...row} />
                    ))}
                </ul>

                {/* Summary footer */}
                <div className="mt-3 flex items-center justify-between rounded-xl bg-green-light px-3.5 py-2.5 text-xs font-bold text-green">
                    <span>Total saved by freezing</span>
                    <span className="font-mono tabular-nums">₦6,900</span>
                </div>
            </Chrome>
        );
    }

    return (
        <Chrome title="Settings">
            <div className="space-y-1.5">
                {[
                    ['Plan', 'Pro · ₦4,000/month', 'orange'],
                    ['Bank connections', '2 linked via Mono', 'green'],
                    ['Charge alerts', 'On — 3 days ahead', 'green'],
                    ['Card controls', 'Freeze on demand', ''],
                ].map(([label, value, color]) => (
                    <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-3">
                        <span className="text-[13px] text-ink-70">{label}</span>
                        <span className={cn(
                            'text-[13px] font-semibold',
                            color === 'orange' ? 'text-orange' : color === 'green' ? 'text-green' : 'text-ink',
                        )}>
                            {value}
                        </span>
                    </div>
                ))}
            </div>
        </Chrome>
    );
}
