import Link from 'next/link';

interface PricingTier {
  id: 'free' | 'pro' | 'concierge';
  label: string;
  monthlyPrice: number;
  subtitle: string;
  features: Array<{ text: string; available: boolean }>;
  ctaLabel: string;
  href: string;
  highlight?: boolean;
  badgeLabel?: string;
}

const TIERS: PricingTier[] = [
  {
    id: 'free',
    label: 'Free',
    monthlyPrice: 0,
    subtitle: 'Core detection only. Build trust first.',
    features: [
      { text: 'Bank link (1 account)', available: true },
      { text: 'Subscription detection', available: true },
      { text: 'Total spend summary', available: true },
      { text: 'Usage signals', available: false },
      { text: 'Alerts & price hike detect', available: false },
      { text: 'AI monthly debrief', available: false },
      { text: 'Cancel assistance', available: false },
    ],
    ctaLabel: 'Get started',
    href: '/dashboard/connect',
  },
  {
    id: 'pro',
    label: 'Pro',
    monthlyPrice: 4,
    subtitle: 'Full intelligence layer. Pays for itself in week one.',
    features: [
      { text: 'Bank link (unlimited)', available: true },
      { text: 'Subscription detection', available: true },
      { text: 'Total spend summary', available: true },
      { text: 'Usage signals + scoring', available: true },
      { text: 'Alerts & price hike detect', available: true },
      { text: 'AI monthly debrief', available: true },
      { text: 'Cancel assistance', available: false },
    ],
    ctaLabel: 'Start free trial',
    href: '/dashboard/connect',
    highlight: true,
    badgeLabel: 'Most popular',
  },
  {
    id: 'concierge',
    label: 'Concierge',
    monthlyPrice: 9,
    subtitle: 'We handle cancellations on your behalf.',
    features: [
      { text: 'Everything in Pro', available: true },
      { text: 'We cancel for you', available: true },
      { text: 'Bill negotiation (opt-in)', available: true },
      { text: 'Family plan optimizer', available: true },
      { text: 'Priority support', available: true },
      { text: 'Yearly savings report', available: true },
      { text: 'Export to CSV / PDF', available: true },
    ],
    ctaLabel: 'Go Concierge',
    href: '/dashboard/connect',
  },
];

export const PricingSection = () => (
  <section id="pricing" className="border border-stone-800 bg-stone-900 p-5 sm:p-6">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Pricing</p>
        <h2 className="mt-2 font-display text-3xl text-stone-100">Pick the pressure level</h2>
      </div>
      <p className="text-xs uppercase tracking-[0.06em] text-stone-500">Cancel anytime</p>
    </div>

    <div className="mt-5 grid gap-3 xl:grid-cols-3">
      {TIERS.map((tier) => (
        <article
          key={tier.id}
          className={`flex h-full flex-col border p-4 ${tier.highlight
            ? 'border-blue-500 bg-stone-950'
            : 'border-stone-700 bg-stone-950'
            }`}
        >
          {tier.badgeLabel ? (
            <span className="inline-flex w-fit border border-blue-800 bg-blue-950 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-blue-300">
              {tier.badgeLabel}
            </span>
          ) : (
            <span className="h-6" aria-hidden="true" />
          )}

          <p className="mt-3 text-lg text-stone-100">{tier.label}</p>
          <p className="mt-1 font-display text-5xl leading-none text-stone-100">
            ${tier.monthlyPrice}
            <span className="ml-1 text-base text-stone-400">/ month</span>
          </p>
          <p className="mt-3 min-h-12 text-sm text-stone-300">{tier.subtitle}</p>

          <ul className="mt-3 flex-1 space-y-2 border-t border-stone-800 pt-3 text-sm text-stone-300">
            {tier.features.map((feature) => (
              <li key={feature.text} className="flex items-start gap-2">
                <span className={feature.available ? 'text-acid-green' : 'text-stone-500'} aria-hidden="true">
                  •
                </span>
                <span className={feature.available ? 'text-stone-200' : 'text-stone-500'}>{feature.text}</span>
              </li>
            ))}
          </ul>

          <Link
            href={tier.href}
            className={`mt-4 border px-4 py-2 text-center text-xs uppercase tracking-[0.08em] ${tier.highlight
              ? 'border-acid-green bg-acid-green text-stone-950 hover:bg-acid-dim'
              : 'border-stone-600 text-stone-100 hover:border-stone-400'
              }`}
          >
            {tier.ctaLabel}
          </Link>
        </article>
      ))}
    </div>
  </section>
);
