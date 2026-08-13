import { FreezeCardDemo } from '@/components/marketing/FreezeCardDemo';
import { Reveal } from '@/components/marketing/Reveal';
import { SectionTitle } from '@/components/marketing/SectionTitle';

const shell = 'mx-auto max-w-7xl px-6 sm:px-8 lg:px-12';

export function HowItWorks() {
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
                                <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-[#1C1A17] via-[#2A241F] to-[#12100E] p-3 text-white border border-white/20">
                                    <div className="flex items-center justify-between text-[10px]">
                                        <div className="flex items-center gap-2">
                                            {/* Mini Golden EMV Chip */}
                                            <div className="h-4 w-5 rounded-[3px] bg-linear-to-br from-amber-200 via-yellow-400 to-amber-500 border border-amber-600/40 p-px">
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
                                <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-[#26211C] via-[#1E1915] to-[#0E0C0A] p-3 text-white border border-white/20">
                                    <div className="flex items-center justify-between text-[10px]">
                                        <div className="flex items-center gap-2">
                                            {/* Mini Golden EMV Chip */}
                                            <div className="h-4 w-5 rounded-[3px] bg-linear-to-br from-amber-200 via-yellow-400 to-amber-500 border border-amber-600/40 p-[1px]">
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
