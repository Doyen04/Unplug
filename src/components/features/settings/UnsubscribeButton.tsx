'use client';

import { useTransition } from 'react';
import { unsubscribeFromProAction } from '@/app/dashboard/settings/actions';
import { Button } from '@/components/ui/Button';

export const UnsubscribeButton = () => {
    const [isPending, startTransition] = useTransition();

    const handleUnsubscribe = () => {
        const confirmed = window.confirm(
            'Are you sure you want to unsubscribe from Pro? ' +
            'You will keep virtual card access until the end of your current billing period.'
        );

        if (confirmed) {
            startTransition(() => {
                unsubscribeFromProAction();
            });
        }
    };

    return (
        <Button
            type="button"
            onClick={handleUnsubscribe}
            disabled={isPending}
            className="w-full sm:w-auto border border-[var(--color-border)] text-[var(--color-warning)] bg-transparent hover:bg-[var(--color-warning-light)] focus:ring-[var(--color-warning)]"
        >
            {isPending ? 'Unsubscribing...' : 'Unsubscribe'}
        </Button>
    );
};
