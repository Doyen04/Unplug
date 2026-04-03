import Link from 'next/link';

import { formatCurrency } from '../../../lib/utils/format';

interface DashboardSidebarProps {
  monthlySpend: number;
}

export const DashboardSidebar = ({ monthlySpend }: DashboardSidebarProps) => (
  <aside className="flex h-full min-h-0 flex-col border border-stone-800 bg-stone-900 p-5">
    <Link href="/" className="text-[11px] uppercase tracking-[0.08em] text-stone-400 hover:text-stone-100">
      Unplug
    </Link>

    <Link
      href="/dashboard/connect"
      className="mt-4 border border-acid-green bg-acid-green px-3 py-2 text-center text-[11px] uppercase tracking-[0.08em] text-stone-950 hover:bg-acid-dim"
    >
      Connect Accounts
    </Link>

    <nav className="mt-8 space-y-3 text-sm text-stone-200">
      <Link href="/dashboard" className="block text-acid-green hover:text-acid-dim">
        Dashboard
      </Link>
      <Link href="/dashboard#subscriptions" className="block hover:text-stone-100">
        Subscriptions
      </Link>
      <Link href="/dashboard#alerts" className="block hover:text-stone-100">
        Alerts
      </Link>
      <Link href="/dashboard#debrief" className="block hover:text-stone-100">
        Debrief
      </Link>
      <Link href="/logout" className="block text-stone-300 hover:text-red-400">
        Log out
      </Link>
    </nav>

    <div className="mt-auto border-t border-stone-800 pt-4">
      <p className="text-[11px] uppercase tracking-[0.08em] text-stone-500">Burning / month</p>
      <p className="mt-2 font-display text-2xl text-red-500 sm:text-3xl">{formatCurrency(monthlySpend)}</p>
    </div>
  </aside>
);
