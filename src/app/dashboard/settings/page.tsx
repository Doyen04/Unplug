import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getServerSession } from '@/lib/server/auth-session';
import { NotificationSwitches } from '@/components/features/settings/NotificationSwitches';
import { DeleteAccountButton } from '@/components/features/settings/DeleteAccountButton';
import { UnsubscribeButton } from '@/components/features/settings/UnsubscribeButton';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { db } from '@/lib/server/db';
import { updateProfileAction } from './actions';

const hasAuthSessionCookie = async (): Promise<boolean> => {
    const cookieStore = await cookies();
    return Boolean(cookieStore.get('better-auth.session_token')?.value)
        || Boolean(cookieStore.get('__Secure-better-auth.session_token')?.value);
};

const getSessionUserField = (session: unknown, key: 'email' | 'name'): string | undefined => {
    if (!session || typeof session !== 'object') return undefined;
    const user = (session as { user?: unknown }).user;
    if (!user || typeof user !== 'object') return undefined;
    const value = (user as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : undefined;
};

interface SettingsPageProps {
    searchParams?: Promise<{ error?: string; success?: string; }>;
}

export default async function DashboardSettingsPage({ searchParams }: SettingsPageProps) {
    const hasSessionCookie = await hasAuthSessionCookie();
    let session = null;
    let isOffline = false;

    try {
        session = await getServerSession();
    } catch {
        isOffline = true;
    }

    if (!session) {
        if (hasSessionCookie || isOffline) {
            isOffline = true;
        } else {
            redirect('/login');
        }
    }

    const params = (await searchParams) ?? {};

    const hasInvalidProfileInput = params.error === 'invalid_profile_input';
    const hasProfileUpdateFailed = params.error === 'profile_update_failed';
    const hasProfileUpdated = params.success === 'profile_updated';
    const hasUnsubscribeFailed = params.error === 'unsubscribe_failed';
    const hasUnsubscribed = params.success === 'unsubscribed';

    const email = getSessionUserField(session, 'email') ?? 'unknown';
    const name = getSessionUserField(session, 'name') ?? 'Account user';

    // Fetch user plan status from DB
    let isPro = false;
    if (session?.user?.id) {
        const user = await db
            .selectFrom('user')
            .select(['plan'])
            .where('id', '=', session.user.id)
            .executeTakeFirst();
        isPro = user?.plan === 'pro';
    }

    return (
        <div className="max-w-[880px] mx-auto pt-6 px-6 max-sm:px-4 space-y-4">
            <header className="mb-5">
                <h1 className="text-[28px] font-semibold leading-tight text-[var(--color-text-primary)] font-display">Settings</h1>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1 font-ui">Manage your personal information and preferences.</p>
            </header>

            {isOffline && (
                <Badge variant="warning" className="w-full justify-center py-3 h-auto">
                    Offline Mode: Some settings may be unavailable.
                </Badge>
            )}

            {hasInvalidProfileInput && <Badge variant="danger" className="w-full justify-center py-2">Input error: Check name and email requirements.</Badge>}
            {hasProfileUpdateFailed && <Badge variant="danger" className="w-full justify-center py-2">Error: Could not update profile.</Badge>}
            {hasProfileUpdated && <Badge variant="success" className="w-full justify-center py-2">Success: Profile has been updated.</Badge>}
            {hasUnsubscribeFailed && <Badge variant="danger" className="w-full justify-center py-2">Error: Could not cancel Pro plan.</Badge>}
            {hasUnsubscribed && <Badge variant="success" className="w-full justify-center py-2">Success: Pro plan cancelled.</Badge>}

            {/* Profile & Security Card */}
            <Card className="p-5 font-ui">
                <div className="flex flex-col gap-1 mb-3.5">
                    <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Profile & Security</h2>
                    <p className="text-xs text-[var(--color-text-secondary)]">Edit your account details and security settings.</p>
                </div>

                <form action={updateProfileAction} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-[var(--color-text-primary)]">Display Name</label>
                            <Input name="name" defaultValue={name} required placeholder="Display Name" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-[var(--color-text-primary)]">Email Address</label>
                            <Input name="email" type="email" defaultValue={email} required placeholder="Email Address" />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
                        <Link href="/forgot-password" className="text-sm font-medium text-[var(--color-brand)] hover:underline">
                            Change Password &rarr;
                        </Link>
                        <Button type="submit" variant="primary">
                            Update Security
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Connected Accounts & Preferences side-by-side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-ui">
                {/* Connected Accounts Card */}
                <Card className="p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex flex-col gap-1 mb-3.5">
                            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Connected Accounts</h2>
                            <p className="text-xs text-[var(--color-text-secondary)]">Manage linked providers.</p>
                        </div>
                        <div className="flex flex-col gap-1 py-3.5 border-b border-[var(--color-border)] last:border-b-0">
                            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Sync Your Financial Data</p>
                            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">Securely connect new accounts or update credentials via Plaid and Mono.</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Button variant="secondary" asChild className="w-full">
                            <Link href="/dashboard/connect">Manage Connections</Link>
                        </Button>
                    </div>
                </Card>

                {/* Preferences Card */}
                <Card className="p-5">
                    <div className="flex flex-col gap-1 mb-3.5">
                        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Preferences</h2>
                        <p className="text-xs text-[var(--color-text-secondary)]">Choose how Unplug reaches you.</p>
                    </div>
                    <div className="divide-y divide-[var(--color-border)]/30">
                        <NotificationSwitches />
                    </div>
                </Card>
            </div>

            {/* Safety & Account Card (Danger Zone) */}
            <Card className="p-5 border-[var(--color-border-strong)] font-ui">
                <div className="flex flex-col gap-1 mb-3.5">
                    <h2 className="text-base font-semibold text-[var(--color-danger)]">Critical Actions</h2>
                    <p className="text-xs text-[var(--color-text-secondary)]">Destructive actions and account removal.</p>
                </div>

                <div className="divide-y divide-[var(--color-border)]">
                    {/* Log Out Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-3.5">
                        <div>
                            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Log Out</p>
                            <p className="text-xs text-[var(--color-text-secondary)] mt-1">End your current session.</p>
                        </div>
                        <Button variant="secondary" asChild className="w-full sm:w-auto">
                            <Link href="/logout">Log Out</Link>
                        </Button>
                    </div>

                    {/* Unsubscribe Row (Only if Pro) */}
                    {isPro && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-3.5">
                            <div>
                                <p className="text-sm font-semibold text-[var(--color-text-primary)]">Unsubscribe from Pro</p>
                                <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-md leading-relaxed">
                                    Cancel your Pro plan. You&apos;ll keep virtual card access until the end of your current billing period.
                                </p>
                            </div>
                            <UnsubscribeButton />
                        </div>
                    )}

                    {/* Delete Account Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-3.5">
                        <div>
                            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Delete Account</p>
                            <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-md leading-relaxed">
                                Permanently remove all your personal and financial data. This can&apos;t be undone.
                            </p>
                        </div>
                        <DeleteAccountButton />
                    </div>
                </div>
            </Card>
        </div>
    );
}
