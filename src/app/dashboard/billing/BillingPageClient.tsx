'use client';

import Link from 'next/link';
import { ArrowRight, CreditCard, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { SubscriptionCardPanel } from '@/components/subscriptions/SubscriptionCardPanel';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Subscription } from '@/types/subscription';

interface BillingPageClientProps {
    subscriptions: Subscription[];
    isPro: boolean;
}

export default function BillingPageClient({ subscriptions, isPro }: BillingPageClientProps) {
    const [isUpgrading, setIsUpgrading] = useState(false);

    const canUseCards = isPro;

    const totalMonthly = useMemo(
        () => subscriptions.reduce((sum, sub) => sum + sub.amountMonthly, 0),
        [subscriptions]
    );

    const handleUpgrade = async () => {
        setIsUpgrading(true);
        try {
            const res = await fetch('/api/billing/initialize', { method: 'POST' });
            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.error ?? 'Unable to start checkout.');
            }

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
                return;
            }

            throw new Error('Checkout link was not returned.');
        } catch (error: any) {
            toast.error(error.message ?? 'Unable to start checkout.');
        } finally {
            setIsUpgrading(false);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-brand">
                        <CreditCard size={14} /> Billing & cards
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Manage billing and virtual cards</h1>
                    <p className="max-w-2xl text-sm text-text-secondary">
                        Upgrade to Pro to issue dedicated virtual cards for your subscriptions and keep every renewal protected.
                    </p>
                </div>

                <Button variant={canUseCards ? 'secondary' : 'primary'} size="sm" onClick={handleUpgrade} disabled={isUpgrading || canUseCards}>
                    {isUpgrading ? 'Starting checkout…' : canUseCards ? 'Pro active' : 'Upgrade to Pro'}
                </Button>
            </header>

            <Card className="border border-brand/20 bg-linear-to-br from-brand/10 via-bg-surface to-bg-surface p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-brand" />
                            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-text-secondary">Current plan</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-text-primary">
                                {canUseCards ? 'You have access to virtual cards' : 'Unlock dedicated cards for each subscription'}
                            </h2>
                            <p className="mt-2 max-w-xl text-sm text-text-secondary">
                                {canUseCards
                                    ? 'Every subscription below can be paired with a virtual card that can be frozen in one tap.'
                                    : 'Upgrade once to unlock card issuance for every subscription you track in Unplug.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant={canUseCards ? 'success' : 'secondary'}>{canUseCards ? 'Pro' : 'Free'}</Badge>
                        <div className="rounded-2xl border border-border bg-bg-base/80 px-4 py-3 text-sm text-text-secondary">
                            <div className="text-[10px] uppercase tracking-[0.24em] text-text-muted">Monthly spend</div>
                            <div className="mt-1 text-lg font-semibold text-text-primary">${totalMonthly.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary">Subscriptions ready for cards</h2>
                        <p className="text-sm text-text-secondary">Issue a dedicated card or review the current setup for each service.</p>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/dashboard/subscriptions">View subscriptions <ArrowRight size={14} className="ml-2" /></Link>
                    </Button>
                </div>

                {subscriptions.length === 0 ? (
                    <Card className="border-dashed border-border bg-bg-surface/60 p-8 text-center text-sm text-text-secondary">
                        No subscriptions are available yet. Connect your accounts to start managing billing and card coverage.
                    </Card>
                ) : (
                    subscriptions.map((subscription) => (
                        <Card key={subscription.id} className="p-5">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="space-y-2">
                                    <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-text-muted">Subscription</div>
                                    <div className="text-xl font-semibold text-text-primary">{subscription.serviceName}</div>
                                    <div className="text-sm text-text-secondary">
                                        ${subscription.amountMonthly.toFixed(2)} monthly • {subscription.frequencyLabel}
                                    </div>
                                </div>
                                <SubscriptionCardPanel
                                    subscriptionId={subscription.id}
                                    serviceName={subscription.serviceName}
                                    isPro={canUseCards}
                                />
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
