import './globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DM_Sans, Sora, Space_Mono } from 'next/font/google';

import { QueryProvider } from '@/components/providers/QueryProvider';

const dmSans = DM_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-ui',
});

const sora = Sora({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-display',
});

const mono = Space_Mono({
    subsets: ['latin'],
    weight: ['400', '700'],
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
    <html lang="en" className={`${dmSans.variable} ${sora.variable} ${mono.variable}`}>
        <body className="bg-white font-ui text-ink antialiased">
            <QueryProvider>{children}</QueryProvider>
        </body>
    </html>
);

export default RootLayout;
