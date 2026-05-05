import { TrendingUp, RefreshCcw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card } from '../../../components/ui/Card';
import { formatCurrency } from '../../../lib/utils/format';

interface SpendChartProps {
  monthlySpend: number;
  currency: string;
  previousPeriodSpend: number;
  currentPeriodSpend: number;
  spendDelta: number;
  spendDeltaPercent: number;
  chartData: any[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  onRetry: () => void;
}

export function SpendChart({
  monthlySpend,
  currency,
  previousPeriodSpend,
  currentPeriodSpend,
  spendDelta,
  spendDeltaPercent,
  chartData,
  isLoading,
  isError,
  isFetching,
  onRetry,
}: SpendChartProps) {
  return (
    <Card className="col-span-1 min-w-0 lg:col-span-2 group flex h-full flex-col justify-between p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-base text-text-primary ring-1 ring-border transition-colors group-hover:bg-text-primary group-hover:text-white">
            <TrendingUp size={16} />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">Monthly Spend</p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-bold text-text-primary">{formatCurrency(monthlySpend, currency)}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-text-muted">total this period</p>
          {previousPeriodSpend > 0 && currentPeriodSpend > 0 ? (
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-text-muted">
              vs {formatCurrency(previousPeriodSpend, currency)} prev
              {spendDelta >= 0 ? 
                <ArrowUpRight size={11} className="text-warning" /> : 
                <ArrowDownRight size={11} className="text-success" />
              }
              <span className={spendDelta >= 0 ? 'text-warning' : 'text-success'}>{Math.abs(spendDeltaPercent)}%</span>
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-text-muted">Need more history for trend.</p>
          )}
        </div>
      </div>
      <div className="mt-6">
        <div className="h-55 w-full min-w-0 sm:h-60 lg:h-65 transition-opacity">
          {isLoading ? (
            <div className="h-full animate-pulse rounded-xl bg-bg-muted" />
          ) : isError ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-danger/80">
              <p>Could not load trend.</p>
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-white px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-bg-muted"
              >
                <RefreshCcw size={12} className={isFetching ? 'animate-spin' : ''} />
                Retry
              </button>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-text-secondary">
              No transactions yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={160}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF5C35" stopOpacity={0.35} />
                    <stop offset="75%" stopColor="#FF5C35" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#FF5C35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <ReferenceLine y={0} stroke="#E8E7E0" strokeWidth={1} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  style={{ textTransform: 'uppercase' }}
                  tick={{ fill: '#A9A79E', fontSize: 10, fontWeight: 500 }}
                  dy={22}
                />
                <Tooltip
                  cursor={{ stroke: '#FFE0D6', strokeWidth: 2 }}
                  contentStyle={{ 
                    borderRadius: 'var(--radius-btn)', 
                    border: '1px solid var(--color-border)', 
                    boxShadow: 'none', 
                    fontSize: '12px', 
                    fontWeight: 600, 
                    color: 'var(--color-text-primary)' 
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value) || 0, currency), 'Spend']}
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="#FF5C35"
                  strokeWidth={3}
                  fill="url(#spendGradient)"
                  fillOpacity={1}
                  dot={{ r: 3, fill: '#FF5C35', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: '#FF5C35', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Card>
  );
}
