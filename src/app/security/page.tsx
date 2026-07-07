import Link from 'next/link';

import { SiteFooter } from '@/components/marketing/SiteFooter';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SectionTitle } from '@/components/marketing/SectionTitle';
import { Card } from '@/components/ui/Card';

export const metadata = {
    title: 'Security',
    description: 'Security and trust details for Unplug: read-only access, secure card display, and partner-based funds handling.',
};

const items = [
    'Your bank connection is read-only and used only once to discover subscriptions.',
    'Card numbers are never stored on our servers. You view them through a sandboxed secured display.',
    'Funds sit with a licensed banking partner. Unplug does not hold your money directly.',
    'Your Pro subscription is billed through Paystack.',
] as const;

export default function SecurityPage() {
    return (
        <main className="min-h-screen bg-cream text-ink">
            <SiteHeader />
            <section className="bg-ink py-20 text-cream sm:py-24">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
                    <SectionTitle eyebrow="Security" title="We built this so you do not have to trust us blindly." description="This expands the homepage section with the same factual claims." />
                    <div className="space-y-4">
                        {items.map((item) => (
                            <Card key={item} className="rounded-[20px] border-white/10 bg-white/5 p-5 text-cream">
                                <p className="text-[15px] leading-7 text-cream/90">{item}</p>
                            </Card>
                        ))}
                        <p className="pt-2 text-sm text-cream/70">Safe Haven MFB and Sudo Africa wording stay behind confirm gates until sign-off.</p>
                    </div>
                </div>
            </section>
            <section className="py-20 sm:py-24">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <Card className="rounded-[24px] border-line bg-white p-8">
                        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-70">What this means in practice</p>
                        <p className="mt-4 text-[18px] leading-8 text-ink-70">Unplug is built to control the subscription itself rather than your whole bank card. That is the reason the product can stop a single charge without blocking every other payment you make.</p>
                        <Link href="/signup" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-orange px-6 text-sm font-semibold text-ink transition-colors hover:bg-orange-deep">
                            Get started free
                        </Link>
                    </Card>
                </div>
            </section>
            <SiteFooter />
        </main>
    );
}
