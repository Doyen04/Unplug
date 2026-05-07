import Link from 'next/link';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['700', '900'] });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600'] });

const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free',
    monthly: 0,
    subtitle: 'Core detection only.',
    cta: 'Get started',
    href: '/signup',
    features: [
      { text: 'Bank link (1 account)', active: true },
      { text: 'Subscription detection', active: true },
      { text: 'Total spend summary', active: true },
      { text: 'Usage insights', active: false },
      { text: 'Price hike alerts', active: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 4,
    subtitle: 'Full intelligence layer.',
    highlight: true,
    badge: 'Most Popular',
    cta: 'Start free trial',
    href: '/signup',
    features: [
      { text: 'Unlimited bank links', active: true },
      { text: 'AI usage scoring', active: true },
      { text: 'Price hike detection', active: true },
      { text: 'Monthly AI debrief', active: true },
      { text: 'Smart recommendations', active: true },
    ],
  },
  {
    id: 'concierge',
    name: 'Concierge',
    monthly: 9,
    subtitle: 'White-glove service.',
    cta: 'Contact sales',
    href: '/signup',
    features: [
      { text: 'Everything in Pro', active: true },
      { text: 'We cancel for you', active: true },
      { text: 'Bill negotiation', active: true },
      { text: 'Priority support', active: true },
      { text: 'Dedicated advisor', active: true },
    ],
  },
];

const TESTIMONIALS = [
  {
    quote: "I found $2,400 in annual subscriptions I'd completely forgotten about. Unplug paid for itself on day one.",
    author: 'Sarah Chen',
    role: 'Founder',
    company: 'TechStart',
  },
  {
    quote: 'Finally, a tool that makes subscription management effortless. The shame score gamification is genuinely motivating.',
    author: 'Marcus Reynolds',
    role: 'Product Manager',
    company: 'Growth Labs',
  },
  {
    quote: "The AI insights are spot-on. I cancelled 7 subscriptions and recovered $156/month just like that.",
    author: 'Jessica Park',
    role: 'Freelancer',
    company: 'Park Creative',
  },
];

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
  {
    q: 'What if I change my mind about cancelling?',
    a: 'We give you a 24-hour undo window on every cancellation. If you need the service back, just hit undo.',
  },
  {
    q: 'Does Unplug work with all banks?',
    a: 'We support 12,000+ banking institutions worldwide via Plaid. If your bank isn\'t connected, you can upload transactions manually.',
  },
];
function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b border-border/40 bg-bg-base/95">
      <div className="mx-auto max-w-6xl px-4 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className={`${playfair.className} text-2xl font-bold tracking-tight`}>
            Unplug
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors">
              Features
            </a>
            <a href="#social-proof" className="text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors">
              Testimonials
            </a>
            <a href="#pricing" className="text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors">
              Pricing
            </a>
            <a href="#faq" className="text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-brand-light/30 via-bg-base to-bg-base">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-40 right-20 h-72 w-72 rounded-full bg-brand-light/20 blur-3xl" />
        <div className="absolute bottom-40 left-20 h-96 w-96 rounded-full bg-brand-light/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-20 lg:px-8 lg:py-32">
        <div className="max-w-3xl">
          <Badge className="mb-6 inline-block">The Last Sub-Audit Tool You'll Need</Badge>

          <h1 className={`${playfair.className} text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6 text-text-primary`}>
            Stop throwing money at forgotten subscriptions
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary leading-8 mb-8 max-w-2xl">
            Connect your bank. We'll find every hidden subscription, score your actual usage, and help you cancel what you don't need. The average person recovers <span className="font-bold text-brand">$156/month</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" asChild className="px-8">
              <Link href="/signup">Start Your Free Audit</Link>
            </Button>
            <Button variant="secondary" size="lg" asChild className="px-8">
              <Link href="/login">View Demo</Link>
            </Button>
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
            ✓ No credit card required  • ✓ Takes 2 minutes  • ✓ Bank data is secure
          </p>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          <div className="text-center">
            <p className={`${playfair.className} text-4xl sm:text-5xl mb-2 text-brand`}>$2.4T</p>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Annual waste by Americans</p>
          </div>
          <div className="text-center">
            <p className={`${playfair.className} text-4xl sm:text-5xl mb-2 text-brand`}>12+</p>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Subscriptions per person (avg)</p>
          </div>
          <div className="text-center">
            <p className={`${playfair.className} text-4xl sm:text-5xl mb-2 text-brand`}>85%</p>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Accurately detected unused subs</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-16 lg:py-24 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mb-16 text-center">
          <Badge variant="outline" className="mb-4">How It Works</Badge>
          <h2 className={`${playfair.className} text-4xl sm:text-5xl mb-6 text-text-primary`}>
            Three simple steps to save money
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Link your bank. Get intelligent insights. Decide what stays and what goes.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-brand font-bold text-xl">
              1
            </div>
            <h3 className={`${playfair.className} text-2xl mb-4 text-text-primary`}>Detect Subscriptions</h3>
            <p className="text-text-secondary leading-7 flex-1">
              Securely connect your bank once. We map every recurring charge into a clean, organized list you can actually review.
            </p>
          </div>

          <div className="flex flex-col">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-brand font-bold text-xl">
              2
            </div>
            <h3 className={`${playfair.className} text-2xl mb-4 text-text-primary`}>Score Usage</h3>
            <p className="text-text-secondary leading-7 flex-1">
              Our AI analyzes your login patterns and transaction history to estimate which services you actually use. No more guessing.
            </p>
          </div>

          <div className="flex flex-col">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-brand font-bold text-xl">
              3
            </div>
            <h3 className={`${playfair.className} text-2xl mb-4 text-text-primary`}>Take Action</h3>
            <p className="text-text-secondary leading-7 flex-1">
              Cancel with one click. Get instant refunds. Track your savings. Or let us handle it all on Concierge.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <Card className="p-8 bg-bg-surface">
            <h3 className={`${playfair.className} text-2xl mb-4 text-text-primary`}>Usage Insights You Trust</h3>
            <p className="text-text-secondary leading-7">
              Every subscription gets an AI confidence score based on login frequency, last activity, and spending patterns. The shame score keeps you motivated.
            </p>
          </Card>
          <Card className="p-8 bg-bg-surface">
            <h3 className={`${playfair.className} text-2xl mb-4 text-text-primary`}>Price Hike Alerts</h3>
            <p className="text-text-secondary leading-7">
              We monitor your subscriptions for price increases and notify you immediately. Decide if it's still worth the premium.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  return (
    <section id="social-proof" className="py-16 lg:py-24 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4">Loved by Users</Badge>
          <h2 className={`${playfair.className} text-4xl sm:text-5xl mb-6 text-text-primary`}>
            Real results from real people
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Join thousands who've reclaimed control of their subscriptions.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Card key={i} className="p-8 flex flex-col bg-bg-surface hover:shadow-lg transition-shadow">
              <p className="text-base leading-8 text-text-primary mb-8 flex-1">"{t.quote}"</p>
              <div>
                <p className="font-semibold text-text-primary">{t.author}</p>
                <p className="text-xs uppercase tracking-widest text-text-muted">
                  {t.role} at {t.company}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-brand-light/20 border border-brand/30 rounded-2xl p-8 md:p-12 text-center">
          <p className="text-text-secondary text-lg mb-4">
            As seen in trusted publications
          </p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-70">
            <span className="text-sm font-bold uppercase tracking-widest">Product Hunt</span>
            <span className="text-sm font-bold uppercase tracking-widest">Y Combinator</span>
            <span className="text-sm font-bold uppercase tracking-widest">Tech Crunch</span>
            <span className="text-sm font-bold uppercase tracking-widest">Hacker News</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="py-16 lg:py-24 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4">Transparent Pricing</Badge>
          <h2 className={`${playfair.className} text-4xl sm:text-5xl mb-4 text-text-primary`}>
            Choose your level
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            No annual lock-in. Cancel anytime.
          </p>

          <div className="inline-flex items-center gap-4 bg-bg-muted rounded-full px-4 py-2">
            <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Money-back guarantee</span>
            <span className="text-xs text-text-secondary">30 days, no questions asked</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map(plan => (
            <Card
              key={plan.id}
              className={`flex flex-col p-8 transition-all ${
                plan.highlight
                  ? 'border-brand border-2 bg-brand-light/10 shadow-xl scale-105'
                  : 'bg-bg-surface'
              }`}
            >
              {plan.badge && (
                <Badge className="mb-4 w-fit">{plan.badge}</Badge>
              )}

              <h3 className={`${playfair.className} text-3xl mb-2 text-text-primary`}>
                {plan.name}
              </h3>
              <p className="text-text-secondary text-sm mb-6">{plan.subtitle}</p>

              <div className="mb-8">
                <span className={`${playfair.className} text-5xl text-text-primary`}>
                  ${plan.monthly}
                </span>
                <span className="text-text-muted ml-2">/month</span>
              </div>

              <ul className="space-y-4 flex-1 mb-8">
                {plan.features.map(feature => (
                  <li
                    key={feature.text}
                    className={`text-sm flex items-start gap-3 ${
                      feature.active ? 'text-text-primary' : 'text-text-muted'
                    }`}
                  >
                    <span className={`inline-block mt-1 font-bold ${feature.active ? 'text-brand' : 'opacity-40'}`}>
                      {feature.active ? '✓' : '−'}
                    </span>
                    {feature.text}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlight ? 'primary' : 'secondary'}
                className="w-full"
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-text-secondary mb-4">
            For teams or enterprises?
          </p>
          <Button variant="secondary" asChild>
            <a href="mailto:hello@unplug.app">Contact our sales team</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section id="faq" className="py-16 lg:py-24 border-b border-border">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4">Questions?</Badge>
          <h2 className={`${playfair.className} text-4xl sm:text-5xl mb-6 text-text-primary`}>
            Frequently asked questions
          </h2>
        </div>

        <div className="divide-y divide-border">
          {FAQs.map((item, i) => (
            <div key={i} className="py-6 first:pt-0 last:pb-0">
              <details className="group cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-text-primary hover:text-brand transition-colors list-none">
                  {item.q}
                  <span className="ml-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-bg-muted group-open:bg-brand group-open:text-white transition-colors shrink-0">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-text-secondary leading-7">{item.a}</p>
              </details>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-brand-light/30 border border-brand/30 p-8 text-center">
          <h3 className={`${playfair.className} text-2xl mb-3 text-text-primary`}>
            Still have questions?
          </h3>
          <p className="text-text-secondary mb-6">
            Our support team is here to help. Reach out anytime.
          </p>
          <Button asChild>
            <a href="mailto:support@unplug.app">Email us</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16 lg:py-24 border-b border-border">
      <div className="mx-auto max-w-4xl px-4 lg:px-8 text-center">
        <h2 className={`${playfair.className} text-4xl sm:text-5xl mb-6 text-text-primary`}>
          Ready to stop wasting money?
        </h2>
        <p className="text-lg text-text-secondary mb-10 max-w-2xl mx-auto">
          Your first audit takes 2 minutes. Join thousands of people who've reclaimed their subscriptions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="px-10">
            <Link href="/signup">Start Your Free Audit</Link>
          </Button>
          <Button size="lg" variant="secondary" asChild className="px-10">
            <Link href="/login">Log in to Dashboard</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${jakarta.className} bg-text-primary text-bg-base`}>
      <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4 mb-12">
          <div>
            <p className={`${playfair.className} text-2xl font-bold tracking-tight mb-2`}>
              Unplug
            </p>
            <p className="text-xs uppercase tracking-widest opacity-70">
              Audit. Score. Cut. Recover.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4 opacity-90">Product</p>
            <ul className="space-y-2 text-sm opacity-70">
              <li>
                <Link href="/signup" className="hover:opacity-100 transition-opacity">
                  Get Started
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:opacity-100 transition-opacity">
                  Dashboard
                </Link>
              </li>
              <li>
                <a href="#pricing" className="hover:opacity-100 transition-opacity">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4 opacity-90">Company</p>
            <ul className="space-y-2 text-sm opacity-70">
              <li>
                <a href="/#how-it-works" className="hover:opacity-100 transition-opacity">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#social-proof" className="hover:opacity-100 transition-opacity">
                  Blog
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:opacity-100 transition-opacity">
                  Support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4 opacity-90">Legal</p>
            <ul className="space-y-2 text-sm opacity-70">
              <li>
                <a href="/privacy" className="hover:opacity-100 transition-opacity">
                  Privacy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:opacity-100 transition-opacity">
                  Terms
                </a>
              </li>
              <li>
                <a href="/security" className="hover:opacity-100 transition-opacity">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs uppercase tracking-widest opacity-70">
            <p>© {currentYear} Unplug. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:opacity-100 transition-opacity">Twitter</a>
              <a href="#" className="hover:opacity-100 transition-opacity">LinkedIn</a>
              <a href="#" className="hover:opacity-100 transition-opacity">GitHub</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <main className={`${jakarta.className} bg-bg-base text-text-primary`}>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <SocialProofSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
