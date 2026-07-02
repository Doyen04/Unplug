import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Globe } from 'lucide-react';

import { ConnectProviderButtons } from '@/components/features/connect/ConnectProviderButtons';
import { ConnectedAccountsSection } from '@/components/features/connect/ConnectedAccountsSection';
import { ConnectStatusToast } from '@/components/features/connect/ConnectStatusToast';
import { getServerSession } from '@/lib/server/auth-session';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const MONO_COUNTRIES = new Set(['NG', 'GH', 'KE', 'ZA', 'UG', 'TZ']);

const resolveCountry = (
    countryHeader: string | null,
    languageHeader: string | null,
    forceRegion?: string
): string => {
    if (forceRegion && forceRegion.length === 2) return forceRegion.toUpperCase();
    if (countryHeader && countryHeader.length === 2) return countryHeader.toUpperCase();

    // Fallback using server environment time zone (helps heavily in local development)
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
        if (tz.includes('Lagos')) return 'NG';
        if (tz.includes('Accra')) return 'GH';
        if (tz.includes('Nairobi')) return 'KE';
        if (tz.includes('Johannesburg')) return 'ZA';
        if (tz.includes('Kampala')) return 'UG';
        if (tz.includes('Dar_es_Salaam')) return 'TZ';
        if (tz.includes('London')) return 'GB';
    }

    const languageSuffix = languageHeader?.split(',')[0]?.split('-')[1];
    if (languageSuffix && languageSuffix.length === 2 && languageSuffix.toUpperCase() !== 'US') {
        // Ignore US language suffix because en-US is the default language for most browser installations globally
        return languageSuffix.toUpperCase();
    }

    return 'US';
};

interface ConnectAccountsPageProps {
    searchParams?: Promise<{ error?: string; disconnected?: string; connected?: string; region?: string; welcome?: string }>;
}

const ConnectAccountsPage = async ({ searchParams }: ConnectAccountsPageProps) => {
    const params = (await searchParams) ?? {};
    let isOffline = false;
    const session = await getServerSession();

    if(!session) {
        isOffline = true;
    }

    if (!session) {
        if (session || isOffline) {
            isOffline = true;
        } else {
            redirect('/login');
        }
    }

    const requestHeaders = await headers();
    const countryCode = resolveCountry(
        requestHeaders.get('x-vercel-ip-country') || requestHeaders.get('cf-ipcountry'),
        requestHeaders.get('accept-language'),
        params.region
    );
    const preferredProvider = MONO_COUNTRIES.has(countryCode) ? 'mono' : 'plaid';
    const monoPublicKey = process.env.MONO_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY ?? '';

    const hasConnectSuccess = params.connected === 'plaid' || params.connected === 'mono';
    const hasDisconnected = params.disconnected === '1';
    const hasDisconnectError = params.error === 'disconnect_failed';
    const hasWelcome = params.welcome === '1';

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Connect Accounts</h1>
                    <div className="flex items-start gap-1.5 text-sm text-text-secondary">
                        <Globe size={14} className="text-text-muted mt-0.5 shrink-0" />
                        <p>
                            Region detected: <span className="text-text-primary font-bold">{countryCode}</span>. Choose your bank linking provider.
                        </p>
                    </div>
                </div>
            </header>

            {(isOffline || hasWelcome) && (
                <div className="space-y-3">
                    {isOffline && <Badge variant="warning" className="w-full justify-center py-3 h-auto">Offline Mode: Some data may be unavailable.</Badge>}
                    {hasWelcome && <Badge variant="success" className="w-full justify-center py-3 h-auto">Welcome! Connect an account to get started.</Badge>}
                </div>
            )}

            {hasConnectSuccess || hasDisconnected || hasDisconnectError ? (
                <ConnectStatusToast
                    hasConnectSuccess={hasConnectSuccess}
                    hasDisconnected={hasDisconnected}
                    hasDisconnectError={hasDisconnectError}
                />
            ) : null}

            <div className="grid gap-6 lg:grid-cols-5">
                <ConnectedAccountsSection
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
