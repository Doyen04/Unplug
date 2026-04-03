import Link from 'next/link';

import { getDashboardPayload } from '../lib/server/dashboard-data';
import { formatCurrency } from '../lib/utils/format';

const HomePage = async () => {
  const { summary, subscriptions } = await getDashboardPayload({ pageSize: 20 });

  const pressureList = subscriptions
    .filter((item) => item.status !== 'healthy' && item.status !== 'cancelled')
    .sort((a, b) => b.amountMonthly - a.amountMonthly)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100">
      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 md:px-6 md:pt-8 lg:px-8 lg:pt-10">
        <header className="flex items-center justify-between border border-stone-800 bg-stone-900 px-4 py-3 md:px-6">
          <p className="font-display text-2xl italic tracking-[-0.02em]">Unplug</p>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em]">
            <Link href="/login" className="border border-stone-700 px-3 py-2 text-stone-300 hover:border-stone-500">
              Log in
            </Link>
            <Link href="/signup" className="border border-acid-green bg-acid-green px-3 py-2 text-stone-950 hover:bg-acid-dim">
              Start now
            </Link>
          </div>
        </header>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="border border-stone-800 bg-stone-900 p-6 sm:p-8 lg:p-10">
            <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Subscription waste dashboard</p>
            <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.02] tracking-[-0.02em] text-stone-100 sm:text-6xl">
              You are paying for
              <br />
              things you forgot.
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-stone-300">
              Unplug scans recurring charges, scores likely waste, and forces one clear decision:
              keep paying, or cut it.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="border border-stone-800 bg-stone-950 p-4">
                <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Burning / month</p>
                <p className="mt-2 font-display text-4xl text-red-500">{formatCurrency(summary.monthlySpend)}</p>
              </div>
              <div className="border border-stone-800 bg-stone-950 p-4">
                <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Likely unused</p>
                <p className="mt-2 font-display text-4xl text-stone-100">{summary.unusedCount}</p>
              </div>
              <div className="border border-stone-800 bg-stone-950 p-4">
                <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Recoverable / yr</p>
                <p className="mt-2 font-display text-4xl text-acid-green">
                  {formatCurrency(summary.saveablePerYear)}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="border border-acid-green bg-acid-green px-5 py-3 text-center text-xs uppercase tracking-[0.08em] text-stone-950 hover:bg-acid-dim"
              >
                Audit my subscriptions
              </Link>
              <Link
                href="/dashboard"
                className="border border-stone-700 px-5 py-3 text-center text-xs uppercase tracking-[0.08em] text-stone-300 hover:border-stone-500"
              >
                View dashboard preview
              </Link>
            </div>
          </article>

          <aside className="border border-stone-800 bg-stone-900 p-6">
            <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Live pressure list</p>
            <div className="mt-4 border border-stone-800 bg-stone-950 p-4">
              <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Shame score</p>
              <p className="mt-2 font-display text-6xl text-red-500">{summary.shameScore}</p>
              <p className="mt-2 text-xs text-stone-400">Lower is better. You are not there yet.</p>
            </div>

            <div className="mt-4 space-y-3">
              {pressureList.map((item) => (
                <div
                  key={item.id}
                  className="border-y border-r border-stone-800 border-l-[3px] border-l-red-500 bg-stone-950 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-stone-100">{item.serviceName}</p>
                    <p className="text-sm text-red-400">{formatCurrency(item.amountMonthly)}/mo</p>
                  </div>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.08em] text-stone-500">
                    {item.alert?.message ?? 'Low utility detected'}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-3">
          <article className="border border-stone-800 bg-stone-900 p-6">
            <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">01 / detect</p>
            <h2 className="mt-3 font-display text-3xl">Find recurring charges</h2>
            <p className="mt-4 text-sm leading-7 text-stone-300">
              We map monthly transactions into a clean list of subscriptions so hidden spend stops hiding.
            </p>
          </article>
          <article className="border border-stone-800 bg-stone-900 p-6">
            <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">02 / score</p>
            <h2 className="mt-3 font-display text-3xl">Measure actual usage</h2>
            <p className="mt-4 text-sm leading-7 text-stone-300">
              Every service gets a confidence-weighted usage score so you stop arguing with vague feelings.
            </p>
          </article>
          <article className="border border-stone-800 bg-stone-900 p-6">
            <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">03 / cut</p>
            <h2 className="mt-3 font-display text-3xl">Cancel dead weight fast</h2>
            <p className="mt-4 text-sm leading-7 text-stone-300">
              One-click cancellation flow, short undo window, and a lower shame score every time you act.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
};

export default HomePage;
