'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={[
        'sticky top-0 z-50 transition-colors duration-200',
        scrolled ? 'border-b border-line/100 bg-cream/95 backdrop-blur-md' : 'bg-transparent',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-[20px] font-semibold tracking-tight text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2">
          Unplug.
        </Link>

        <nav className="hidden items-center gap-8 text-[13px] font-semibold uppercase tracking-[0.08em] text-ink sm:flex">
          <a href="#how-it-works" className="transition-colors hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2">How it works</a>
          <Link href="/security" className="transition-colors hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2">Security</Link>
          <Link href="/pricing" className="transition-colors hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2">Pricing</Link>
          <a href="#faq" className="transition-colors hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2">FAQ</a>
        </nav>

        <Link href="/signup" className="inline-flex min-h-11 items-center justify-center rounded-full bg-orange px-5 text-sm font-semibold text-ink transition-colors hover:bg-orange-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2">
          Get started free
        </Link>
      </div>
    </header>
  );
}
