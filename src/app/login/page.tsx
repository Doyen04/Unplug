import Link from 'next/link';

const LoginPage = () => {
  return (
    <main className="flex min-h-screen items-center bg-stone-950 px-4 py-10 text-stone-100 md:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[1.2fr_1fr]">
        <section className="border border-stone-800 bg-stone-900 p-8 lg:p-10">
          <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Unplug</p>
          <h1 className="mt-4 font-display text-5xl leading-tight text-stone-100">
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
        </section>

        <section className="border border-stone-800 bg-stone-900 p-8">
          <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Account Access</p>

          <form className="mt-5 space-y-4" action="#" method="post">
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
