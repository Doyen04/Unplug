import { Check } from 'lucide-react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { FormSubmitButton } from '@/components/features/auth/FormSubmitButton';
import { auth } from '@/lib/auth';
import { getServerSession } from '@/lib/server/auth-session';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { UnplugLogo } from '@/components/ui/UnplugLogo';

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

const features = [
    {
        title: 'Automatic detection',
        body: 'Finds every subscription in your bank history — Naira or dollar.',
    },
    {
        title: 'Usage scoring',
        body: 'See what you actually use versus what you forgot about.',
    },
    {
        title: 'Monthly debriefs',
        body: 'A plain-language summary of every charge and why it happened.',
    },
] as const;

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
    const showRequest = mobileStep === 'request';
    const showReset = mobileStep === 'reset';

    const resetStepUrl = `/forgot-password?${new URLSearchParams({
        ...(email ? { email } : {}),
        ...(sent ? { sent: '1' } : {}),
        step: 'reset',
    }).toString()}`;
    const requestStepUrl = `/forgot-password?${new URLSearchParams({
        ...(email ? { email } : {}),
        step: 'request',
    }).toString()}`;

    const hasInvalidEmailError = params.error === 'invalid_email';
    const hasRequestFailedError = params.error === 'request_failed';
    const hasInvalidResetInputError = params.error === 'invalid_reset_input';
    const hasInvalidCodeError = params.error === 'invalid_code';

    return (
        <main className="auth-page relative min-h-dvh w-full max-w-full overflow-x-hidden">
            <div className="lg:grid lg:min-h-screen lg:grid-cols-2">
                {/* Left: brand story */}
                <section className="dot-grid relative hidden flex-col justify-between gap-10 overflow-hidden border-r border-line bg-bg-surface p-8 xl:p-12 lg:flex">
                    <div className="relative space-y-5">
                        <Link href="/" aria-label="Back to home" className="inline-block">
                            <UnplugLogo size="md" />
                        </Link>
                        <h1 className="font-display text-[clamp(38px,4vw,54px)] font-bold leading-[1.05] tracking-tight text-ink">
                            Let&apos;s get you back in.
                        </h1>
                        <p className="max-w-md text-[15px] leading-7 text-ink-70">
                            Enter your email and we&apos;ll send a 6-digit reset code. Two minutes, tops — then you&apos;re
                            back in your dashboard.
                        </p>
                        <ul role="list" className="space-y-3.5 pt-2">
                            {features.map((feature) => (
                                <li key={feature.title} className="flex items-start gap-3">
                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-light text-green">
                                        <Check aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={3} />
                                    </span>
                                    <div>
                                        <p className="text-sm font-bold text-ink">{feature.title}</p>
                                        <p className="text-sm leading-6 text-ink-70">{feature.body}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative">
                        <p className="font-display text-3xl font-extrabold text-green">₦18M+</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-70">Saved from subscription creep · 2,400+ accounts</p>
                    </div>
                </section>

                {/* Right: form */}
                <section className="flex min-h-dvh flex-col justify-center bg-white px-4 py-8 sm:px-10 sm:py-12">
                    <div className="mx-auto w-full max-w-md">
                        <div className="mb-6 sm:mb-8 flex items-center justify-between lg:hidden">
                            <Link href="/" aria-label="Back to home">
                                <UnplugLogo size="md" />
                            </Link>
                            <Link href="/" className="text-xs font-semibold text-ink-70 hover:text-ink transition-colors">
                                ← Home
                            </Link>
                        </div>

                        <div className="mb-6">
                            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">Password Recovery</h2>
                            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-ink-70">
                                {showReset ? 'Enter the code sent to your email' : 'Reset your password'}
                            </p>
                        </div>

                        {showRequest && (
                            <>
                                {hasInvalidEmailError && (
                                    <Badge variant="danger" className="w-full justify-center py-3 mb-6">Enter a valid email.</Badge>
                                )}
                                {hasRequestFailedError && (
                                    <Badge variant="danger" className="w-full justify-center py-3 mb-6">Could not send reset code. Check email settings and try again.</Badge>
                                )}
                                {sent && (
                                    <Badge variant="success" className="w-full justify-center py-3 mb-6">If an account exists for this email, a reset code will arrive shortly.</Badge>
                                )}

                                <form action={requestResetCodeAction} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-ink-70 ml-1">Email</label>
                                        <Input name="email" type="email" defaultValue={email} placeholder="you@example.com" required />
                                    </div>
                                    <FormSubmitButton
                                        idleLabel="Send reset code"
                                        pendingLabel="Sending..."
                                        className="w-full h-12 text-sm font-bold uppercase tracking-widest mt-6"
                                    />
                                </form>

                                <div className="mt-6 space-y-3 text-center text-xs font-bold uppercase tracking-widest text-ink-70">
                                    <p>
                                        Already have a code?{' '}
                                        <Link href={resetStepUrl} className="text-green hover:underline">Enter it</Link>
                                    </p>
                                    <p className="border-t border-line pt-4">
                                        Remembered your password?{' '}
                                        <Link href="/login" className="text-green hover:underline">Back to login</Link>
                                    </p>
                                </div>
                            </>
                        )}

                        {showReset && (
                            <>
                                {hasInvalidResetInputError && (
                                    <Badge variant="danger" className="w-full justify-center py-3 mb-6">Enter email, 6-digit code, and a password with at least 8 characters.</Badge>
                                )}
                                {hasInvalidCodeError && (
                                    <Badge variant="danger" className="w-full justify-center py-3 mb-6">Invalid or expired code. Request another code and retry.</Badge>
                                )}

                                <form action={resetPasswordAction} className="space-y-3.5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-ink-70 ml-1">Email</label>
                                        <Input name="email" type="email" defaultValue={email} placeholder="you@example.com" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-ink-70 ml-1">Reset code</label>
                                        <Input
                                            name="otp"
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]{6}"
                                            minLength={6}
                                            maxLength={6}
                                            className="text-center tracking-[0.35em]"
                                            placeholder="123456"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-ink-70 ml-1">New password</label>
                                        <Input name="password" type="password" minLength={8} placeholder="At least 8 characters" required />
                                    </div>
                                    <FormSubmitButton
                                        idleLabel="Reset password"
                                        pendingLabel="Resetting..."
                                        className="w-full h-12 text-sm font-bold uppercase tracking-widest mt-6"
                                    />
                                </form>

                                <div className="mt-6 space-y-3 text-center text-xs font-bold uppercase tracking-widest text-ink-70">
                                    <p>
                                        Need a new code?{' '}
                                        <Link href={requestStepUrl} className="text-green hover:underline">Go back</Link>
                                    </p>
                                    <p className="border-t border-line pt-4">
                                        Remembered your password?{' '}
                                        <Link href="/login" className="text-green hover:underline">Back to login</Link>
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default ForgotPasswordPage;