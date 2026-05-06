import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Globe } from 'lucide-react';

import { ConnectProviderButtons } from '@/components/features/connect/ConnectProviderButtons';
import { ConnectedAccountsSection } from '@/components/features/connect/ConnectedAccountsSection';
import { listConnectedAccountsByUser } from '@/lib/server/connected-accounts-store';
import { getServerSession } from '@/lib/server/auth-session';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const MONO_COUNTRIES = new Set(['NG', 'GH', 'KE', 'ZA', 'UG', 'TZ']);

const resolveCountry = (countryHeader: string | null, languageHeader: string | null): string => {
    if (countryHeader && countryHeader.length === 2) return countryHeader.toUpperCase();
    const languageSuffix = languageHeader?.split(',')[0]?.split('-')[1];
    if (languageSuffix && languageSuffix.length === 2) return languageSuffix.toUpperCase();
    return 'US';
};

interface ConnectAccountsPageProps {
    searchParams?: Promise<{ error?: string; disconnected?: string; connected?: string }>;
}

const ConnectAccountsPage = async ({ searchParams }: ConnectAccountsPageProps) => {
    const params = (await searchParams) ?? {};
    let session;
    let isOffline = false;
    try {
        session = await getServerSession();
    } catch (e) {
        isOffline = true;
    }

    if (!session && !isOffline) redirect('/login');
    
    const sessionAny = session as { user?: { id?: string } } | null;
    const userId = sessionAny?.user?.id ?? 'local-user';
    
    let accounts: any[] = [];
    try {
        accounts = await listConnectedAccountsByUser(userId);
    } catch (e) {
        isOffline = true;
    }

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

            {(isOffline || hasConnectSuccess || hasDisconnected || hasDisconnectError) && (
                <div className="space-y-3">
                    {isOffline && <Badge variant="warning" className="w-full justify-center py-3 h-auto">Offline Mode: Some data may be unavailable.</Badge>}
                    {hasConnectSuccess && <Badge variant="success" className="w-full justify-center py-3 h-auto">Account connected successfully.</Badge>}
                    {hasDisconnected && <Badge variant="secondary" className="w-full justify-center py-3 h-auto">Account disconnected.</Badge>}
                    {hasDisconnectError && <Badge variant="danger" className="w-full justify-center py-3 h-auto">Could not disconnect account.</Badge>}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-5">
                <ConnectedAccountsSection 
                    initialAccounts={accounts as any} 
                    preferredProvider={preferredProvider} 
                    monoPublicKey={monoPublicKey} 
                />

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
