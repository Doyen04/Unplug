import Link from 'next/link';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';

import { getDashboardPayload } from '../lib/server/dashboard-data';
import { formatCurrency } from '../lib/utils/format';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

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

  const displayPressureList = pressureList.length > 0
    ? pressureList
    : subscriptions.slice(0, 3);

  return (
    <main className={`${jakarta.className} min-h-screen bg-bg-base text-text-primary`}>
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 md:px-6 md:pt-8 lg:px-8 lg:pt-10">

        {/* Header */}
        <header className="flex items-center justify-between rounded-card border border-border bg-white px-4 py-3 shadow-card md:px-6">
          <p className={`${playfair.className} text-3xl tracking-[-0.02em] text-text-primary`}>
            Unplug
          </p>
          <div className="hidden items-center gap-5 text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-text-primary">
              How it works
            </a>
            <a href="#pricing" className="transition-colors hover:text-text-primary">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em]">
            <Link
              href="/login"
              className="rounded-btn border border-border-strong px-3 py-2 text-text-secondary transition-all duration-150 hover:border-text-primary hover:text-text-primary"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-btn bg-brand px-3 py-2 text-white transition-all duration-150 hover:bg-brand-dark hover:-translate-y-0.5"
            >
              Start now
            </Link>
          </div>
        </header>

        {/* Hero section */}
        <section
          className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"
          style={{ animationDelay: '0.1s' }}
        >
          <article className="rounded-card border border-border bg-white p-6 shadow-card card-hover sm:p-8 lg:p-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
              Subscription waste dashboard
            </p>
            <h1 className={`${playfair.className} mt-4 max-w-3xl text-5xl leading-[1.02] tracking-[-0.02em] text-text-primary sm:text-6xl`}>
              You are paying for
              <br />
              things you forgot.
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-7 text-text-secondary">
              Unplug scans recurring charges, scores likely waste, and forces one clear decision:
              keep paying, or cut it.
            </p>

            {/* Stat cards */}
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-card border border-border bg-brand-light p-4 transition-shadow duration-200 hover:shadow-card-hover">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
                  Burning / month
                </p>
                <p className={`${playfair.className} mt-2 text-4xl text-danger`}>
                  {formatCurrency(summary.monthlySpend)}
                </p>
              </div>
              <div className="rounded-card border border-border bg-bg-muted p-4 transition-shadow duration-200 hover:shadow-card-hover">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
                  Likely unused
                </p>
                <p className={`${playfair.className} mt-2 text-4xl text-text-primary`}>
                  {summary.unusedCount}
                </p>
              </div>
              <div className="rounded-card border border-border bg-success-light p-4 transition-shadow duration-200 hover:shadow-card-hover">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
                  Recoverable / yr
                </p>
                <p className={`${playfair.className} mt-2 text-4xl text-success`}>
                  {formatCurrency(summary.saveablePerYear)}
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-btn bg-brand px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition-all duration-150 hover:bg-brand-dark hover:-translate-y-0.5"
              >
                Audit my subscriptions
              </Link>
              <Link
                href="/dashboard"
                className="rounded-btn border border-border-strong px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary transition-all duration-150 hover:border-text-primary hover:text-text-primary"
              >
                View dashboard preview
              </Link>
            </div>
          </article>

          {/* Pressure list sidebar */}
          <aside className="rounded-card border border-border bg-white p-6 shadow-card">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
              Live pressure list
            </p>

            <div className="mt-4 rounded-card border border-border bg-bg-muted p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-text-muted">
                Shame score
              </p>
              <p className={`${playfair.className} mt-2 text-6xl font-black ${
                summary.shameScore >= 70
                  ? 'text-danger'
                  : summary.shameScore >= 40
                    ? 'text-warning'
                    : 'text-success'
              }`}>
                {summary.shameScore}
              </p>
              <p className="mt-2 text-[13px] text-text-secondary">
                Lower is better. Every cancel moves it down.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {displayPressureList.map((item) => (
                <div
                  key={item.id}
                  className="rounded-btn border border-border border-l-[3px] border-l-danger bg-danger-light p-3 transition-shadow duration-200 hover:shadow-card-hover"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-danger font-display text-xs font-bold text-white">
                        {item.serviceName.charAt(0)}
                      </div>
                      <p className="text-[13px] font-medium text-text-primary">{item.serviceName}</p>
                    </div>
                    <p className={`${playfair.className} text-[13px] font-bold text-danger`}>
                      {formatCurrency(item.amountMonthly)}/mo
                    </p>
                  </div>
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
                    {item.alert?.message ?? 'Low utility detected'}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { step: '01 / detect', title: 'Find recurring charges', description: 'We map monthly transactions into a clean list of subscriptions so hidden spend stops hiding.' },
            { step: '02 / score', title: 'Measure actual usage', description: 'Every service gets a confidence-weighted usage score so you stop arguing with vague feelings.' },
            { step: '03 / cut', title: 'Cancel dead weight fast', description: 'One-click cancellation flow, short undo window, and a lower shame score every time you act.' },
          ].map(({ step, title, description }) => (
            <article
              key={step}
              className="rounded-card border border-border bg-white p-6 shadow-card card-hover"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-brand">
                {step}
              </p>
              <h2 className={`${playfair.className} mt-3 text-3xl text-text-primary`}>{title}</h2>
              <p className="mt-4 text-[15px] leading-7 text-text-secondary">{description}</p>
            </article>
          ))}
        </section>

        {/* Pricing */}
        <section
          id="pricing"
          className="mt-4 rounded-card border border-border bg-white p-6 shadow-card sm:p-8"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
                Pricing
              </p>
              <h2 className={`${playfair.className} mt-2 text-4xl text-text-primary`}>
                Choose your pressure level
              </h2>
            </div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
              No annual lock-in
            </p>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <article
                key={plan.id}
                className={`card-hover flex flex-col rounded-card border p-5 ${
                  plan.highlight
                    ? 'border-brand bg-brand-light'
                    : 'border-border bg-bg-base'
                }`}
              >
                {plan.badge ? (
                  <span className="inline-flex w-fit rounded-pill bg-brand px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
                    {plan.badge}
                  </span>
                ) : (
                  <span className="h-6" aria-hidden="true" />
                )}

                <h3 className="mt-3 text-2xl font-medium text-text-primary">{plan.name}</h3>
                <p className={`${playfair.className} mt-1 text-5xl font-bold leading-none text-text-primary`}>
                  ${plan.monthly}
                  <span className="ml-1 font-ui text-base font-normal text-text-secondary">/ month</span>
                </p>
                <p className="mt-3 min-h-12 text-[13px] text-text-secondary">{plan.subtitle}</p>

                <ul className="mt-4 flex-1 space-y-2.5 border-t border-border pt-4 text-[13px]">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-2">
                      <span
                        className={`mt-0.5 text-[14px] ${feature.available ? 'text-success' : 'text-text-muted'}`}
                        aria-hidden="true"
                      >
                        {feature.available ? '✓' : '—'}
                      </span>
                      <span className={feature.available ? 'text-text-primary' : 'text-text-muted'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`mt-5 rounded-btn border px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.08em] transition-all duration-150 ${
                    plan.highlight
                      ? 'border-brand bg-brand text-white hover:bg-brand-dark hover:-translate-y-0.5'
                      : 'border-border-strong text-text-primary hover:border-text-primary hover:bg-bg-muted'
                  }`}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>

          <p className="mt-6 text-center text-[11px] font-medium uppercase tracking-[0.06em] text-text-muted">
            Why this pricing works: start free, upgrade only when waste is measurable.
          </p>
        </section>

        {/* Final CTA */}
        <section className="mt-4 rounded-card border border-border bg-white p-6 shadow-card sm:p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
            Final prompt
          </p>
          <h2 className={`${playfair.className} mt-3 max-w-3xl text-4xl leading-tight text-text-primary sm:text-5xl`}>
            Keep leaking money,
            <br />
            or face it this week.
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-text-secondary">
            Connect your accounts, surface recurring waste, and cut dead subscriptions in minutes.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-btn bg-brand px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition-all duration-150 hover:bg-brand-dark hover:-translate-y-0.5"
            >
              Start now
            </Link>
            <Link
              href="/login"
              className="rounded-btn border border-border-strong px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary transition-all duration-150 hover:border-text-primary hover:text-text-primary"
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
