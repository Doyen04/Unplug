import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { FormSubmitButton } from '../../components/features/auth/FormSubmitButton';
import { auth } from '../../lib/auth';
import { getServerSession } from '../../lib/server/auth-session';

const requestResetCodeAction = async (formData: FormData) => {
    'use server';

    const email = String(formData.get('email') ?? '').trim();

    if (!email) {
        redirect('/forgot-password?error=invalid_email');
    }

    try {
        await auth.api.requestPasswordResetEmailOTP({
            body: { email },
            headers: await headers(),
        });
    } catch {
        redirect('/forgot-password?error=request_failed');
    }

    redirect(`/forgot-password?sent=1&email=${encodeURIComponent(email)}`);
};

const resetPasswordAction = async (formData: FormData) => {
    'use server';

    const email = String(formData.get('email') ?? '').trim();
    const otp = String(formData.get('otp') ?? '').trim();
    const password = String(formData.get('password') ?? '').trim();

    if (!email || !otp || password.length < 8) {
        redirect(`/forgot-password?error=invalid_reset_input&email=${encodeURIComponent(email)}`);
    }

    try {
        await auth.api.resetPasswordEmailOTP({
            body: {
                email,
                otp,
                password,
            },
            headers: await headers(),
        });
    } catch {
        redirect(`/forgot-password?error=invalid_code&email=${encodeURIComponent(email)}`);
    }

    redirect('/login?reset=success');
};

interface ForgotPasswordPageProps {
    searchParams?: Promise<{
        sent?: string;
        email?: string;
        error?: string;
    }>;
}

const ForgotPasswordPage = async ({ searchParams }: ForgotPasswordPageProps) => {
    const session = await getServerSession();

    if (session) {
        redirect('/dashboard');
    }

    const params = (await searchParams) ?? {};
    const sent = params.sent === '1';
    const email = String(params.email ?? '').trim();

    const hasInvalidEmailError = params.error === 'invalid_email';
    const hasRequestFailedError = params.error === 'request_failed';
    const hasInvalidResetInputError = params.error === 'invalid_reset_input';
    const hasInvalidCodeError = params.error === 'invalid_code';

    return (
        <main className="min-h-screen bg-[#FAFAF7] px-4 py-8 text-[#1A1A17] md:px-6 md:py-10 lg:px-8">
            <div className="mx-auto grid h-full w-full max-w-6xl items-stretch gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                {/* Request Reset Code - Left */}
                <section className="scrollbar-hidden flex max-h-[calc(100vh-4rem)] flex-col overflow-y-auto rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] sm:p-8 lg:p-10">
                    <div className="my-auto w-full">
                        <Link
                            href="/"
                            className="inline-block focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
                            aria-label="Go to Unplug home page"
                        >
                            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Password recovery</p>
                        </Link>
                        <h1 className="font-display mt-4 text-4xl leading-tight text-[#1A1A17] sm:text-5xl">
                            Forgot your password?
                        </h1>
                        <p className="mt-5 max-w-xl text-sm leading-7 text-[#6B6960]">
                            Enter your email to receive a 6-digit reset code. Then set a new password.
                        </p>

                        {hasInvalidEmailError ? (
                            <div className="mt-6 rounded-[10px] border border-[#E53434] bg-[#FEF0F0] p-4 text-xs font-medium uppercase tracking-[0.08em] text-[#E53434]">
                                Enter a valid email.
                            </div>
                        ) : null}

                        {hasRequestFailedError ? (
                            <div className="mt-6 rounded-[10px] border border-[#E53434] bg-[#FEF0F0] p-4 text-xs font-medium uppercase tracking-[0.08em] text-[#E53434]">
                                Could not send reset code. Check email settings and try again.
                            </div>
                        ) : null}

                        {sent ? (
                            <div className="mt-6 rounded-[10px] border border-[#1C9E5B] bg-[#EDFAF3] p-4 text-xs font-medium uppercase tracking-[0.08em] text-[#1C9E5B]">
                                If an account exists for this email, a reset code will arrive shortly.
                            </div>
                        ) : null}

                        <form className="mt-8 space-y-5" action={requestResetCodeAction}>
                            <div>
                                <label htmlFor="email" className="text-xs font-medium uppercase tracking-[0.08em] text-[#A9A79E]">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={email}
                                    required
                                    className="mt-2 w-full rounded-[10px] border border-[#D0CFC7] bg-[#FAFAF7] px-4 py-3 text-sm text-[#1A1A17] placeholder-[#A9A79E] outline-none transition-colors focus:border-[#FF5C35] focus:bg-white focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <FormSubmitButton
                                idleLabel="Send reset code"
                                pendingLabel="Sending..."
                                className="w-full rounded-[10px] border border-[#FF5C35] bg-[#FF5C35] px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-all hover:bg-[#C93A1A] focus-visible:outline-2 focus-visible:outline-[#FF5C35] disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </form>
                    </div>
                </section>

                {/* Use Reset Code - Right */}
                <section className="scrollbar-hidden flex max-h-[calc(100vh-4rem)] flex-col overflow-y-auto rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] sm:p-8">
                    <div className="my-auto w-full">
                        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Use code</p>

                        {hasInvalidResetInputError ? (
                            <div className="mt-4 rounded-[10px] border border-[#E53434] bg-[#FEF0F0] p-4 text-xs font-medium uppercase tracking-[0.08em] text-[#E53434]">
                                Enter email, 6-digit code, and a password with at least 8 characters.
                            </div>
                        ) : null}

                        {hasInvalidCodeError ? (
                            <div className="mt-4 rounded-[10px] border border-[#E53434] bg-[#FEF0F0] p-4 text-xs font-medium uppercase tracking-[0.08em] text-[#E53434]">
                                Invalid or expired code. Request another code and retry.
                            </div>
                        ) : null}

                        <form className="mt-6 space-y-5" action={resetPasswordAction}>
                            <div>
                                <label htmlFor="reset-email" className="text-xs font-medium uppercase tracking-[0.08em] text-[#A9A79E]">
                                    Email
                                </label>
                                <input
                                    id="reset-email"
                                    name="email"
                                    type="email"
                                    defaultValue={email}
                                    required
                                    className="mt-2 w-full rounded-[10px] border border-[#D0CFC7] bg-[#FAFAF7] px-4 py-3 text-sm text-[#1A1A17] placeholder-[#A9A79E] outline-none transition-colors focus:border-[#FF5C35] focus:bg-white focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="otp" className="text-xs font-medium uppercase tracking-[0.08em] text-[#A9A79E]">
                                    Reset code
                                </label>
                                <input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]{6}"
                                    minLength={6}
                                    maxLength={6}
                                    required
                                    className="mt-2 w-full rounded-[10px] border border-[#D0CFC7] bg-[#FAFAF7] px-4 py-3 text-sm tracking-[0.35em] text-[#1A1A17] placeholder-[#A9A79E] outline-none transition-colors focus:border-[#FF5C35] focus:bg-white focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
                                    placeholder="123456"
                                />
                            </div>

                            <div>
                                <label htmlFor="new-password" className="text-xs font-medium uppercase tracking-[0.08em] text-[#A9A79E]">
                                    New password
                                </label>
                                <input
                                    id="new-password"
                                    name="password"
                                    type="password"
                                    minLength={8}
                                    required
                                    className="mt-2 w-full rounded-[10px] border border-[#D0CFC7] bg-[#FAFAF7] px-4 py-3 text-sm text-[#1A1A17] placeholder-[#A9A79E] outline-none transition-colors focus:border-[#FF5C35] focus:bg-white focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
                                    placeholder="At least 8 characters"
                                />
                            </div>

                            <FormSubmitButton
                                idleLabel="Reset password"
                                pendingLabel="Resetting..."
                                className="w-full rounded-[10px] border border-[#FF5C35] bg-[#FF5C35] px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-all hover:bg-[#C93A1A] focus-visible:outline-2 focus-visible:outline-[#FF5C35] disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </form>

                        <p className="mt-6 text-center text-xs uppercase tracking-[0.06em] text-[#6B6960]">
                            Remembered your password?{' '}
                            <Link href="/login" className="font-semibold text-[#FF5C35] hover:text-[#C93A1A] focus-visible:outline-2 focus-visible:outline-[#FF5C35]">
                                Back to login
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default ForgotPasswordPage;
