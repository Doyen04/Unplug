import Link from 'next/link';
import { Settings } from 'lucide-react';

import { formatCurrency } from '@/lib/utils/format';

interface DashboardSidebarProps {
  monthlySpend: number;
}

export const DashboardSidebar = ({ monthlySpend }: DashboardSidebarProps) => (
  <aside className="flex h-full min-h-0 flex-col rounded-2xl border border-border bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
    <div className="flex items-center justify-between gap-3">
      <Link href="/" className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-brand">
        Unplug
      </Link>

      <Link
        href="/dashboard/settings"
        aria-label="Profile and account settings"
        className="inline-flex items-center justify-center rounded-[10px] border border-[#D0CFC7] p-2 text-text-secondary hover:border-text-primary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-brand"
      >
        <Settings size={14} />
      </Link>
    </div>

    <Link
      href="/dashboard/connect"
      className="mt-4 rounded-[10px] border border-brand bg-brand px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-white hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-brand"
    >
      Connect Accounts
    </Link>

    <nav className="mt-8 space-y-3 text-sm text-text-primary">
      <Link href="/dashboard" className="block text-brand hover:text-brand-dark focus-visible:outline-2 focus-visible:outline-brand">
        Dashboard
      </Link>
      <Link href="/dashboard#subscriptions" className="block hover:text-text-primary focus-visible:outline-2 focus-visible:outline-brand">
        Subscriptions
      </Link>
      <Link href="/dashboard#alerts" className="block hover:text-text-primary focus-visible:outline-2 focus-visible:outline-brand">
        Alerts
      </Link>
      <Link href="/dashboard#debrief" className="block hover:text-text-primary focus-visible:outline-2 focus-visible:outline-brand">
        Debrief
      </Link>
      <Link href="/dashboard/settings" className="block hover:text-text-primary focus-visible:outline-2 focus-visible:outline-brand">
        Profile & Settings
      </Link>
      <Link href="/logout" className="block text-text-secondary hover:text-danger focus-visible:outline-2 focus-visible:outline-brand">
        Log out
      </Link>
    </nav>

    <div className="mt-auto border-t border-border pt-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">Burning / month</p>
      <p className="mt-2 font-display text-3xl text-danger sm:text-4xl">{formatCurrency(monthlySpend)}</p>
    </div>
  </aside>
);
