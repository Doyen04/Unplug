import Link from 'next/link';

/**
 * Only real, resolvable routes are linked here — a footer full of 404s is worse
 * for crawlers than a shorter footer. Terms/Privacy/About go back in as soon as
 * those pages exist.
 */
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
    return (
        <footer className="border-t border-line bg-cream">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
                    <div>
                        <p className="text-[20px] font-semibold tracking-tight text-ink">Unplug.</p>
                        <p className="mt-3 max-w-xs text-[15px] leading-7 text-ink-70">
                            One card per subscription — Naira or dollar. Freeze it and the charge can&apos;t go through.
                        </p>
                        <a
                            href="mailto:support@unplug.app"
                            className="mt-5 inline-block text-[15px] text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                        >
                            support@unplug.app
                        </a>
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
                                            className="rounded transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
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
                    <p>Cards issued via licensed partners.</p>
                </div>
            </div>
        </footer>
    );
}