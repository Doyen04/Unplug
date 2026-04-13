import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Shield, CreditCard, Bell, AlertOctagon, LogOut, Key } from 'lucide-react';

import { FormSubmitButton } from '../../../components/features/auth/FormSubmitButton';
import { auth } from '../../../lib/auth';
import { getServerSession } from '../../../lib/server/auth-session';

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

    if (!currentPassword || newPassword.length < 8) {
        redirect('/dashboard/settings?error=invalid_input');
    }

    try {
        await auth.api.changePassword({
            body: {
                currentPassword,
                newPassword,
                revokeOtherSessions: true,
            },
            headers: await headers(),
        });
    } catch {
        redirect('/dashboard/settings?error=change_failed');
    }

    redirect('/dashboard/settings?success=password_changed');
};

interface SettingsPageProps {
    searchParams?: Promise<{
        error?: string;
        success?: string;
    }>;
}

export default async function DashboardSettingsPage({ searchParams }: SettingsPageProps) {
    const session = await getServerSession();

    if (!session) {
        redirect('/login');
    }

    const params = (await searchParams) ?? {};
    const hasInvalidInputError = params.error === 'invalid_input';
    const hasChangeFailedError = params.error === 'change_failed';
    const hasPasswordChanged = params.success === 'password_changed';

    const email = getSessionUserField(session, 'email') ?? 'unknown';
    const name = getSessionUserField(session, 'name') ?? 'Account user';

    return (
        <div className="space-y-8 max-w-4xl mx-auto w-full pb-10">
            <header className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-[#1A1A17]">Settings</h1>
            </header>

            <div className="space-y-6">

                {/* PROFILE SECTION */}
                <section className="rounded-2xl border border-[#E8E7E0] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:border-[#D0CFC7]">
                    <div className="border-b border-[#E8E7E0] bg-[#FAFAF7] px-6 py-5 flex items-center gap-4 sm:px-8">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#1A1A17] border border-[#E8E7E0] shadow-sm">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[#1A1A17]">Profile & Security</h2>
                            <p className="text-xs text-[#6B6960] mt-0.5">Manage your personal information and password.</p>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 grid gap-8 md:grid-cols-2">
                        <div className="space-y-6">
                            <div>
                                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Name</p>
                                <p className="mt-1.5 text-base font-medium text-[#1A1A17]">{name}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Email</p>
                                <p className="mt-1.5 text-base font-medium text-[#1A1A17]">{email}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-[#E8E7E0] p-6 bg-[#FAFAF7] transition-all hover:border-[#D0CFC7] hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                            <div className="flex items-center gap-2 mb-5">
                                <Key className="text-[#6B6960]" size={16} />
                                <p className="text-sm font-bold text-[#1A1A17]">Change Password</p>
                            </div>

                            {hasInvalidInputError && (
                                <div className="mb-5 rounded-lg border border-[#E53434] bg-[#FEF0F0] p-3 text-xs text-[#E53434]">
                                    Enter current password and a new password (min 8 chars).
                                </div>
                            )}

                            {hasChangeFailedError && (
                                <div className="mb-5 rounded-lg border border-[#E53434] bg-[#FEF0F0] p-3 text-xs text-[#E53434]">
                                    Update failed. Check your current password.
                                </div>
                            )}

                            {hasPasswordChanged && (
                                <div className="mb-5 rounded-lg border border-[#1C9E5B] bg-[#EDFAF3] p-3 text-xs text-[#1C9E5B]">
                                    Password updated successfully.
                                </div>
                            )}

                            <form className="space-y-4" action={changePasswordAction}>
                                <div>
                                    <input
                                        name="currentPassword"
                                        type="password"
                                        required
                                        className="w-full rounded-lg border border-[#D0CFC7] bg-white px-3 py-2.5 text-sm text-[#1A1A17] placeholder:text-[#A9A79E] outline-none focus:border-[#FF5C35] focus:ring-1 focus:ring-[#FF5C35] transition-all"
                                        placeholder="Current password"
                                    />
                                </div>
                                <div>
                                    <input
                                        name="newPassword"
                                        type="password"
                                        minLength={8}
                                        required
                                        className="w-full rounded-lg border border-[#D0CFC7] bg-white px-3 py-2.5 text-sm text-[#1A1A17] placeholder:text-[#A9A79E] outline-none focus:border-[#FF5C35] focus:ring-1 focus:ring-[#FF5C35] transition-all"
                                        placeholder="New password"
                                    />
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <Link href="/forgot-password" className="text-xs font-semibold text-[#6B6960] hover:text-[#1A1A17] transition-colors">
                                        Forgot password?
                                    </Link>
                                    <FormSubmitButton
                                        idleLabel="Update"
                                        pendingLabel="Updating..."
                                        className="rounded-lg bg-[#1A1A17] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#31302A] focus:ring-2 focus:ring-offset-1 focus:ring-[#1A1A17] transition-all"
                                    />
                                </div>
                            </form>
                        </div>
                    </div>
                </section>

                {/* CONNECTED ACCOUNTS SECTION */}
                <section className="group rounded-2xl border border-[#E8E7E0] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:border-[#D0CFC7]">
                    <div className="border-b border-[#E8E7E0] bg-white px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:px-8">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FAFAF7] text-[#1A1A17] border border-[#E8E7E0] group-hover:bg-[#1A1A17] group-hover:text-white transition-colors duration-300">
                                <CreditCard size={18} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-[#1A1A17]">Connected Accounts</h2>
                                <p className="text-xs text-[#6B6960] mt-0.5">Banks and financial connections mapped to your profile.</p>
                            </div>
                        </div>
                        <Link href="/dashboard/connect" className="flex w-fit items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#FF5C35] hover:text-[#C93A1A] bg-transparent hover:bg-[#FEF6EC] px-3 py-1.5 rounded-lg transition-colors">
                            Manage &rarr;
                        </Link>
                    </div>
                    <div className="px-6 py-12 sm:px-8 flex flex-col items-center justify-center text-center bg-[#FAFAF7] group-hover:bg-white transition-colors duration-500">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white border border-[#E8E7E0] shadow-sm mb-4 transition-transform duration-500 group-hover:scale-110">
                            <CreditCard size={24} className="text-[#A9A79E]" />
                        </div>
                        <p className="text-sm font-bold text-[#1A1A17]">Control your synced data</p>
                        <p className="text-xs text-[#6B6960] mt-1.5 max-w-sm leading-relaxed">Connect new accounts or update existing credentials safely through our encrypted providers.</p>
                        <Link href="/dashboard/connect" className="mt-6 rounded-xl bg-[#1A1A17] px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white hover:bg-[#31302A] focus:ring-2 focus:ring-offset-2 focus:ring-[#1A1A17] transition-all shadow-sm hover:shadow-md">
                            Go to Connections
                        </Link>
                    </div>
                </section>

                {/* NOTIFICATIONS SECTION */}
                <section className="rounded-2xl border border-[#E8E7E0] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:border-[#D0CFC7]">
                    <div className="border-b border-[#E8E7E0] bg-white px-6 py-5 flex items-center gap-4 sm:px-8">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FAFAF7] text-[#1A1A17] border border-[#E8E7E0] shadow-sm">
                            <Bell size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[#1A1A17]">Notifications</h2>
                            <p className="text-xs text-[#6B6960] mt-0.5">Control how and when we send you updates.</p>
                        </div>
                    </div>
                    <div className="px-4 py-4 sm:px-6 divide-y divide-[#E8E7E0]/50">
                        <label className="flex items-center justify-between gap-4 cursor-pointer p-4 rounded-xl hover:bg-[#FAFAF7] transition-colors border border-transparent">
                            <div>
                                <p className="text-sm font-bold text-[#1A1A17] hover:text-[#1A1A17]">New Subscriptions Detected</p>
                                <p className="text-xs text-[#6B6960] mt-1.5 leading-relaxed">Receive an email when we notice a new recurring charge.</p>
                            </div>
                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#1C9E5B] shrink-0 border border-[#1C9E5B] shadow-inner">
                                <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition shadow-sm" />
                            </div>
                        </label>
                        <label className="flex items-center justify-between gap-4 cursor-pointer p-4 rounded-xl hover:bg-[#FAFAF7] transition-colors border border-transparent">
                            <div>
                                <p className="text-sm font-bold text-[#1A1A17]">Monthly Unplug Summary</p>
                                <p className="text-xs text-[#6B6960] mt-1.5 leading-relaxed">Get a monthly report of your burn rate and shame score.</p>
                            </div>
                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#1C9E5B] shrink-0 border border-[#1C9E5B] shadow-inner">
                                <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition shadow-sm" />
                            </div>
                        </label>
                        <label className="flex items-center justify-between gap-4 cursor-pointer p-4 rounded-xl hover:bg-[#FAFAF7] transition-colors border border-transparent">
                            <div>
                                <p className="text-sm font-bold text-[#1A1A17]">Price Increase Alerts</p>
                                <p className="text-xs text-[#6B6960] mt-1.5 leading-relaxed">Notify me when a subscription increases its price.</p>
                            </div>
                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#E8E7E0] shrink-0 border border-[#D0CFC7] shadow-inner">
                                <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white transition shadow-sm" />
                            </div>
                        </label>
                    </div>
                </section>

                {/* DANGER ZONE SECTION */}
                <section className="rounded-2xl border border-[#FEE2E2] bg-white shadow-[0_1px_4px_rgba(229,52,52,0.06),0_4px_16px_rgba(229,52,52,0.04)] overflow-hidden transition-all hover:shadow-[0_4px_24px_rgba(229,52,52,0.08)] hover:border-[#FCA5A5]">
                    <div className="border-b border-[#FEE2E2] bg-[#FEF0F0]/50 px-6 py-5 flex items-center gap-4 sm:px-8">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEF0F0] text-[#E53434] border border-[#FEE2E2] shadow-sm">
                            <AlertOctagon size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[#E53434]">Danger Zone</h2>
                            <p className="text-xs text-[#E53434]/80 mt-0.5">Destructive actions and account deletion.</p>
                        </div>
                    </div>
                    <div className="px-6 py-6 sm:px-8 sm:py-8 flex flex-col gap-6 sm:flex-row sm:items-center justify-between bg-linear-to-br from-white to-[#FEF0F0]/30">
                        <div>
                            <p className="text-sm font-bold text-[#1A1A17]">Account Actions</p>
                            <p className="text-xs text-[#6B6960] mt-1.5 max-w-sm leading-relaxed">Sign out of this session or permanently delete your account and all associated financial data.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
                            <Link href="/logout" className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl border border-[#D0CFC7] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-[#1A1A17] hover:bg-[#FAFAF7] hover:border-[#1A1A17] focus:ring-2 focus:ring-offset-1 focus:ring-[#1A1A17] transition-all shadow-sm hover:shadow-md">
                                <LogOut size={14} /> Log Out
                            </Link>
                            <button className="flex items-center justify-center w-full sm:w-auto rounded-xl bg-[#E53434] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-white hover:bg-[#C92929] focus:ring-2 focus:ring-offset-1 focus:ring-[#E53434] transition-all shadow-sm hover:shadow-md">
                                Delete Account
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
