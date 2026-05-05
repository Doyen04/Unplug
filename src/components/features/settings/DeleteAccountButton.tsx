'use client';

import { useTransition } from 'react';
import { deleteAccountAction } from '../../../app/dashboard/settings/actions';

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
        <button 
            type="button" 
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center justify-center w-full sm:w-auto rounded-xl bg-[#E53434] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-white hover:bg-[#C92929] focus:ring-2 focus:ring-offset-1 focus:ring-[#E53434] transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isPending ? 'Deleting...' : 'Delete Account'}
        </button>
    );
};
