import { Eye, KeyRound, Landmark, Lock } from 'lucide-react';

import { CtaLink } from '@/components/marketing/CtaLink';
import { SectionTitle } from '@/components/marketing/SectionTitle';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { SiteHeader } from '@/components/marketing/SiteHeader';

export const metadata = {
    title: 'Security',
    description:
        'How Unplug handles your data: read-only bank access used once, card numbers never stored on our servers, and funds held with a licensed banking partner.',
};

const guarantees = [
    {
        icon: Eye,
        title: 'Read-only, and used once.',
        body: 'The bank connection can look at your transaction history to find recurring charges. It cannot move money, and we are not sitting on the line watching your account afterwards.',
    },
    {
        icon: Lock,
        title: 'We never store your card numbers.',
        body: 'Full card numbers and CVVs are never written to our database or our logs. When you reveal a card, it is fetched through a sandboxed display that hands the details straight to your browser.',
    },
    {
        icon: Landmark,
        title: 'Your money sits with a licensed partner.',
        body: 'Unplug does not hold customer funds directly. The balance backing your virtual cards is held at a licensed banking partner.',
    },
    {
        icon: KeyRound,
        title: 'Pro billing runs through Paystack.',
        body: 'Your card details for the Unplug subscription itself are held by Paystack, not by us. We only keep the token that lets us charge the agreed amount.',
    },
] as const;

export default function SecurityPage() {
    return (
        <>
            <SiteHeader />
            <main id="main" className="bg-white text-ink">
                <section className="bg-ink py-16 sm:py-24">
                    <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
                        <SectionTitle
                            tone="inverse"
                            eyebrow="Security"
                            title="We built this so you don't have to trust us blindly."
                            description="A subscription tool asks for access to the most sensitive account you have. Here is exactly how far that access goes."
                        />
                    </div>
                </section>

                <section className="py-16 sm:py-24">
                    <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
                        <ul role="list" className="grid gap-10 sm:grid-cols-2 lg:gap-14">
                            {guarantees.map(({ icon: Icon, title, body }) => (
                                <li key={title} className="border-t border-line pt-7">
                                    <Icon aria-hidden="true" className="h-6 w-6 text-orange" />
                                    <h2 className="mt-5 text-[20px] font-semibold leading-snug tracking-tight text-ink">
                                        {title}
                                    </h2>
                                    <p className="mt-3 max-w-xl text-[16px] leading-7 text-ink-70">{body}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="border-t border-line py-16 sm:py-24">
                    <div className="mx-auto max-w-3xl px-6 text-center sm:px-8 lg:px-12">
                        <h2 className="font-display text-[clamp(26px,3.6vw,38px)] leading-tight tracking-tight text-ink text-balance">
                            One card per subscription is itself a security decision.
                        </h2>
                        <p className="mt-5 text-[17px] leading-8 text-ink-70">
                            If a merchant leaks a card, the damage stops at that one subscription — the card is locked to
                            them, capped at roughly their monthly amount, and you can freeze it in a tap. Your real card
                            never touches the merchant at all.
                        </p>
                        <CtaLink href="/signup" className="mt-9">
                            Get started free
                        </CtaLink>
                    </div>
                </section>
            </main>
            <SiteFooter />
        </>
    );
}