import Link from 'next/link';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';

import { getDashboardPayload } from '../lib/server/dashboard-data';
import { formatCurrency } from '../lib/utils/format';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['700', '900'] });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600'] });

const PRICING_PLANS = [
  {
    id: 'free', name: 'Free', monthly: 0, subtitle: 'Core detection only.', cta: 'Get started', href: '/signup',
    features: [
      { text: 'Bank link (1 account)', active: true }, { text: 'Subscription detection', active: true },
      { text: 'Total spend summary', active: true }, { text: 'Usage signals', active: false },
    ],
  },
  {
    id: 'pro', name: 'Pro', monthly: 4, subtitle: 'Full intelligence layer.', highlight: true, badge: 'Best Value', cta: 'Start trial', href: '/signup',
    features: [
      { text: 'Bank link (unlimited)', active: true }, { text: 'AI usage scoring', active: true },
      { text: 'Price hike detection', active: true }, { text: 'AI monthly debrief', active: true },
    ],
  },
  {
    id: 'concierge', name: 'Concierge', monthly: 9, subtitle: 'We handle it for you.', cta: 'Go Concierge', href: '/signup',
    features: [
      { text: 'Everything in Pro', active: true }, { text: 'We cancel for you', active: true },
      { text: 'Bill negotiation', active: true }, { text: 'Priority support', active: true },
    ],
  },
];

const FeatureCard = ({ number, title, desc }: { number: string; title: string; desc: string }) => (
  <Card className="p-6">
    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{number}</p>
    <h3 className={`${playfair.className} mt-3 text-3xl text-text-primary`}>{title}</h3>
    <p className="mt-4 text-sm leading-7 text-text-secondary">{desc}</p>
  </Card>
);

const StatCard = ({ label, value, className }: { label: string; value: string | number; className?: string }) => (
  <Card className={`p-4 border-none shadow-none ${className}`}>
    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{label}</p>
    <p className={`${playfair.className} mt-2 text-4xl`}>{value}</p>
  </Card>
);

export default async function HomePage() {
  const { summary, subscriptions } = await getDashboardPayload({ pageSize: 20 });
  const pressureList = subscriptions.filter(s => s.status !== 'healthy' && s.status !== 'cancelled').slice(0, 3);

  return (
    <main className={`${jakarta.className} relative min-h-screen bg-bg-base text-text-primary`}>
      <div className="auth-page-pattern opacity-30" />
      
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-6 lg:px-8">
        <header className="flex items-center justify-between rounded-2xl border border-border bg-bg-surface px-4 py-3 shadow-md">
          <p className={`${playfair.className} text-3xl tracking-[-0.02em]`}>Unplug</p>
          <nav className="hidden md:flex gap-6 items-center text-[11px] font-bold uppercase tracking-widest text-text-secondary">
            <a href="#how" className="hover:text-text-primary">How it works</a>
            <a href="#pricing" className="hover:text-text-primary">Pricing</a>
          </nav>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" asChild><Link href="/login">Log in</Link></Button>
            <Button size="sm" asChild><Link href="/signup">Start now</Link></Button>
          </div>
        </header>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="p-8 lg:p-10">
            <Badge variant="secondary" className="mb-4">Auditing $ spend</Badge>
            <h1 className={`${playfair.className} text-5xl sm:text-6xl leading-[1.02] tracking-tight`}>
              You are paying for<br />things you forgot.
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-text-secondary">
              Unplug connects to your bank, scores likely waste, and forces a decision: keep it, or cut it.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <StatCard label="Monthly Burn" value={formatCurrency(summary.monthlySpend)} className="bg-brand-light text-danger" />
              <StatCard label="Likely Unused" value={summary.unusedCount} className="bg-bg-muted text-text-primary" />
              <StatCard label="Recoverable / yr" value={formatCurrency(summary.saveablePerYear)} className="bg-success-light text-success" />
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild className="px-10"><Link href="/signup">Audit My Subs</Link></Button>
              <Button variant="secondary" size="lg" asChild><Link href="/dashboard">View Preview</Link></Button>
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-4">Live pressure list</p>
            <div className="rounded-xl bg-bg-muted p-4 mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Shame score</p>
              <p className={`${playfair.className} text-6xl mt-2 ${summary.shameScore >= 70 ? 'text-danger' : 'text-warning'}`}>{summary.shameScore}</p>
            </div>
            <div className="space-y-3">
              {pressureList.map(s => (
                <div key={s.id} className="rounded-lg border-l-4 border-l-danger bg-danger-light/20 p-3">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span>{s.serviceName}</span>
                    <span className="text-danger">{formatCurrency(s.amountMonthly)}/mo</span>
                  </div>
                  <p className="text-[10px] font-medium uppercase text-text-muted mt-1">{s.alert?.message || 'Low utility'}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section id="how" className="mt-4 grid gap-4 md:grid-cols-3">
          <FeatureCard number="01 / detect" title="Find recurring charges" desc="We map monthly transactions into a clean list of subscriptions so hidden spend stops hiding." />
          <FeatureCard number="02 / score" title="Measure actual usage" desc="Every service gets a confidence-weighted usage score so you stop arguing with vague feelings." />
          <FeatureCard number="03 / cut" title="Cancel dead weight" desc="One-click cancellation flow, short undo window, and a lower shame score every time you act." />
        </section>

        <section id="pricing" className="mt-4">
          <Card className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-border pb-6 mb-6">
              <div>
                <Badge variant="outline" className="mb-2">Pricing</Badge>
                <h2 className={`${playfair.className} text-4xl`}>Choose your level</h2>
              </div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest">No annual lock-in</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {PRICING_PLANS.map(p => (
                <Card key={p.id} className={`flex flex-col p-6 ${p.highlight ? 'border-brand bg-brand-light/10 shadow-lg scale-[1.02]' : 'bg-bg-base'}`}>
                  {p.badge && <Badge className="w-fit mb-4">{p.badge}</Badge>}
                  <h3 className="text-2xl font-bold">{p.name}</h3>
                  <p className={`${playfair.className} text-5xl mt-2`}>${p.monthly}<span className="text-sm font-sans text-text-muted">/mo</span></p>
                  <p className="text-sm text-text-secondary mt-3 mb-6">{p.subtitle}</p>
                  <ul className="flex-1 space-y-3 mb-6">
                    {p.features.map(f => (
                      <li key={f.text} className={`text-xs flex items-center gap-2 ${f.active ? 'text-text-primary' : 'text-text-muted'}`}>
                        <span className="text-brand opacity-60">•</span> {f.text}
                      </li>
                    ))}
                  </ul>
                  <Button variant={p.highlight ? 'primary' : 'secondary'} asChild><Link href={p.href}>{p.cta}</Link></Button>
                </Card>
              ))}
            </div>
          </Card>
        </section>

        <footer className="mt-4 rounded-2xl border border-border bg-bg-muted px-6 py-8 shadow-sm">
           <div className="flex flex-col md:flex-row justify-between gap-8">
              <div>
                <p className={`${playfair.className} text-2xl`}>Unplug</p>
                <p className="text-xs uppercase tracking-widest text-text-muted mt-1">Audit. Score. Cut. Recover.</p>
              </div>
              <div className="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                 <Link href="/signup">Get Started</Link>
                 <Link href="/login">Log in</Link>
                 <a href="#how">How it works</a>
                 <a href="#pricing">Pricing</a>
              </div>
           </div>
           <p className="mt-8 pt-4 border-t border-border-strong text-[10px] text-text-muted uppercase tracking-widest">© {new Date().getFullYear()} Unplug. Securely audited.</p>
        </footer>
      </div>
    </main>
  );
}
