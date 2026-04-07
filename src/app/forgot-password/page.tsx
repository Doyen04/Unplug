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
        <main className="min-h-screen bg-stone-950 px-4 py-8 text-stone-100 md:px-6 md:py-10 lg:px-8">
            <div className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <section className="border border-stone-800 bg-stone-900 p-6 sm:p-8 lg:p-10">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Password recovery</p>
                    <h1 className="mt-4 font-display text-4xl leading-tight text-stone-100 sm:text-5xl">
                        Forgot your password?
                    </h1>
                    <p className="mt-5 max-w-xl text-sm leading-7 text-stone-300">
                        Enter your email to receive a 6-digit reset code. Then set a new password.
                    </p>

                    {hasInvalidEmailError ? (
                        <div className="mt-4 border border-red-900 bg-red-950 p-3 text-xs uppercase tracking-[0.08em] text-red-400">
                            Enter a valid email.
                        </div>
                    ) : null}

                    {hasRequestFailedError ? (
                        <div className="mt-4 border border-red-900 bg-red-950 p-3 text-xs uppercase tracking-[0.08em] text-red-400">
                            Could not send reset code. Check email settings and try again.
                        </div>
                    ) : null}

                    {sent ? (
                        <div className="mt-4 border border-acid-muted bg-acid-muted/30 p-3 text-xs uppercase tracking-[0.08em] text-acid-green">
                            If an account exists for this email, a reset code will arrive shortly.
                        </div>
                    ) : null}

                    <form className="mt-5 space-y-4" action={requestResetCodeAction}>
                        <div>
                            <label htmlFor="email" className="text-xs uppercase tracking-[0.08em] text-stone-500">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={email}
                                required
                                className="mt-2 w-full border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 outline-none transition-colors focus:border-acid-green focus-visible:outline-2 focus-visible:outline-acid-green"
                                placeholder="you@example.com"
                            />
                        </div>

                        <FormSubmitButton
                            idleLabel="Send reset code"
                            pendingLabel="Sending..."
                            className="w-full border border-acid-green bg-acid-green px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-stone-950 transition-colors hover:bg-acid-dim focus-visible:outline-2 focus-visible:outline-acid-green disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    </form>
                </section>

                <section className="border border-stone-800 bg-stone-900 p-6 sm:p-8">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Use code</p>

                    {hasInvalidResetInputError ? (
                        <div className="mt-4 border border-red-900 bg-red-950 p-3 text-xs uppercase tracking-[0.08em] text-red-400">
                            Enter email, 6-digit code, and a password with at least 8 characters.
                        </div>
                    ) : null}

                    {hasInvalidCodeError ? (
                        <div className="mt-4 border border-red-900 bg-red-950 p-3 text-xs uppercase tracking-[0.08em] text-red-400">
                            Invalid or expired code. Request another code and retry.
                        </div>
                    ) : null}

                    <form className="mt-5 space-y-4" action={resetPasswordAction}>
                        <div>
                            <label htmlFor="reset-email" className="text-xs uppercase tracking-[0.08em] text-stone-500">
                                Email
                            </label>
                            <input
                                id="reset-email"
                                name="email"
                                type="email"
                                defaultValue={email}
                                required
                                className="mt-2 w-full border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 outline-none transition-colors focus:border-acid-green focus-visible:outline-2 focus-visible:outline-acid-green"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="otp" className="text-xs uppercase tracking-[0.08em] text-stone-500">
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
                                className="mt-2 w-full border border-stone-700 bg-stone-950 px-3 py-2 text-sm tracking-[0.35em] text-stone-100 outline-none transition-colors focus:border-acid-green focus-visible:outline-2 focus-visible:outline-acid-green"
                                placeholder="123456"
                            />
                        </div>

                        <div>
                            <label htmlFor="new-password" className="text-xs uppercase tracking-[0.08em] text-stone-500">
                                New password
                            </label>
                            <input
                                id="new-password"
                                name="password"
                                type="password"
                                minLength={8}
                                required
                                className="mt-2 w-full border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 outline-none transition-colors focus:border-acid-green focus-visible:outline-2 focus-visible:outline-acid-green"
                                placeholder="At least 8 characters"
                            />
                        </div>

                        <FormSubmitButton
                            idleLabel="Reset password"
                            pendingLabel="Resetting..."
                            className="w-full border border-stone-600 px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-stone-100 transition-colors hover:border-stone-400 focus-visible:outline-2 focus-visible:outline-acid-green disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    </form>

                    <p className="mt-4 text-xs uppercase tracking-[0.06em] text-stone-500">
                        Remembered your password?{' '}
                        <Link href="/login" className="text-acid-green hover:text-acid-dim focus-visible:outline-2 focus-visible:outline-acid-green">
                            Back to login
                        </Link>
                    </p>
                </section>
            </div>
        </main>
    );
};

export default ForgotPasswordPage;
