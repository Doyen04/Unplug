import { Check } from 'lucide-react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { FormSubmitButton } from '@/components/features/auth/FormSubmitButton';
import { auth } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/server/mailer';
import { getServerSession } from '@/lib/server/auth-session';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { UnplugLogo } from '@/components/ui/UnplugLogo';

const signupAction = async (formData: FormData) => {
    'use server';
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const phoneNumber = String(formData.get('phoneNumber') ?? '').trim();
    const password = String(formData.get('password') ?? '').trim();

    if (!name || !email || !phoneNumber || !password) redirect('/signup?error=invalid_input');

    try {
        await auth.api.signUpEmail({
            body: { name, email, password, phoneNumber, callbackURL: '/dashboard' },
            headers: await headers(),
        });

        // fire-and-forget welcome email
        try {
            // don't await to avoid slowing signup response
            void sendWelcomeEmail(email, name);
        } catch { }
    } catch {
        redirect('/signup?error=signup_failed');
    }
    redirect('/dashboard')
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

export default async function SignupPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
    const params = (await searchParams) ?? {};
    const session = await getServerSession();
    if (session) redirect('/dashboard');

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
                            Stop paying for things you forgot.
                        </h1>
                        <p className="max-w-md text-[15px] leading-7 text-ink-70">
                            Unplug gives every subscription its own virtual card — so you can freeze or cancel the
                            charges you don&apos;t want, the moment you notice them.
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
                            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">Create Account</h2>
                            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-ink-70">Get started with Unplug free in 2 minutes</p>
                        </div>

                        {params.error === 'signup_failed' && (
                            <Badge variant="danger" className="w-full justify-center py-3 mb-6">Sign-up failed. Try again.</Badge>
                        )}

                        <form action={signupAction} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-ink-70 ml-1">Full Name</label>
                                <Input name="name" type="text" placeholder="Your name" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-ink-70 ml-1">Email</label>
                                <Input name="email" type="email" placeholder="you@example.com" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-ink-70 ml-1">Phone Number</label>
                                <Input name="phoneNumber" type="tel" placeholder="+234 801 234 5678" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-widest text-ink-70 ml-1">Password</label>
                                <Input name="password" type="password" placeholder="At least 8 characters" required />
                            </div>
                            <FormSubmitButton
                                idleLabel="Create account"
                                pendingLabel="Creating..."
                                className="w-full h-12 text-sm font-bold uppercase tracking-widest mt-5"
                            />
                        </form>

                        <p className="mt-6 border-t border-line pt-5 text-center text-xs font-bold uppercase tracking-widest text-ink-70">
                            Already have an account?{' '}
                            <Link href="/login" className="text-green hover:underline">Log in</Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
