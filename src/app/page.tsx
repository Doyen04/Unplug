import Link from 'next/link';

import { FreezeCardDemo } from '@/components/marketing/FreezeCardDemo';
import { Reveal } from '@/components/marketing/Reveal';
import { SectionTitle } from '@/components/marketing/SectionTitle';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { StructuredData } from '@/components/marketing/StructuredData';
import { SubscriptionCreepCalculator } from '@/components/marketing/SubscriptionCreepCalculator';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { Check, ShieldCheck, Snowflake } from 'lucide-react';

const whyRows = [
    ['Rocket Money-style trackers', 'Yes', 'No', 'Rarely', 'No', 'Yes'],
    ['gomoney / Payora / Cardtonic / TransferXO', 'No', 'Partial', 'Sometimes', 'Yes', 'No'],
    ["Your bank's own card controls", 'No', 'Freezes the whole card', 'No', 'Yes, bluntly', 'No'],
    ['Unplug', 'Yes', 'Yes — one card per subscription', 'Yes', 'Yes', 'Yes'],
] as const;

const faqItems = [
    ['Is my banking information safe?', 'Your connection is read-only, and we only use it once to find subscriptions. We do not watch your account.'],
    ['How is this different from freezing a card in my bank app?', 'Your bank freezes the whole card. Unplug freezes one merchant card, so the rest of your payments keep working.'],
    ["What\'s the difference between freezing and cancelling?", 'Freezing stops the next charge. Cancelling removes the card from that subscription entirely.'],
    ['What happens with my dollar subscriptions?', 'USD subscriptions are managed alongside Naira subscriptions in the same dashboard.'],
    ['Do I need to tell Netflix or Spotify about the new card myself?', 'Yes. The spec assumes you update the payment method once for that merchant.'],
    ['What if I freeze the wrong card by mistake?', 'Unfreeze it instantly. The next billing cycle will continue normally.'],
    ["What does Pro get me that Free doesn\'t?", 'Pro adds unlimited bank accounts, dollar cards, and a 3-day billing forecast.'],
] as const;

function HeroCard() {
    return (
        <div className="relative mx-auto w-full max-w-105">
            <div className="absolute -inset-4 rounded-4xl bg-[radial-gradient(circle_at_top,rgba(255,92,53,0.16),transparent_60%)] blur-2xl" />
            <FreezeCardDemo />
            <p className="mt-3 text-center text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-70">
                tap the card
            </p>
        </div>
    );
}

function HeroSection() {
    return (
        <section className="relative overflow-hidden">
            <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-14 sm:px-6 md:pb-28 md:pt-20 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:px-8">
                <Reveal className="max-w-3xl">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-70">
                        FOR EVERYONE PAYING IN NAIRA AND DOLLARS
                    </p>
                    <h1 className="mt-6 max-w-2xl font-display text-[clamp(40px,7vw,72px)] leading-[0.95] tracking-tight text-ink">
                        Cancel anything. Even the things that don&apos;t let you.
                    </h1>
                    <p className="mt-6 max-w-xl text-[18px] leading-8 text-ink-70 sm:text-[20px]">
                        Unplug gives every subscription its own virtual card — Naira or dollar. Freeze it, and the charge simply can&apos;t go through. No calls, no forms, no chasing a refund.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Link href="/signup" className="inline-flex min-h-12 items-center justify-center rounded-full bg-orange px-7 text-sm font-semibold text-ink transition-colors hover:bg-orange-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2">
                            Get started free
                        </Link>
                        <a href="#how-it-works" aria-label="See how it works" className="inline-flex min-h-12 items-center gap-2 rounded-full px-1 text-sm font-semibold text-ink transition-colors hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2">
                            See how it works
                        </a>
                    </div>
                </Reveal>

                <Reveal className="lg:justify-self-end" delay={0.08} as="div">
                    <HeroCard />
                </Reveal>
            </div>
        </section>
    );
}

function TrustStrip() {
    return (
        <section className="border-y border-line bg-cream/60">
            <div className="mx-auto max-w-7xl px-4 py-4 text-sm text-ink-70 sm:px-6 lg:px-8">
                Cards issued via licensed partners · Bank-linking is read-only, always
            </div>
        </section>
    );
}

function ProblemSection() {
    const items = [
        ['Forgotten trials.', 'The free month ends. The charge does not.'],
        ['Naira value swings on dollar bills.', 'Netflix, Spotify, ChatGPT — priced in dollars, felt in Naira, different every month.'],
        ['Cancel flows built to make you give up.', 'Multi-step menus, "are you sure?" screens, a phone line that is never picked up.'],
    ] as const;

    return (
        <Reveal className="py-20 sm:py-24" as="section">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionTitle eyebrow="The problem" title="Your subscriptions are not trying to help you remember them." />
                <div className="mt-12 grid gap-6 lg:grid-cols-3">
                    {items.map(([title, body]) => (
                        <Card key={title} className="rounded-[24px] border-line bg-bg-surface p-8 shadow-[0_16px_40px_-30px_rgba(31,26,22,0.3)]">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange/10 text-orange">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <h3 className="mt-6 text-[22px] font-semibold tracking-tight text-ink">{title}</h3>
                            <p className="mt-3 max-w-sm text-base leading-7 text-ink-70">{body}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </Reveal>
    );
}

function HowItWorksSection() {
    return (
        <Reveal className="border-y border-line bg-bg-surface py-20 sm:py-24" as="section">
            <div id="how-it-works" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionTitle eyebrow="How it works" title="A genuine three-step sequence." description="The number order is earned here. Nothing is pretending to be sequential just because it looks nice." />
                <div className="mt-12 grid gap-6 lg:grid-cols-3">
                    {[
                        ['01', 'Connect your bank, once.', 'Read-only, through Mono. Used one time, to find what you are already paying for.'],
                        ['02', 'Get a dedicated card per subscription.', 'Every recurring charge gets its own virtual card — Naira or dollar.'],
                        ['03', 'Freeze or cancel, anytime.', 'See a charge you do not want next cycle? Freeze the card. Done.'],
                    ].map(([step, title, body], index) => (
                        <Card key={step} className="rounded-[24px] border-line bg-cream p-8 transition-transform duration-200 hover:-translate-y-0.5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange/10 text-[15px] font-semibold text-orange">
                                {step}
                            </div>
                            <h3 className="mt-6 text-[22px] font-semibold tracking-tight text-ink">{title}</h3>
                            <p className="mt-3 max-w-md text-base leading-7 text-ink-70">{body}</p>
                            {index === 2 ? (
                                <div className="mt-6">
                                    <FreezeCardDemo merchant="Streaming Plan" amount="₦4,500/mo" last4="4471" />
                                </div>
                            ) : null}
                        </Card>
                    ))}
                </div>
            </div>
        </Reveal>
    );
}

function TourSection() {
    const panels = [
        ['Dashboard', 'Your whole subscription picture — total monthly spend, active vs. frozen, what is charging this week'],
        ['Subscriptions', 'One card per subscription, always under your thumb'],
        ['Billing', 'We tell you 3 days before a charge, not after'],
        ['Transactions', 'Every charge, searchable'],
        ['Settings', 'Your account, your plan, your rules'],
    ] as const;

    return (
        <Reveal className="py-20 sm:py-24" as="section">
            <div id="dashboard" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionTitle eyebrow="Product tour" title="Everything lives on one dashboard." description="A condensed view of the app, presented as the product itself rather than a marketing illustration." />
                <div className="mt-12 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
                    <div className="rounded-[24px] border border-line bg-bg-surface p-3">
                        <div className="space-y-2">
                            {panels.map(([label]) => (
                                <div key={label} className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm font-medium text-ink-70 hover:bg-bg-muted">
                                    <span className="text-orange">●</span>
                                    <span>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {panels.map(([label, body], index) => (
                            <Card key={label} className={cn('rounded-[24px] p-6', index === 0 ? 'border-orange/30' : 'border-line')}>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange/10 text-orange">
                                    <Snowflake className="h-4 w-4" />
                                </div>
                                <h3 className="mt-5 text-[20px] font-semibold text-ink">{label}</h3>
                                <p className="mt-3 text-base leading-7 text-ink-70">{body}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </Reveal>
    );
}

function WhyCardsSection() {
    return (
        <Reveal className="border-y border-line bg-bg-surface py-20 sm:py-24" as="section">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionTitle eyebrow="Why virtual cards" title="Tracking is not control. Freezing is." />
                <div className="mt-12 overflow-hidden rounded-[24px] border border-line bg-cream">
                    <div className="grid grid-cols-[1.45fr_repeat(5,minmax(120px,1fr))] border-b border-line bg-bg-muted px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-70">
                        <div />
                        <div>Finds subscriptions automatically</div>
                        <div>Actually stops the charge</div>
                        <div>Naira + Dollar cards</div>
                        <div>Works even if merchant hides cancel</div>
                        <div>Subscription is the core product</div>
                    </div>
                    <div className="divide-y divide-line">
                        {whyRows.map(([label, a, b, c, d, e], index) => (
                            <div key={label} className={cn('grid grid-cols-[1.45fr_repeat(5,minmax(120px,1fr))] px-5 py-4 text-sm text-ink-70', index === whyRows.length - 1 && 'bg-orange/5 text-ink')}>
                                <div className="font-medium text-ink">{label}</div>
                                <div>{a}</div>
                                <div>{b}</div>
                                <div>{c}</div>
                                <div>{d}</div>
                                <div>{e}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Reveal>
    );
}

function CalculatorSection() {
    return (
        <Reveal className="py-20 sm:py-24" as="section">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SubscriptionCreepCalculator />
            </div>
        </Reveal>
    );
}

function SecuritySection() {
    const items = [
        'Your bank connection is read-only, and we only use it once — to find your subscriptions, not to watch your account.',
        'Card numbers are never stored on our servers. You view them through a sandboxed, secured display.',
        'Funds sit with a licensed banking partner — Unplug does not hold your money directly.',
        'Your Pro subscription is billed through Paystack.',
    ] as const;

    return (
        <Reveal className="bg-ink py-20 text-cream sm:py-24" as="section">
            <div id="security" className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
                <SectionTitle eyebrow="Security" title="We built this so you do not have to trust us blindly." description="The full-bleed dark section appears exactly once, where the page turns serious." />
                <div className="space-y-4">
                    {items.map((item, index) => (
                        <div key={item} className="flex gap-4 rounded-[20px] border border-white/10 bg-white/5 p-5">
                            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-frost-wash text-frost-deep">
                                {index === 1 ? <ShieldCheck className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                            </div>
                            <p className="text-[15px] leading-7 text-cream/90">{item}</p>
                        </div>
                    ))}
                    <p className="pt-2 text-sm text-cream/70">Safe Haven MFB and Sudo Africa naming and logo use stay behind the required confirm gate until sign-off.</p>
                </div>
            </div>
        </Reveal>
    );
}

function ProofSection() {
    return (
        <Reveal className="py-20 sm:py-24" as="section">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionTitle eyebrow="Proof" title="The honest version." description="If there is no real founder note, real usage, or real beta number, skip the section entirely. Fabricated quotes are not a shortcut." />
                <Card className="mt-10 max-w-4xl rounded-[24px] border-line bg-bg-surface p-8 sm:p-10">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-70">Founder note</p>
                    <p className="mt-4 text-[18px] leading-8 text-ink">
                        I built Unplug because recurring charges in Naira and dollars kept showing up at the wrong time, on the wrong card, and with too little control. The goal is simple: stop the next charge before it happens.
                    </p>
                </Card>
            </div>
        </Reveal>
    );
}

function PricingSection() {
    return (
        <Reveal className="border-y border-line bg-bg-surface py-20 sm:py-24" as="section">
            <div id="pricing" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionTitle eyebrow="Pricing" title="Simple pricing for the subscriptions you actually keep." description="This mirrors the side-by-side card pattern already used in the product shell." />
                <div className="mt-12 grid gap-6 lg:grid-cols-2">
                    {[
                        {
                            name: 'Free',
                            price: '₦0',
                            features: ['1 account', 'Subscription discovery', 'Naira virtual cards', 'Freeze / cancel'],
                        },
                        {
                            name: 'Pro',
                            price: '₦4,000/mo',
                            features: ['Unlimited accounts', 'Subscription discovery', 'Naira virtual cards', 'Dollar virtual cards', '3-day billing forecast', 'Freeze / cancel', 'Priority support'],
                        },
                    ].map((plan, index) => (
                        <Card key={plan.name} className={cn('rounded-[24px] p-8', index === 1 ? 'border-orange/30 bg-[linear-gradient(180deg,rgba(255,92,53,0.06),rgba(255,92,53,0.02))]' : 'border-line bg-cream')}>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-[24px] font-semibold tracking-tight text-ink">{plan.name}</h3>
                                    <p className="mt-2 text-base leading-7 text-ink-70">{index === 0 ? 'Start for free.' : 'For people who want the full control layer.'}</p>
                                </div>
                                {index === 1 ? <span className="rounded-full bg-orange/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-orange">Most popular</span> : null}
                            </div>
                            <p className="mt-8 font-display text-[clamp(32px,5vw,48px)] leading-none text-ink">{plan.price}</p>
                            <ul className="mt-8 space-y-3 text-sm text-ink-70">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3">
                                        <Check className="h-4 w-4 text-orange" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/signup" className={cn('mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2', index === 1 ? 'bg-orange text-ink hover:bg-orange-deep' : 'border border-line bg-bg-surface text-ink hover:border-ink')}>
                                Get started free
                            </Link>
                        </Card>
                    ))}
                </div>
            </div>
        </Reveal>
    );
}

function FAQSection() {
    return (
        <Reveal className="py-20 sm:py-24" as="section">
            <div id="faq" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <SectionTitle eyebrow="FAQ" title="Common questions, answered plainly." />
                <div className="mt-12 divide-y divide-line overflow-hidden rounded-[24px] border border-line bg-bg-surface">
                    {faqItems.map(([question, answer]) => (
                        <details key={question} className="group p-6 sm:p-8">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-[18px] font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2">
                                <span>{question}</span>
                                <span className="text-2xl text-orange transition-transform group-open:rotate-45">+</span>
                            </summary>
                            <p className="mt-4 max-w-3xl text-base leading-8 text-ink-70">{answer}</p>
                        </details>
                    ))}
                </div>
            </div>
        </Reveal>
    );
}

function FinalCtaSection() {
    return (
        <Reveal className="border-t border-line bg-cream py-20 sm:py-24" as="section">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-start justify-between gap-6 rounded-[28px] border border-line bg-bg-surface p-8 sm:flex-row sm:items-center sm:p-10">
                    <div>
                        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-70">Final CTA</p>
                        <h2 className="mt-3 max-w-2xl font-display text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-tight text-ink">
                            Stop the next charge before it happens.
                        </h2>
                    </div>
                    <Link href="/signup" className="inline-flex min-h-12 items-center justify-center rounded-full bg-orange px-7 text-sm font-semibold text-ink transition-colors hover:bg-orange-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2">
                        Get started free
                    </Link>
                </div>
            </div>
        </Reveal>
    );
}

export default function HomePage() {
    return (
        <main className="min-h-screen bg-cream text-ink">
            <StructuredData />
            <SiteHeader />
            <HeroSection />
            <TrustStrip />
            <ProblemSection />
            <HowItWorksSection />
            <TourSection />
            <WhyCardsSection />
            <CalculatorSection />
            <SecuritySection />
            <ProofSection />
            <PricingSection />
            <FAQSection />
            <FinalCtaSection />
            <SiteFooter />
        </main>
    );
}
