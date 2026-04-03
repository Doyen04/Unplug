import './globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { QueryProvider } from '../components/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'Unplug',
  description: 'Subscription waste dashboard',
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang="en">
    <body>
      <QueryProvider>{children}</QueryProvider>
    </body>
  </html>
);

export default RootLayout;
