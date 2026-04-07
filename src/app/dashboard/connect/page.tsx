import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ConnectProviderButtons } from '../../../components/features/connect/ConnectProviderButtons';
import {
    disconnectConnectedAccount,
    listConnectedAccountsByUser,
} from '../../../lib/server/connected-accounts-store';
import { getServerSession } from '../../../lib/server/auth-session';

const MONO_COUNTRIES = new Set(['NG', 'GH', 'KE', 'ZA', 'UG', 'TZ']);

const resolveCountry = (countryHeader: string | null, languageHeader: string | null): string => {
    if (countryHeader && countryHeader.length === 2) {
        return countryHeader.toUpperCase();
    }

    const languageSuffix = languageHeader?.split(',')[0]?.split('-')[1];
    if (languageSuffix && languageSuffix.length === 2) {
        return languageSuffix.toUpperCase();
    }

    return 'US';
};

const disconnectAccountAction = async (formData: FormData) => {
    'use server';

    const session = await getServerSession();
    if (!session) {
        redirect('/login');
    }

    const sessionAny = session as { user?: { id?: string } };
    const userId = sessionAny.user?.id ?? 'local-user';
    const accountId = String(formData.get('accountId') ?? '').trim();

    if (!accountId) {
        redirect('/dashboard/connect?error=disconnect_failed');
    }

    const ok = await disconnectConnectedAccount(userId, accountId);
    if (!ok) {
        redirect('/dashboard/connect?error=disconnect_failed');
    }

    redirect('/dashboard/connect?disconnected=1');
};

interface ConnectAccountsPageProps {
    searchParams?: Promise<{ error?: string; disconnected?: string; connected?: string }>;
}

const ConnectAccountsPage = async ({ searchParams }: ConnectAccountsPageProps) => {
    const session = await getServerSession();
    if (!session) {
        redirect('/login');
    }

    const sessionAny = session as { user?: { id?: string } };
    const userId = sessionAny.user?.id ?? 'local-user';

    const accounts = await listConnectedAccountsByUser(userId);
    const params = (await searchParams) ?? {};
    const hasDisconnected = params.disconnected === '1';
    const hasConnectSuccess = params.connected === 'plaid' || params.connected === 'mono';
    const hasDisconnectError = params.error === 'disconnect_failed';

    const requestHeaders = await headers();
    const countryCode = resolveCountry(
        requestHeaders.get('x-vercel-ip-country'),
        requestHeaders.get('accept-language')
    );

    const preferredProvider = MONO_COUNTRIES.has(countryCode) ? 'mono' : 'plaid';

    return (
        <main className="min-h-screen bg-stone-950 px-4 py-10 text-stone-100 md:px-6 lg:px-8">
            <section className="mx-auto max-w-4xl border border-stone-800 bg-stone-900 p-6 sm:p-8">
                <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Account Connections</p>
                <h1 className="mt-4 font-display text-4xl leading-tight text-stone-100">Connect your accounts</h1>
                <p className="mt-5 text-sm leading-7 text-stone-300">
                    We detected your location as <span className="text-stone-100">{countryCode}</span>. Choose
                    your bank linking provider below.
                </p>

                {hasConnectSuccess ? (
                    <div className="mt-4 border border-acid-muted bg-acid-muted/30 p-3 text-xs uppercase tracking-[0.08em] text-acid-green">
                        Account connected.
                    </div>
                ) : null}

                {hasDisconnected ? (
                    <div className="mt-4 border border-acid-muted bg-acid-muted/30 p-3 text-xs uppercase tracking-[0.08em] text-acid-green">
                        Account disconnected.
                    </div>
                ) : null}

                {hasDisconnectError ? (
                    <div className="mt-4 border border-red-900 bg-red-950 p-3 text-xs uppercase tracking-[0.08em] text-red-400">
                        Could not disconnect account.
                    </div>
                ) : null}

                <section className="mt-6 border border-stone-800 bg-stone-950 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Connected accounts</p>
                        <p className="text-xs uppercase tracking-[0.08em] text-stone-500">{accounts.length}</p>
                    </div>

                    {accounts.length === 0 ? (
                        <p className="mt-3 text-sm text-stone-500">No linked accounts yet.</p>
                    ) : (
                        <ul className="mt-3 space-y-2">
                            {accounts.map((account) => (
                                <li
                                    key={account.id}
                                    className="flex flex-col gap-2 border border-stone-800 bg-stone-900 p-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <p className="text-sm text-stone-100">{account.displayName}</p>
                                        <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">
                                            {account.provider} · {account.accountRef}
                                        </p>
                                    </div>

                                    <form action={disconnectAccountAction}>
                                        <input type="hidden" name="accountId" value={account.id} />
                                        <button
                                            type="submit"
                                            className="border border-red-900 px-3 py-1 text-xs uppercase tracking-[0.08em] text-red-400 hover:border-red-700"
                                        >
                                            Disconnect
                                        </button>
                                    </form>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <div className="mt-8 grid gap-3 md:grid-cols-2">
                    <article
                        className={`border p-4 ${preferredProvider === 'plaid'
                            ? 'border-acid-green bg-acid-muted/30'
                            : 'border-stone-700 bg-stone-950'
                            }`}
                    >
                        <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Recommended in US/Canada</p>
                        <h2 className="mt-2 font-display text-3xl text-stone-100">Plaid</h2>
                        <p className="mt-3 text-sm leading-7 text-stone-300">
                            Best for US-focused bank connections with broad institution support.
                        </p>
                        <ConnectProviderButtons provider="plaid" preferredProvider={preferredProvider} />
                    </article>

                    <article
                        className={`border p-4 ${preferredProvider === 'mono'
                            ? 'border-acid-green bg-acid-muted/30'
                            : 'border-stone-700 bg-stone-950'
                            }`}
                    >
                        <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Recommended in Africa</p>
                        <h2 className="mt-2 font-display text-3xl text-stone-100">Mono</h2>
                        <p className="mt-3 text-sm leading-7 text-stone-300">
                            Best for Nigeria and supported African markets with regional banking coverage.
                        </p>
                        <ConnectProviderButtons provider="mono" preferredProvider={preferredProvider} />
                    </article>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/dashboard"
                        className="border border-stone-600 px-4 py-2 text-center text-xs uppercase tracking-[0.08em] text-stone-100 hover:border-stone-400"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </section>
        </main>
    );
};

export default ConnectAccountsPage;
