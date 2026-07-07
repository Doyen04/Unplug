import './globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { IBM_Plex_Mono, Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';

import { QueryProvider } from '@/components/providers/QueryProvider';

const jakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-ui',
});

const playfair = Playfair_Display({
    subsets: ['latin'],
    weight: ['600'],
    variable: '--font-display',
});

const mono = IBM_Plex_Mono({
    subsets: ['latin'],
    weight: ['500'],
    variable: '--font-mono',
});

export const metadata: Metadata = {
    metadataBase: new URL('https://unplug.app'),
    title: {
        default: 'Unplug — Freeze Any Subscription, Instantly',
        template: '%s · Unplug',
    },
    description:
        'Unplug gives every subscription its own virtual card — Naira or dollar — so you can freeze or cancel it the moment you want to.',
};

interface RootLayoutProps {
    children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => (
    <html lang="en" className={`${jakarta.variable} ${playfair.variable} ${mono.variable}`}>
        <body className="bg-cream font-ui text-ink antialiased">
            <QueryProvider>{children}</QueryProvider>
        </body>
    </html>
);

export default RootLayout;
