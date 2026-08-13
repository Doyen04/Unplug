import { AlarmClock, DoorClosed, Shield, TrendingUp } from 'lucide-react';

import { ComparisonTable } from '@/components/marketing/ComparisonTable';
import { CtaLink } from '@/components/marketing/CtaLink';
import { FaqList } from '@/components/marketing/FaqList';
import { FreezeCardDemo } from '@/components/marketing/FreezeCardDemo';
import { LogoCloud } from '@/components/marketing/LogoCloud';
import { PricingCards } from '@/components/marketing/PricingCards';
import { ProductTour } from '@/components/marketing/ProductTour';
import { Reveal, RevealItem } from '@/components/marketing/Reveal';
import { SectionTitle } from '@/components/marketing/SectionTitle';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { StructuredData } from '@/components/marketing/StructuredData';
import { SubscriptionCreepCalculator } from '@/components/marketing/SubscriptionCreepCalculator';
import { Testimonials } from '@/components/marketing/Testimonials';

const shell = 'mx-auto max-w-7xl px-6 sm:px-8 lg:px-12';

function Hero() {
    return (
        <section className="relative overflow-hidden bg-white dot-grid">
            <div className={`${shell} relative grid gap-12 pb-16 pt-10 md:pb-24 md:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center`}>
                <Reveal as="div" variant="slide-up" className="max-w-2xl">
                    <h1 className="font-display text-[clamp(42px,6.5vw,72px)] font-bold leading-[0.98] tracking-tight text-ink text-balance">
                        Cancel anything. Even the things that <span className="text-orange underline decoration-orange/30 underline-offset-8">don&apos;t let you.</span>
                    </h1>

                    <p className="mt-7 max-w-xl text-[19px] leading-8 text-ink-70">
                        Unplug gives every subscription its own virtual card — Naira or dollar. Freeze it, and the charge
                        simply can&apos;t go through. No calls, no forms, no chasing a refund.
                    </p>

                    <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                        <CtaLink href="/signup" className="h-13 px-8 text-base">Get started free</CtaLink>
                        <a
                            href="#how-it-works"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-ink transition-colors hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-cream sm:justify-start"
                        >
                            See how it works
                            <span aria-hidden="true">↓</span>
                        </a>
                    </div>

                    {/* Social proof metrics strip */}
                    <div className="mt-12 flex items-center gap-8 border-t border-line pt-6">
                        <div>
                            <p className="font-display text-2xl font-bold text-ink">2,400+</p>
                            <p className="text-xs text-ink-70">Cards frozen</p>
                        </div>
                        <div className="h-8 w-px bg-line" />
                        <div>
                            <p className="font-display text-2xl font-extrabold text-green">₦18M+</p>
                            <p className="text-xs font-medium text-ink-70">Saved from creep</p>
                        </div>
                        <div className="h-8 w-px bg-line" />
                        <div>
                            <p className="font-display text-2xl font-extrabold text-ink flex items-center gap-1">
                                4.9<span className="text-green text-lg">★</span>
                            </p>
                            <p className="text-xs font-medium text-ink-70">User rating</p>
                        </div>
                    </div>
                </Reveal>

                {/* Hero Graphic: Isolated Cutout Photo on White Base + Floating Demo Card */}
                <Reveal as="div" variant="scale" delay={0.1} className="relative lg:justify-self-end">
                    <div className="relative mx-auto w-full max-w-[460px]">
                        {/* Cutout Photo container */}
                        <div className="relative overflow-hidden rounded-[28px] border-2 border-line bg-white p-4">
                            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-slate-50 flex items-center justify-center">
                                <img
                                    src="/images/hero-1.png"
                                    alt="Young Nigerian professional managing subscriptions on smartphone"
                                    className="h-full w-full object-cover object-center"
                                />
                            </div>
                        </div>

                        {/* Floating FreezeCardDemo overlaying the bottom right */}
                        <div className="absolute -bottom-6 -left-4 right-4 sm:-left-8 sm:right-6 max-w-[360px] z-10">
                            <FreezeCardDemo />
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

const problems = [
    {
        icon: AlarmClock,
        stat: '73%',
        title: 'Forgotten trials.',
        body: '73% of free trials convert into paid charges you didn’t plan for. The free month ends, the charge doesn’t.',
    },
    {
        icon: TrendingUp,
        stat: '₦12,000+',
        title: 'Naira swings on dollar bills.',
        body: 'Average monthly loss per user from volatile dollar rates on Netflix, Spotify, and ChatGPT bills.',
    },
    {
        icon: DoorClosed,
        stat: '4 in 5',
        title: 'Cancel flows built to trap you.',
        body: 'Multi-step menus, "are you sure?" screens, non-responsive phone lines. Built deliberately so you give up.',
    },
] as const;

function Problem() {
    return (
        <Reveal as="section" variant="fade" className="py-20 sm:py-28 bg-white">
            <div className={shell}>
                <SectionTitle
                    eyebrow="The problem"
                    title="Your subscriptions aren't trying to help you remember them."
                />

                <Reveal as="div" stagger className="mt-14 grid gap-8 lg:grid-cols-3 lg:gap-10">
                    {problems.map(({ icon: Icon, stat, title, body }) => (
                        <RevealItem key={title}>
                            <div className="group rounded-[24px] border border-line bg-white p-7 border-t-4 border-t-orange transition-transform duration-300 hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange/10 text-orange">
                                        <Icon aria-hidden="true" className="h-5 w-5" />
                                    </div>
                                    <span className="font-display text-2xl font-bold text-ink">{stat}</span>
                                </div>
                                <h3 className="mt-6 text-[20px] font-semibold leading-snug tracking-tight text-ink">{title}</h3>
                                <p className="mt-3 text-[15px] leading-7 text-ink-70">{body}</p>
                            </div>
                        </RevealItem>
                    ))}
                </Reveal>
            </div>
        </Reveal>
    );
}

const steps = [
    {
        step: '01',
        title: 'Connect your bank, once.',
        body: 'Read-only connection via Mono. Used one time, solely to discover what you are currently paying for.',
    },
    {
        step: '02',
        title: 'Get a dedicated card per subscription.',
        body: 'Every recurring charge gets its own virtual card — Naira or dollar. You paste it into that service once.',
    },
    {
        step: '03',
        title: 'Freeze or cancel, anytime.',
        body: 'See a charge you don’t want next cycle? Tap to freeze the card. The merchant gets declined instantly.',
    },
] as const;

function HowItWorks() {
    return (
        <Reveal as="section" id="how-it-works" variant="fade" className="scroll-mt-24 border-y border-line bg-white py-20 sm:py-28">
            <div className={shell}>
                <SectionTitle
                    eyebrow="How it works"
                    title="Three steps, then it runs itself."
                    description="From bank connection to instant cancellation — full control in under 2 minutes."
                />

                <ol role="list" className="mt-14 grid gap-8 lg:grid-cols-3">
                    {/* Step 01 */}
                    <li className="flex flex-col justify-between rounded-[24px] border border-line bg-white p-6 sm:p-7 transition-all duration-300 hover:border-orange/40">
                        <div>
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange text-xs font-bold text-ink">
                                01
                            </span>
                            <h3 className="mt-4 font-display text-[21px] font-semibold leading-snug tracking-tight text-ink">
                                Connect your bank, once.
                            </h3>
                            <p className="mt-2 text-[15px] leading-relaxed text-ink-70">
                                Read-only connection via Mono. Used one time, solely to discover what you are currently paying for.
                            </p>
                        </div>

                        {/* Step 01 Visual Widget */}
                        <div className="mt-6 rounded-2xl border border-line bg-slate-50 p-4">
                            <div className="flex items-center justify-between border-b border-line pb-2.5">
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Mono Linked · Read-only
                                </span>
                                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                    Encrypted
                                </span>
                            </div>

                            <div className="mt-3 space-y-2">
                                <div className="flex items-center justify-between rounded-lg bg-white p-2.5 text-xs border border-line">
                                    <span className="font-medium text-ink">🎬 Netflix</span>
                                    <span className="font-mono text-ink-70">₦4,400/mo</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-white p-2.5 text-xs border border-line">
                                    <span className="font-medium text-ink">🎵 Spotify</span>
                                    <span className="font-mono text-ink-70">₦1,900/mo</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-white p-2.5 text-xs border border-line">
                                    <span className="font-medium text-ink">🤖 ChatGPT Plus</span>
                                    <span className="font-mono text-ink-70">$20.00/mo</span>
                                </div>
                            </div>
                        </div>
                    </li>

                    {/* Step 02 */}
                    <li className="flex flex-col justify-between rounded-[24px] border border-line bg-white p-6 sm:p-7 transition-all duration-300 hover:border-orange/40">
                        <div>
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange text-xs font-bold text-ink">
                                02
                            </span>
                            <h3 className="mt-4 font-display text-[21px] font-semibold leading-snug tracking-tight text-ink">
                                Get a dedicated card per sub.
                            </h3>
                            <p className="mt-2 text-[15px] leading-relaxed text-ink-70">
                                Every recurring charge gets its own virtual card — Naira or dollar. Paste it into that service once.
                            </p>
                        </div>

                        {/* Step 02 Visual Widget */}
                        <div className="mt-6 rounded-2xl border border-line bg-slate-50 p-4">
                            <div className="flex items-center justify-between border-b border-line pb-2.5 mb-3">
                                <span className="text-xs font-semibold text-ink">Virtual Card Vault</span>
                                <span className="text-[10px] font-mono font-medium text-orange">2 Cards Active</span>
                            </div>
                            <div className="space-y-3">
                                {/* Card 1: Netflix NGN Card */}
                                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1C1A17] via-[#2A241F] to-[#12100E] p-3 text-white border border-white/20 shadow-md">
                                    <div className="flex items-center justify-between text-[10px]">
                                        <div className="flex items-center gap-2">
                                            {/* Mini Golden EMV Chip */}
                                            <div className="h-4 w-5 rounded-[3px] bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 border border-amber-600/40 p-[1px]">
                                                <div className="h-full w-full border border-amber-800/30 grid grid-cols-2" />
                                            </div>
                                            <span className="font-bold tracking-widest uppercase text-white">NETFLIX</span>
                                        </div>
                                        <span className="font-mono text-[9px] text-white/60">NGN · VIRTUAL</span>
                                    </div>
                                    <div className="mt-2.5 flex items-center justify-between text-xs">
                                        <span className="font-mono tracking-[0.2em] font-bold text-white/90">•••• •••• •••• 4471</span>
                                        <div className="flex items-center -space-x-1.5">
                                            <div className="h-4 w-4 rounded-full bg-[#EB001B]" />
                                            <div className="h-4 w-4 rounded-full bg-[#F79E1B] mix-blend-screen opacity-90" />
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2: ChatGPT USD Card */}
                                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#26211C] via-[#1E1915] to-[#0E0C0A] p-3 text-white border border-white/20 shadow-md">
                                    <div className="flex items-center justify-between text-[10px]">
                                        <div className="flex items-center gap-2">
                                            {/* Mini Golden EMV Chip */}
                                            <div className="h-4 w-5 rounded-[3px] bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 border border-amber-600/40 p-[1px]">
                                                <div className="h-full w-full border border-amber-800/30 grid grid-cols-2" />
                                            </div>
                                            <span className="font-bold tracking-widest uppercase text-orange">CHATGPT PLUS</span>
                                        </div>
                                        <span className="font-mono text-[9px] text-white/60">USD · VIRTUAL</span>
                                    </div>
                                    <div className="mt-2.5 flex items-center justify-between text-xs">
                                        <span className="font-mono tracking-[0.2em] font-bold text-white/90">•••• •••• •••• 9032</span>
                                        <div className="flex items-center -space-x-1.5">
                                            <div className="h-4 w-4 rounded-full bg-[#EB001B]" />
                                            <div className="h-4 w-4 rounded-full bg-[#F79E1B] mix-blend-screen opacity-90" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>

                    {/* Step 03 */}
                    <li className="flex flex-col justify-between rounded-[24px] border border-line bg-white p-6 sm:p-7 transition-all duration-300 hover:border-orange/40">
                        <div>
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange text-xs font-bold text-ink">
                                03
                            </span>
                            <h3 className="mt-4 font-display text-[21px] font-semibold leading-snug tracking-tight text-ink">
                                Freeze or cancel, anytime.
                            </h3>
                            <p className="mt-2 text-[15px] leading-relaxed text-ink-70">
                                See a charge you don’t want next cycle? Tap to freeze the card. The merchant gets declined instantly.
                            </p>
                        </div>

                        {/* Step 03 Visual Widget */}
                        <div className="mt-6">
                            <FreezeCardDemo merchant="Streaming Plan" amount="₦4,500" last4="4471" />
                        </div>
                    </li>
                </ol>
            </div>
        </Reveal>
    );
}

function Tour() {
    return (
        <Reveal as="section" id="dashboard" variant="fade" className="scroll-mt-24 py-20 sm:py-28 bg-white">
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
        <Reveal as="section" variant="fade" className="border-y border-line bg-white py-20 sm:py-28">
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
        <Reveal as="section" variant="fade" className="py-20 sm:py-28 bg-white">
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
    'Your Pro subscription is billed securely through Paystack.',
] as const;

function Security() {
    return (
        <Reveal as="section" id="security" variant="fade" className="scroll-mt-24 bg-ink py-20 sm:py-28 dot-grid-light text-cream">
            <div className={`${shell} grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20`}>
                <div>
                    <SectionTitle
                        tone="inverse"
                        eyebrow="Security"
                        title="We built this so you don't have to trust us blindly."
                        description="Four things that are true whether or not you take our word for them."
                    />
                </div>

                <ol role="list" className="space-y-4">
                    {securityPoints.map((point, index) => (
                        <li key={point} className="flex gap-5 rounded-[20px] border border-white/12 bg-white/5 p-6 border-l-4 border-l-orange">
                            <span className="font-mono text-sm font-bold text-orange">0{index + 1}</span>
                            <p className="text-[16px] leading-8 text-cream/90">{point}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </Reveal>
    );
}

function TestimonialsSection() {
    return (
        <Reveal as="section" variant="fade" className="py-20 sm:py-28 bg-white">
            <div className={shell}>
                <SectionTitle
                    align="center"
                    eyebrow="Testimonials"
                    title="Loved by people who hate surprise charges."
                />
                <div className="mt-12">
                    <Testimonials />
                </div>
            </div>
        </Reveal>
    );
}

function Pricing() {
    return (
        <Reveal as="section" id="pricing" variant="fade" className="scroll-mt-24 border-y border-line bg-white py-20 sm:py-28">
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
        <Reveal as="section" id="faq" variant="fade" className="scroll-mt-24 py-20 sm:py-28 bg-white">
            <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-12">
                <SectionTitle align="center" eyebrow="FAQ" title="Common questions, answered plainly." />
                <FaqList />
            </div>
        </Reveal>
    );
}

function FinalCta() {
    return (
        <Reveal as="section" variant="fade" className="bg-ink py-20 sm:py-28 text-center text-cream dot-grid-light">
            <div className={`${shell} flex flex-col items-center gap-8`}>
                <h2 className="max-w-3xl font-display text-[clamp(34px,5.5vw,60px)] font-bold leading-[1.03] tracking-tight text-balance">
                    Stop the next charge <span className="text-orange">before it happens.</span>
                </h2>
                <p className="max-w-xl text-cream/80 text-lg">
                    Join 2,400+ Nigerians who stopped bleeding money to forgotten subscriptions.
                </p>
                <CtaLink href="/signup" className="h-14 px-9 text-base animate-pulse-ring">
                    Get started free
                </CtaLink>
            </div>
        </Reveal>
    );
}

export default function HomePage() {
    return (
        <>
            <StructuredData />
            <SiteHeader />
            <main id="main" className="bg-white text-ink">
                <Hero />
                <LogoCloud />
                <Problem />
                <HowItWorks />
                <Tour />
                <WhyCards />
                <Calculator />
                <Security />
                <TestimonialsSection />
                <Pricing />
                <Faq />
                <FinalCta />
            </main>
            <SiteFooter />
        </>
    );
}
