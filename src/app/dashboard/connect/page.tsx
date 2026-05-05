import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Globe, Trash2 } from 'lucide-react';

import { ConnectProviderButtons } from '@/components/features/connect/ConnectProviderButtons';
import {
    disconnectConnectedAccount,
    listConnectedAccountsByUser,
} from '@/lib/server/connected-accounts-store';
import { getServerSession } from '@/lib/server/auth-session';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const MONO_COUNTRIES = new Set(['NG', 'GH', 'KE', 'ZA', 'UG', 'TZ']);

const resolveCountry = (countryHeader: string | null, languageHeader: string | null): string => {
    if (countryHeader && countryHeader.length === 2) return countryHeader.toUpperCase();
    const languageSuffix = languageHeader?.split(',')[0]?.split('-')[1];
    if (languageSuffix && languageSuffix.length === 2) return languageSuffix.toUpperCase();
    return 'US';
};

const disconnectAccountAction = async (formData: FormData) => {
    'use server';
    const session = await getServerSession();
    if (!session) redirect('/login');
    const sessionAny = session as { user?: { id?: string } };
    const userId = sessionAny.user?.id ?? 'local-user';
    const accountId = String(formData.get('accountId') ?? '').trim();
    if (!accountId) redirect('/dashboard/connect?error=disconnect_failed');
    const ok = await disconnectConnectedAccount(userId, accountId);
    if (!ok) redirect('/dashboard/connect?error=disconnect_failed');
    redirect('/dashboard/connect?disconnected=1');
};

interface ConnectAccountsPageProps {
    searchParams?: Promise<{ error?: string; disconnected?: string; connected?: string }>;
}

const ConnectAccountsPage = async ({ searchParams }: ConnectAccountsPageProps) => {
    const session = await getServerSession();
    if (!session) redirect('/login');
    const sessionAny = session as { user?: { id?: string } };
    const userId = sessionAny.user?.id ?? 'local-user';
    const accounts = await listConnectedAccountsByUser(userId);
    const params = (await searchParams) ?? {};
    const hasDisconnected = params.disconnected === '1';
    const hasConnectSuccess = params.connected === 'plaid' || params.connected === 'mono';
    const hasDisconnectError = params.error === 'disconnect_failed';

    const requestHeaders = await headers();
    const countryCode = resolveCountry(requestHeaders.get('x-vercel-ip-country'), requestHeaders.get('accept-language'));
    const preferredProvider = MONO_COUNTRIES.has(countryCode) ? 'mono' : 'plaid';
    const monoPublicKey = process.env.MONO_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY ?? '';

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Connect Accounts</h1>
                    <p className="flex items-center gap-1.5 text-sm text-text-secondary">
                        <Globe size={14} className="text-text-muted" />
                        Region detected: <span className="text-text-primary font-bold">{countryCode}</span>. Choose your bank linking provider.
                    </p>
                </div>
            </header>

            {(hasConnectSuccess || hasDisconnected || hasDisconnectError) && (
                <div className="space-y-3">
                    {hasConnectSuccess && <Badge variant="success" className="w-full justify-center py-3 h-auto">Account connected successfully.</Badge>}
                    {hasDisconnected && <Badge variant="secondary" className="w-full justify-center py-3 h-auto">Account disconnected.</Badge>}
                    {hasDisconnectError && <Badge variant="danger" className="w-full justify-center py-3 h-auto">Could not disconnect account.</Badge>}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-5">
                <Card className="lg:col-span-3 p-0 overflow-hidden">
                    <div className="p-6 border-b border-border bg-bg-muted/30 flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Connected accounts</p>
                        <Badge variant="secondary">{accounts.length}</Badge>
                    </div>

                    <div className="p-6">
                        {accounts.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-border p-12 text-center text-text-secondary">
                                <p className="font-semibold">No linked accounts yet</p>
                                <p className="text-sm mt-1">Choose a provider to get started.</p>
                            </div>
                        ) : (
                            <ul className="space-y-4">
                                {accounts.map((account) => (
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
                                            <form action={disconnectAccountAction}>
                                                <input type="hidden" name="accountId" value={account.id} />
                                                <Button variant="dangerOutline" size="icon" type="submit" className="h-8 w-8" title="Disconnect account">
                                                    <Trash2 size={14} />
                                                </Button>
                                            </form>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </Card>

                <div className="lg:col-span-2 space-y-4">
                    <Card className={`relative overflow-hidden ${preferredProvider === 'plaid' ? 'ring-2 ring-brand' : ''}`}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">North America / Europe</p>
                        <h2 className="font-display mt-2 text-3xl font-bold text-text-primary">Plaid</h2>
                        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                            Best for US, Canada, and UK bank connections with broad institution support.
                        </p>
                        <div className="mt-6">
                            <ConnectProviderButtons provider="plaid" preferredProvider={preferredProvider} monoPublicKey={monoPublicKey} />
                        </div>
                    </Card>

                    <Card className={`relative overflow-hidden ${preferredProvider === 'mono' ? 'ring-2 ring-brand' : ''}`}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Africa</p>
                        <h2 className="font-display mt-2 text-3xl font-bold text-text-primary">Mono</h2>
                        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                            Preferred for Nigeria, Kenya, and South African markets with regional coverage.
                        </p>
                        <div className="mt-6">
                            <ConnectProviderButtons provider="mono" preferredProvider={preferredProvider} monoPublicKey={monoPublicKey} />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ConnectAccountsPage;
