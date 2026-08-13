import { Check, X } from 'lucide-react';

import { PRICING_PLANS } from '@/lib/constants/marketing';
import { cn } from '@/lib/utils';

import { CtaLink } from './CtaLink';

export function PricingCards() {
    return (
        <div className="mt-12 grid items-start gap-6 lg:grid-cols-2">
            {PRICING_PLANS.map((plan) => (
                <div
                    key={plan.name}
                    className={cn(
                        'group relative rounded-[24px] border p-8 transition-transform duration-300 hover:-translate-y-1 sm:p-9',
                        plan.featured ? 'border-2 border-orange bg-bg-surface' : 'border-line bg-white',
                    )}
                >
                    {plan.featured ? (
                        <span className="absolute -top-3 left-8 overflow-hidden rounded-full bg-orange px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink">
                            Most popular
                            {/* Shimmer sweep */}
                            <span
                                aria-hidden="true"
                                className="absolute inset-0 animate-shimmer bg-white/25"
                                style={{ width: '40%' }}
                            />
                        </span>
                    ) : null}

                    <h3 className="text-[15px] font-semibold uppercase tracking-[0.08em] text-ink-70">{plan.name}</h3>

                    <p className="mt-5 flex items-baseline gap-1.5">
                        <span className="font-display text-[clamp(38px,5vw,52px)] leading-none tracking-tight text-ink">
                            {plan.price}
                        </span>
                        {plan.cadence ? <span className="text-[15px] text-ink-70">{plan.cadence}</span> : null}
                    </p>

                    <p className="mt-4 text-[15px] leading-7 text-ink-70">{plan.tagline}</p>

                    <CtaLink href="/signup" variant={plan.featured ? 'primary' : 'secondary'} className="mt-7 w-full">
                        Get started free
                    </CtaLink>

                    <ul role="list" className="mt-8 space-y-3.5 border-t border-line pt-8 text-[15px]">
                        {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3 text-ink">
                                <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-success" />
                                <span>{feature}</span>
                            </li>
                        ))}
                        {plan.absent.map((feature) => (
                            <li key={feature} className="flex items-start gap-3 text-ink-70">
                                <X aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" />
                                <span>
                                    {feature}
                                    <span className="sr-only"> — not included</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
