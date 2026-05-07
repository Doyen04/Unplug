interface StatCardProps {
  label: string;
  value: string;
  variant?: 'default' | 'danger' | 'success';
  delta?: string;
}

const variantClassMap: Record<NonNullable<StatCardProps['variant']>, string> = {
  default: 'text-[#1A1A17]',
  danger: 'text-[#E53434]',
  success: 'text-[#1C9E5B]',
};

export const StatCard = ({
  label,
  value,
  variant = 'default',
  delta,
}: StatCardProps) => (
  <article className="rounded-2xl border border-border bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">{label}</p>
    <p className={`font-display mt-2 text-4xl leading-none ${variantClassMap[variant]}`}>
      {value}
    </p>
    {delta ? <p className="mt-1 text-xs text-text-secondary">{delta}</p> : null}
  </article>
);
