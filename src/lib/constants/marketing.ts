import type { LucideIcon } from 'lucide-react';
import { BellRing, CreditCard, Eye, LayoutDashboard, Settings2 } from 'lucide-react';

/**
 * Marketing copy lives here so the homepage and the standalone /pricing and
 * /security pages can never drift apart. Copy is taken verbatim from
 */

export interface PricingPlan {
    name: string;
    price: string;
    cadence?: string;
    tagline: string;
    featured: boolean;
    features: readonly string[];
    absent: readonly string[];
}

export const PRICING_PLANS: readonly PricingPlan[] = [
    {
        name: 'Free',
        price: '₦0',
        tagline: 'Find what you are paying for, and stop the obvious ones.',
        featured: false,
        features: ['1 bank connection', 'Subscription discovery', 'Naira virtual cards', 'Freeze / cancel', 'Email support'],
        absent: ['Dollar virtual cards', '3-day billing forecast'],
    },
    {
        name: 'Pro',
        price: '₦4,000',
        cadence: '/month',
        tagline: 'Every subscription on its own card, Naira and dollar.',
        featured: true,
        features: [
            'Unlimited bank connections',
            'Subscription discovery',
            'Naira virtual cards',
            'Dollar virtual cards',
            '3-day billing forecast',
            'Freeze / cancel',
            'Priority support',
        ],
        absent: [],
    },
] as const;

export const FAQ_ITEMS = [
    {
        question: 'Is my banking information safe?',
        answer:
            'Your bank connection is read-only, and we use it once — to find what you are already paying for. We are not watching your account, and we cannot move money out of it.',
    },
    {
        question: 'How is this different from just freezing a card in my own banking app?',
        answer:
            'Your bank freezes the whole card, so your transport, your data top-up and your rent all stop with it. Unplug gives each subscription its own card, so freezing Netflix stops Netflix and nothing else.',
    },
    {
        question: "What's the difference between freezing and cancelling?",
        answer:
            'Freezing blocks the next charge but keeps the card, so you can start again with one tap. Cancelling removes the card from that subscription for good.',
    },
    {
        question: 'What happens with my dollar (USD) subscriptions?',
        answer:
            'Dollar-priced services get a dollar card, and you manage them in the same place as your Naira ones. No separate app, no separate login.',
    },
    {
        question: 'Do I need to tell Netflix or Spotify about the new card myself?',
        answer:
            'Yes — once. You paste the new card into that service the same way you would any other card. After that, the subscription bills the Unplug card and you control it from here.',
    },
    {
        question: 'What if I freeze the wrong card by mistake?',
        answer: 'Unfreeze it and the next billing cycle carries on as normal. Nothing is cancelled until you cancel it.',
    },
    {
        question: "What does Pro get me that Free doesn't?",
        answer:
            'Pro adds dollar virtual cards, unlimited bank connections, and a heads-up three days before a charge lands. Free covers discovery and Naira cards.',
    },
] as const;

export interface TourPanel {
    id: string;
    label: string;
    icon: LucideIcon;
    headline: string;
    body: string;
}

export const TOUR_PANELS: readonly TourPanel[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        headline: 'Your whole subscription picture.',
        body: 'Total monthly spend, active versus frozen, and what is charging this week — on one screen, without digging through a statement.',
    },
    {
        id: 'subscriptions',
        label: 'Subscriptions',
        icon: CreditCard,
        headline: 'One card per subscription, always under your thumb.',
        body: 'Every recurring charge sits on its own virtual card. Freeze one and the rest keep working exactly as they were.',
    },
    {
        id: 'billing',
        label: 'Billing',
        icon: BellRing,
        headline: 'We tell you three days before a charge, not after.',
        body: 'Enough warning to freeze the card if you have changed your mind — instead of finding out when the money is already gone.',
    },
    {
        id: 'transactions',
        label: 'Transactions',
        icon: Eye,
        headline: 'Every charge, searchable.',
        body: 'A plain record of what was charged, by whom, and to which card. Search by merchant when something does not look familiar.',
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: Settings2,
        headline: 'Your account, your plan, your rules.',
        body: 'Manage your connections and your plan, or close the account entirely. No retention flow, no phone call.',
    },
] as const;
