import Link from 'next/link';

import { SiteFooter } from '@/components/marketing/SiteFooter';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SectionTitle } from '@/components/marketing/SectionTitle';
import { Card } from '@/components/ui/Card';
import { Check } from 'lucide-react';

export const metadata = {
    title: 'Pricing',
    description: 'Expanded pricing for Unplug: Free and Pro plans with the features each plan includes.',
};

const plans = [
    {
        name: 'Free',
        price: '₦0',
        features: ['1 bank connection', 'Subscription discovery', 'Naira virtual cards', 'Freeze / cancel'],
    },
    {
        name: 'Pro',
        price: '₦4,000/mo',
        features: ['Unlimited bank connections', 'Subscription discovery', 'Naira virtual cards', 'Dollar virtual cards', '3-day billing forecast', 'Freeze / cancel', 'Priority support'],
    },
] as const;

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-cream text-ink">
            <SiteHeader />
            <section className="py-20 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionTitle eyebrow="Pricing" title="A clearer look at Free and Pro." description="The homepage already includes a concise version. This page expands the comparison for people who want it." />
                    <div className="mt-12 grid gap-6 lg:grid-cols-2">
                        {plans.map((plan, index) => (
                            <Card key={plan.name} className={index === 1 ? 'rounded-[24px] border-orange/30 bg-white p-8' : 'rounded-[24px] border-line bg-white p-8'}>
                                <h2 className="text-2xl font-semibold text-ink">{plan.name}</h2>
                                <p className="mt-4 font-display text-5xl leading-none text-ink">{plan.price}</p>
                                <ul className="mt-8 space-y-3 text-sm text-ink-70">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-3">
                                            <Check className="h-4 w-4 text-orange" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/signup" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-orange px-6 text-sm font-semibold text-ink transition-colors hover:bg-orange-deep">
                                    Get started free
                                </Link>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
            <SiteFooter />
        </main>
    );
}
