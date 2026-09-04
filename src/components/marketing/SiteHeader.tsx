'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { UnplugLogo } from '@/components/ui/UnplugLogo';

import { CtaLink } from './CtaLink';

const NAV_LINKS = [
    { href: '/#how-it-works', label: 'How it works' },
    { href: '/security', label: 'Security' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/#faq', label: 'FAQ' },
] as const;

const linkClass =
    'rounded-full px-2 py-1 transition-colors hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-cream';

export function SiteHeader() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (!menuOpen) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
                toggleRef.current?.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [menuOpen]);

    return (
        <>
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-60 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-cream"
            >
                Skip to content
            </a>

            <header
                className={cn(
                    'sticky top-0 z-50 transition-all duration-200 w-full max-w-full overflow-x-hidden',
                    scrolled || menuOpen ? 'border-b border-line bg-white/95 backdrop-blur-md py-3' : 'bg-transparent py-3.5 sm:py-5',
                )}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 px-4 sm:px-8 lg:px-12">
                    <Link
                        href="/"
                        className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
                    >
                        <UnplugLogo size="md" />
                    </Link>

                    <nav aria-label="Main" className="hidden items-center gap-8 text-[14px] font-medium text-ink md:flex">
                        {NAV_LINKS.map(({ href, label }) => (
                            <Link key={href} href={href} className={linkClass}>
                                {label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <Link
                            href="/login"
                            className={cn('hidden text-[14px] font-medium text-ink sm:inline-flex', linkClass)}
                        >
                            Log in
                        </Link>
                        <CtaLink href="/signup" className="min-h-10 sm:min-h-11 px-3 sm:px-5 text-xs sm:text-sm animate-pulse-ring whitespace-nowrap">
                            Get started free
                        </CtaLink>

                        <button
                            ref={toggleRef}
                            type="button"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-expanded={menuOpen}
                            aria-controls="mobile-nav"
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                            className="inline-flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink md:hidden"
                        >
                            {menuOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {menuOpen ? (
                    <nav
                        id="mobile-nav"
                        aria-label="Main"
                        className="border-t border-line bg-white px-4 pb-6 pt-3 sm:px-8 md:hidden shadow-lg animate-slide-up"
                    >
                        <ul className="flex flex-col">
                            {[...NAV_LINKS, { href: '/login', label: 'Log in' }].map(({ href, label }) => (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        onClick={() => setMenuOpen(false)}
                                        className="block border-b border-line py-3.5 text-[16px] font-semibold text-ink transition-colors hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 pt-3">
                            <CtaLink href="/signup" onClick={() => setMenuOpen(false)} className="w-full min-h-12 justify-center text-base">
                                Get started free
                            </CtaLink>
                        </div>
                    </nav>
                ) : null}
            </header>
        </>
    );
}
