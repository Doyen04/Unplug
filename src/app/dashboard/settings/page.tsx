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
        <main className="min-h-screen bg-stone-950 px-4 py-8 text-stone-100 md:px-6 md:py-10 lg:px-8">
            <div className="mx-auto w-full max-w-4xl space-y-4">
                <section className="border border-stone-800 bg-stone-900 p-6 sm:p-8">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Profile</p>
                    <h1 className="mt-3 font-display text-4xl text-stone-100">Account settings</h1>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <article className="border border-stone-800 bg-stone-950 p-4">
                            <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Name</p>
                            <p className="mt-2 text-sm text-stone-200">{name}</p>
                        </article>
                        <article className="border border-stone-800 bg-stone-950 p-4">
                            <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Email</p>
                            <p className="mt-2 text-sm text-stone-200">{email}</p>
                        </article>
                    </div>
                </section>

                <section className="border border-stone-800 bg-stone-900 p-6 sm:p-8">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Security</p>

                    {hasInvalidInputError ? (
                        <div className="mt-4 border border-red-900 bg-red-950 p-3 text-xs uppercase tracking-[0.08em] text-red-400">
                            Enter your current password and a new password of at least 8 characters.
                        </div>
                    ) : null}

                    {hasChangeFailedError ? (
                        <div className="mt-4 border border-red-900 bg-red-950 p-3 text-xs uppercase tracking-[0.08em] text-red-400">
                            Password update failed. Check your current password and try again.
                        </div>
                    ) : null}

                    {hasPasswordChanged ? (
                        <div className="mt-4 border border-acid-muted bg-acid-muted/30 p-3 text-xs uppercase tracking-[0.08em] text-acid-green">
                            Password updated successfully.
                        </div>
                    ) : null}

                    <form className="mt-5 space-y-4" action={changePasswordAction}>
                        <div>
                            <label
                                htmlFor="currentPassword"
                                className="text-xs uppercase tracking-[0.08em] text-stone-500"
                            >
                                Current password
                            </label>
                            <input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                required
                                className="mt-2 w-full border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 outline-none transition-colors focus:border-acid-green focus-visible:outline-2 focus-visible:outline-acid-green"
                                placeholder="Current password"
                            />
                        </div>

                        <div>
                            <label htmlFor="newPassword" className="text-xs uppercase tracking-[0.08em] text-stone-500">
                                New password
                            </label>
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                minLength={8}
                                required
                                className="mt-2 w-full border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 outline-none transition-colors focus:border-acid-green focus-visible:outline-2 focus-visible:outline-acid-green"
                                placeholder="At least 8 characters"
                            />
                        </div>

                        <FormSubmitButton
                            idleLabel="Update password"
                            pendingLabel="Updating..."
                            className="w-full border border-acid-green bg-acid-green px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-stone-950 transition-colors hover:bg-acid-dim focus-visible:outline-2 focus-visible:outline-acid-green disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    </form>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/forgot-password"
                            className="border border-stone-600 px-4 py-2 text-center text-xs uppercase tracking-[0.08em] text-stone-100 hover:border-stone-400 focus-visible:outline-2 focus-visible:outline-acid-green"
                        >
                            Forgot password flow
                        </Link>
                        <Link
                            href="/logout"
                            className="border border-red-900 px-4 py-2 text-center text-xs uppercase tracking-[0.08em] text-red-400 hover:border-red-700 focus-visible:outline-2 focus-visible:outline-acid-green"
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
