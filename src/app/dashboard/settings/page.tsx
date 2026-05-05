import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Shield, CreditCard, Bell, AlertOctagon, LogOut, Key, ArrowRight } from 'lucide-react';

import { FormSubmitButton } from '../../../components/features/auth/FormSubmitButton';
import { auth } from '../../../lib/auth';
import { getServerSession } from '../../../lib/server/auth-session';
import { sql } from 'kysely';
import { db } from '../../../lib/server/db';
import { NotificationSwitches } from '../../../components/features/settings/NotificationSwitches';
import { DeleteAccountButton } from '../../../components/features/settings/DeleteAccountButton';

import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';

const getSessionUserField = (session: unknown, key: 'email' | 'name'): string | undefined => {
    if (!session || typeof session !== 'object') return undefined;
    const user = (session as { user?: unknown }).user;
    if (!user || typeof user !== 'object') return undefined;
    const value = (user as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : undefined;
};

const changePasswordAction = async (formData: FormData) => {
    'use server';
    const currentPassword = String(formData.get('currentPassword') ?? '').trim();
    const newPassword = String(formData.get('newPassword') ?? '').trim();
    if (!currentPassword || newPassword.length < 8) redirect('/dashboard/settings?error=invalid_input');
    try {
        await auth.api.changePassword({
            body: { currentPassword, newPassword, revokeOtherSessions: true },
            headers: await headers(),
        });
    } catch { redirect('/dashboard/settings?error=change_failed'); }
    redirect('/dashboard/settings?success=password_changed');
};

interface SettingsPageProps {
    searchParams?: Promise<{ error?: string; success?: string; }>;
}

export default async function DashboardSettingsPage({ searchParams }: SettingsPageProps) {
    const session = await getServerSession();
    if (!session) redirect('/login');

    const params = (await searchParams) ?? {};
    const userId = session.user.id;
    let userSettings = { new_subscriptions_alerts: true, monthly_summary: true, price_increase_alert: false };

    try {
        const result = await sql`SELECT new_subscriptions_alerts, monthly_summary, price_increase_alert FROM user_settings WHERE user_id = ${userId}`.execute(db);
        if (result.rows.length > 0) {
            const row = result.rows[0] as any;
            userSettings = {
                new_subscriptions_alerts: Boolean(row.new_subscriptions_alerts),
                monthly_summary: Boolean(row.monthly_summary),
                price_increase_alert: Boolean(row.price_increase_alert),
            };
        }
    } catch { /* use defaults */ }

    const hasInvalidInputError = params.error === 'invalid_input';
    const hasChangeFailedError = params.error === 'change_failed';
    const hasPasswordChanged = params.success === 'password_changed';

    const email = getSessionUserField(session, 'email') ?? 'unknown';
    const name = getSessionUserField(session, 'name') ?? 'Account user';

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-text-primary">Settings</h1>
                <p className="text-sm text-text-secondary">Manage your personal information and preferences.</p>
            </header>

            <div className="space-y-6">
                {/* PROFILE SECTION */}
                <section>
                    <Card className="p-0 overflow-hidden">
                        <div className="border-b border-border bg-bg-muted/30 px-6 py-5 flex items-center gap-4 sm:px-8">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-text-primary border border-border">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-text-primary">Profile & Security</h2>
                                <p className="text-xs text-text-secondary mt-0.5">Manage your personal information and password.</p>
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 grid gap-8 md:grid-cols-5">
                            <div className="md:col-span-2 space-y-6">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Name</p>
                                    <p className="mt-1.5 text-base font-bold text-text-primary">{name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Email</p>
                                    <p className="mt-1.5 text-base font-bold text-text-primary">{email}</p>
                                </div>
                            </div>

                            <div className="md:col-span-3 rounded-xl border border-dashed border-border p-6 bg-bg-base/50">
                                <div className="flex items-center gap-2 mb-5">
                                    <Key className="text-text-secondary" size={16} />
                                    <p className="text-sm font-bold text-text-primary">Change Password</p>
                                </div>

                                {hasInvalidInputError && <Badge variant="danger" className="mb-5 w-full justify-center">Enter valid current and new password (min 8 chars).</Badge>}
                                {hasChangeFailedError && <Badge variant="danger" className="mb-5 w-full justify-center">Update failed. Check your current password.</Badge>}
                                {hasPasswordChanged && <Badge variant="success" className="mb-5 w-full justify-center">Password updated successfully.</Badge>}

                                <form className="space-y-4" action={changePasswordAction}>
                                    <div className="space-y-4">
                                        <Input name="currentPassword" type="password" required placeholder="Current password" />
                                        <Input name="newPassword" type="password" minLength={8} required placeholder="New password" />
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <Link href="/forgot-password" className="text-xs font-bold text-text-secondary hover:text-text-primary transition-colors">
                                            Forgot password?
                                        </Link>
                                        <FormSubmitButton
                                            idleLabel="Update Password"
                                            pendingLabel="Updating..."
                                            className="rounded-btn bg-text-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-black transition-all"
                                        />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </Card>
                </section>

                {/* CONNECTED ACCOUNTS SECTION */}
                <section>
                    <Card className="p-0 overflow-hidden group">
                        <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-muted text-text-muted group-hover:bg-text-primary group-hover:text-white transition-colors">
                                    <CreditCard size={18} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-text-primary">Connected Accounts</h2>
                                    <p className="text-xs text-text-secondary mt-0.5">Banks and financial connections mapped to your profile.</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="group-hover:translate-x-1 transition-transform">
                                <Link href="/dashboard/connect">Manage <ArrowRight size={14} className="ml-2" /></Link>
                            </Button>
                        </div>
                        <div className="p-8 flex flex-col items-center justify-center text-center bg-bg-muted/10">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white border border-border mb-4">
                                <CreditCard size={24} className="text-text-muted" />
                            </div>
                            <p className="text-sm font-bold text-text-primary">Control your synced data</p>
                            <p className="text-xs text-text-secondary mt-1.5 max-w-sm leading-relaxed">Connect new accounts or update existing credentials safely through our encrypted providers.</p>
                            <Button variant="primary" asChild className="mt-6 px-8">
                                <Link href="/dashboard/connect">Go to Connections</Link>
                            </Button>
                        </div>
                    </Card>
                </section>

                {/* NOTIFICATIONS SECTION */}
                <section>
                    <Card className="p-0 overflow-hidden">
                        <div className="border-b border-border px-6 py-5 flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-muted text-text-primary border border-border">
                                <Bell size={18} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-text-primary">Notifications</h2>
                                <p className="text-xs text-text-secondary mt-0.5">Control how and when we send you updates.</p>
                            </div>
                        </div>
                        <div className="px-6 py-2 divide-y divide-border/50">
                            <NotificationSwitches initialSettings={userSettings} />
                        </div>
                    </Card>
                </section>

                {/* DANGER ZONE SECTION */}
                <section>
                    <Card className="border-danger-light bg-danger-light/5 p-0 overflow-hidden">
                        <div className="border-b border-danger-light bg-danger-light/10 px-6 py-5 flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-danger border border-danger-light">
                                <AlertOctagon size={18} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-danger">Danger Zone</h2>
                                <p className="text-xs text-danger/70 mt-0.5">Destructive actions and account deletion.</p>
                            </div>
                        </div>
                        <div className="p-6 sm:p-8 flex flex-col gap-6 sm:flex-row sm:items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-text-primary">Account Actions</p>
                                <p className="text-xs text-text-secondary mt-1.5 max-w-sm leading-relaxed">Sign out of this session or permanently delete your account and all financial data.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                                <Button variant="secondary" asChild className="w-full sm:w-auto">
                                    <Link href="/logout"><LogOut size={14} className="mr-2" /> Log Out</Link>
                                </Button>
                                <DeleteAccountButton />
                            </div>
                        </div>
                    </Card>
                </section>
            </div>
        </div>
    );
}
