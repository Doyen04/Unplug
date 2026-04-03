interface StatCardProps {
  label: string;
  value: string;
  variant?: 'default' | 'danger' | 'success';
  delta?: string;
}

const variantClassMap: Record<NonNullable<StatCardProps['variant']>, string> = {
  default: 'text-stone-100',
  danger: 'text-red-500',
  success: 'text-acid-green',
};

export const StatCard = ({
  label,
  value,
  variant = 'default',
  delta,
}: StatCardProps) => (
  <article className="border border-stone-800 bg-stone-900 p-6">
    <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">{label}</p>
    <p className={`mt-2 font-display text-4xl leading-none ${variantClassMap[variant]}`}>
      {value}
    </p>
    {delta ? <p className="mt-1 text-xs text-stone-400">{delta}</p> : null}
  </article>
);
