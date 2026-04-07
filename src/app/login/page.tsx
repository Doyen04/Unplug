import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '../../lib/auth';
import { getServerSession } from '../../lib/server/auth-session';

const loginAction = async (formData: FormData) => {
    'use server';

    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '').trim();

    if (!email || !password) {
        redirect('/login?error=invalid_credentials');
    }

    try {
        await auth.api.signInEmail({
            body: {
                email,
                password,
                callbackURL: '/dashboard',
            },
            headers: await headers(),
        });
    } catch {
        redirect('/login?error=invalid_credentials');
    }

    redirect('/dashboard');
};

interface LoginPageProps {
    searchParams?: Promise<{
        error?: string;
    }>;
}

const LoginPage = async ({ searchParams }: LoginPageProps) => {
    const params = (await searchParams) ?? {};
    const hasInvalidCredentials = params.error === 'invalid_credentials';

    const session = await getServerSession();

    if (session) {
        redirect('/dashboard');
    }

    return (
        <main className="h-screen overflow-hidden bg-stone-950 px-4 py-8 text-stone-100 md:px-6 md:py-10 lg:px-8">
            <div className="mx-auto grid h-full w-full max-w-6xl items-stretch gap-4 lg:grid-cols-[1.2fr_1fr]">
                <section className="max-h-[calc(100vh-4rem)] overflow-hidden border border-stone-800 bg-stone-900 p-6 sm:p-8 lg:p-10">
                    <Link
                        href="/"
                        className="block focus-visible:outline-2 focus-visible:outline-acid-green"
                        aria-label="Go to Unplug home page"
                    >
                        <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Unplug</p>
                        <h1 className="mt-4 font-display text-4xl leading-tight text-stone-100 sm:text-5xl">
                            Log in and face
                            <br />
                            your subscriptions.
                        </h1>
                        <p className="mt-5 max-w-xl text-sm leading-7 text-stone-300">
                            No fluff. No fake optimism. Just a clear view of what you pay, what you use,
                            and what should have been cancelled months ago.
                        </p>

                        <div className="mt-8 border-l-2 border-acid-green pl-4">
                            <p className="text-xs uppercase tracking-[0.08em] text-stone-500">This month</p>
                            <p className="mt-2 text-sm text-stone-300">Average recoverable waste: $1,320 / year</p>
                        </div>
                    </Link>
                </section>

                <section className="scrollbar-hidden max-h-[calc(100vh-4rem)] overflow-y-auto border border-stone-800 bg-stone-900 p-6 sm:p-8">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Account Access</p>

                    {hasInvalidCredentials ? (
                        <div
                            className="mt-4 border border-red-900 bg-red-950 p-3 text-xs uppercase tracking-[0.08em] text-red-400"
                            role="status"
                            aria-live="polite"
                        >
                            Invalid email or password.
                        </div>
                    ) : null}

                    <form className="mt-5 space-y-4" action={loginAction}>
                        <div>
                            <label htmlFor="email" className="text-xs uppercase tracking-[0.08em] text-stone-500">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="mt-2 w-full border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 outline-none transition-colors focus:border-acid-green"
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
                                className="mt-2 w-full border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 outline-none transition-colors focus:border-acid-green"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full border border-acid-green bg-acid-green px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-stone-950 transition-colors hover:bg-acid-dim"
                        >
                            Log in
                        </button>
                    </form>

                    <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.06em] text-stone-500">
                        <Link href="/signup" className="hover:text-acid-green">
                            Create account
                        </Link>
                        <a href="#" className="hover:text-stone-300">
                            Forgot password
                        </a>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default LoginPage;
