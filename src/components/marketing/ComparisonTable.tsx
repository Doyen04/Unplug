'use client';

import { Check, CreditCard, Lock, OctagonX, Search, ShieldCheck, Target, X } from 'lucide-react';

import { cn } from '@/lib/utils';

type Support = 'yes' | 'no' | 'partial';

interface Cell {
    support: Support;
    note?: string;
}

const COLUMNS = [
    {
        key: 'discovery',
        label: 'Finds subscriptions automatically',
        icon: Search,
    },
    {
        key: 'stops_charge',
        label: 'Actually stops the charge',
        icon: ShieldCheck,
    },
    {
        key: 'multi_currency',
        label: 'Naira + dollar cards',
        icon: CreditCard,
    },
    {
        key: 'bypass_cancel',
        label: 'Works if merchant hides cancel',
        icon: Lock,
    },
    {
        key: 'core_product',
        label: 'Subscriptions are core product',
        icon: Target,
    },
] as const;

const COMPETITORS: readonly { label: string; cells: readonly Cell[] }[] = [
    {
        label: 'Rocket Money-style trackers',
        cells: [
            { support: 'yes' },
            { support: 'no', note: 'Tracking only' },
            { support: 'partial', note: 'USD rarely' },
            { support: 'no' },
            { support: 'yes' },
        ],
    },
    {
        label: 'gomoney / Payora / Cardtonic',
        cells: [
            { support: 'no', note: 'Manual entry' },
            { support: 'partial', note: 'Generic card' },
            { support: 'partial', note: 'Varies' },
            { support: 'yes' },
            { support: 'no', note: 'General fintech' },
        ],
    },
    {
        label: "Your bank's card controls",
        cells: [
            { support: 'no' },
            { support: 'partial', note: 'Freezes whole bank card' },
            { support: 'no', note: 'Local card only' },
            { support: 'yes', note: 'Bluntly' },
            { support: 'no' },
        ],
    },
];

const UNPLUG_CELLS: readonly Cell[] = [
    { support: 'yes', note: 'Read-only via Mono' },
    { support: 'yes', note: 'One card per merchant' },
    { support: 'yes', note: 'Dedicated Naira & USD' },
    { support: 'yes', note: 'Instant 1-tap freeze' },
    { support: 'yes', note: '100% focused on subs' },
];

function StatusBadge({ support, note, darkRow }: Cell & { darkRow?: boolean }) {
    if (support === 'yes') {
        return (
            <div className="flex flex-col items-start gap-1">
                <span
                    className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-all',
                        darkRow
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                    )}
                >
                    <Check className="h-3.5 w-3.5" />
                    <span>YES</span>
                </span>
                {note ? (
                    <span className={cn('text-[11px] font-medium leading-tight', darkRow ? 'text-white/70' : 'text-ink-70')}>
                        {note}
                    </span>
                ) : null}
            </div>
        );
    }

    if (support === 'partial') {
        return (
            <div className="flex flex-col items-start gap-1">
                <span
                    className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                        darkRow
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-amber-50 text-amber-700 border border-amber-200',
                    )}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>PARTIAL</span>
                </span>
                {note ? <span className="text-[11px] font-medium leading-tight text-ink-70">{note}</span> : null}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start gap-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 border border-slate-200">
                <X className="h-3.5 w-3.5 text-slate-400" />
                <span>NO</span>
            </span>
            {note ? <span className="text-[11px] font-medium leading-tight text-slate-400">{note}</span> : null}
        </div>
    );
}

export function ComparisonTable() {
    return (
        <div className="mt-10">
            {/* Desktop Table View */}
            <div className="hidden overflow-hidden rounded-[24px] border border-line bg-white shadow-xs md:block">
                <table className="w-full border-collapse text-left">
                    <caption className="sr-only">
                        How Unplug compares with subscription trackers, virtual-card apps, and bank card controls
                    </caption>

                    {/* Table Header */}
                    <thead>
                        <tr className="border-b border-line bg-slate-50/80">
                            <th scope="col" className="w-[24%] p-5 text-xs font-bold uppercase tracking-wider text-ink-70">
                                Solution
                            </th>
                            {COLUMNS.map((col) => {
                                const Icon = col.icon;
                                return (
                                    <th key={col.key} scope="col" className="p-5 align-top">
                                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink">
                                            <Icon className="h-4 w-4 text-orange shrink-0" />
                                            <span>{col.label}</span>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-line text-sm">
                        {/* Competitor Rows */}
                        {COMPETITORS.map((row) => (
                            <tr key={row.label} className="transition-colors hover:bg-slate-50/50">
                                <th scope="row" className="p-5 font-semibold text-ink-70 align-middle">
                                    {row.label}
                                </th>
                                {row.cells.map((cell, idx) => (
                                    <td key={COLUMNS[idx].key} className="p-5 align-middle">
                                        <StatusBadge {...cell} />
                                    </td>
                                ))}
                            </tr>
                        ))}

                        {/* Unplug Featured Executive Winner Row */}
                        <tr className="bg-[#1C1A17] text-white border-t-2 border-orange">
                            <th scope="row" className="p-5 align-middle">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-display text-lg font-bold tracking-tight text-white">Unplug</span>
                                        <span className="rounded-full bg-orange px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-ink">
                                            Winner
                                        </span>
                                    </div>
                                    <span className="text-xs text-white/70">Built specifically for Nigeria</span>
                                </div>
                            </th>
                            {UNPLUG_CELLS.map((cell, idx) => (
                                <td key={COLUMNS[idx].key} className="p-5 align-middle">
                                    <StatusBadge {...cell} darkRow />
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Mobile Stacked View */}
            <div className="grid gap-5 md:hidden">
                {/* Unplug Winner Card */}
                <div className="rounded-[24px] border-2 border-orange bg-[#1C1A17] p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between border-b border-white/15 pb-4">
                        <div>
                            <span className="rounded-full bg-orange px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-ink">
                                Recommended Winner
                            </span>
                            <h4 className="mt-2 font-display text-xl font-bold text-white">Unplug</h4>
                        </div>
                    </div>
                    <ul className="mt-5 space-y-4">
                        {COLUMNS.map((col, idx) => {
                            const Icon = col.icon;
                            return (
                                <li key={col.key} className="flex items-start justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-1.5 text-white/90">
                                        <Icon className="h-4 w-4 text-orange shrink-0" />
                                        <span className="font-medium">{col.label}</span>
                                    </div>
                                    <StatusBadge {...UNPLUG_CELLS[idx]} darkRow />
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Competitors */}
                {COMPETITORS.map((row) => (
                    <div key={row.label} className="rounded-[20px] border border-line bg-white p-5">
                        <h4 className="font-semibold text-ink text-base border-b border-line pb-3">{row.label}</h4>
                        <ul className="mt-4 space-y-3">
                            {COLUMNS.map((col, idx) => (
                                <li key={col.key} className="flex items-start justify-between gap-3 text-xs">
                                    <span className="text-ink-70">{col.label}</span>
                                    <StatusBadge {...row.cells[idx]} />
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
