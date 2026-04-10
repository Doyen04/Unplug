import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { FormSubmitButton } from '../../components/features/auth/FormSubmitButton';
import { auth } from '../../lib/auth';
import { getServerSession } from '../../lib/server/auth-session';

const signupAction = async (formData: FormData) => {
    'use server';

    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '').trim();

    if (!name || !email || !password) {
        redirect('/signup?error=invalid_input');
    }

    try {
        await auth.api.signUpEmail({
            body: {
                name,
                email,
                password,
                callbackURL: '/dashboard',
            },
            headers: await headers(),
        });
    } catch {
        redirect('/signup?error=signup_failed');
    }

    redirect('/dashboard');
};

interface SignupPageProps {
    searchParams?: Promise<{
        error?: string;
    }>;
}

const SignupPage = async ({ searchParams }: SignupPageProps) => {
    const params = (await searchParams) ?? {};
    const hasSignupError = params.error === 'signup_failed';

    const session = await getServerSession();

    if (session) {
        redirect('/dashboard');
    }

    return (
        <main className="flex min-h-screen items-center bg-bg-base px-4 py-8 text-text-primary md:px-6 md:py-10 lg:px-8">
            <div className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[1fr_1.2fr]">

                {/* Form panel */}
                <section className="order-2 rounded-card border border-border bg-white p-6 shadow-card sm:p-8 lg:order-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
                        Create Account
                    </p>

                    {hasSignupError && (
                        <div
                            className="mt-4 rounded-btn border border-danger bg-danger-light p-3 text-[13px] text-danger"
                            role="status"
                            aria-live="polite"
                        >
                            Sign-up failed. Check your connection and try again.
                        </div>
                    )}

                    <form className="mt-5 space-y-4" action={signupAction}>
                        <div>
                            <label htmlFor="name" className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
                                Full name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="mt-2 w-full rounded-btn border border-border bg-bg-base px-3 py-2.5 text-[15px] text-text-primary outline-none transition-colors focus:border-brand"
                                placeholder="Your name"
                            />
                        </div>

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
                                placeholder="At least 8 characters"
                            />
                        </div>

                        <FormSubmitButton
                            idleLabel="Create account"
                            pendingLabel="Creating..."
                            className="w-full rounded-btn bg-brand px-4 py-2.5 text-[13px] font-semibold text-white transition-all duration-150 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    </form>

                    <p className="mt-5 text-[11px] uppercase tracking-[0.06em] text-text-secondary">
                        Already have an account?{' '}
                        <Link href="/login" className="text-brand transition-colors hover:text-brand-dark">
                            Log in
                        </Link>
                    </p>
                </section>

                {/* Branding panel */}
                <section className="order-1 rounded-card border border-border bg-white p-6 shadow-card sm:p-8 lg:order-2 lg:p-10">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
                        Unplug
                    </p>
                    <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-text-primary sm:text-5xl">
                        Build a habit of
                        <br />
                        paying attention.
                    </h1>
                    <p className="mt-5 max-w-xl text-[15px] leading-7 text-text-secondary">
                        Connect your accounts, detect recurring charges, and get direct, monthly pressure
                        to cancel what you do not use.
                    </p>

                    <ul className="mt-8 space-y-3 text-[13px] text-text-secondary">
                        <li className="flex items-center gap-2.5 rounded-tag border-l-[3px] border-l-border-strong bg-bg-muted px-3 py-2.5">
                            <span className="text-success">✓</span>
                            Automatic subscription detection
                        </li>
                        <li className="flex items-center gap-2.5 rounded-tag border-l-[3px] border-l-border-strong bg-bg-muted px-3 py-2.5">
                            <span className="text-success">✓</span>
                            Usage confidence scoring
                        </li>
                        <li className="flex items-center gap-2.5 rounded-tag border-l-[3px] border-l-brand bg-brand-light px-3 py-2.5">
                            <span className="text-brand">★</span>
                            Brutally honest monthly debriefs
                        </li>
                    </ul>
                </section>

            </div>
        </main>
    );
};

export default SignupPage;
