'use client';

import Link from 'next/link';
import { useState } from 'react';

const columns = [
    {
        heading: 'Product',
        links: [
            { href: '/#how-it-works', label: 'How it works' },
            { href: '/#dashboard', label: 'Product tour' },
            { href: '/pricing', label: 'Pricing' },
            { href: '/security', label: 'Security' },
        ],
    },
    {
        heading: 'Account',
        links: [
            { href: '/signup', label: 'Create an account' },
            { href: '/login', label: 'Log in' },
        ],
    },
] as const;

export function SiteFooter() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setSubmitted(true);
            setEmail('');
        }
    };

    return (
        <footer className="border-t-2 border-orange bg-white">
            <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-12">
                <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_0.8fr_0.8fr]">
                    <div className="space-y-4">
                        <p className="font-display text-[22px] font-bold tracking-tight text-ink">Unplug.</p>
                        <p className="max-w-xs text-[15px] leading-7 text-ink-70">
                            One card per subscription — Naira or dollar. Freeze it and the charge can&apos;t go through.
                        </p>
                        <a
                            href="mailto:support@unplug.app"
                            className="inline-block text-[15px] text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                        >
                            support@unplug.app
                        </a>
                    </div>

                    {/* Newsletter / Lead Generation Capture */}
                    <div className="space-y-3">
                        <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink">
                            Stay in control
                        </h2>
                        <p className="text-[14px] text-ink-70">
                            Get our monthly teardown of hidden subscription traps in Nigeria.
                        </p>
                        {submitted ? (
                            <p className="rounded-xl border border-success-light bg-success-light/50 p-3 text-xs font-semibold text-success">
                                ✓ You&apos;re on the list! We&apos;ll keep you posted.
                            </p>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl border border-line bg-bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink"
                                />
                                <button
                                    type="submit"
                                    className="rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold text-cream transition-colors hover:bg-orange hover:text-ink"
                                >
                                    Subscribe to debrief
                                </button>
                            </form>
                        )}
                    </div>

                    {columns.map((column) => (
                        <nav key={column.heading} aria-label={column.heading}>
                            <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink">
                                {column.heading}
                            </h2>
                            <ul role="list" className="mt-5 space-y-3.5 text-[15px] text-ink-70">
                                {column.links.map(({ href, label }) => (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            className="rounded transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                <div className="mt-12 flex flex-col gap-2 border-t border-line pt-7 text-[14px] text-ink-70 sm:flex-row sm:items-center sm:justify-between">
                    <p>© {new Date().getFullYear()} Unplug. All rights reserved.</p>
                    <p className="font-mono text-xs">Trusted by 2,400+ subscribers across Nigeria · Cards issued via licensed partners.</p>
                </div>
            </div>
        </footer>
    );
}