import { AlarmClock, DoorClosed, TrendingUp } from 'lucide-react';

import { ComparisonTable } from '@/components/marketing/ComparisonTable';
import { CtaLink } from '@/components/marketing/CtaLink';
import { FaqList } from '@/components/marketing/FaqList';
import { FreezeCardDemo } from '@/components/marketing/FreezeCardDemo';
import { PricingCards } from '@/components/marketing/PricingCards';
import { ProductTour } from '@/components/marketing/ProductTour';
import { Reveal } from '@/components/marketing/Reveal';
import { SectionTitle } from '@/components/marketing/SectionTitle';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { StructuredData } from '@/components/marketing/StructuredData';
import { SubscriptionCreepCalculator } from '@/components/marketing/SubscriptionCreepCalculator';

const shell = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

function Hero() {
    return (
        <section className="relative overflow-hidden">
            {/* Warm bloom behind the card, clipped by the section. */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[-10%] top-[-20%] h-140 w-140 rounded-full bg-[radial-gradient(circle,rgba(255,92,53,0.14),transparent_65%)] blur-3xl"
            />

            <div className={`${shell} relative grid gap-16 pb-20 pt-12 md:pb-28 md:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center`}>
                <Reveal as="div" className="max-w-2xl">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-70">
                        For everyone paying in Naira and dollars
                    </p>

                    <h1 className="mt-6 font-display text-[clamp(42px,7vw,74px)] leading-[0.95] tracking-tight text-ink text-balance">
                        Cancel anything. Even the things that don&apos;t let you.
                    </h1>

                    <p className="mt-7 max-w-xl text-[19px] leading-8 text-ink-70">
                        Unplug gives every subscription its own virtual card — Naira or dollar. Freeze it, and the charge
                        simply can&apos;t go through. No calls, no forms, no chasing a refund.
                    </p>

                    <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <CtaLink href="/signup">Get started free</CtaLink>
                        <a
                            href="#how-it-works"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-2 text-sm font-semibold text-ink transition-colors hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-cream sm:justify-start"
                        >
                            See how it works
                            <span aria-hidden="true">↓</span>
                        </a>
                    </div>
                </Reveal>

                <Reveal as="div" delay={0.08} className="lg:justify-self-end">
                    <div className="mx-auto w-full max-w-100">
                        <FreezeCardDemo />
                        <p className="mt-4 text-center text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-70">
                            Tap the card
                        </p>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

function TrustStrip() {
    return (
        <div className="border-y border-line">
            <p className={`${shell} py-4 text-[14px] text-ink-70`}>
                Cards issued via licensed partners · Bank-linking is read-only, always
            </p>
        </div>
    );
}

const problems = [
    {
        icon: AlarmClock,
        title: 'Forgotten trials.',
        body: 'The free month ends. The charge doesn’t.',
    },
    {
        icon: TrendingUp,
        title: 'Naira value swings on dollar bills.',
        body: 'Netflix, Spotify, ChatGPT — priced in dollars, felt in Naira, different every month.',
    },
    {
        icon: DoorClosed,
        title: 'Cancel flows built to make you give up.',
        body: 'Multi-step menus, "are you sure?" screens, a phone line that’s never picked up. Rarely one click, usually on purpose.',
    },
] as const;

function Problem() {
    return (
        <Reveal as="section" className="py-20 sm:py-28">
            <div className={shell}>
                <SectionTitle
                    eyebrow="The problem"
                    title="Your subscriptions aren't trying to help you remember them."
                />

                <ul role="list" className="mt-14 grid gap-8 lg:grid-cols-3 lg:gap-10">
                    {problems.map(({ icon: Icon, title, body }) => (
                        <li key={title} className="border-t border-line pt-7">
                            <Icon aria-hidden="true" className="h-6 w-6 text-orange" />
                            <h3 className="mt-5 text-[20px] font-semibold leading-snug tracking-tight text-ink">{title}</h3>
                            <p className="mt-3 text-[16px] leading-7 text-ink-70">{body}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </Reveal>
    );
}

const steps = [
    {
        step: '01',
        title: 'Connect your bank, once.',
        body: 'Read-only, through Mono. Used one time, to find what you’re already paying for.',
    },
    {
        step: '02',
        title: 'Get a dedicated card per subscription.',
        body: 'Every recurring charge gets its own virtual card — Naira or dollar. You paste it into that service once.',
    },
    {
        step: '03',
        title: 'Freeze or cancel, anytime.',
        body: 'See a charge you don’t want next cycle? Freeze the card. Done.',
    },
] as const;

function HowItWorks() {
    return (
        <Reveal as="section" id="how-it-works" className="scroll-mt-24 border-y border-line bg-bg-surface py-20 sm:py-28">
            <div className={shell}>
                <SectionTitle eyebrow="How it works" title="Three steps, then it runs itself." />

                <ol role="list" className="mt-14 grid gap-10 lg:grid-cols-3 lg:gap-12">
                    {steps.map(({ step, title, body }, index) => (
                        <li key={step}>
                            <span className="font-mono text-[13px] font-medium tracking-widest text-orange">{step}</span>
                            <h3 className="mt-4 text-[21px] font-semibold leading-snug tracking-tight text-ink text-balance">
                                {title}
                            </h3>
                            <p className="mt-3 text-[16px] leading-7 text-ink-70">{body}</p>

                            {index === 2 ? (
                                <div className="mt-7">
                                    <FreezeCardDemo />
                                </div>
                            ) : null}
                        </li>
                    ))}
                </ol>
            </div>
        </Reveal>
    );
}

function Tour() {
    return (
        <Reveal as="section" id="dashboard" className="scroll-mt-24 py-20 sm:py-28">
            <div className={shell}>
                <SectionTitle
                    eyebrow="Product tour"
                    title="Everything lives on one dashboard."
                    description="Five screens, no hunting. Pick one to see what it does."
                />
                <ProductTour />
            </div>
        </Reveal>
    );
}

function WhyCards() {
    return (
        <Reveal as="section" className="border-y border-line bg-bg-surface py-20 sm:py-28">
            <div className={shell}>
                <SectionTitle
                    eyebrow="Why virtual cards"
                    title="Tracking isn't control. Freezing is."
                    description="A tracker tells you the money left. A card that declines the charge means it never did."
                />
                <ComparisonTable />
            </div>
        </Reveal>
    );
}

function Calculator() {
    return (
        <Reveal as="section" className="py-20 sm:py-28">
            <div className={shell}>
                <SubscriptionCreepCalculator />
            </div>
        </Reveal>
    );
}

const securityPoints = [
    'Your bank connection is read-only, and we only use it once — to find your subscriptions, not to watch your account.',
    'Card numbers are never stored on our servers. You view them through a sandboxed, secured display.',
    'Funds sit with a licensed banking partner — Unplug doesn’t hold your money directly.',
    'Your Pro subscription is billed through Paystack.',
] as const;

function Security() {
    return (
        <Reveal as="section" id="security" className="scroll-mt-24 bg-ink py-20 sm:py-28">
            <div className={`${shell} grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20`}>
                <SectionTitle
                    tone="inverse"
                    eyebrow="Security"
                    title="We built this so you don't have to trust us blindly."
                    description="Four things that are true whether or not you take our word for them."
                />

                <ul role="list" className="space-y-px overflow-hidden rounded-[20px] border border-white/12">
                    {securityPoints.map((point) => (
                        <li key={point} className="flex gap-5 border-b border-white/10 bg-white/4 p-6 last:border-b-0">
                            <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-frost-wash" />
                            <p className="text-[16px] leading-8 text-cream/85">{point}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </Reveal>
    );
}

function Proof() {
    return (
        <Reveal as="section" className="py-20 sm:py-28">
            <div className={shell}>
                <figure className="mx-auto max-w-3xl text-center">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-orange">From the founder</p>
                    <blockquote className="mt-6 font-display text-[clamp(24px,3.4vw,36px)] leading-[1.3] tracking-tight text-ink text-balance">
                        &ldquo;I built Unplug because recurring charges in Naira and dollars kept showing up at the wrong
                        time, on the wrong card, with too little control. The goal is simple: stop the next charge before
                        it happens.&rdquo;
                    </blockquote>
                </figure>
            </div>
        </Reveal>
    );
}

function Pricing() {
    return (
        <Reveal as="section" id="pricing" className="scroll-mt-24 border-y border-line bg-bg-surface py-20 sm:py-28">
            <div className={shell}>
                <SectionTitle
                    align="center"
                    eyebrow="Pricing"
                    title="Simple pricing for the subscriptions you actually keep."
                    description="Start free. Move to Pro when you want dollar cards and a warning before every charge."
                />
                <PricingCards />
            </div>
        </Reveal>
    );
}

function Faq() {
    return (
        <Reveal as="section" id="faq" className="scroll-mt-24 py-20 sm:py-28">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <SectionTitle align="center" eyebrow="FAQ" title="Common questions, answered plainly." />
                <FaqList />
            </div>
        </Reveal>
    );
}

function FinalCta() {
    return (
        <Reveal as="section" className="border-t border-line py-20 sm:py-28">
            <div className={`${shell} flex flex-col items-center gap-8 text-center`}>
                <h2 className="max-w-3xl font-display text-[clamp(34px,5.5vw,60px)] leading-[1.03] tracking-tight text-ink text-balance">
                    Stop the next charge before it happens.
                </h2>
                <CtaLink href="/signup">Get started free</CtaLink>
            </div>
        </Reveal>
    );
}

export default function HomePage() {
    return (
        <>
            <StructuredData />
            <SiteHeader />
            <main id="main" className="bg-cream text-ink">
                <Hero />
                <TrustStrip />
                <Problem />
                <HowItWorks />
                <Tour />
                <WhyCards />
                <Calculator />
                <Security />
                <Proof />
                <Pricing />
                <Faq />
                <FinalCta />
            </main>
            <SiteFooter />
        </>
    );
}
