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
        <main className="min-h-screen bg-[#FAFAF7] px-4 py-8 text-[#1A1A17] md:px-6 md:py-10 lg:px-8">
            <div className="mx-auto grid h-full w-full max-w-6xl items-stretch gap-4 lg:grid-cols-[1.2fr_1fr]">
                <section className="rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] sm:p-8 lg:p-10">
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

                        <div className="mt-8 border-l-2 border-[#FF5C35] pl-4">
                            <p className="text-xs uppercase tracking-[0.08em] text-[#A9A79E]">This month</p>
                            <p className="mt-2 text-sm text-[#6B6960]">Average recoverable waste: $1,320 / year</p>
                        </div>
                    </Link>
                </section>

                <section className="scrollbar-hidden max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] sm:p-8">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Account Access</p>

                    {hasInvalidCredentials ? (
                        <div
                            className="mt-4 rounded-[10px] border border-[#E53434] bg-[#FEF0F0] p-3 text-xs uppercase tracking-[0.08em] text-[#E53434]"
                            role="status"
                            aria-live="polite"
                        >
                            Invalid email or password.
                        </div>
                    ) : null}

                    {hasPasswordResetSuccess ? (
                        <div
                            className="mt-4 rounded-[10px] border border-[#1C9E5B] bg-[#EDFAF3] p-3 text-xs uppercase tracking-[0.08em] text-[#1C9E5B]"
                            role="status"
                            aria-live="polite"
                        >
                            Password reset successful. Log in with your new password.
                        </div>
                    ) : null}

                    <form className="mt-5 space-y-4" action={loginAction}>
                        <div>
                            <label htmlFor="email" className="text-xs uppercase tracking-[0.08em] text-stone-500">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="mt-2 w-full rounded-[10px] border border-[#D0CFC7] bg-[#FAFAF7] px-3 py-2 text-sm text-[#1A1A17] outline-none transition-colors focus:border-[#FF5C35] focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="text-xs uppercase tracking-[0.08em] text-stone-500"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="mt-2 w-full rounded-[10px] border border-[#D0CFC7] bg-[#FAFAF7] px-3 py-2 text-sm text-[#1A1A17] outline-none transition-colors focus:border-[#FF5C35] focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
                                placeholder="••••••••"
                            />
                        </div>

                        <FormSubmitButton
                            idleLabel="Log in"
                            pendingLabel="Logging in..."
                            className="w-full rounded-[10px] border border-[#FF5C35] bg-[#FF5C35] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#C93A1A] focus-visible:outline-2 focus-visible:outline-[#FF5C35] disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    </form>

                    <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.06em] text-[#6B6960]">
                        <Link href="/signup" className="hover:text-[#FF5C35] focus-visible:outline-2 focus-visible:outline-[#FF5C35]">
                            Create account
                        </Link>
                        <Link href="/forgot-password" className="hover:text-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#FF5C35]">
                            Forgot password
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default LoginPage;
