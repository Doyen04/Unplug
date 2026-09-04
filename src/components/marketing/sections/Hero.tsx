import { CtaLink } from '@/components/marketing/CtaLink';
import { FreezeCardDemo } from '@/components/marketing/FreezeCardDemo';
import { Reveal } from '@/components/marketing/Reveal';

const shell = 'mx-auto max-w-7xl px-6 sm:px-8 lg:px-12';

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-white dot-grid">
            <div className={`${shell} relative grid gap-12 pb-16 pt-10 md:pb-24 md:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center`}>
                <Reveal as="div" variant="slide-up" className="max-w-2xl">
                    <h1 className="font-display text-[clamp(30px,6.5vw,72px)] font-bold leading-[0.98] tracking-tight text-ink text-balance">
                        Cancel anything. Even the things that <span className="text-orange underline decoration-orange/30 underline-offset-8">don&apos;t let you.</span>
                    </h1>

                    <p className="mt-7 max-w-xl text-[17px] sm:text-[19px] leading-7 sm:leading-8 text-ink-70">
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
                    <div className="mt-12 flex flex-wrap items-center justify-between gap-3 pt-6 sm:justify-start sm:gap-8">
                        <div>
                            <p className="font-display text-xl sm:text-2xl font-bold text-ink">2,400+</p>
                            <p className="text-xs text-ink-70">Cards frozen</p>
                        </div>
                        <div className="hidden h-8 w-px bg-line sm:block" />
                        <div>
                            <p className="font-display text-xl sm:text-2xl font-extrabold text-green">₦18M+</p>
                            <p className="text-xs font-medium text-ink-70">Saved from creep</p>
                        </div>
                        <div className="hidden h-8 w-px bg-line sm:block" />
                        <div>
                            <p className="font-display text-xl sm:text-2xl font-extrabold text-ink flex items-center gap-1">
                                4.9<span className="text-green text-lg">★</span>
                            </p>
                            <p className="text-xs font-medium text-ink-70">User rating</p>
                        </div>
                    </div>
                </Reveal>

                {/* Hero Graphic: Isolated Cutout Photo on White Base + Floating Demo Card */}
                <Reveal as="div" variant="scale" delay={0.1} className="relative lg:justify-self-end">
                    <div className="relative mx-auto w-full max-w-115">
                        {/* Cutout Photo container */}
                        <div className="relative overflow-hidden rounded-[28px] border-2 border-line bg-white p-4">
                            <div className="relative aspect-4/5 w-full overflow-hidden rounded-[20px] bg-slate-50 flex items-center justify-center">
                                <img
                                    src="/images/hero-1.png"
                                    alt="Young Nigerian professional managing subscriptions on smartphone"
                                    className="h-full w-full object-cover object-center"
                                />
                            </div>
                        </div>

                        {/* Floating FreezeCardDemo overlaying the bottom right */}
                        <div className="absolute -bottom-6 left-0 right-0 sm:-left-8 sm:right-6 max-w-90 z-10 mx-auto sm:mx-0">
                            <FreezeCardDemo />
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
