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

const FAQ_ITEMS = [
  {
    question: 'Is it safe to connect my account?',
    answer:
      'Yes. We use secure bank-link providers and only pull the data needed to detect recurring subscriptions and estimate waste.',
  },
  {
    question: 'Will Unplug cancel subscriptions automatically?',
    answer:
      'You stay in control. Pro gives guided cancellation links, and Concierge can handle cancellation steps for you with your approval.',
  },
  {
    question: 'Can I start for free?',
    answer:
      'Yes. The free plan lets you scan subscriptions and view total monthly spend before choosing any upgrade.',
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
    <main className={`${jakarta.className} relative min-h-screen bg-[#FAFAF7] text-[#1A1A17]`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            'repeating-linear-gradient(45deg, rgba(26, 26, 23, 0.05) 0px, rgba(26, 26, 23, 0.05) 1px, transparent 1px, transparent 40px)',
            'repeating-linear-gradient(135deg, rgba(26, 26, 23, 0.05) 0px, rgba(26, 26, 23, 0.05) 1px, transparent 1px, transparent 40px)',
          ].join(', '),
        }}
      />
      <div className="relative z-1 mx-auto w-full max-w-6xl px-4 pb-16 pt-6 md:px-6 md:pt-8 lg:px-8 lg:pt-10">
        <header className="flex items-center justify-between rounded-2xl border border-[#E8E7E0] bg-white px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] md:px-6">
          <p className={`${playfair.className} text-3xl tracking-[-0.02em] text-[#1A1A17]`}>Unplug</p>
          <div className="hidden items-center gap-4 text-[11px] font-medium uppercase tracking-[0.08em] text-[#6B6960] md:flex">
            <a href="#how-it-works" className="hover:text-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#FF5C35]">How it works</a>
            <a href="#pricing" className="hover:text-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#FF5C35]">Pricing</a>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em]">
            <Link href="/login" className="rounded-[10px] border border-[#D0CFC7] px-3 py-2 text-[#6B6960] hover:border-[#1A1A17] hover:text-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#FF5C35]">
              Log in
            </Link>
            <Link href="/signup" className="rounded-[10px] border border-[#FF5C35] bg-[#FF5C35] px-3 py-2 text-white hover:bg-[#C93A1A] focus-visible:outline-2 focus-visible:outline-[#FF5C35]">
              Start now
            </Link>
          </div>
        </header>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] sm:p-8 lg:p-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Subscription waste dashboard</p>
            <h1 className={`${playfair.className} mt-4 max-w-3xl text-5xl leading-[1.02] tracking-[-0.02em] text-[#1A1A17] sm:text-6xl`}>
              You are paying for
              <br />
              things you forgot.
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[#6B6960]">
              Unplug scans recurring charges, scores likely waste, and forces one clear decision:
              keep paying, or cut it.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#E8E7E0] bg-[#FFF0EC] p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Burning / month</p>
                <p className={`${playfair.className} mt-2 text-4xl text-[#E53434]`}>{formatCurrency(summary.monthlySpend)}</p>
              </div>
              <div className="rounded-2xl border border-[#E8E7E0] bg-[#F4F3EE] p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Likely unused</p>
                <p className={`${playfair.className} mt-2 text-4xl text-[#1A1A17]`}>{summary.unusedCount}</p>
              </div>
              <div className="rounded-2xl border border-[#E8E7E0] bg-[#EDFAF3] p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Recoverable / yr</p>
                <p className={`${playfair.className} mt-2 text-4xl text-[#1C9E5B]`}>
                  {formatCurrency(summary.saveablePerYear)}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-[10px] border border-[#FF5C35] bg-[#FF5C35] px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#C93A1A] focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
              >
                Audit my subscriptions
              </Link>
              <Link
                href="/dashboard"
                className="rounded-[10px] border border-[#D0CFC7] px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.08em] text-[#6B6960] hover:border-[#1A1A17] hover:text-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
              >
                View dashboard preview
              </Link>
            </div>
          </article>

          <aside className="rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Live pressure list</p>
            <div className="mt-4 rounded-2xl border border-[#E8E7E0] bg-[#F4F3EE] p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Shame score</p>
              <p className={`${playfair.className} mt-2 text-6xl ${summary.shameScore >= 70 ? 'text-[#E53434]' : summary.shameScore >= 40 ? 'text-[#E8860A]' : 'text-[#1C9E5B]'}`}>
                {summary.shameScore}
              </p>
              <p className="mt-2 text-xs text-[#6B6960]">Lower is better. Every cancel moves it down.</p>
            </div>

            <div className="mt-4 space-y-3">
              {displayPressureList.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[10px] border-y border-r border-[#E8E7E0] border-l-[3px] border-l-[#E53434] bg-[#FEF0F0] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-[#1A1A17]">{item.serviceName}</p>
                    <p className={`${playfair.className} text-sm text-[#E53434]`}>{formatCurrency(item.amountMonthly)}/mo</p>
                  </div>
                  <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">
                    {item.alert?.message ?? 'Low utility detected'}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section id="how-it-works" className="mt-4 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">01 / detect</p>
            <h2 className={`${playfair.className} mt-3 text-3xl text-[#1A1A17]`}>Find recurring charges</h2>
            <p className="mt-4 text-sm leading-7 text-[#6B6960]">
              We map monthly transactions into a clean list of subscriptions so hidden spend stops hiding.
            </p>
          </article>
          <article className="rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">02 / score</p>
            <h2 className={`${playfair.className} mt-3 text-3xl text-[#1A1A17]`}>Measure actual usage</h2>
            <p className="mt-4 text-sm leading-7 text-[#6B6960]">
              Every service gets a confidence-weighted usage score so you stop arguing with vague feelings.
            </p>
          </article>
          <article className="rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">03 / cut</p>
            <h2 className={`${playfair.className} mt-3 text-3xl text-[#1A1A17]`}>Cancel dead weight fast</h2>
            <p className="mt-4 text-sm leading-7 text-[#6B6960]">
              One-click cancellation flow, short undo window, and a lower shame score every time you act.
            </p>
          </article>
        </section>

        <section id="pricing" className="mt-4 rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Pricing</p>
              <h2 className={`${playfair.className} mt-2 text-4xl text-[#1A1A17]`}>Choose your pressure level</h2>
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#A9A79E]">No annual lock-in</p>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <article
                key={plan.id}
                className={`flex flex-col rounded-2xl border p-4 ${plan.highlight
                  ? 'border-[#FF5C35] bg-[#FFF0EC]'
                  : 'border-[#E8E7E0] bg-[#FAFAF7]'
                  }`}
              >
                {plan.badge ? (
                  <span className="inline-flex w-fit rounded-[9999px] border border-[#FF5C35]/40 bg-[#FFF0EC] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#C93A1A]">
                    {plan.badge}
                  </span>
                ) : (
                  <span className="h-6" aria-hidden="true" />
                )}

                <h3 className="mt-3 text-2xl text-[#1A1A17]">{plan.name}</h3>
                <p className={`${playfair.className} mt-1 text-5xl leading-none text-[#1A1A17]`}>
                  ${plan.monthly}
                  <span className="ml-1 text-base text-[#6B6960]">/ month</span>
                </p>
                <p className="mt-3 min-h-12 text-sm text-[#6B6960]">{plan.subtitle}</p>

                <ul className="mt-3 flex-1 space-y-2 border-t border-[#E8E7E0] pt-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-2">
                      <span className={feature.available ? 'text-[#1C9E5B]' : 'text-[#A9A79E]'} aria-hidden="true">•</span>
                      <span className={feature.available ? 'text-[#1A1A17]' : 'text-[#A9A79E]'}>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`mt-4 rounded-[10px] border px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.08em] ${plan.highlight
                    ? 'border-[#FF5C35] bg-[#FF5C35] text-white hover:bg-[#C93A1A]'
                    : 'border-[#D0CFC7] text-[#1A1A17] hover:border-[#1A1A17]'
                    } focus-visible:outline-2 focus-visible:outline-[#FF5C35]`}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>

          <p className="mt-6 text-center text-xs font-medium uppercase tracking-[0.06em] text-[#A9A79E]">
            Why this pricing works: start free, upgrade only when waste is measurable.
          </p>
        </section>

        <section className="mt-4 rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] sm:p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Final prompt</p>
          <h2 className={`${playfair.className} mt-3 max-w-3xl text-4xl leading-tight text-[#1A1A17] sm:text-5xl`}>
            Keep leaking money,
            <br />
            or face it this week.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6B6960]">
            Connect your accounts, surface recurring waste, and cut dead subscriptions in minutes.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-[10px] border border-[#FF5C35] bg-[#FF5C35] px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#C93A1A] focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
            >
              Start now
            </Link>
            <Link
              href="/login"
              className="rounded-[10px] border border-[#D0CFC7] px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.08em] text-[#6B6960] hover:border-[#1A1A17] hover:text-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
            >
              I already have an account
            </Link>
          </div>
        </section>

        <section id="faq" className="mt-4 rounded-2xl border border-[#E8E7E0] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">FAQ</p>
              <h2 className={`${playfair.className} mt-2 text-4xl text-[#1A1A17]`}>Questions before you unplug</h2>
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Clear answers, no fluff</p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {FAQ_ITEMS.map((item) => (
              <article key={item.question} className="rounded-2xl border border-[#E8E7E0] bg-[#FAFAF7] p-4">
                <h3 className="text-base font-semibold text-[#1A1A17]">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-[#6B6960]">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-4 rounded-2xl border border-[#E8E7E0] bg-[#F4F3EE] px-6 py-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={`${playfair.className} text-2xl tracking-[-0.02em] text-[#1A1A17]`}>Unplug</p>
              <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[#6B6960]">Cut subscription waste with confidence</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B6960]">
              <Link href="/signup" className="hover:text-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#FF5C35]">
                Get started
              </Link>
              <Link href="/login" className="hover:text-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#FF5C35]">
                Log in
              </Link>
              <a href="#pricing" className="hover:text-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#FF5C35]">
                Pricing
              </a>
              <a href="#faq" className="hover:text-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#FF5C35]">
                FAQ
              </a>
            </div>
          </div>

          <div className="mt-4 border-t border-[#DCDAD0] pt-4 text-[11px] uppercase tracking-[0.08em] text-[#8A887E]">
            © {new Date().getFullYear()} Unplug. All rights reserved.
          </div>
        </footer>
      </div>
    </main>
  );
};

export default HomePage;
