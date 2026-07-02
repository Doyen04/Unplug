'use client';

import { useTransition } from 'react';
import { deleteAccountAction } from '@/app/dashboard/settings/actions';
import { Button } from '@/components/ui/Button';

export const DeleteAccountButton = () => {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        const confirmed = window.confirm(
            'Are you strictly sure you want to permanently delete your Unplug account? ' +
            'This will wipe all financial connections, mapped subscriptions, and authentication history.'
        );

        if (confirmed) {
            startTransition(() => {
                deleteAccountAction();
            });
        }
    };

    return (
        <Button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="w-full sm:w-auto border border-border text-danger bg-transparent hover:bg-danger-light focus:ring-danger"
        >
            {isPending ? 'Deleting...' : 'Delete Account'}
        </Button>
    );
};
