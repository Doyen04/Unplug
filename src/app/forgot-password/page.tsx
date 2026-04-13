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
        step?: string;
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
    const requestedStep = params.step === 'reset' ? 'reset' : params.step === 'request' ? 'request' : null;
    const mobileStep = requestedStep ?? (sent ? 'reset' : 'request');
    const showRequestOnMobile = mobileStep === 'request';
    const showResetOnMobile = mobileStep === 'reset';

    const hasInvalidEmailError = params.error === 'invalid_email';
    const hasRequestFailedError = params.error === 'request_failed';
    const hasInvalidResetInputError = params.error === 'invalid_reset_input';
    const hasInvalidCodeError = params.error === 'invalid_code';

    return (
        <main className="auth-page flex min-h-screen items-center justify-center px-4 py-8 text-[#1A1A17] md:px-6 md:py-10 lg:px-8">
            <div aria-hidden="true" className="auth-page-pattern" />
            <div className="auth-content mx-auto grid w-full max-w-6xl items-stretch gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                {/* Request Reset Code - Left */}
                <section className={`auth-card scrollbar-hidden ${showRequestOnMobile ? 'flex' : 'hidden'} max-h-[calc(100vh-4rem)] flex-col overflow-y-auto rounded-2xl p-6 sm:p-8 lg:flex lg:p-10`}>
                    <div className="my-auto w-full">
                        <div className="mb-4 lg:hidden">
                            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Step 1 of 2</p>
                            <Link
                                href={`/forgot-password?${new URLSearchParams({
                                    ...(email ? { email } : {}),
                                    ...(sent ? { sent: '1' } : {}),
                                    step: 'reset',
                                }).toString()}`}
                                className="mt-2 inline-block text-xs font-semibold uppercase tracking-[0.08em] text-[#E8482C] hover:text-[#D43D23] focus-visible:outline-2 focus-visible:outline-[#E8482C]"
                            >
                                Already have a code? Enter it
                            </Link>
                        </div>

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
                                    className="auth-input mt-2 w-full rounded-[10px] border bg-[#FAFAF7] px-4 py-3 text-sm text-[#1A1A17] placeholder-[#A9A79E] outline-none transition-colors focus:bg-white"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <FormSubmitButton
                                idleLabel="Send reset code"
                                pendingLabel="Sending..."
                                className="auth-btn-primary w-full rounded-[10px] border px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white focus-visible:outline-2 focus-visible:outline-[#E8482C] disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </form>
                    </div>
                </section>

                {/* Use Reset Code - Right */}
                <section className={`auth-card scrollbar-hidden ${showResetOnMobile ? 'flex' : 'hidden'} max-h-[calc(100vh-4rem)] flex-col overflow-y-auto rounded-2xl p-6 sm:p-8 lg:flex`}>
                    <div className="my-auto w-full">
                        <div className="mb-4 lg:hidden">
                            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Step 2 of 2</p>
                            <Link
                                href={`/forgot-password?${new URLSearchParams({
                                    ...(email ? { email } : {}),
                                    step: 'request',
                                }).toString()}`}
                                className="mt-2 inline-block text-xs font-semibold uppercase tracking-[0.08em] text-[#6B6960] hover:text-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#E8482C]"
                            >
                                Need a new code? Go back
                            </Link>
                        </div>

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
                                    className="auth-input mt-2 w-full rounded-[10px] border bg-[#FAFAF7] px-4 py-3 text-sm text-[#1A1A17] placeholder-[#A9A79E] outline-none transition-colors focus:bg-white"
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
                                    className="auth-input mt-2 w-full rounded-[10px] border bg-[#FAFAF7] px-4 py-3 text-sm tracking-[0.35em] text-[#1A1A17] placeholder-[#A9A79E] outline-none transition-colors focus:bg-white"
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
                                    className="auth-input mt-2 w-full rounded-[10px] border bg-[#FAFAF7] px-4 py-3 text-sm text-[#1A1A17] placeholder-[#A9A79E] outline-none transition-colors focus:bg-white"
                                    placeholder="At least 8 characters"
                                />
                            </div>

                            <FormSubmitButton
                                idleLabel="Reset password"
                                pendingLabel="Resetting..."
                                className="auth-btn-primary w-full rounded-[10px] border px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white focus-visible:outline-2 focus-visible:outline-[#E8482C] disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </form>

                        <p className="mt-6 text-center text-xs uppercase tracking-[0.06em] text-[#6B6960]">
                            Remembered your password?{' '}
                            <Link href="/login" className="font-semibold text-[#E8482C] hover:text-[#D43D23] focus-visible:outline-2 focus-visible:outline-[#E8482C]">
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
