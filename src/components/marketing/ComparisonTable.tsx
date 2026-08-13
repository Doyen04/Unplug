'use client';

import { Check, CreditCard, Lock, Minus, Search, ShieldCheck, Target, X } from 'lucide-react';

import { cn } from '@/lib/utils';

type Support = 'yes' | 'no' | 'partial';

const COLUMNS = [
    {
        key: 'discovery',
        label: 'Auto-discovery',
        icon: Search,
    },
    {
        key: 'stops_charge',
        label: 'Stops charges',
        icon: ShieldCheck,
    },
    {
        key: 'multi_currency',
        label: 'Naira + USD cards',
        icon: CreditCard,
    },
    {
        key: 'bypass_cancel',
        label: 'Bypasses cancel blocks',
        icon: Lock,
    },
    {
        key: 'core_product',
        label: 'Subscription-first',
        icon: Target,
    },
] as const;

const COMPETITORS: readonly { label: string; cells: readonly Support[] }[] = [
    {
        label: 'Rocket Money-style trackers',
        cells: ['yes', 'no', 'partial', 'no', 'yes'],
    },
    {
        label: 'gomoney / Payora / Cardtonic',
        cells: ['no', 'partial', 'partial', 'yes', 'no'],
    },
    {
        label: "Your bank's card controls",
        cells: ['no', 'partial', 'no', 'yes', 'no'],
    },
];

const UNPLUG_CELLS: readonly Support[] = ['yes', 'yes', 'yes', 'yes', 'yes'];

function CleanStatus({ support, darkRow }: { support: Support; darkRow?: boolean }) {
    if (support === 'yes') {
        return (
            <span className={cn('inline-flex items-center gap-1.5 text-sm font-bold', darkRow ? 'text-emerald-400' : 'text-emerald-600')}>
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Yes</span>
            </span>
        );
    }

    if (support === 'partial') {
        return (
            <span className={cn('inline-flex items-center gap-1.5 text-sm font-medium', darkRow ? 'text-amber-300' : 'text-amber-600')}>
                <Minus className="h-4 w-4 stroke-[2.5]" />
                <span>Partial</span>
            </span>
        );
    }

    return (
        <span className={cn('inline-flex items-center gap-1.5 text-sm font-medium', darkRow ? 'text-white/40' : 'text-slate-300')}>
            <X className="h-3.5 w-3.5 stroke-[2]" />
            <span>No</span>
        </span>
    );
}

export function ComparisonTable() {
    return (
        <div className="mt-10">
            {/* Desktop Lean Table View */}
            <div className="hidden overflow-hidden rounded-[20px] border border-line bg-white md:block">
                <table className="w-full border-collapse text-left">
                    <caption className="sr-only">
                        How Unplug compares with subscription trackers, virtual-card apps, and bank card controls
                    </caption>

                    {/* Table Header */}
                    <thead>
                        <tr className="border-b border-line bg-slate-50/60">
                            <th scope="col" className="w-[26%] p-4 sm:px-6 sm:py-4 text-xs font-bold uppercase tracking-wider text-ink-70">
                                Solution
                            </th>
                            {COLUMNS.map((col) => {
                                const Icon = col.icon;
                                return (
                                    <th key={col.key} scope="col" className="p-4 sm:px-6 sm:py-4">
                                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink">
                                            <Icon className="h-3.5 w-3.5 text-orange shrink-0" />
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
                                <th scope="row" className="p-4 sm:px-6 sm:py-4.5 font-medium text-ink-70 align-middle">
                                    {row.label}
                                </th>
                                {row.cells.map((support, idx) => (
                                    <td key={COLUMNS[idx].key} className="p-4 sm:px-6 sm:py-4.5 align-middle">
                                        <CleanStatus support={support} />
                                    </td>
                                ))}
                            </tr>
                        ))}

                        {/* Unplug Executive Winner Row */}
                        <tr className="bg-[#1C1A17] text-white border-t-2 border-orange">
                            <th scope="row" className="p-4 sm:px-6 sm:py-5 align-middle">
                                <div className="flex items-center gap-2.5">
                                    <span className="font-display text-lg font-bold tracking-tight text-white">Unplug</span>
                                    <span className="rounded-full bg-orange px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-ink">
                                        Winner
                                    </span>
                                </div>
                            </th>
                            {UNPLUG_CELLS.map((support, idx) => (
                                <td key={COLUMNS[idx].key} className="p-4 sm:px-6 sm:py-5 align-middle">
                                    <CleanStatus support={support} darkRow />
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Mobile Stacked Lean View */}
            <div className="grid gap-4 md:hidden">
                {/* Unplug Winner Card */}
                <div className="rounded-[20px] border-2 border-orange bg-[#1C1A17] p-5 text-white">
                    <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-4">
                        <h4 className="font-display text-lg font-bold text-white">Unplug</h4>
                        <span className="rounded-full bg-orange px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-ink">
                            Winner
                        </span>
                    </div>
                    <ul className="space-y-3">
                        {COLUMNS.map((col, idx) => {
                            const Icon = col.icon;
                            return (
                                <li key={col.key} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5 text-white/90 font-medium">
                                        <Icon className="h-3.5 w-3.5 text-orange shrink-0" />
                                        <span>{col.label}</span>
                                    </div>
                                    <CleanStatus support={UNPLUG_CELLS[idx]} darkRow />
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Competitors */}
                {COMPETITORS.map((row) => (
                    <div key={row.label} className="rounded-[18px] border border-line bg-white p-4">
                        <h4 className="font-semibold text-ink text-sm border-b border-line pb-2.5 mb-3">{row.label}</h4>
                        <ul className="space-y-2.5">
                            {COLUMNS.map((col, idx) => (
                                <li key={col.key} className="flex items-center justify-between text-xs">
                                    <span className="text-ink-70">{col.label}</span>
                                    <CleanStatus support={row.cells[idx]} />
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
