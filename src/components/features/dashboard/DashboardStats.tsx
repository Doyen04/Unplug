import { useState } from 'react';
import { Flame, Layers, Link as LinkIcon, Check, ArrowUpRight, Share2, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/format';
import { ShareCard } from '@/components/shame-score/ShareCard';

interface DashboardStatsProps {
    summary: {
        monthlySpend: number;
        recentTransactionCount: number;
        shameScore: number;
        linkedAccounts: number;
        unusedCount: number;
    };
    totalSubscriptions: number;
    activeFilterCount: number;
    providers: {
        connected: string[];
        active: string | null;
        hasBoth: boolean;
    };
    currency: string;
    scoreColor: string;
    strokeDashoffset: number;
    dialX: number;
    dialY: number;
    userName?: string;
    walletBalanceKobo?: number;
}

const providerLabel = (provider: string): string =>
    provider === 'plaid' ? 'Plaid' : 'Mono';

export function DashboardStats({
    summary,
    totalSubscriptions,
    activeFilterCount,
    providers,
    currency,
    scoreColor,
    strokeDashoffset,
    dialX,
    dialY,
    userName,
    walletBalanceKobo,
}: DashboardStatsProps) {
    const [isSharing, setIsSharing] = useState(false);

    return (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Wallet Balance */}
            <Card className="group flex flex-col gap-3 p-3.5">
                <div className="flex items-center gap-3">
                    <div className="flex h-9.5 w-9.5 items-center justify-center rounded-full bg-brand-light text-brand ring-1 ring-brand/10 transition-colors group-hover:bg-brand group-hover:text-white">
                        <Wallet size={20} />
                    </div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">Wallet Balance</p>
                </div>
                <div className="flex min-h-14 items-center">
                    <p className="font-ui text-3xl font-bold tabular-nums leading-none text-text-primary">
                        {typeof walletBalanceKobo === 'number'
                            ? `₦${(walletBalanceKobo / 100).toLocaleString('en-US')}`
                            : '—'}
                    </p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary tabular-nums">
                    <span>Available to fund protected subscriptions</span>
                </div>
            </Card>

            {/* Monthly Burn */}
            <Card className="group flex flex-col gap-3 p-3.5">
                <div className="flex items-center gap-3">
                    <div className="flex h-9.5 w-9.5 items-center justify-center rounded-full bg-danger-light text-danger ring-1 ring-danger/10 transition-colors group-hover:bg-danger group-hover:text-white">
                        <Flame size={20} />
                    </div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">Monthly Burn</p>
                </div>
                <div className="flex min-h-14 items-center">
                    <p className="font-ui text-3xl font-bold tabular-nums leading-none text-text-primary">
                        {formatCurrency(summary.monthlySpend, currency)}
                    </p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] text-[#B56B6B] tabular-nums">
                    {summary.recentTransactionCount > 0 ? (
                        <>
                            <ArrowUpRight size={12} />
                            <span>{summary.recentTransactionCount} recent charges analyzed</span>
                        </>
                    ) : (
                        <span>Waiting for transaction data</span>
                    )}
                </div>
            </Card>

            {/* Tracked Subs */}
            <Card className="group flex flex-col gap-3 p-3.5">
                <div className="flex items-center gap-3">
                    <div className="flex h-9.5 w-9.5 items-center justify-center rounded-full bg-brand-light text-brand ring-1 ring-brand/10 transition-colors group-hover:bg-brand group-hover:text-white">
                        <Layers size={20} />
                    </div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">Tracked Subs</p>
                </div>
                <div className="flex min-h-14 items-center">
                    <p className="font-ui text-3xl font-bold tabular-nums leading-none text-text-primary">{totalSubscriptions}</p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary tabular-nums">
                    <ArrowUpRight size={12} />
                    <span>{activeFilterCount} active in this provider</span>
                </div>
            </Card>

            {/* Linked Accounts */}
            <Card className="group flex flex-col gap-3 p-3.5">
                <div className="flex items-center gap-3">
                    <div className="flex h-9.5 w-9.5 items-center justify-center rounded-full bg-success-light text-success ring-1 ring-success/10 transition-colors group-hover:bg-success group-hover:text-white">
                        <LinkIcon size={20} />
                    </div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">Linked Accounts</p>
                </div>
                <div className="flex min-h-14 items-center">
                    <p className="font-ui text-3xl font-bold tabular-nums leading-none text-text-primary">{summary.linkedAccounts}</p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary">
                    <ArrowUpRight size={12} />
                    <span>{providers.active ? `${providerLabel(providers.active)} feed selected` : 'No provider connected'}</span>
                </div>
            </Card>

            {/* Shame Score */}
            <Card className="group relative flex flex-col gap-3 overflow-hidden p-3.5">
                <div className="z-10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9.5 w-9.5 items-center justify-center rounded-full bg-bg-base text-text-primary ring-1 ring-border transition-colors group-hover:bg-text-primary group-hover:text-white">
                            <Check size={20} />
                        </div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">Shame Score</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" className="h-8 px-3 text-[11px]" onClick={() => setIsSharing(true)}>
                        <Share2 size={12} className="mr-1.5" />
                        Share
                    </Button>
                </div>
                <div className="z-10 flex min-h-14 items-center justify-between">
                    <p className="font-ui text-3xl font-bold tabular-nums leading-none text-text-primary">{summary.shameScore}</p>
                    <div className="relative flex h-14 w-14 items-center justify-center transition-transform duration-500 group-hover:scale-110">
                        <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 44 44">
                            <circle cx="22" cy="22" r="20" fill="none" stroke="#F4F3EE" strokeWidth="4" />
                            {summary.shameScore > 0 && (
                                <circle
                                    cx="22"
                                    cy="22"
                                    r="20"
                                    fill="none"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    style={{
                                        stroke: scoreColor,
                                        strokeDasharray: 125.6,
                                        strokeDashoffset,
                                        transition: 'stroke-dashoffset 1s ease-out'
                                    }}
                                />
                            )}
                            <circle
                                cx={dialX}
                                cy={dialY}
                                r="2.3"
                                fill={summary.shameScore > 0 ? scoreColor : '#D0CFC7'}
                                stroke="#FFFFFF"
                                strokeWidth="1"
                            />
                        </svg>
                    </div>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] text-[#5E9273]">
                    <span>{summary.unusedCount} subscriptions need attention</span>
                </div>
                {isSharing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-sm sm:px-6">
                        <div className="relative w-full max-w-2xl rounded-[28px] border border-border/70 bg-bg-surface p-5 sm:p-6 lg:p-8">
                            <button
                                type="button"
                                onClick={() => setIsSharing(false)}
                                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg-base text-lg text-text-secondary transition-colors hover:bg-bg-base/80 hover:text-text-primary"
                                aria-label="Close share dialog"
                            >
                                ×
                            </button>
                            <ShareCard
                                score={summary.shameScore}
                                wasteAmountNaira={summary.monthlySpend}
                                totalSubscriptions={totalSubscriptions}
                                wastedCount={summary.unusedCount}
                                userName={userName}
                            />
                        </div>
                    </div>
                )}
            </Card>
        </section>
    );
}
