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
        <main className="flex min-h-screen items-center bg-[#FAFAF7] px-4 py-8 text-[#1A1A17] md:px-6 md:py-10 lg:px-8">
            <div className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[1fr_1.2fr]">
                <section className="order-2 rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] sm:p-8 lg:order-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Create Account</p>

                    {hasSignupError ? (
                        <div
                            className="mt-4 rounded-[10px] border border-[#E53434] bg-[#FEF0F0] p-3 text-xs uppercase tracking-[0.08em] text-[#E53434]"
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
                                className="mt-2 w-full rounded-[10px] border border-[#D0CFC7] bg-[#FAFAF7] px-3 py-2 text-sm text-[#1A1A17] outline-none transition-colors focus:border-[#FF5C35] focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
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
                                placeholder="At least 8 characters"
                            />
                        </div>

                        <FormSubmitButton
                            idleLabel="Create account"
                            pendingLabel="Creating..."
                            className="w-full rounded-[10px] border border-[#FF5C35] bg-[#FF5C35] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#C93A1A] focus-visible:outline-2 focus-visible:outline-[#FF5C35] disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    </form>

                    <p className="mt-4 text-xs uppercase tracking-[0.06em] text-[#6B6960]">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#FF5C35] hover:text-[#C93A1A] focus-visible:outline-2 focus-visible:outline-[#FF5C35]">
                            Log in
                        </Link>
                    </p>
                </section>

                <section className="order-1 rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] sm:p-8 lg:order-2 lg:p-10">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Unplug</p>
                    <h1 className="font-display mt-4 text-4xl leading-tight text-[#1A1A17] sm:text-5xl">
                        Build a habit of
                        <br />
                        paying attention.
                    </h1>
                    <p className="mt-5 max-w-xl text-sm leading-7 text-[#6B6960]">
                        Connect your accounts, detect recurring charges, and get direct, monthly pressure
                        to cancel what you do not use.
                    </p>

                    <ul className="mt-8 space-y-3 text-sm text-[#6B6960]">
                        <li className="border-l-2 border-[#D0CFC7] pl-3">Automatic subscription detection</li>
                        <li className="border-l-2 border-[#D0CFC7] pl-3">Usage confidence scoring</li>
                        <li className="border-l-2 border-[#FF5C35] pl-3">Brutally honest monthly debriefs</li>
                    </ul>
                </section>
            </div>
        </main>
    );
};

export default SignupPage;
