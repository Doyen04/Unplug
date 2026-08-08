import { Search, Snowflake } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Stylised representations of the real product surfaces, drawn with the design
 * tokens rather than screenshots. Seeded demo figures only — never real data.
 */

const rows = [
    { name: 'Netflix', meta: 'Streaming · card 4471', amount: '₦4,400', frozen: false },
    { name: 'Spotify', meta: 'Music · card 2810', amount: '₦1,900', frozen: false },
    { name: 'ChatGPT Plus', meta: 'Software · card 9032', amount: '$20.00', frozen: true },
    { name: 'Cloud storage', meta: 'Storage · card 5518', amount: '₦2,500', frozen: false },
] as const;

function Chrome({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="overflow-hidden rounded-[18px] border border-line bg-cream">
            <div className="flex items-center gap-2 border-b border-line bg-bg-muted px-4 py-2.5">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-border-strong" />
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-border-strong" />
                <span className="ml-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-70">{title}</span>
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className="rounded-[14px] border border-line bg-bg-surface p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-70">{label}</p>
            <p className={cn('mt-1.5 font-mono text-[19px] tabular-nums', accent ? 'text-orange' : 'text-ink')}>{value}</p>
        </div>
    );
}

function SubscriptionRow({ name, meta, amount, frozen }: (typeof rows)[number]) {
    return (
        <li className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-0">
            <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-ink">{name}</p>
                <p className="truncate text-[11px] text-ink-70">{meta}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
                <span className={cn('font-mono text-[13px] tabular-nums', frozen ? 'text-ink-70 line-through' : 'text-ink')}>
                    {amount}
                </span>
                <span
                    className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em]',
                        frozen ? 'bg-frost-wash text-frost-deep' : 'bg-success-light text-success',
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
                    <Stat label="Monthly spend" value="₦38,200" />
                    <Stat label="Frozen" value="2" accent />
                    <Stat label="Charging this week" value="3" />
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
                <div className="rounded-[14px] border-l-[3px] border-orange bg-orange/5 p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-orange">In 3 days</p>
                    <p className="mt-1.5 text-[13px] leading-6 text-ink">
                        Netflix will charge <span className="font-mono tabular-nums">₦4,400</span> to card 4471.
                    </p>
                </div>
                <div className="mt-3 space-y-2">
                    {[
                        ['12 Aug', 'Spotify', '₦1,900'],
                        ['15 Aug', 'Cloud storage', '₦2,500'],
                        ['21 Aug', 'ChatGPT Plus', '$20.00'],
                    ].map(([date, name, amount]) => (
                        <div key={name} className="flex items-center justify-between rounded-[12px] bg-bg-surface px-3.5 py-2.5">
                            <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-70">{date}</span>
                            <span className="text-[13px] text-ink">{name}</span>
                            <span className="font-mono text-[13px] tabular-nums text-ink">{amount}</span>
                        </div>
                    ))}
                </div>
            </Chrome>
        );
    }

    if (id === 'transactions') {
        return (
            <Chrome title="Transactions">
                <div className="flex items-center gap-2 rounded-full border border-line bg-bg-surface px-3.5 py-2 text-[13px] text-ink-70">
                    <Search aria-hidden="true" className="h-3.5 w-3.5" />
                    <span>Search by merchant</span>
                </div>
                <ul className="mt-3">
                    {rows.map((row) => (
                        <SubscriptionRow key={row.name} {...row} />
                    ))}
                </ul>
            </Chrome>
        );
    }

    return (
        <Chrome title="Settings">
            <div className="space-y-2">
                {[
                    ['Plan', 'Pro · ₦4,000/month'],
                    ['Bank connections', '2 linked'],
                    ['Charge alerts', 'On — 3 days ahead'],
                ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-[12px] bg-bg-surface px-3.5 py-3">
                        <span className="text-[13px] text-ink-70">{label}</span>
                        <span className="text-[13px] font-medium text-ink">{value}</span>
                    </div>
                ))}
            </div>
        </Chrome>
    );
}
