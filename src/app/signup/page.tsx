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
        <main className="min-h-screen bg-[#FAFAF7] px-4 py-8 text-[#1A1A17] md:px-6 md:py-10 lg:px-8">
            <div className="mx-auto grid h-full w-full max-w-6xl items-stretch gap-4 lg:grid-cols-[1.2fr_1fr]">
                {/* Hero Section - Left */}
                <section className="rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] sm:p-8 lg:p-10">
                    <Link
                        href="/"
                        className="block focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
                        aria-label="Go to Unplug home page"
                    >
                        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Unplug</p>
                        <h1 className="font-display mt-4 text-4xl leading-tight text-[#1A1A17] sm:text-5xl">
                            Stop paying for
                            <br />
                            things you forgot.
                        </h1>
                        <p className="mt-5 max-w-xl text-sm leading-7 text-[#6B6960]">
                            The average person wastes $1,320 a year on subscriptions they don't use. 
                            We make the waste impossible to ignore.
                        </p>

                        <div className="mt-8 space-y-4">
                            <div className="border-l-2 border-[#FF5C35] pl-4">
                                <p className="text-xs uppercase tracking-[0.08em] text-[#A9A79E]">This Month</p>
                                <p className="mt-1 text-2xl font-semibold text-[#1A1A17]">$1,320<span className="text-sm text-[#6B6960]">/year</span></p>
                                <p className="mt-1 text-xs text-[#A9A79E]">Average recoverable waste</p>
                            </div>
                        </div>

                        <div className="mt-10 border-t border-[#E8E7E0] pt-8">
                            <p className="text-xs uppercase tracking-[0.08em] text-[#A9A79E]">Why join?</p>
                            <ul className="mt-4 space-y-3 text-sm text-[#6B6960]">
                                <li className="flex items-center gap-3">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EDFAF3] text-[#1C9E5B]">✓</span>
                                    Automatic subscription detection
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EDFAF3] text-[#1C9E5B]">✓</span>
                                    Usage confidence scoring
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EDFAF3] text-[#1C9E5B]">✓</span>
                                    Monthly savings pressure (the good kind)
                                </li>
                            </ul>
                        </div>
                    </Link>
                </section>

                {/* Form Section - Right */}
                <section className="scrollbar-hidden flex max-h-[calc(100vh-4rem)] flex-col overflow-y-auto rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] sm:p-8">
                    <div className="my-auto w-full">
                        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Create Account</p>

                        {hasSignupError ? (
                            <div
                                className="mt-4 rounded-[10px] border border-[#E53434] bg-[#FEF0F0] p-4 text-xs font-medium uppercase tracking-[0.08em] text-[#E53434]"
                                role="status"
                                aria-live="polite"
                            >
                                Sign-up failed. Check your connection and try again.
                            </div>
                        ) : null}

                        <form className="mt-6 space-y-5" action={signupAction}>
                            <div>
                                <label htmlFor="name" className="text-xs font-medium uppercase tracking-[0.08em] text-[#A9A79E]">
                                    Full name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="mt-2 w-full rounded-[10px] border border-[#D0CFC7] bg-[#FAFAF7] px-4 py-3 text-sm text-[#1A1A17] placeholder-[#A9A79E] outline-none transition-colors focus:border-[#FF5C35] focus:bg-white focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="text-xs font-medium uppercase tracking-[0.08em] text-[#A9A79E]">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="mt-2 w-full rounded-[10px] border border-[#D0CFC7] bg-[#FAFAF7] px-4 py-3 text-sm text-[#1A1A17] placeholder-[#A9A79E] outline-none transition-colors focus:border-[#FF5C35] focus:bg-white focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
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
                                    className="mt-2 w-full rounded-[10px] border border-[#D0CFC7] bg-[#FAFAF7] px-4 py-3 text-sm text-[#1A1A17] placeholder-[#A9A79E] outline-none transition-colors focus:border-[#FF5C35] focus:bg-white focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
                                    placeholder="At least 8 characters"
                                />
                            </div>

                            <FormSubmitButton
                                idleLabel="Create account"
                                pendingLabel="Creating..."
                                className="w-full rounded-[10px] border border-[#FF5C35] bg-[#FF5C35] px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-all hover:bg-[#C93A1A] focus-visible:outline-2 focus-visible:outline-[#FF5C35] disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </form>

                        <p className="mt-6 text-center text-xs uppercase tracking-[0.06em] text-[#6B6960]">
                            Already have an account?{' '}
                            <Link href="/login" className="font-semibold text-[#FF5C35] hover:text-[#C93A1A] focus-visible:outline-2 focus-visible:outline-[#FF5C35]">
                                Log in
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default SignupPage;
