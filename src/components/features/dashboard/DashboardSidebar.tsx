import Link from 'next/link';
import { Settings, LayoutDashboard, CreditCard, Bell, FileText, LogOut, Plus } from 'lucide-react';

import { formatCurrency } from '../../../lib/utils/format';

interface DashboardSidebarProps {
  monthlySpend: number;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
  { href: '/dashboard#subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/dashboard#alerts', label: 'Alerts', icon: Bell },
  { href: '/dashboard#debrief', label: 'Debrief', icon: FileText },
];

export const DashboardSidebar = ({ monthlySpend }: DashboardSidebarProps) => (
  <aside className="flex h-full min-h-0 flex-col rounded-card border border-border bg-white p-5 shadow-card">
    {/* Header */}
    <div className="flex items-center justify-between gap-3">
      <Link
        href="/"
        className="font-display text-xl font-bold text-text-primary transition-colors hover:text-brand"
      >
        Unplug
      </Link>
      <Link
        href="/dashboard/settings"
        aria-label="Profile and account settings"
        className="inline-flex items-center justify-center rounded-btn border border-border p-2 text-text-secondary transition-all duration-150 hover:border-border-strong hover:text-text-primary"
      >
        <Settings size={14} />
      </Link>
    </div>

    {/* Connect CTA */}
    <Link
      href="/dashboard/connect"
      className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-btn bg-brand px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition-all duration-150 hover:bg-brand-dark hover:-translate-y-0.5"
    >
      <Plus size={12} />
      Connect Accounts
    </Link>

    {/* Navigation */}
    <nav className="mt-6 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-tag px-3 py-2 text-[13px] font-medium transition-colors ${
              item.active
                ? 'bg-brand-light text-brand'
                : 'text-text-secondary hover:bg-bg-muted hover:text-text-primary'
            }`}
          >
            <Icon size={15} />
            {item.label}
          </Link>
        );
      })}
    </nav>

    {/* Bottom section */}
    <div className="mt-auto space-y-3">
      <div className="rounded-tag border border-border bg-bg-muted p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
          Burning / month
        </p>
        <p className="mt-2 font-display text-3xl font-bold text-danger">
          {formatCurrency(monthlySpend)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/settings"
          className="flex-1 rounded-tag px-3 py-2 text-center text-[11px] font-medium text-text-secondary transition-colors hover:bg-bg-muted hover:text-text-primary"
        >
          Settings
        </Link>
        <Link
          href="/logout"
          className="flex items-center gap-1.5 rounded-tag px-3 py-2 text-[11px] font-medium text-text-muted transition-colors hover:bg-danger-light hover:text-danger"
        >
          <LogOut size={12} />
          Log out
        </Link>
      </div>
    </div>
  </aside>
);
