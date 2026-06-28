'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConnectProviderButtons } from './ConnectProviderButtons';
import { fetchConnectedAccounts } from '@/lib/client/dashboard-api';
import { dashboardKeys } from '@/lib/query-keys';

interface ConnectedAccount {
    id: string;
    displayName: string;
    provider: 'plaid' | 'mono';
    accountRef: string;
    authStatus: 'active' | 'reconnect_required' | 'disconnected';
}

interface ConnectedAccountsSectionProps {
    preferredProvider: 'plaid' | 'mono';
    monoPublicKey: string;
}

export const ConnectedAccountsSection = ({
    preferredProvider,
    monoPublicKey,
}: ConnectedAccountsSectionProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const accountsQuery = useQuery({
        queryKey: dashboardKeys.connectedAccounts(),
        queryFn: fetchConnectedAccounts,
        refetchOnMount: 'always',
    });

    const disconnectMutation = useMutation({
        mutationFn: async (accountId: string) => {
            const formData = new FormData();
            formData.append('accountId', accountId);

            const response = await fetch('/api/connect/disconnect', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to disconnect account');
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: dashboardKeys.connectedAccounts() });
            router.refresh();
        },
    });

    const handleDelete = async (accountId: string) => {
        if (disconnectMutation.isPending) return;
        await disconnectMutation.mutateAsync(accountId);
    };

    const accounts = accountsQuery.data ?? [];

    if (accountsQuery.isLoading) {
        return (
            <Card className="lg:col-span-3 p-0 overflow-hidden">
                <div className="p-6 border-b border-border bg-bg-muted/30 flex items-center justify-between">
                    <div className="h-4 w-40 bg-bg-muted rounded animate-pulse"></div>
                    <div className="h-6 w-12 bg-bg-muted rounded animate-pulse"></div>
                </div>
                <div className="p-6 space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-bg-muted rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card className="lg:col-span-3 p-0 overflow-hidden relative">
            {disconnectMutation.isPending && (
                <div className="absolute inset-0 z-10 bg-bg-surface/60 backdrop-blur-xs flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 animate-pulse">
                        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand border-t-transparent" />
                        <p className="text-xs font-bold uppercase tracking-widest text-brand">Updating...</p>
                    </div>
                </div>
            )}

            <div className="p-6 border-b border-border bg-bg-muted/30 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Connected accounts</p>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">{accounts.length}</Badge>
                </div>
            </div>

            <div className="p-6">
                {accountsQuery.isError && (
                    <div className="mb-4 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-light/20 p-4 text-sm text-text-secondary">
                        <AlertCircle size={16} className="mt-0.5 text-warning" />
                        <div className="space-y-2">
                            <p className="font-semibold text-text-primary">Could not load connected accounts.</p>
                            <p className="text-xs leading-relaxed">You may be offline or the connection service is unavailable. Existing accounts will appear once the request succeeds.</p>
                            <Button size="sm" variant="outline" onClick={() => accountsQuery.refetch()}>
                                Retry
                            </Button>
                        </div>
                    </div>
                )}

                {accounts.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-12 text-center text-text-secondary">
                        <p className="font-semibold">No linked accounts yet</p>
                        <p className="text-sm mt-1">
                            {accountsQuery.isError
                                ? 'Unable to confirm your accounts right now. Try again when the connection is restored.'
                                : 'Choose a provider to get started.'}
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {accounts.map((account) => (
                                <motion.li
                                    layout
                                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -15 }}
                                    transition={{ duration: 0.25, ease: 'easeOut' }}
                                    key={account.id}
                                    className="flex flex-col gap-4 rounded-xl border border-border bg-bg-base/50 p-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-bg-base"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-text-primary">{account.displayName}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted break-all">
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
                                            disabled={disconnectMutation.isPending}
                                            onClick={() => handleDelete(account.id)}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </ul>
                )}
            </div>
        </Card>
    );
};
