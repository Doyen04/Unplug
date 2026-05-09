"use client";

import Link from 'next/link';
import { Syne, Manrope } from 'next/font/google';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ShieldAlert, Sparkles, TrendingDown, EyeOff, Scissors, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const displayFont = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const uiFont = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const stagger = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

function Header() {
    return (
        <header className="sticky top-0 z-50 bg-bg-base/80 backdrop-blur-xl border-b border-border/40">
            <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
                <Link href="/" className={`${displayFont.className} text-2xl font-bold tracking-tight`}>
                    Unplug.
                </Link>
                <nav className="hidden md:flex items-center gap-10">
                    <a href="#features" className="text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-brand transition-colors">Features</a>
                    <a href="#metrics" className="text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-brand transition-colors">Impact</a>
                    <a href="#pricing" className="text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-brand transition-colors">Pricing</a>
                </nav>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                        <Link href="/login">Log In</Link>
                    </Button>
                    <Button size="sm" asChild className="rounded-full shadow-lg shadow-brand/20">
                        <Link href="/signup">Get Started</Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}

function HeroSection() {
    return (
        <section className="relative pt-24 pb-32 overflow-hidden border-b border-border">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-brand-light/40 via-bg-base to-bg-base -z-10" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] -z-10" />

            <div className="mx-auto max-w-6xl px-6 relative z-10 text-center">
                <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl mx-auto">
                    <motion.h1 variants={fadeIn} className={`${displayFont.className} text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight text-text-primary mb-8 mt-4`}>
                        Stop throwing money at <br className="hidden md:block" />
                        <span className="text-brand">forgotten</span> services.
                    </motion.h1>

                    <motion.p variants={fadeIn} className="text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto mb-12">
                        Connect your bank securely. We uncover hidden recurring charges, analyze your true usage, and cancel the dead weight.
                    </motion.p>

                    <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" className="rounded-full h-14 px-8 shadow-xl shadow-brand/20" asChild>
                            <Link href="/signup">Run Free Audit <ArrowRight className="ml-2 w-4 h-4" /></Link>
                        </Button>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted sm:ml-4">
                            Avg. savings: <span className="text-brand">$156/mo</span>
                        </p>
                    </motion.div>
                </motion.div>

                {/* Abstract UI Reveal */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-24 mx-auto max-w-4xl"
                >
                    <div className="rounded-[24px] border border-border-strong bg-white/40 p-2 shadow-2xl backdrop-blur-xl">
                        <div className="rounded-[20px] bg-white border border-border overflow-hidden">
                            <div className="flex border-b border-border bg-bg-muted/30 px-6 py-4 items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-danger/80" />
                                    <div className="w-3 h-3 rounded-full bg-warning/80" />
                                    <div className="w-3 h-3 rounded-full bg-success/80" />
                                </div>
                                <div className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Unplug Dashboard</div>
                                <div className="w-16" />
                            </div>
                            <div className="p-8 text-left">
                                <div className="flex justify-between items-end mb-8">
                                    <div>
                                        <h3 className={`${displayFont.className} text-2xl mb-1`}>Identified Waste</h3>
                                        <p className="text-sm text-text-secondary">AI found 3 unused subscriptions</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-light tracking-tight text-brand tabular-nums">-$84.00</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Creative Cloud', amount: '$54.99', status: 'Unused (14 days)' },
                                        { name: 'Unknown Gym', amount: '$29.01', status: 'Unused (3 mos)' }
                                    ].map((sub, i) => (
                                        <div key={i} className="flex justify-between items-center p-4 border border-danger-light bg-danger-light/20 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white border border-danger/20 flex items-center justify-center text-danger font-bold text-sm">
                                                    {sub.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{sub.name}</p>
                                                    <p className="text-xs text-danger uppercase tracking-wider font-bold mt-1">{sub.status}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold tabular-nums text-text-primary text-sm sm:text-base">{sub.amount}</span>
                                                <Button variant="dangerOutline" size="sm" className="rounded-full hidden sm:flex">Cancel Now</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function ImpactSection() {
    return (
        <section id="metrics" className="py-24 border-b border-border bg-text-primary text-bg-base">
            <div className="mx-auto max-w-6xl px-6">
                <div className="grid md:grid-cols-3 gap-12 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-white/10">
                    <div className="pt-8 md:pt-0 md:pr-12">
                        <TrendingDown className="w-8 h-8 text-brand mb-6 mx-auto md:mx-0" />
                        <p className={`${displayFont.className} text-5xl mb-2`}>$2.4T</p>
                        <p className="text-xs uppercase tracking-widest text-white/50 font-bold">Annual Waste</p>
                    </div>
                    <div className="pt-8 md:pt-0 md:px-12">
                        <EyeOff className="w-8 h-8 text-brand mb-6 mx-auto md:mx-0" />
                        <p className={`${displayFont.className} text-5xl mb-2`}>12+</p>
                        <p className="text-xs uppercase tracking-widest text-white/50 font-bold">Hidden Subs</p>
                    </div>
                    <div className="pt-8 md:pt-0 md:pl-12">
                        <CheckCircle2 className="w-8 h-8 text-brand mb-6 mx-auto md:mx-0" />
                        <p className={`${displayFont.className} text-5xl mb-2`}>85%</p>
                        <p className="text-xs uppercase tracking-widest text-white/50 font-bold">AI Accuracy</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FeaturesSection() {
    const features = [
        {
            icon: ShieldAlert,
            title: 'Flawless Detection',
            desc: 'Securely sync your bank via Plaid. We parse thousands of transactions to map your recurring footprint.'
        },
        {
            icon: Scissors,
            title: '1-Click Cancels',
            desc: 'Stop navigating dark patterns. We provide direct cancellation links or handle it entirely on your behalf.'
        },
        {
            icon: Lock,
            title: 'Bank-Grade Privacy',
            desc: 'Read-only access. We never store your credentials. Your financial data is encrypted and immediately analyzed.'
        }
    ];

    return (
        <section id="features" className="py-32 border-b border-border relative">
            <div className="mx-auto max-w-6xl px-6">
                <div className="max-w-xl mb-20 text-center md:text-left mx-auto md:mx-0">
                    <h2 className={`${displayFont.className} text-4xl md:text-5xl mb-6`}>Precision analytics for your expenses.</h2>
                    <p className="text-lg text-text-secondary">We didn't just build a list. We built an intelligence layer that evaluates if a subscription is actually worth keeping.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((F, i) => (
                        <Card key={i} className="p-8 border-border hover:shadow-xl hover:shadow-brand/5 hover:border-brand/30 transition-all bg-white group">
                            <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <F.icon className="w-5 h-5" />
                            </div>
                            <h3 className={`${displayFont.className} text-2xl mb-3`}>{F.title}</h3>
                            <p className="text-text-secondary leading-relaxed">{F.desc}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CustomersSection() {
    const TESTIMONIALS = [
        {
            quote: '"I found $2,400 in annual subscriptions I\'d completely forgotten about. Unplug paid for itself on day one."',
            author: 'Sarah Chen',
            role: 'Founder',
            company: 'TechStart',
        },
        {
            quote: '"Finally, a tool that makes subscription management effortless. The shame score gamification is genuinely motivating."',
            author: 'Marcus Reynolds',
            role: 'Product Manager',
            company: 'Growth Labs',
        },
        {
            quote: '"The AI insights are spot-on. I cancelled 7 subscriptions and recovered $156/month just like that."',
            author: 'Jessica Park',
            role: 'Freelancer',
            company: 'Park Creative',
        },
    ];

    return (
        <section id="customers" className="py-32 border-b border-border bg-bg-base">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mb-20 text-center max-w-2xl mx-auto">
                    <h2 className={`${displayFont.className} text-4xl md:text-5xl mb-6`}>Real results from real people.</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((t, i) => (
                        <Card key={i} className="p-8 border-border hover:shadow-xl hover:shadow-brand/5 hover:border-brand/30 transition-all bg-white flex flex-col justify-between">
                            <p className="text-text-secondary leading-relaxed mb-8 italic">{t.quote}</p>
                            <div>
                                <p className="font-bold text-text-primary">{t.author}</p>
                                <p className="text-[10px] uppercase tracking-widest text-text-muted mt-1">{t.role} at {t.company}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

function PricingSection() {
    return (
        <section id="pricing" className="py-32 bg-bg-muted/50 border-b border-border">
            <div className="mx-auto max-w-6xl px-6">
                <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className={`${displayFont.className} text-4xl md:text-5xl mb-6`}>A fraction of what you'll save.</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                    <Card className="p-10 bg-white border-border-strong shadow-sm group hover:-translate-y-1 transition-transform">
                        <h3 className={`${displayFont.className} text-3xl mb-2`}>Free</h3>
                        <p className="text-text-secondary mb-8">Core detection only.</p>
                        <div className="mb-8 border-b border-border pb-8">
                            <span className={`${displayFont.className} text-5xl`}>$0</span>
                            <span className="text-text-muted ml-2 font-medium">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-sm text-text-secondary"><CheckCircle2 className="w-4 h-4 text-brand" /> Bank link (1 acc)</li>
                            <li className="flex items-center gap-3 text-sm text-text-secondary"><CheckCircle2 className="w-4 h-4 text-brand" /> Subscription detection</li>
                            <li className="flex items-center gap-3 text-sm text-text-secondary"><CheckCircle2 className="w-4 h-4 text-brand" /> Total spend summary</li>
                            <li className="flex items-center gap-3 text-sm text-text-muted opacity-60"><CheckCircle2 className="w-4 h-4 text-text-muted" /> AI usage & engagement score</li>
                            <li className="flex items-center gap-3 text-sm text-text-muted opacity-60"><CheckCircle2 className="w-4 h-4 text-text-muted" /> Real-time price hike detection</li>
                            <li className="flex items-center gap-3 text-sm text-text-muted opacity-60"><CheckCircle2 className="w-4 h-4 text-text-muted" /> 1-Click cancellation assistance</li>
                        </ul>
                        <Button variant="outline" className="w-full rounded-full" asChild>
                            <Link href="/signup">Get Started</Link>
                        </Button>
                    </Card>

                    <Card className="p-10 bg-white border-border-strong shadow-sm group hover:-translate-y-1 transition-transform border-t-4 border-t-brand">
                        <h3 className={`${displayFont.className} text-3xl mb-2`}>Standard</h3>
                        <p className="text-text-secondary mb-8">Full toolkit to audit and cancel.</p>
                        <div className="mb-8 border-b border-border pb-8">
                            <span className={`${displayFont.className} text-5xl`}>$4</span>
                            <span className="text-text-muted ml-2 font-medium">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-sm text-text-secondary"><CheckCircle2 className="w-4 h-4 text-brand" /> Unlimited bank links</li>
                            <li className="flex items-center gap-3 text-sm text-text-secondary"><CheckCircle2 className="w-4 h-4 text-brand" /> Advanced subscription detection</li>
                            <li className="flex items-center gap-3 text-sm text-text-secondary"><CheckCircle2 className="w-4 h-4 text-brand" /> AI usage & engagement score</li>
                            <li className="flex items-center gap-3 text-sm text-text-secondary"><CheckCircle2 className="w-4 h-4 text-brand" /> Real-time price hike detection</li>
                            <li className="flex items-center gap-3 text-sm text-text-secondary"><CheckCircle2 className="w-4 h-4 text-brand" /> 1-Click cancellation assistance</li>
                            <li className="flex items-center gap-3 text-sm text-text-muted opacity-60"><CheckCircle2 className="w-4 h-4 text-text-muted" /> Dedicated concierge</li>
                        </ul>
                        <Button className="w-full rounded-full bg-text-primary text-white hover:bg-black" asChild>
                            <Link href="/signup">Start Trial</Link>
                        </Button>
                    </Card>

                    <Card className="p-10 bg-text-primary text-bg-base border-text-primary shadow-xl relative overflow-hidden transform md:-translate-y-4 hover:translate-y-0 md:hover:-translate-y-5 transition-transform">
                        <div className="absolute top-0 right-0 p-4">
                            <span className="inline-block bg-brand text-white border-none shadow-lg shadow-brand/20 font-bold uppercase tracking-wider text-[10px] px-3 py-1 rounded-full">Concierge</span>
                        </div>
                        <h3 className={`${displayFont.className} text-3xl mb-2`}>White-Glove</h3>
                        <p className="text-white/60 mb-8 w-11/12">We cancel directly for you.</p>
                        <div className="mb-8 border-b border-white/10 pb-8">
                            <span className={`${displayFont.className} text-5xl text-brand`}>$9</span>
                            <span className="text-white/40 ml-2 font-medium">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="w-4 h-4 text-brand" /> Everything in Standard</li>
                            <li className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="w-4 h-4 text-brand" /> We handle cancellation phone calls</li>
                            <li className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="w-4 h-4 text-brand" /> Proactive refund negotiation</li>
                            <li className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="w-4 h-4 text-brand" /> Monthly detailed AI spend debrief</li>
                            <li className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="w-4 h-4 text-brand" /> Priority email & chat support</li>
                            <li className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="w-4 h-4 text-brand" /> Dedicated concierge advisor</li>
                        </ul>
                        <Button className="w-full rounded-full bg-brand text-white hover:bg-brand-dark" asChild>
                            <Link href="/signup">Get Concierge</Link>
                        </Button>
                    </Card>
                </div>
            </div>
        </section>
    );
}

function FAQSection() {
    const FAQs = [
        {
            q: 'Is my bank data secure?',
            a: 'Yes. We use Plaid for secure connections and OAuth authentication. Your login credentials are never stored, and we only access transaction data.',
        },
        {
            q: 'How does the AI usage scoring work?',
            a: 'Our AI analyzes login frequency, transaction patterns, and usage signals to estimate if you actively use a service. No machine is perfect, but it catches ~85% of truly unused subscriptions.',
        },
        {
            q: 'Can I be refunded if I just cancel?',
            a: 'Most subscriptions offer prorated refunds for the remainder of the month. On Concierge, we handle refund negotiations for you.',
        },
    ];

    return (
        <section id="faq" className="py-32 border-b border-border bg-bg-base">
            <div className="mx-auto max-w-4xl px-6">
                <div className="mb-20 text-center">
                    <h2 className={`${displayFont.className} text-4xl md:text-5xl mb-6`}>Common questions.</h2>
                </div>
                <div className="divide-y divide-border">
                    {FAQs.map((item, i) => (
                        <div key={i} className="py-8 first:pt-0 last:pb-0">
                            <h3 className={`${displayFont.className} text-2xl font-bold mb-4`}>{item.q}</h3>
                            <p className="text-text-secondary leading-relaxed">{item.a}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-16 text-center">
                    <p className="text-text-secondary mb-6">Still have questions?</p>
                    <Button variant="outline" className="rounded-full" asChild>
                        <a href="mailto:support@unplug.app">Email Support</a>
                    </Button>
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="bg-text-primary text-bg-base py-12">
            <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className={`${displayFont.className} text-2xl font-bold`}>Unplug.</div>
                <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold">
                    © {new Date().getFullYear()} Unplug. Audit. Score. Cancel.
                </div>
            </div>
        </footer>
    );
}

export default function HomePage() {
    return (
        <main className={`${uiFont.className} bg-bg-base text-text-primary min-h-screen selection:bg-brand selection:text-white flex flex-col`}>
            <Header />
            <div className="flex-1">
                <HeroSection />
                <ImpactSection />
                <FeaturesSection />
                <CustomersSection />
                <PricingSection />
                <FAQSection />
            </div>
            <Footer />
        </main>
    );
}
