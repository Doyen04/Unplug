import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { FormSubmitButton } from '../../components/features/auth/FormSubmitButton';
import { auth } from '../../lib/auth';
import { getServerSession } from '../../lib/server/auth-session';

const loginAction = async (formData: FormData) => {
    'use server';

    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '').trim();

    if (!email || !password) {
        redirect('/login?error=invalid_credentials');
    }

    try {
        await auth.api.signInEmail({
            body: {
                email,
                password,
                callbackURL: '/dashboard',
            },
            headers: await headers(),
        });
    } catch {
        redirect('/login?error=invalid_credentials');
    }

    redirect('/dashboard');
};

interface LoginPageProps {
    searchParams?: Promise<{
        error?: string;
        reset?: string;
    }>;
}

const LoginPage = async ({ searchParams }: LoginPageProps) => {
    const params = (await searchParams) ?? {};
    const hasInvalidCredentials = params.error === 'invalid_credentials';
    const hasPasswordResetSuccess = params.reset === 'success';

    const session = await getServerSession();

    if (session) {
        redirect('/dashboard');
    }

    return (
        <main className="auth-page flex min-h-screen items-center justify-center px-4 py-8 text-[#1A1A17] md:px-6 md:py-10 lg:px-8">
            <div aria-hidden="true" className="auth-page-pattern" />
            <div className="auth-content mx-auto grid w-full max-w-6xl items-stretch gap-4 lg:grid-cols-[1.2fr_1fr]">
                <section className="auth-card hidden rounded-2xl p-6 sm:p-8 lg:block lg:p-10">
                    <Link
                        href="/"
                        className="block focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
                        aria-label="Go to Unplug home page"
                    >
                        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Unplug</p>
                        <h1 className="font-display mt-4 text-4xl leading-tight text-[#1A1A17] sm:text-5xl">
                            Log in and face
                            <br />
                            your subscriptions.
                        </h1>
                        <p className="mt-5 max-w-xl text-sm leading-7 text-[#6B6960]">
                            No fluff. No fake optimism. Just a clear view of what you pay, what you use,
                            and what should have been cancelled months ago.
                        </p>

                        <div className="mt-8 border-l-[3px] border-[#E8482C] pl-4">
                            <p className="text-xs uppercase tracking-[0.08em] text-[#A9A79E]">This month</p>
                            <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#1A1A17]">$1,320<span className="text-sm text-[#6B6960]">/year</span></p>
                            <p className="mt-1 text-xs text-[#A9A79E]">Average recoverable waste</p>
                        </div>
                    </Link>
                </section>

                <section className="auth-card scrollbar-hidden mx-auto flex max-h-[calc(100vh-4rem)] w-full max-w-xl flex-col overflow-y-auto rounded-2xl p-6 sm:p-8 lg:max-w-none">
                    <div className="my-auto w-full">
                        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Account Access</p>

                        {hasInvalidCredentials ? (
                            <div
                                className="mt-4 rounded-[10px] border border-[#E53434] bg-[#FEF0F0] p-4 text-xs font-medium uppercase tracking-[0.08em] text-[#E53434]"
                                role="status"
                                aria-live="polite"
                            >
                                Invalid email or password.
                            </div>
                        ) : null}

                        {hasPasswordResetSuccess ? (
                            <div
                                className="mt-4 rounded-[10px] border border-[#1C9E5B] bg-[#EDFAF3] p-4 text-xs font-medium uppercase tracking-[0.08em] text-[#1C9E5B]"
                                role="status"
                                aria-live="polite"
                            >
                                Password reset successful. Log in with your new password.
                            </div>
                        ) : null}

                        <form className="mt-6 space-y-5" action={loginAction}>
                            <div>
                                <label htmlFor="email" className="text-xs font-medium uppercase tracking-[0.08em] text-[#A9A79E]">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="auth-input mt-2 w-full rounded-[10px] border bg-[#FAFAF7] px-4 py-3 text-sm text-[#1A1A17] placeholder-[#A9A79E] outline-none transition-colors focus:bg-white"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="text-xs font-medium uppercase tracking-[0.08em] text-[#A9A79E]"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="auth-input mt-2 w-full rounded-[10px] border bg-[#FAFAF7] px-4 py-3 text-sm text-[#1A1A17] placeholder-[#A9A79E] outline-none transition-colors focus:bg-white"
                                    placeholder="••••••••"
                                />
                            </div>

                            <FormSubmitButton
                                idleLabel="Log in"
                                pendingLabel="Logging in..."
                                className="auth-btn-primary w-full rounded-[10px] border px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white focus-visible:outline-2 focus-visible:outline-[#E8482C] disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </form>

                        <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.06em] text-[#6B6960]">
                            <Link href="/signup" className="font-semibold text-[#E8482C] hover:text-[#D43D23] focus-visible:outline-2 focus-visible:outline-[#E8482C]">
                                Create account
                            </Link>
                            <Link href="/forgot-password" className="hover:text-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#E8482C]">
                                Forgot password
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default LoginPage;
