import Link from 'next/link';

import { getDashboardPayload } from '../lib/server/dashboard-data';
import { formatCurrency } from '../lib/utils/format';

interface PricingPlan {
  id: 'free' | 'pro' | 'concierge';
  name: string;
  monthly: number;
  subtitle: string;
  cta: string;
  href: string;
  highlight?: boolean;
  badge?: string;
  features: Array<{ text: string; available: boolean }>;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    monthly: 0,
    subtitle: 'Core detection only. Build trust first.',
    cta: 'Get started',
    href: '/signup',
    features: [
      { text: 'Bank link (1 account)', available: true },
      { text: 'Subscription detection', available: true },
      { text: 'Total spend summary', available: true },
      { text: 'Usage signals', available: false },
      { text: 'Alerts & price hike detect', available: false },
      { text: 'AI monthly debrief', available: false },
      { text: 'Cancel assistance', available: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 4,
    subtitle: 'Full intelligence layer. Pays for itself in week one.',
    cta: 'Start free trial',
    href: '/signup',
    highlight: true,
    badge: 'Most popular',
    features: [
      { text: 'Bank link (unlimited)', available: true },
      { text: 'Subscription detection', available: true },
      { text: 'Total spend summary', available: true },
      { text: 'Usage signals + scoring', available: true },
      { text: 'Alerts & price hike detect', available: true },
      { text: 'AI monthly debrief', available: true },
      { text: 'Cancel assistance', available: false },
    ],
  },
  {
    id: 'concierge',
    name: 'Concierge',
    monthly: 9,
    subtitle: 'We handle cancellations on your behalf.',
    cta: 'Go Concierge',
    href: '/signup',
    features: [
      { text: 'Everything in Pro', available: true },
      { text: 'We cancel for you', available: true },
      { text: 'Bill negotiation (opt-in)', available: true },
      { text: 'Family plan optimizer', available: true },
      { text: 'Priority support', available: true },
      { text: 'Yearly savings report', available: true },
      { text: 'Export to CSV / PDF', available: true },
    ],
  },
];

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
          <div className="hidden items-center gap-4 text-[11px] uppercase tracking-[0.08em] text-stone-400 md:flex">
            <a href="#how-it-works" className="hover:text-stone-100 focus-visible:outline-2 focus-visible:outline-acid-green">How it works</a>
            <a href="#pricing" className="hover:text-stone-100 focus-visible:outline-2 focus-visible:outline-acid-green">Pricing</a>
          </div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em]">
            <Link href="/login" className="border border-stone-700 px-3 py-2 text-stone-300 hover:border-stone-500 focus-visible:outline-2 focus-visible:outline-acid-green">
              Log in
            </Link>
            <Link href="/signup" className="border border-acid-green bg-acid-green px-3 py-2 text-stone-950 hover:bg-acid-dim focus-visible:outline-2 focus-visible:outline-acid-green">
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
                className="border border-acid-green bg-acid-green px-5 py-3 text-center text-xs uppercase tracking-[0.08em] text-stone-950 hover:bg-acid-dim focus-visible:outline-2 focus-visible:outline-acid-green"
              >
                Audit my subscriptions
              </Link>
              <Link
                href="/dashboard"
                className="border border-stone-700 px-5 py-3 text-center text-xs uppercase tracking-[0.08em] text-stone-300 hover:border-stone-500 focus-visible:outline-2 focus-visible:outline-acid-green"
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

        <section id="how-it-works" className="mt-4 grid gap-4 md:grid-cols-3">
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

        <section id="pricing" className="mt-4 border border-stone-800 bg-stone-900 p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Pricing</p>
              <h2 className="mt-2 font-display text-4xl text-stone-100">Choose your pressure level</h2>
            </div>
            <p className="text-xs uppercase tracking-[0.08em] text-stone-500">No annual lock-in</p>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <article
                key={plan.id}
                className={`flex flex-col border p-4 ${plan.highlight
                  ? 'border-acid-green bg-acid-muted/30'
                  : 'border-stone-700 bg-stone-950'
                  }`}
              >
                {plan.badge ? (
                  <span className="inline-flex w-fit border border-acid-green/40 bg-acid-muted px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-acid-green">
                    {plan.badge}
                  </span>
                ) : (
                  <span className="h-6" aria-hidden="true" />
                )}

                <h3 className="mt-3 text-2xl text-stone-100">{plan.name}</h3>
                <p className="mt-1 font-display text-5xl leading-none text-stone-100">
                  ${plan.monthly}
                  <span className="ml-1 text-base text-stone-400">/ month</span>
                </p>
                <p className="mt-3 min-h-12 text-sm text-stone-300">{plan.subtitle}</p>

                <ul className="mt-3 flex-1 space-y-2 border-t border-stone-800 pt-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-2">
                      <span className={feature.available ? 'text-acid-green' : 'text-stone-500'} aria-hidden="true">•</span>
                      <span className={feature.available ? 'text-stone-200' : 'text-stone-500'}>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`mt-4 border px-4 py-2 text-center text-xs uppercase tracking-[0.08em] ${plan.highlight
                    ? 'border-acid-green bg-acid-green text-stone-950 hover:bg-acid-dim'
                    : 'border-stone-600 text-stone-100 hover:border-stone-400'
                    } focus-visible:outline-2 focus-visible:outline-acid-green`}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>

          <p className="mt-6 text-center text-xs uppercase tracking-[0.06em] text-stone-500">
            Why this pricing works: start free, upgrade only when waste is measurable.
          </p>
        </section>

        <section className="mt-4 border border-stone-800 bg-stone-900 p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Final prompt</p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl leading-tight text-stone-100 sm:text-5xl">
            Keep leaking money,
            <br />
            or face it this week.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300">
            Connect your accounts, surface recurring waste, and cut dead subscriptions in minutes.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="border border-acid-green bg-acid-green px-5 py-3 text-center text-xs uppercase tracking-[0.08em] text-stone-950 hover:bg-acid-dim focus-visible:outline-2 focus-visible:outline-acid-green"
            >
              Start now
            </Link>
            <Link
              href="/login"
              className="border border-stone-700 px-5 py-3 text-center text-xs uppercase tracking-[0.08em] text-stone-300 hover:border-stone-500 focus-visible:outline-2 focus-visible:outline-acid-green"
            >
              I already have an account
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default HomePage;
