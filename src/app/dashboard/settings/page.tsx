import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

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

const DashboardSettingsPage = async ({ searchParams }: SettingsPageProps) => {
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
        <main className="min-h-screen bg-[#FAFAF7] px-4 py-8 text-[#1A1A17] md:px-6 md:py-10 lg:px-8">
            <div className="mx-auto w-full max-w-4xl space-y-4">
                <section className="rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] sm:p-8">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Profile</p>
                    <h1 className="font-display mt-3 text-4xl text-[#1A1A17]">Account settings</h1>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <article className="rounded-2xl border border-[#E8E7E0] bg-[#FAFAF7] p-4">
                            <p className="text-[11px] uppercase tracking-[0.08em] text-[#A9A79E]">Name</p>
                            <p className="mt-2 text-sm text-[#1A1A17]">{name}</p>
                        </article>
                        <article className="rounded-2xl border border-[#E8E7E0] bg-[#FAFAF7] p-4">
                            <p className="text-[11px] uppercase tracking-[0.08em] text-[#A9A79E]">Email</p>
                            <p className="mt-2 text-sm text-[#1A1A17]">{email}</p>
                        </article>
                    </div>
                </section>

                <section className="rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] sm:p-8">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Security</p>

                    {hasInvalidInputError ? (
                        <div className="mt-4 rounded-[10px] border border-[#E53434] bg-[#FEF0F0] p-3 text-xs uppercase tracking-[0.08em] text-[#E53434]">
                            Enter your current password and a new password of at least 8 characters.
                        </div>
                    ) : null}

                    {hasChangeFailedError ? (
                        <div className="mt-4 rounded-[10px] border border-[#E53434] bg-[#FEF0F0] p-3 text-xs uppercase tracking-[0.08em] text-[#E53434]">
                            Password update failed. Check your current password and try again.
                        </div>
                    ) : null}

                    {hasPasswordChanged ? (
                        <div className="mt-4 rounded-[10px] border border-[#1C9E5B] bg-[#EDFAF3] p-3 text-xs uppercase tracking-[0.08em] text-[#1C9E5B]">
                            Password updated successfully.
                        </div>
                    ) : null}

                    <form className="mt-5 space-y-4" action={changePasswordAction}>
                        <div>
                            <label
                                htmlFor="currentPassword"
                                className="text-xs uppercase tracking-[0.08em] text-[#A9A79E]"
                            >
                                Current password
                            </label>
                            <input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                required
                                className="mt-2 w-full rounded-[10px] border border-[#D0CFC7] bg-[#FAFAF7] px-3 py-2 text-sm text-[#1A1A17] outline-none transition-colors focus:border-[#FF5C35] focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
                                placeholder="Current password"
                            />
                        </div>

                        <div>
                            <label htmlFor="newPassword" className="text-xs uppercase tracking-[0.08em] text-[#A9A79E]">
                                New password
                            </label>
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                minLength={8}
                                required
                                className="mt-2 w-full rounded-[10px] border border-[#D0CFC7] bg-[#FAFAF7] px-3 py-2 text-sm text-[#1A1A17] outline-none transition-colors focus:border-[#FF5C35] focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
                                placeholder="At least 8 characters"
                            />
                        </div>

                        <FormSubmitButton
                            idleLabel="Update password"
                            pendingLabel="Updating..."
                            className="w-full rounded-[10px] border border-[#FF5C35] bg-[#FF5C35] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#C93A1A] focus-visible:outline-2 focus-visible:outline-[#FF5C35] disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    </form>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/forgot-password"
                            className="rounded-[10px] border border-[#D0CFC7] px-4 py-2 text-center text-xs uppercase tracking-[0.08em] text-[#1A1A17] hover:border-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
                        >
                            Forgot password flow
                        </Link>
                        <Link
                            href="/logout"
                            className="rounded-[10px] border border-[#E53434] px-4 py-2 text-center text-xs uppercase tracking-[0.08em] text-[#E53434] hover:bg-[#FEF0F0] focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
                        >
                            Log out
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default DashboardSettingsPage;
