import Link from 'next/link';
import { Settings } from 'lucide-react';

import { formatCurrency } from '../../../lib/utils/format';

interface DashboardSidebarProps {
  monthlySpend: number;
}

export const DashboardSidebar = ({ monthlySpend }: DashboardSidebarProps) => (
  <aside className="flex h-full min-h-0 flex-col rounded-2xl border border-[#E8E7E0] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
    <div className="flex items-center justify-between gap-3">
      <Link href="/" className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#6B6960] hover:text-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#FF5C35]">
        Unplug
      </Link>

      <Link
        href="/dashboard/settings"
        aria-label="Profile and account settings"
        className="inline-flex items-center justify-center rounded-[10px] border border-[#D0CFC7] p-2 text-[#6B6960] hover:border-[#1A1A17] hover:text-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
      >
        <Settings size={14} />
      </Link>
    </div>

    <Link
      href="/dashboard/connect"
      className="mt-4 rounded-[10px] border border-[#FF5C35] bg-[#FF5C35] px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#C93A1A] focus-visible:outline-2 focus-visible:outline-[#FF5C35]"
    >
      Connect Accounts
    </Link>

    <nav className="mt-8 space-y-3 text-sm text-[#1A1A17]">
      <Link href="/dashboard" className="block text-[#FF5C35] hover:text-[#C93A1A] focus-visible:outline-2 focus-visible:outline-[#FF5C35]">
        Dashboard
      </Link>
      <Link href="/dashboard#subscriptions" className="block hover:text-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#FF5C35]">
        Subscriptions
      </Link>
      <Link href="/dashboard#alerts" className="block hover:text-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#FF5C35]">
        Alerts
      </Link>
      <Link href="/dashboard#debrief" className="block hover:text-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#FF5C35]">
        Debrief
      </Link>
      <Link href="/dashboard/settings" className="block hover:text-[#1A1A17] focus-visible:outline-2 focus-visible:outline-[#FF5C35]">
        Profile & Settings
      </Link>
      <Link href="/logout" className="block text-[#6B6960] hover:text-[#E53434] focus-visible:outline-2 focus-visible:outline-[#FF5C35]">
        Log out
      </Link>
    </nav>

    <div className="mt-auto border-t border-[#E8E7E0] pt-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#A9A79E]">Burning / month</p>
      <p className="mt-2 font-display text-3xl text-[#E53434] sm:text-4xl">{formatCurrency(monthlySpend)}</p>
    </div>
  </aside>
);
