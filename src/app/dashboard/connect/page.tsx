import { headers } from 'next/headers';
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
    const monoPublicKey = process.env.MONO_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY ?? '';
    const monoSandboxPublicKey =
        process.env.MONO_SANDBOX_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_MONO_SANDBOX_PUBLIC_KEY ?? '';

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#1A1A17]">Connect Accounts</h1>
                    <p className="text-sm text-[#6B6960]">
                        Region detected: <span className="text-[#1A1A17] font-semibold">{countryCode}</span>. Choose your bank linking provider below.
                    </p>
                </div>
            </header>

            {(hasConnectSuccess || hasDisconnected || hasDisconnectError) && (
                <div className="space-y-3">
                    {hasConnectSuccess && (
                        <div className="rounded-[10px] border border-[#1C9E5B] bg-[#EDFAF3] p-3 text-xs uppercase tracking-[0.08em] text-[#1C9E5B]">
                            Account connected.
                        </div>
                    )}
                    {hasDisconnected && (
                        <div className="rounded-[10px] border border-[#1C9E5B] bg-[#EDFAF3] p-3 text-xs uppercase tracking-[0.08em] text-[#1C9E5B]">
                            Account disconnected.
                        </div>
                    )}
                    {hasDisconnectError && (
                        <div className="rounded-[10px] border border-[#E53434] bg-[#FEF0F0] p-3 text-xs uppercase tracking-[0.08em] text-[#E53434]">
                            Could not disconnect account.
                        </div>
                    )}
                </div>
            )}

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-2xl border border-[#E8E7E0] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Connected accounts</p>
                        <p className="text-xs uppercase tracking-[0.08em] text-[#A9A79E]">{accounts.length}</p>
                    </div>

                    {accounts.length === 0 ? (
                        <p className="mt-4 rounded-2xl border border-[#E8E7E0] bg-[#FAFAF7] p-4 text-sm text-[#6B6960]">No linked accounts yet.</p>
                    ) : (
                        <ul className="mt-4 space-y-2">
                            {accounts.map((account) => (
                                <li
                                    key={account.id}
                                    className="flex flex-col gap-3 rounded-2xl border border-[#E8E7E0] bg-[#FAFAF7] p-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <p className="text-sm text-[#1A1A17]">{account.displayName}</p>
                                        <p className="text-[11px] uppercase tracking-[0.08em] text-[#A9A79E]">
                                            {account.provider} · {account.accountRef}
                                        </p>
                                        <p
                                            className={`mt-1 text-[11px] uppercase tracking-[0.08em] ${account.authStatus === 'reconnect_required'
                                                ? 'text-[#E8860A]'
                                                : 'text-[#1C9E5B]'
                                                }`}
                                        >
                                            {account.authStatus === 'reconnect_required' ? 'Reconnect required' : 'Active'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {account.provider === 'plaid' && account.authStatus === 'reconnect_required' ? (
                                            <ConnectProviderButtons
                                                provider="plaid"
                                                preferredProvider={preferredProvider}
                                                accountId={account.id}
                                                compact
                                                monoPublicKey={monoPublicKey}
                                                monoSandboxPublicKey={monoSandboxPublicKey}
                                            />
                                        ) : null}

                                        <form action={disconnectAccountAction}>
                                            <input type="hidden" name="accountId" value={account.id} />
                                            <button
                                                type="submit"
                                                className="rounded-[10px] border border-[#E53434] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#E53434] hover:bg-[#FEF0F0] focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
                                            >
                                                Disconnect
                                            </button>
                                        </form>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="space-y-3">
                    <article
                        className={`rounded-2xl border p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] ${preferredProvider === 'plaid'
                            ? 'border-[#FF5C35] bg-[#FFF0EC]'
                            : 'border-[#E8E7E0] bg-white'
                            }`}
                    >
                        <p className="text-[11px] uppercase tracking-[0.08em] text-[#A9A79E]">Recommended in US/Canada</p>
                        <h2 className="font-display mt-2 text-3xl text-[#1A1A17]">Plaid</h2>
                        <p className="mt-3 text-sm leading-7 text-[#6B6960]">
                            Best for US-focused bank connections with broad institution support.
                        </p>
                        <ConnectProviderButtons
                            provider="plaid"
                            preferredProvider={preferredProvider}
                            monoPublicKey={monoPublicKey}
                            monoSandboxPublicKey={monoSandboxPublicKey}
                        />
                    </article>

                    <article
                        className={`rounded-2xl border p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] ${preferredProvider === 'mono'
                            ? 'border-[#FF5C35] bg-[#FFF0EC]'
                            : 'border-[#E8E7E0] bg-white'
                            }`}
                    >
                        <p className="text-[11px] uppercase tracking-[0.08em] text-[#A9A79E]">Recommended in Africa</p>
                        <h2 className="font-display mt-2 text-3xl text-[#1A1A17]">Mono</h2>
                        <p className="mt-3 text-sm leading-7 text-[#6B6960]">
                            Best for Nigeria and supported African markets with regional banking coverage.
                        </p>
                        <ConnectProviderButtons
                            provider="mono"
                            preferredProvider={preferredProvider}
                            monoPublicKey={monoPublicKey}
                            monoSandboxPublicKey={monoSandboxPublicKey}
                        />
                    </article>
                </section>
            </div>
        </div>
    );
};

export default ConnectAccountsPage;
