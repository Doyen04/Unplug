'use client';

import { useState } from 'react';
import { CreditCard, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface IssueCardPromptProps {
    subscriptionId: string;
    serviceName: string;
    onIssued: () => void;
    isPro: boolean;
}

export function IssueCardPrompt({
    subscriptionId,
    serviceName,
    onIssued,
    isPro,
}: IssueCardPromptProps) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleIssueCard() {
        if (!isPro) {
            // Redirect to upgrade page
            window.location.href = '/dashboard/billing';
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/cards/issue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscriptionId }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? 'Failed to request card');
            }
            toast.success(`${serviceName} card issued successfully.`);
            onIssued();
        } catch (err: any) {
            toast.error(err.message ?? 'Could not issue card. Try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-900/50 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center mx-auto">
                <CreditCard className="w-5 h-5 text-neutral-400" />
            </div>

            <div>
                <p className="text-sm font-medium text-neutral-200">
                    No virtual card for {serviceName}
                </p>
                <p className="text-xs text-neutral-200 mt-1 max-w-xs mx-auto">
                    {isPro
                        ? 'Get a dedicated card. Freeze it anytime to stop the next billing cycle.'
                        : 'Upgrade to Pro to get a virtual card for each subscription.'}
                </p>
            </div>

            <button onClick={handleIssueCard} disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E8482C] text-white text-sm font-medium hover:bg-[#d13f26] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                {isLoading
                    ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Requesting...</>
                    : <><Sparkles className="w-3.5 h-3.5" />{isPro ? 'Get virtual card' : 'Upgrade to Pro'}</>}
            </button>
        </div>
    );
}
