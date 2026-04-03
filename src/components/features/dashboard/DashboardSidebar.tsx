import { formatCurrency } from '../../../lib/utils/format';

interface DashboardSidebarProps {
  monthlySpend: number;
}

export const DashboardSidebar = ({ monthlySpend }: DashboardSidebarProps) => (
  <aside className="flex h-full min-h-130 flex-col border border-stone-800 bg-stone-900 p-5">
    <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Unplug</p>

    <nav className="mt-8 space-y-3 text-sm text-stone-300">
      <p className="text-acid-green">Dashboard</p>
      <p>Subscriptions</p>
      <p>Alerts</p>
      <p>Debrief</p>
    </nav>

    <div className="mt-auto border-t border-stone-800 pt-4">
      <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Burning / month</p>
      <p className="mt-2 font-display text-3xl text-red-500">{formatCurrency(monthlySpend)}</p>
    </div>
  </aside>
);
