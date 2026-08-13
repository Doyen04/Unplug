import { Shield } from 'lucide-react';

import { ComparisonTable } from '@/components/marketing/ComparisonTable';
import { CtaLink } from '@/components/marketing/CtaLink';
import { FaqList } from '@/components/marketing/FaqList';
import { PricingCards } from '@/components/marketing/PricingCards';
import { ProductTour } from '@/components/marketing/ProductTour';
import { Reveal } from '@/components/marketing/Reveal';
import { SectionTitle } from '@/components/marketing/SectionTitle';
import { SubscriptionCreepCalculator } from '@/components/marketing/SubscriptionCreepCalculator';
import { Testimonials } from '@/components/marketing/Testimonials';

const shell = 'mx-auto max-w-7xl px-6 sm:px-8 lg:px-12';

export function Tour() {
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

export function WhyCards() {
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

export function Calculator() {
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
    `Funds sit with a licensed banking partner — Unplug doesn't hold your money directly.`,
    'Your Pro subscription is billed securely through Paystack.',
] as const;

export function Security() {
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

export function TestimonialsSection() {
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

export function Pricing() {
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

export function Faq() {
    return (
        <Reveal as="section" id="faq" variant="fade" className="scroll-mt-24 py-20 sm:py-28 bg-white">
            <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-12">
                <SectionTitle align="center" eyebrow="FAQ" title="Common questions, answered plainly." />
                <FaqList />
            </div>
        </Reveal>
    );
}

export function FinalCta() {
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
