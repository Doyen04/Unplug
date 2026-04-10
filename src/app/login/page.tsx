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
        <main className="flex min-h-screen items-center bg-bg-base px-4 py-8 text-text-primary md:px-6 md:py-10 lg:px-8">
            <div className="mx-auto grid h-full w-full max-w-6xl items-stretch gap-4 lg:grid-cols-[1.2fr_1fr]">

                {/* Left branding panel */}
                <section className="rounded-card border border-border bg-white p-6 shadow-card sm:p-8 lg:p-10">
                    <Link
                        href="/"
                        className="block transition-opacity hover:opacity-80"
                        aria-label="Go to Unplug home page"
                    >
                        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
                            Unplug
                        </p>
                        <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-text-primary sm:text-5xl">
                            Log in and face
                            <br />
                            your subscriptions.
                        </h1>
                        <p className="mt-5 max-w-xl text-[15px] leading-7 text-text-secondary">
                            No fluff. No fake optimism. Just a clear view of what you pay, what you use,
                            and what should have been cancelled months ago.
                        </p>

                        <div className="mt-8 rounded-tag border-l-[3px] border-l-brand bg-brand-light p-4">
                            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
                                This month
                            </p>
                            <p className="mt-2 text-[13px] text-text-secondary">
                                Average recoverable waste: <span className="font-display font-bold text-danger">$1,320</span> / year
                            </p>
                        </div>
                    </Link>
                </section>

                {/* Right form panel */}
                <section className="scrollbar-hidden max-h-[calc(100vh-4rem)] overflow-y-auto rounded-card border border-border bg-white p-6 shadow-card sm:p-8">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
                        Account Access
                    </p>

                    {hasInvalidCredentials && (
                        <div
                            className="mt-4 rounded-btn border border-danger bg-danger-light p-3 text-[13px] text-danger"
                            role="status"
                            aria-live="polite"
                        >
                            Invalid email or password. Please try again.
                        </div>
                    )}

                    {hasPasswordResetSuccess && (
                        <div
                            className="mt-4 rounded-btn border border-success bg-success-light p-3 text-[13px] text-success"
                            role="status"
                            aria-live="polite"
                        >
                            Password reset successful. Log in with your new password.
                        </div>
                    )}

                    <form className="mt-5 space-y-4" action={loginAction}>
                        <div>
                            <label htmlFor="email" className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="mt-2 w-full rounded-btn border border-border bg-bg-base px-3 py-2.5 text-[15px] text-text-primary outline-none transition-colors focus:border-brand"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="mt-2 w-full rounded-btn border border-border bg-bg-base px-3 py-2.5 text-[15px] text-text-primary outline-none transition-colors focus:border-brand"
                                placeholder="••••••••"
                            />
                        </div>

                        <FormSubmitButton
                            idleLabel="Log in"
                            pendingLabel="Logging in..."
                            className="w-full rounded-btn bg-brand px-4 py-2.5 text-[13px] font-semibold text-white transition-all duration-150 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    </form>

                    <div className="mt-5 flex items-center justify-between text-[11px] uppercase tracking-[0.06em]">
                        <Link href="/signup" className="text-text-secondary transition-colors hover:text-brand">
                            Create account
                        </Link>
                        <Link href="/forgot-password" className="text-text-secondary transition-colors hover:text-text-primary">
                            Forgot password
                        </Link>
                    </div>
                </section>

            </div>
        </main>
    );
};

export default LoginPage;
