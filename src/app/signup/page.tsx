import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { FormSubmitButton } from '@/components/features/auth/FormSubmitButton';
import { auth } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/server/mailer';
import { getServerSession } from '@/lib/server/auth-session';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

const signupAction = async (formData: FormData) => {
    'use server';
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '').trim();

    if (!name || !email || !password) redirect('/signup?error=invalid_input');

    try {
        await auth.api.signUpEmail({
            body: { name, email, password, callbackURL: '/dashboard' },
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
    // redirect('/onboarding');
};

export default async function SignupPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
    const params = (await searchParams) ?? {};
    const session = await getServerSession();
    if (session) redirect('/dashboard');

    return (
        <main className="auth-page flex min-h-screen items-center justify-center p-4">
            <div className="auth-page-pattern" />
            <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-4 items-stretch">
                <Card className="hidden lg:flex flex-col justify-between p-10 bg-bg-surface">
                    <div>
                        <Badge variant="outline" className="mb-6">Unplug</Badge>
                        <h1 className="font-display text-5xl leading-tight tracking-tight">Stop paying for<br />things you forgot.</h1>
                        <p className="mt-6 text-text-secondary leading-7">The average person wastes $1,320 a year on subscriptions they don't use. We make the waste impossible to ignore.</p>
                    </div>
                    <div className="space-y-4">
                        {["Automatic detection", "Usage scoring", "Monthly debriefs"].map(item => (
                            <div key={item} className="flex items-center gap-3 text-sm font-medium text-text-secondary">
                                <span className="h-2 w-2 rounded-full bg-brand" /> {item}
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-8 lg:p-12 flex flex-col justify-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-8">Create Account</p>

                    {params.error === 'signup_failed' && (
                        <Badge variant="danger" className="w-full justify-center py-3 mb-6">Sign-up failed. Try again.</Badge>
                    )}

                    <form action={signupAction} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Full Name</label>
                            <Input name="name" type="text" placeholder="Your name" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Email</label>
                            <Input name="email" type="email" placeholder="you@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Password</label>
                            <Input name="password" type="password" placeholder="At least 8 characters" required />
                        </div>
                        <FormSubmitButton
                            idleLabel="Create account"
                            pendingLabel="Creating..."
                            className="w-full h-12 text-[10px] font-bold uppercase tracking-widest mt-4"
                        />
                    </form>

                    <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        Already have an account?{' '}
                        <Link href="/login" className="text-brand hover:underline">Log in</Link>
                    </p>
                </Card>
            </div>
        </main>
    );
}
