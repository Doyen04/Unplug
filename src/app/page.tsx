"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Syne, Manrope } from 'next/font/google';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const displayFont = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const uiFont = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-bg-base/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className={`${displayFont.className} text-2xl font-semibold tracking-tight text-text-primary`}>
          Unplug.
        </Link>
        <nav className="hidden items-center gap-8 text-[10px] font-semibold uppercase tracking-[0.25em] text-text-secondary md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-brand">
            How it works
          </a>
          <a href="#security" className="transition-colors hover:text-brand">
            Security
          </a>
          <a href="#pricing" className="transition-colors hover:text-brand">
            Pricing
          </a>
          <a href="#faq" className="transition-colors hover:text-brand">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild className="rounded-full shadow-lg shadow-brand/20">
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function FreezeCardDemo() {
  const [isFrozen, setIsFrozen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="mx-auto mt-12 max-w-xl lg:mt-0">
      <button
        type="button"
        onClick={() => setIsFrozen((value) => !value)}
        className="w-full rounded-[28px] border border-white/70 bg-white/70 p-2 text-left shadow-[0_25px_90px_-30px_rgba(31,26,22,0.45)] backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        aria-pressed={isFrozen}
        aria-live="polite"
      >
        <motion.div
          animate={{
            background: isFrozen
              ? 'linear-gradient(135deg, #DCEEF5 0%, #CFE6F2 100%)'
              : 'linear-gradient(135deg, #FF5C35 0%, #FF8A5B 100%)',
            color: isFrozen ? '#1B3A4B' : '#FFF8F2',
            scale: prefersReducedMotion ? 1 : isFrozen ? 0.98 : 1,
          }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: 'easeOut' }}
          className="rounded-[24px] p-6 sm:p-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] opacity-80">
                {isFrozen ? 'Frozen' : 'Active'}
              </p>
              <p className="mt-2 text-2xl font-semibold">Streaming Plan</p>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isFrozen ? 'bg-[#1B3A4B]/10' : 'bg-white/20'}`}>
              <Snowflake className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-8 rounded-[20px] border border-white/30 bg-black/5 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="opacity-80">Monthly charge</span>
              <span className={`font-mono text-lg font-semibold ${isFrozen ? 'line-through opacity-70' : ''}`}>
                ₦4,500
              </span>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4 text-sm">
              <div>
                <p className="opacity-80">Card number</p>
                <p className="mt-1 font-mono tracking-[0.25em]">•••• 4471</p>
              </div>
              <div className="text-right">
                <p className="opacity-80">Renews</p>
                <p className="mt-1 font-mono">08/26</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between rounded-full border border-white/30 bg-white/15 px-4 py-3 text-sm backdrop-blur-sm">
            <span className="font-medium">
              {isFrozen ? 'Charge blocked. Unfreeze anytime.' : 'Tap to freeze this recurring charge.'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </motion.div>
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-text-secondary sm:justify-start">
        {['Netflix', 'Spotify', 'YouTube Premium', 'ChatGPT'].map((item) => (
          <span key={item} className="rounded-full border border-border bg-bg-surface px-3 py-1.5">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/70 pb-24 pt-16 sm:pb-28 sm:pt-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,92,53,0.16),transparent_45%)]" />
      <div className="mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-brand">
            For everyone paying in naira and dollars
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] text-text-primary sm:text-5xl lg:text-6xl">
            Freeze any subscription. Instantly.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-text-secondary">
            Unplug gives every recurring charge its own virtual card. See something you no longer want? Freeze the card and the charge stops at the payment rail.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild className="rounded-full px-8 shadow-xl shadow-brand/20">
              <Link href="/signup">
                Find my subscriptions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild className="rounded-full px-8">
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
            <span className="flex items-center gap-2 rounded-full border border-border bg-bg-surface px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-brand" /> Read-only bank connection
            </span>
            <span className="flex items-center gap-2 rounded-full border border-border bg-bg-surface px-3 py-2">
              <Sparkles className="h-4 w-4 text-brand" /> One card per subscription
            </span>
          </div>
        </div>

        <FreezeCardDemo />
      </div>
    </section>
  );
}

function ProblemSection() {
  const items = [
    {
      title: 'Forgotten trials',
      body: 'The free month ends and the charge keeps rolling forward.',
    },
    {
      title: 'Naira value swings',
      body: 'USD bills move with the exchange rate and the cost feels different every month.',
    },
    {
      title: 'Cancel flows built to make you give up',
      body: 'Menus, hold times, and “are you sure?” screens make simple cancellations feel like a chore.',
    },
  ];

  return (
    <section className="border-b border-border/70 bg-bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-brand">
            The problem
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-text-primary sm:text-4xl">
            Your subscriptions are not trying to help you remember them.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <Card key={item.title} className="border-border/70 bg-bg-base p-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary">{item.title}</h3>
              <p className="mt-3 leading-7 text-text-secondary">{item.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      title: 'Connect your bank once',
      body: 'We use a read-only bank connection to spot the subscriptions you already pay for.',
    },
    {
      title: 'Get a dedicated card per subscription',
      body: 'Every recurring charge gets its own virtual card, whether it is billed in NGN or USD.',
    },
    {
      title: 'Freeze or cancel anytime',
      body: 'If a charge no longer feels worth it, freeze the card and the payment stops instantly.',
    },
  ];

  return (
    <section id="how-it-works" className="border-b border-border/70 bg-bg-base py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-brand">How it works</p>
          <h2 className="mt-4 text-3xl font-semibold text-text-primary sm:text-4xl">
            A real sequence, not a vague promise.
          </h2>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-[24px] border border-border/70 bg-bg-surface p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-lg font-semibold text-brand">
                0{index + 1}
              </div>
              <h3 className="text-xl font-semibold text-text-primary">{step.title}</h3>
              <p className="mt-3 leading-7 text-text-secondary">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TourSection() {
  const panels = [
    {
      title: 'Per-subscription cards',
      body: 'NGN and USD recurring charges each get their own card in the same dashboard.',
      icon: CreditCard,
    },
    {
      title: 'One-tap freeze or cancel',
      body: 'When a payment is no longer worth it, you stop it from the same screen you manage it on.',
      icon: Snowflake,
    },
    {
      title: 'Renewal alerts before you’re charged',
      body: 'See upcoming renewals early and take action before the debit lands.',
      icon: BellRing,
    },
    {
      title: 'Everything in one place',
      body: 'Subscriptions, cards, and renewal dates live side by side so nothing disappears into the noise.',
      icon: CircleDollarSign,
    },
  ];

  return (
    <section className="border-b border-border/70 bg-bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-brand">Product tour</p>
          <h2 className="mt-4 text-3xl font-semibold text-text-primary sm:text-4xl">
            Everything lives on one dashboard.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {panels.map((panel) => {
            const Icon = panel.icon;
            return (
              <Card key={panel.title} className="border-border/70 bg-bg-base p-8 transition-transform hover:-translate-y-1">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary">{panel.title}</h3>
                <p className="mt-3 leading-7 text-text-secondary">{panel.body}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section id="security" className="border-b border-border/70 bg-[#1F1A16] py-24 text-[#F8F1E9]">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#FF9A76]">Security</p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
            We built this so you do not have to trust us blindly.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#D7CFC2]">
            Your bank connection is read-only, and we only use it once to find your recurring charges. Card numbers are never stored on our servers for everyday use.
          </p>
        </div>
        <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          {[
            'Read-only access to find subscriptions without watching your full account.',
            'Card numbers are shown through a secure, sandboxed display instead of being stored on our servers.',
            'Freezing is instant and reversible, and it never touches your main bank account.',
          ].map((item) => (
            <div key={item} className="flex gap-3 rounded-[18px] border border-white/10 bg-black/10 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#FF9A76]" />
              <p className="leading-7 text-[#F5EDE2]">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProofSection() {
  return (
    <section className="border-b border-border/70 bg-bg-base py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-3xl rounded-[28px] border border-border/70 bg-bg-surface p-8 sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-brand">Proof</p>
          <h2 className="mt-4 text-3xl font-semibold text-text-primary sm:text-4xl">
            This was built because a dollar-priced surprise can still hit hard in naira.
          </h2>
          <p className="mt-6 text-lg leading-8 text-text-secondary">
            We started Unplug after seeing how quickly a forgotten subscription or a renewals surprise could quietly drain a budget. The product is designed to make that exact moment feel manageable instead of inevitable.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-lg font-semibold text-brand">
              U
            </div>
            <div>
              <p className="font-semibold text-text-primary">The Unplug team</p>
              <p className="text-sm text-text-secondary">Built for recurring charges that should be easier to stop</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '₦0',
      description: 'Start with one bank connection and discover your recurring charges.',
      features: ['1 bank connection', 'Subscription discovery', 'Virtual cards in NGN', 'Freeze or cancel on demand'],
      cta: 'Get started',
      href: '/signup',
      highlight: false,
    },
    {
      name: 'Pro',
      price: '₦4,000/mo',
      description: 'Get the full control layer for all your subscriptions, including USD bills.',
      features: ['Unlimited subscriptions', 'NGN + USD cards', 'Renewal alerts', 'Priority support'],
      cta: 'Start Pro',
      href: '/signup',
      highlight: true,
    },
  ];

  return (
    <section id="pricing" className="border-b border-border/70 bg-bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-brand">Pricing</p>
          <h2 className="mt-4 text-3xl font-semibold text-text-primary sm:text-4xl">
            Simple pricing for the subscriptions you actually keep.
          </h2>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.name} className={`p-8 ${plan.highlight ? 'border-brand/30 bg-white shadow-[0_22px_60px_-30px_rgba(255,92,53,0.35)]' : 'border-border/70 bg-bg-surface'}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold text-text-primary">{plan.name}</h3>
                  <p className="mt-2 leading-7 text-text-secondary">{plan.description}</p>
                </div>
                {plan.highlight ? (
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-brand">
                    Most popular
                  </span>
                ) : null}
              </div>
              <p className="mt-8 text-4xl font-semibold text-text-primary">{plan.price}</p>
              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-text-secondary">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className={`mt-8 w-full rounded-full ${plan.highlight ? '' : 'border border-border bg-white text-text-primary hover:bg-bg-muted'}`}>
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const items = [
    {
      question: 'Is my banking information safe?',
      answer: 'Yes. We use a read-only bank connection and do not store your login details. We only use the data needed to identify recurring payments.',
    },
    {
      question: 'How is this different from freezing a card in my bank app?',
      answer: 'Bank-level freezes block the whole card. Unplug gives each subscription its own virtual card, so one freeze only affects that merchant.',
    },
    {
      question: 'What happens with my dollar subscriptions?',
      answer: 'USD subscriptions are handled in the same dashboard, so you can manage both NGN and USD recurring charges without switching tools.',
    },
    {
      question: 'Do I need to tell Netflix or Spotify about the new card myself?',
      answer: 'Yes. The card is assigned to the subscription, so you will need to update the payment method with that merchant once to complete the handoff.',
    },
  ];

  return (
    <section id="faq" className="bg-bg-base py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-brand">FAQ</p>
          <h2 className="mt-4 text-3xl font-semibold text-text-primary sm:text-4xl">
            Common questions, answered plainly.
          </h2>
        </div>
        <div className="mt-12 divide-y divide-border/70 rounded-[24px] border border-border/70 bg-bg-surface">
          {items.map((item) => (
            <details key={item.question} className="group p-6 sm:p-8">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-text-primary">
                <span>{item.question}</span>
                <span className="text-xl text-brand">+</span>
              </summary>
              <p className="mt-4 leading-8 text-text-secondary">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="border-t border-border/70 bg-bg-surface py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 rounded-4xl border border-border/70 bg-bg-base p-8 text-center sm:flex-row sm:text-left">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-brand">Ready to stop guessing?</p>
          <h2 className="mt-3 text-3xl font-semibold text-text-primary">
            Stop guessing what is leaving your account every month.
          </h2>
        </div>
        <Button size="lg" asChild className="rounded-full px-8 shadow-lg shadow-brand/15">
          <Link href="/signup">Find my subscriptions</Link>
        </Button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#1F1A16] py-10 text-[#F8F1E9]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xl font-semibold">Unplug.</div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#D7CFC2]">
          <a href="#how-it-works" className="transition-colors hover:text-brand">How it works</a>
          <a href="#pricing" className="transition-colors hover:text-brand">Pricing</a>
          <a href="#faq" className="transition-colors hover:text-brand">FAQ</a>
          <a href="mailto:support@unplug.app" className="transition-colors hover:text-brand">Support</a>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <main className={`${uiFont.className} flex min-h-screen flex-col bg-bg-base text-text-primary selection:bg-brand selection:text-white`}>
      <Header />
      <div className="flex-1">
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <TourSection />
        <SecuritySection />
        <ProofSection />
        <PricingSection />
        <FAQSection />
        <FinalCtaSection />
      </div>
      <Footer />
    </main>
  );
}
