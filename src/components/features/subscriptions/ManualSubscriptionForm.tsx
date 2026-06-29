'use client';

import { useState, type FormEvent } from 'react';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface ManualSubscriptionFormProps {
    onSuccess?: () => void | Promise<void>;
}

export function ManualSubscriptionForm({ onSuccess }: ManualSubscriptionFormProps) {
    const [serviceName, setServiceName] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
    const [billingDay, setBillingDay] = useState('1');
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!serviceName.trim()) {
            toast.error('Add the service name first.');
            return;
        }

        const parsedAmount = Number(amount);
        const parsedBillingDay = Number(billingDay);

        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            toast.error('Enter a valid monthly amount.');
            return;
        }

        if (!Number.isInteger(parsedBillingDay) || parsedBillingDay < 1 || parsedBillingDay > 31) {
            toast.error('Billing day must be between 1 and 31.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceName: serviceName.trim(),
                    amountMonthly: parsedAmount,
                    currency,
                    billingDay: parsedBillingDay,
                }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error ?? 'Unable to create subscription.');
            }

            toast.success(`${serviceName.trim()} added. A card request is being processed immediately.`);
            setServiceName('');
            setAmount('');
            setCurrency('NGN');
            setBillingDay('1');
            await onSuccess?.();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Unable to create subscription.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card className="border border-border bg-bg-surface/80 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-text-secondary">
                        <PlusCircle size={14} /> Manual addition
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary">Add a subscription manually</h2>
                        <p className="mt-1 max-w-2xl text-sm text-text-secondary">
                            Create a subscription record and queue a dedicated virtual card for its next renewal.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2 md:col-span-2 xl:col-span-1">
                    <label className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted" htmlFor="serviceName">
                        Service name
                    </label>
                    <Input
                        id="serviceName"
                        value={serviceName}
                        onChange={(event) => setServiceName(event.target.value)}
                        placeholder="Netflix"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted" htmlFor="amount">
                        Monthly amount
                    </label>
                    <Input
                        id="amount"
                        type="number"
                        min="1"
                        step="0.01"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        placeholder="1200"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted" htmlFor="currency">
                        Currency
                    </label>
                    <select
                        id="currency"
                        value={currency}
                        onChange={(event) => setCurrency(event.target.value as 'NGN' | 'USD')}
                        className="flex h-12 w-full rounded-btn border border-border bg-bg-base px-4 py-3 text-sm text-text-primary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                    >
                        <option value="NGN">NGN</option>
                        <option value="USD">USD</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted" htmlFor="billingDay">
                        Billing day
                    </label>
                    <Input
                        id="billingDay"
                        type="number"
                        min="1"
                        max="31"
                        value={billingDay}
                        onChange={(event) => setBillingDay(event.target.value)}
                    />
                </div>

                <div className="md:col-span-2 xl:col-span-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                    <p className="text-sm text-text-secondary">
                        We’ll create the subscription record and issue a dedicated virtual card immediately.
                    </p>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating…' : 'Create subscription'}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
