'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConnectProviderButtons } from './ConnectProviderButtons';

interface ConnectedAccount {
    id: string;
    displayName: string;
    provider: 'plaid' | 'mono';
    accountRef: string;
    authStatus: 'active' | 'reconnect_required' | 'disconnected';
}

interface ConnectedAccountsSectionProps {
    initialAccounts: ConnectedAccount[];
    preferredProvider: 'plaid' | 'mono';
    monoPublicKey: string;
}

export const ConnectedAccountsSection = ({
    initialAccounts,
    preferredProvider,
    monoPublicKey,
}: ConnectedAccountsSectionProps) => {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    // This is a simple server action wrapper to show loading
    const handleDelete = async (accountId: string) => {
        if (isPending) return;
        setIsPending(true);
        try {
            const formData = new FormData();
            formData.append('accountId', accountId);
            
            // We use a trick to call the server action from client and then refresh
            const response = await fetch('/api/connect/disconnect', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                router.refresh();
            }
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Card className="lg:col-span-3 p-0 overflow-hidden relative">
            {isPending && (
                <div className="absolute inset-0 z-10 bg-bg-surface/60 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                        <p className="text-xs font-bold text-text-primary uppercase tracking-widest">Updating...</p>
                    </div>
                </div>
            )}

            <div className="p-6 border-b border-border bg-bg-muted/30 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Connected accounts</p>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">{initialAccounts.length}</Badge>
                </div>
            </div>

            <div className="p-6">
                {initialAccounts.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-12 text-center text-text-secondary">
                        <p className="font-semibold">No linked accounts yet</p>
                        <p className="text-sm mt-1">Choose a provider to get started.</p>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {initialAccounts.map((account) => (
                            <li key={account.id} className="flex flex-col gap-4 rounded-xl border border-border bg-bg-base/50 p-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-bg-base">
                                <div>
                                    <p className="text-sm font-bold text-text-primary">{account.displayName}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                                        {account.provider} · {account.accountRef}
                                    </p>
                                    <Badge variant={account.authStatus === 'reconnect_required' ? 'warning' : 'success'} className="mt-2 text-[8px] px-1.5">
                                        {account.authStatus === 'reconnect_required' ? 'Reconnect' : 'Active'}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-3">
                                    {account.authStatus === 'reconnect_required' && (
                                        <ConnectProviderButtons
                                            provider={account.provider} preferredProvider={preferredProvider}
                                            accountId={account.id} compact monoPublicKey={monoPublicKey}
                                        />
                                    )}
                                    <Button 
                                        variant="dangerOutline" 
                                        size="icon" 
                                        className="h-8 w-8" 
                                        title="Disconnect account"
                                        disabled={isPending}
                                        onClick={() => handleDelete(account.id)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Card>
    );
};
