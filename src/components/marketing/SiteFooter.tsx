import Link from 'next/link';

export function SiteFooter() {
    return (
        <footer className="border-t border-line bg-cream py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
                    <div>
                        <div className="text-[20px] font-semibold tracking-tight text-ink">Unplug.</div>
                        <p className="mt-3 max-w-sm text-sm leading-7 text-ink-70">One card per subscription.</p>
                        <p className="mt-4 text-sm text-ink-70">support@unplug.app</p>
                    </div>

                    <div>
                        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink">Product</p>
                        <ul className="mt-4 space-y-3 text-sm text-ink-70">
                            <li><Link className="transition-colors hover:text-ink" href="/#dashboard">Dashboard</Link></li>
                            <li><Link className="transition-colors hover:text-ink" href="/pricing">Pricing</Link></li>
                            <li><Link className="transition-colors hover:text-ink" href="/security">Security</Link></li>
                        </ul>
                    </div>

                    <div>
                        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink">Company</p>
                        <ul className="mt-4 space-y-3 text-sm text-ink-70">
                            <li><Link className="transition-colors hover:text-ink" href="/about">About</Link></li>
                            <li><a className="transition-colors hover:text-ink" href="mailto:hello@unplug.app">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink">Legal</p>
                        <ul className="mt-4 space-y-3 text-sm text-ink-70">
                            <li><Link className="transition-colors hover:text-ink" href="/terms">Terms</Link></li>
                            <li><Link className="transition-colors hover:text-ink" href="/privacy">Privacy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 border-t border-line pt-6 text-sm text-ink-70 sm:flex sm:items-center sm:justify-between">
                    <p>© {new Date().getFullYear()} Unplug. All rights reserved.</p>
                    <p className="mt-2 sm:mt-0">Built for recurring charges that should be easier to stop.</p>
                </div>
            </div>
        </footer>
    );
}
