import { CtaLink } from '@/components/marketing/CtaLink';
import { FaqList } from '@/components/marketing/FaqList';
import { PricingCards } from '@/components/marketing/PricingCards';
import { SectionTitle } from '@/components/marketing/SectionTitle';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { SiteHeader } from '@/components/marketing/SiteHeader';

export const metadata = {
    title: 'Pricing',
    description:
        'Unplug pricing: start free with Naira virtual cards and subscription discovery, or go Pro for dollar cards and a 3-day billing forecast.',
};

export default function PricingPage() {
    return (
        <>
            <SiteHeader />
            <main id="main" className="bg-cream text-ink">
                <section className="py-16 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <SectionTitle
                            align="center"
                            eyebrow="Pricing"
                            title="Pay for control, not for a spreadsheet."
                            description="Free finds what you're paying for and gives you Naira cards. Pro adds dollar cards, unlimited connections, and a warning three days before every charge."
                        />
                        <PricingCards />
                        <p className="mx-auto mt-8 max-w-2xl text-center text-[14px] leading-7 text-ink-70">
                            Billed through Paystack. Cancel from Settings at any time — your cards stay frozen rather than
                            disappearing, so nothing charges you by surprise on the way out.
                        </p>
                    </div>
                </section>

                <section className="border-t border-line py-16 sm:py-24">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        <SectionTitle align="center" eyebrow="FAQ" title="Before you pick a plan." />
                        <FaqList />
                    </div>
                </section>

                <section className="border-t border-line py-16 sm:py-24">
                    <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 text-center sm:px-6 lg:px-8">
                        <h2 className="max-w-2xl font-display text-[clamp(30px,4.5vw,48px)] leading-[1.05] tracking-tight text-ink text-balance">
                            Stop the next charge before it happens.
                        </h2>
                        <CtaLink href="/signup">Get started free</CtaLink>
                    </div>
                </section>
            </main>
            <SiteFooter />
        </>
    );
}