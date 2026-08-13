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

const loginAction = async (formData: FormData) => {
    'use server';
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '').trim();

    if (!email || !password) redirect('/login?error=invalid_credentials');

    try {
        await auth.api.signInEmail({
            body: { email, password, callbackURL: '/dashboard' },
            headers: await headers(),
        });
    } catch {
        redirect('/login?error=invalid_credentials');
    }
    redirect('/dashboard');
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

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ error?: string; reset?: string }> }) {
    const params = (await searchParams) ?? {};
    const session = await getServerSession();
    if (session) redirect('/dashboard');

    return (
        <main className="auth-page relative">
            <div className="lg:grid lg:min-h-screen lg:grid-cols-2">
                {/* Left: brand story */}
                <section className="dot-grid relative hidden flex-col justify-between gap-10 overflow-hidden border-r border-line bg-bg-surface p-8 xl:p-12 lg:flex">
                    <div className="relative space-y-5">
                        <Link href="/" aria-label="Back to home" className="inline-block">
                            <UnplugLogo size="md" />
                        </Link>
                        <h1 className="font-display text-[clamp(38px,4vw,54px)] font-bold leading-[1.05] tracking-tight text-ink">
                            Log in and face your subscriptions.
                        </h1>
                        <p className="max-w-md text-[15px] leading-7 text-ink-70">
                            No fluff. Just a clear view of what you pay, what you use, and what should have been
                            cancelled months ago.
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
                <section className="flex min-h-screen flex-col bg-white px-4 py-12 sm:px-10">
                    <div className="m-auto w-full max-w-md">
                        <Link href="/" aria-label="Back to home" className="mb-10 inline-block lg:hidden">
                            <UnplugLogo size="md" />
                        </Link>

                        <p className="text-xs font-bold uppercase tracking-widest text-ink-70 mb-6">Log in to Unplug</p>

                        {params.error === 'invalid_credentials' && (
                            <Badge variant="danger" className="w-full justify-center py-3 mb-6">Invalid email or password</Badge>
                        )}
                        {params.error === 'delete_failed' && (
                            <Badge variant="danger" className="w-full justify-center py-3 mb-6">Account deletion failed. Please contact support.</Badge>
                        )}
                        {params.reset === 'success' && (
                            <Badge variant="success" className="w-full justify-center py-3 mb-6">Password reset successful</Badge>
                        )}

                        <form action={loginAction} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-ink-70 ml-1">Email</label>
                                <Input name="email" type="email" placeholder="you@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-ink-70 ml-1">Password</label>
                                <Input name="password" type="password" placeholder="••••••••" required />
                            </div>
                            <FormSubmitButton
                                idleLabel="Log in"
                                pendingLabel="Logging in..."
                                className="w-full h-12 text-sm font-bold uppercase tracking-widest mt-4"
                            />
                        </form>

                        <div className="mt-8 flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                            <Link href="/signup" className="text-green hover:underline">Create account</Link>
                            <Link href="/forgot-password" title="Coming soon" className="text-ink-70 hover:text-ink">Forgot password</Link>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
