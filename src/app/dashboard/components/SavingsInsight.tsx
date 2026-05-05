import { AlertTriangle, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/format';

interface SavingsInsightProps {
  unusedCount: number;
  saveablePerYear: number;
  currency: string;
  onFilterUnused: () => void;
}

export function SavingsInsight({
  unusedCount,
  saveablePerYear,
  currency,
  onFilterUnused,
}: SavingsInsightProps) {
  return (
    <div className="col-span-1 grid h-full gap-4 lg:grid-rows-2">
      {/* Unused Subs */}
      <Card className="group flex h-full flex-col justify-between p-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-base text-text-primary ring-1 ring-border transition-colors group-hover:bg-text-primary group-hover:text-white">
              <AlertTriangle size={16} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-secondary">Unused</p>
          </div>
          <p className="mt-3 font-ui text-4xl font-bold tabular-nums leading-none text-text-primary">{unusedCount}</p>
          {unusedCount === 0 ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-text-secondary">
              <Check size={14} /> You're clean
            </p>
          ) : (
            <p className="mt-2 text-sm text-text-secondary max-w-xs">
              subscriptions you haven't used proactively in 30+ days.
            </p>
          )}
        </div>
        <Link
          href="#subscriptions"
          onClick={onFilterUnused}
          className="mt-3 flex w-max items-center rounded-lg bg-transparent px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-brand transition-colors hover:bg-brand-light hover:text-brand-dark hover:underline hover:underline-offset-4 -ml-3"
        >
          Review unused <ArrowRight size={14} className="ml-1.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </Card>

      {/* Potential Savings */}
      <Card className="group flex h-full flex-col justify-between border-brand-light bg-brand-light/20 p-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-danger">You could save</p>
          <p className="mt-3 font-ui text-3xl font-bold tabular-nums text-danger">{formatCurrency(saveablePerYear, currency)}</p>
          <p className="mt-1.5 text-xs text-danger/80 font-medium">
            {saveablePerYear === 0 ? 'Nothing to cut right now' : 'by cutting unused subs'}
          </p>
        </div>
        <Button
          variant="dangerOutline"
          onClick={onFilterUnused}
          className="mt-3 h-11.5 w-full"
        >
          See what to cut
        </Button>
      </Card>
    </div>
  );
}
