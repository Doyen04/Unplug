import { Check, Minus, X } from 'lucide-react';

import { cn } from '@/lib/utils';

type Support = 'yes' | 'no' | 'partial';

interface Cell {
    support: Support;
    note?: string;
}

const COLUMNS = [
    'Finds subscriptions automatically',
    'Actually stops the charge',
    'Naira + dollar cards',
    'Works even if merchant hides cancel',
    'Subscriptions are core product',
] as const;

const ROWS: readonly { label: string; highlight?: boolean; cells: readonly Cell[] }[] = [
    {
        label: 'Rocket Money-style trackers',
        cells: [
            { support: 'yes' },
            { support: 'no' },
            { support: 'partial', note: 'Rarely' },
            { support: 'no' },
            { support: 'yes' },
        ],
    },
    {
        label: 'gomoney / Payora / Cardtonic',
        cells: [
            { support: 'no' },
            { support: 'partial' },
            { support: 'partial', note: 'Sometimes' },
            { support: 'yes' },
            { support: 'no' },
        ],
    },
    {
        label: "Your bank's card controls",
        cells: [
            { support: 'no' },
            { support: 'partial', note: 'Freezes whole card' },
            { support: 'no' },
            { support: 'yes', note: 'Bluntly' },
            { support: 'no' },
        ],
    },
    {
        label: 'Unplug',
        highlight: true,
        cells: [
            { support: 'yes' },
            { support: 'yes', note: 'One card per subscription' },
            { support: 'yes' },
            { support: 'yes' },
            { support: 'yes' },
        ],
    },
];

function SupportMark({ support, note }: Cell) {
    const config = {
        yes: { Icon: Check, label: 'Yes', className: 'text-success' },
        no: { Icon: X, label: 'No', className: 'text-ink-70' },
        partial: { Icon: Minus, label: 'Partial', className: 'text-warning' },
    }[support];

    return (
        <span className="flex flex-col items-start gap-1">
            <span className={cn('flex items-center gap-1.5 text-[13px] font-medium', config.className)}>
                <config.Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                {config.label}
            </span>
            {note ? <span className="text-[12px] leading-5 text-ink-70">{note}</span> : null}
        </span>
    );
}

export function ComparisonTable() {
    return (
        <div className="mt-12">
            {/* Desktop Table View */}
            <div className="hidden overflow-hidden rounded-[24px] border border-line bg-bg-surface md:block">
                <table className="w-full border-collapse text-left">
                    <caption className="sr-only">
                        How Unplug compares with subscription trackers, virtual-card apps, and bank card controls
                    </caption>
                    <thead>
                        <tr className="border-b border-line bg-bg-muted">
                            <th scope="col" className="w-[26%] px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-70">
                                <span className="sr-only">Product</span>
                            </th>
                            {COLUMNS.map((column) => (
                                <th
                                    key={column}
                                    scope="col"
                                    className="px-5 py-4 align-bottom text-[12px] font-semibold uppercase leading-5 tracking-[0.08em] text-ink-70"
                                >
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {ROWS.map((row) => (
                            <tr key={row.label} className={cn(row.highlight && 'bg-orange/8 border-l-4 border-orange')}>
                                <th
                                    scope="row"
                                    className={cn(
                                        'px-5 py-4 align-top text-[14px] font-medium',
                                        row.highlight ? 'text-ink font-semibold' : 'text-ink-70',
                                    )}
                                >
                                    {row.highlight ? (
                                        <span className="flex items-center gap-2">
                                            {row.label}
                                            <span className="rounded-full bg-orange px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-ink">
                                                This one
                                            </span>
                                        </span>
                                    ) : (
                                        row.label
                                    )}
                                </th>
                                {row.cells.map((cell, index) => (
                                    <td key={COLUMNS[index]} className="px-5 py-4 align-top">
                                        <SupportMark {...cell} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="grid gap-4 md:hidden">
                {ROWS.map((row) => (
                    <div
                        key={row.label}
                        className={cn(
                            'rounded-[20px] border p-5 bg-bg-surface',
                            row.highlight ? 'border-2 border-orange bg-orange/5' : 'border-line',
                        )}
                    >
                        <div className="flex items-center justify-between border-b border-line pb-3">
                            <h4 className="font-semibold text-ink text-[16px]">{row.label}</h4>
                            {row.highlight ? (
                                <span className="rounded-full bg-orange px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-ink">
                                    Unplug
                                </span>
                            ) : null}
                        </div>
                        <ul className="mt-4 space-y-3">
                            {row.cells.map((cell, index) => (
                                <li key={COLUMNS[index]} className="flex items-start justify-between text-sm">
                                    <span className="text-ink-70 max-w-[60%]">{COLUMNS[index]}</span>
                                    <SupportMark {...cell} />
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
