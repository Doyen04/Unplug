import type { ReactNode } from 'react';

export function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: ReactNode; description?: ReactNode }) {
  return (
    <div className="max-w-3xl">
      <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-70">{eyebrow}</p>
      <h2 className="mt-3 font-display text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-tight text-ink">{title}</h2>
      {description ? <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-70">{description}</p> : null}
    </div>
  );
}
