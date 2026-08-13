import { BellOff, DoorClosed, TrendingUp } from 'lucide-react';

import { Reveal, RevealItem } from '@/components/marketing/Reveal';
import { SectionTitle } from '@/components/marketing/SectionTitle';

const shell = 'mx-auto max-w-7xl px-6 sm:px-8 lg:px-12';

const problems = [
    {
        icon: BellOff,
        stat: '73%',
        statLabel: 'Auto-converted',
        title: 'Forgotten free trials.',
        body: 'Free trials quiet-convert into paid monthly charges. The free trial ends, but the recurring charges never do.',
        widget: (
            <div className="mt-5 rounded-2xl border border-rose-200/80 bg-rose-50/60 p-3.5">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-700 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                        Trial Expired Charge
                    </span>
                    <span className="font-mono text-[10px] font-bold text-rose-600 uppercase">Unexpected</span>
                </div>
                <div className="mt-2.5 flex items-center justify-between text-xs border-t border-rose-200/60 pt-2">
                    <span className="font-semibold text-ink">Design Tool Pro</span>
                    <span className="font-mono font-bold text-rose-600">-$29.00/mo</span>
                </div>
            </div>
        ),
    },
    {
        icon: TrendingUp,
        stat: '₦12,000+',
        statLabel: 'Monthly FX creep',
        title: 'Naira swings on dollar bills.',
        body: 'Volatile exchange rates double your Netflix, Spotify, and ChatGPT charges overnight without notice.',
        widget: (
            <div className="mt-5 rounded-2xl border border-line bg-slate-50 p-3.5">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink-70">USD FX Volatility</span>
                    <span className="font-mono font-bold text-orange flex items-center gap-0.5">
                        +35% Rate Jump
                    </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between font-mono text-xs border-t border-line pt-2">
                    <span className="text-ink-70 line-through">₦1,150 / $1</span>
                    <span className="font-bold text-ink">₦1,550 / $1</span>
                </div>
            </div>
        ),
    },
    {
        icon: DoorClosed,
        stat: '4 in 5',
        statLabel: 'Give up cancelling',
        title: 'Cancel flows built to trap you.',
        body: 'Multi-step menus, hidden buttons, and "are you sure?" screens engineered deliberately so you give up.',
        widget: (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900">Cancellation Wall</span>
                    <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                        Step 4 of 6
                    </span>
                </div>
                <p className="mt-2 text-[11px] font-medium leading-relaxed text-amber-900/90 border-t border-amber-200/60 pt-2">
                    &quot;Please call support during EST hours to confirm...&quot;
                </p>
            </div>
        ),
    },
] as const;

export function Problem() {
    return (
        <Reveal as="section" variant="fade" className="py-20 sm:py-28 bg-white">
            <div className={shell}>
                <SectionTitle
                    eyebrow="The problem"
                    title="Your subscriptions aren't trying to help you remember them."
                />

                <Reveal as="div" stagger className="mt-14 grid gap-8 lg:grid-cols-3 lg:gap-8">
                    {problems.map(({ icon: Icon, stat, statLabel, title, body, widget }) => (
                        <RevealItem key={title}>
                            <div className="group relative flex h-full flex-col justify-between rounded-[24px] border border-line bg-white p-6 sm:p-7 transition-all duration-300 hover:border-ink/20">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange/10 text-orange">
                                            <Icon aria-hidden="true" className="h-5 w-5" />
                                        </div>
                                        <div className="text-right">
                                            <span className="font-display text-2xl sm:text-3xl font-extrabold text-ink block">{stat}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-70">{statLabel}</span>
                                        </div>
                                    </div>
                                    <h3 className="mt-6 text-[19px] font-bold leading-snug tracking-tight text-ink">{title}</h3>
                                    <p className="mt-2.5 text-[14px] leading-6 text-ink-70">{body}</p>
                                </div>
                                {widget}
                            </div>
                        </RevealItem>
                    ))}
                </Reveal>
            </div>
        </Reveal>
    );
}
