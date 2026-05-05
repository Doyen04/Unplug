import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { FormSubmitButton } from '../../components/features/auth/FormSubmitButton';
import { auth } from '../../lib/auth';
import { getServerSession } from '../../lib/server/auth-session';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

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

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ error?: string; reset?: string }> }) {
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
                    <h1 className="font-display text-5xl leading-tight tracking-tight">Log in and face<br />your subscriptions.</h1>
                    <p className="mt-6 text-text-secondary leading-7">No fluff. No fake optimism. Just a clear view of what you pay, what you use, and what should have been cancelled months ago.</p>
                   </div>
                   <div className="border-l-4 border-brand pl-6">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Recoverable Waste</p>
                      <p className="text-3xl font-bold mt-1">$1,320<span className="text-sm font-normal text-text-muted"> / year</span></p>
                   </div>
                </Card>

                <Card className="p-8 lg:p-12 flex flex-col justify-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-8">Account Access</p>
                    
                    {params.error === 'invalid_credentials' && (
                        <Badge variant="danger" className="w-full justify-center py-3 mb-6">Invalid email or password</Badge>
                    )}
                    {params.reset === 'success' && (
                        <Badge variant="success" className="w-full justify-center py-3 mb-6">Password reset successful</Badge>
                    )}

                    <form action={loginAction} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Email</label>
                            <Input name="email" type="email" placeholder="you@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Password</label>
                            <Input name="password" type="password" placeholder="••••••••" required />
                        </div>
                        <FormSubmitButton 
                           idleLabel="Log in" 
                           pendingLabel="Logging in..." 
                           className="w-full h-12 text-[10px] font-bold uppercase tracking-widest"
                        />
                    </form>

                    <div className="mt-8 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                       <Link href="/signup" className="text-brand hover:underline">Create account</Link>
                       <Link href="/forgot-password" title="Coming soon" className="text-text-muted hover:text-text-primary">Forgot password</Link>
                    </div>
                </Card>
            </div>
        </main>
    );
}
