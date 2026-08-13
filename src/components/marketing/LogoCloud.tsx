'use client';

const partners = [
    { name: 'Mono', descriptor: 'Bank linking' },
    { name: 'Paystack', descriptor: 'Payments' },
    { name: 'Sudo Africa', descriptor: 'Virtual cards' },
    { name: 'Licensed & Regulated', descriptor: 'Partners' },
] as const;

export function LogoCloud() {
    /* Duplicate the list so the marquee loops seamlessly. */
    const items = [...partners, ...partners];

    return (
        <div className="border-y border-line bg-bg-surface">
            <div className="mx-auto max-w-7xl overflow-hidden fade-edge-x">
                <div className="marquee-track py-4">
                    {items.map((p, i) => (
                        <span
                            key={`${p.name}-${i}`}
                            className="inline-flex shrink-0 items-center gap-2 px-8 text-[14px] text-ink-70"
                        >
                            <span className="font-mono font-bold tracking-tight text-ink">{p.name}</span>
                            <span aria-hidden="true" className="text-line">·</span>
                            <span>{p.descriptor}</span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
