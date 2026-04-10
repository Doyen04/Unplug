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
    <section id="pricing" className="rounded-2xl border border-[#E8E7E0] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Pricing</p>
                <h2 className="mt-2 font-display text-3xl text-[#1A1A17]">Pick the pressure level</h2>
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.06em] text-[#A9A79E]">Cancel anytime</p>
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-3">
            {TIERS.map((tier) => (
                <article
                    key={tier.id}
                    className={`flex h-full flex-col rounded-2xl border p-4 ${tier.highlight
                        ? 'border-[#FF5C35] bg-[#FFF0EC]'
                        : 'border-[#E8E7E0] bg-[#FAFAF7]'
                        }`}
                >
                    {tier.badgeLabel ? (
                        <span className="inline-flex w-fit rounded-[9999px] border border-[#FF5C35]/40 bg-[#FFF0EC] px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-[#C93A1A]">
                            {tier.badgeLabel}
                        </span>
                    ) : (
                        <span className="h-6" aria-hidden="true" />
                    )}

                    <p className="mt-3 text-lg text-[#1A1A17]">{tier.label}</p>
                    <p className="font-display mt-1 text-5xl leading-none text-[#1A1A17]">
                        ${tier.monthlyPrice}
                        <span className="ml-1 text-base text-[#6B6960]">/ month</span>
                    </p>
                    <p className="mt-3 min-h-12 text-sm text-[#6B6960]">{tier.subtitle}</p>

                    <ul className="mt-3 flex-1 space-y-2 border-t border-[#E8E7E0] pt-3 text-sm text-[#6B6960]">
                        {tier.features.map((feature) => (
                            <li key={feature.text} className="flex items-start gap-2">
                                <span className={feature.available ? 'text-[#1C9E5B]' : 'text-[#A9A79E]'} aria-hidden="true">
                                    •
                                </span>
                                <span className={feature.available ? 'text-[#1A1A17]' : 'text-[#A9A79E]'}>{feature.text}</span>
                            </li>
                        ))}
                    </ul>

                    <Link
                        href={tier.href}
                        className={`mt-4 rounded-[10px] border px-4 py-2 text-center text-xs uppercase tracking-[0.08em] ${tier.highlight
                            ? 'border-[#FF5C35] bg-[#FF5C35] text-white hover:bg-[#C93A1A]'
                            : 'border-[#D0CFC7] text-[#1A1A17] hover:border-[#1A1A17]'
                            }`}
                    >
                        {tier.ctaLabel}
                    </Link>
                </article>
            ))}
        </div>
    </section>
);
