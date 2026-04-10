import './globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';

import { QueryProvider } from '../components/providers/QueryProvider';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ui',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Unplug — Subscription Waste Dashboard',
  description: 'Detect, score, and cancel unused subscriptions. Unplug scans your recurring charges and shows you exactly where your money goes.',
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang="en" className={`${jakarta.variable} ${playfair.variable}`}>
    <body className="font-ui">
      <QueryProvider>{children}</QueryProvider>
    </body>
  </html>
);

export default RootLayout;
