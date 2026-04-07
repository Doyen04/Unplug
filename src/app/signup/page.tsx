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
        <main className="flex min-h-screen items-center bg-stone-950 px-4 py-8 text-stone-100 md:px-6 md:py-10 lg:px-8">
            <div className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[1fr_1.2fr]">
                <section className="order-2 border border-stone-800 bg-stone-900 p-6 sm:p-8 lg:order-1">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Create Account</p>

                    {hasSignupError ? (
                        <div
                            className="mt-4 border border-red-900 bg-red-950 p-3 text-xs uppercase tracking-[0.08em] text-red-400"
                            role="status"
                            aria-live="polite"
                        >
                            Sign-up failed. Check your connection and try again.
                        </div>
                    ) : null}

                    <form className="mt-5 space-y-4" action={signupAction}>
                        <div>
                            <label htmlFor="name" className="text-xs uppercase tracking-[0.08em] text-stone-500">
                                Full name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="mt-2 w-full border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 outline-none transition-colors focus:border-acid-green focus-visible:outline-2 focus-visible:outline-acid-green"
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="text-xs uppercase tracking-[0.08em] text-stone-500">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="mt-2 w-full border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 outline-none transition-colors focus:border-acid-green focus-visible:outline-2 focus-visible:outline-acid-green"
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
                                className="mt-2 w-full border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 outline-none transition-colors focus:border-acid-green focus-visible:outline-2 focus-visible:outline-acid-green"
                                placeholder="At least 8 characters"
                            />
                        </div>

                        <FormSubmitButton
                            idleLabel="Create account"
                            pendingLabel="Creating..."
                            className="w-full border border-acid-green bg-acid-green px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-stone-950 transition-colors hover:bg-acid-dim focus-visible:outline-2 focus-visible:outline-acid-green disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    </form>

                    <p className="mt-4 text-xs uppercase tracking-[0.06em] text-stone-500">
                        Already have an account?{' '}
                        <Link href="/login" className="text-acid-green hover:text-acid-dim focus-visible:outline-2 focus-visible:outline-acid-green">
                            Log in
                        </Link>
                    </p>
                </section>

                <section className="order-1 border border-stone-800 bg-stone-900 p-6 sm:p-8 lg:order-2 lg:p-10">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Unplug</p>
                    <h1 className="mt-4 font-display text-4xl leading-tight text-stone-100 sm:text-5xl">
                        Build a habit of
                        <br />
                        paying attention.
                    </h1>
                    <p className="mt-5 max-w-xl text-sm leading-7 text-stone-300">
                        Connect your accounts, detect recurring charges, and get direct, monthly pressure
                        to cancel what you do not use.
                    </p>

                    <ul className="mt-8 space-y-3 text-sm text-stone-300">
                        <li className="border-l-2 border-stone-700 pl-3">Automatic subscription detection</li>
                        <li className="border-l-2 border-stone-700 pl-3">Usage confidence scoring</li>
                        <li className="border-l-2 border-acid-green pl-3">Brutally honest monthly debriefs</li>
                    </ul>
                </section>
            </div>
        </main>
    );
};

export default SignupPage;
