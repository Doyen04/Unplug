'use client';

import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CreditCard, Loader2, PlusCircle, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface CreateCardModalProps {
    onSuccess?: () => void | Promise<void>;
}

/**
 * CreateCardModal
 *
 * Button + modal for manually adding a subscription and issuing its virtual
 * card in one step. Replaces the old always-visible inline form.
 *
 * NOTE ON BILLING DATE:
 * There's intentionally no "billing day" input here. The backend assigns a
 * placeholder anchor at creation time and then corrects `billing_day` to the
 * real value automatically the first time the card is actually charged
 * (see the Sudo webhook handler) — the user never has to guess it.
 */
export function CreateCardModal({ onSuccess }: CreateCardModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [serviceName, setServiceName] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
    const [isSubmitting, setIsSubmitting] = useState(false);

    function resetForm() {
        setServiceName('');
        setAmount('');
        setCurrency('NGN');
    }

    function handleClose() {
        if (isSubmitting) return; // prevent closing mid-request
        setIsOpen(false);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!serviceName.trim()) {
            toast.error('Add the service name first.');
            return;
        }

        const parsedAmount = Number(amount);
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            toast.error('Enter a valid monthly amount.');
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
                }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error ?? 'Unable to create card.');
            }

            toast.success(`${serviceName.trim()} card issued successfully.`);
            resetForm();
            setIsOpen(false);
            await onSuccess?.();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Unable to create card.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <Button type="button" onClick={() => setIsOpen(true)} className="gap-2 w-full sm:w-auto">
                <PlusCircle size={16} /> Create virtual card
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                            className="fixed inset-0 bg-text-primary/40 backdrop-blur-sm"
                            aria-hidden="true"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-card border border-border bg-bg-surface shadow-2xl"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="create-card-modal-title"
                        >
                            <div className="flex items-center justify-between border-b border-border bg-bg-muted/40 px-5 py-4">
                                <h2
                                    id="create-card-modal-title"
                                    className="flex items-center gap-2 text-base font-semibold text-text-primary"
                                >
                                    <CreditCard size={18} className="text-brand" />
                                    Create a virtual card
                                </h2>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-bg-muted hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
                                    aria-label="Close"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 p-5">
                                <p className="text-sm leading-relaxed text-text-secondary">
                                    We&apos;ll create the subscription record and issue a dedicated virtual
                                    card immediately. Your billing date is detected automatically the
                                    first time the card is charged — no need to guess it.
                                </p>

                                <div className="space-y-2">
                                    <label
                                        className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted"
                                        htmlFor="cc-service-name"
                                    >
                                        Service name
                                    </label>
                                    <Input
                                        id="cc-service-name"
                                        value={serviceName}
                                        onChange={(event) => setServiceName(event.target.value)}
                                        placeholder="Netflix"
                                        autoFocus
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label
                                            className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted"
                                            htmlFor="cc-amount"
                                        >
                                            Monthly amount
                                        </label>
                                        <Input
                                            id="cc-amount"
                                            type="number"
                                            min="1"
                                            step="0.01"
                                            value={amount}
                                            onChange={(event) => setAmount(event.target.value)}
                                            placeholder="1200"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted"
                                            htmlFor="cc-currency"
                                        >
                                            Currency
                                        </label>
                                        <select
                                            id="cc-currency"
                                            value={currency}
                                            onChange={(event) => setCurrency(event.target.value as 'NGN' | 'USD')}
                                            className="flex h-12 w-full rounded-btn border border-border bg-bg-base px-4 py-3 text-sm text-text-primary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                                        >
                                            <option value="NGN">NGN</option>
                                            <option value="USD">USD</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse items-center gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleClose}
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto"
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting} className="w-full gap-2 sm:w-auto">
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={14} className="animate-spin" /> Creating…
                                            </>
                                        ) : (
                                            'Create card'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
