'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    List,
    Receipt,
    Link as LinkIcon,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Bell,
    Menu,
} from 'lucide-react';

interface SidebarProps {
    expanded: boolean;
    toggleExpanded: () => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
}

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/subscriptions', label: 'Subscriptions', icon: List },
    { href: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
    { href: '/dashboard/connect', label: 'Linked Accounts', icon: LinkIcon },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ expanded, toggleExpanded, isMobileOpen, setIsMobileOpen }: SidebarProps) => {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#E8E7E0] bg-[#FAFAF7] transition-all duration-300 lg:static ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    } ${expanded ? 'w-60' : 'w-16'}`}
            >
                <div className="flex h-16 items-center justify-between px-4">
                    {expanded ? (
                        <Link href="/" className="text-sm font-bold uppercase tracking-[0.08em] text-[#1A1A17]">
                            Unplug
                        </Link>
                    ) : (
                        <Link href="/" className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#1A1A17] text-xs font-bold text-white">
                            U
                        </Link>
                    )}

                    <button
                        onClick={toggleExpanded}
                        className="hidden rounded-full p-1 hover:bg-[#E8E7E0] lg:block"
                    >
                        {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto p-2">
                    {NAV_ITEMS.map((item) => {
                        const isActive = item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname.startsWith(item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center rounded-xl p-2.5 transition-colors ${isActive
                                    ? 'bg-[#FFE8E2] text-[#FF5C35]'
                                    : 'text-[#6B6960] hover:bg-[#E8E7E0] hover:text-[#1A1A17]'
                                    } ${!expanded ? 'justify-center' : ''}`}
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <Icon size={20} className={expanded ? 'mr-3 shrink-0' : 'shrink-0'} />
                                {expanded && <span className="text-sm font-medium">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-[#E8E7E0] p-4">
                    <Link
                        href="/logout"
                        className={`flex items-center text-[#6B6960] hover:text-[#E53434] transition-colors ${!expanded ? 'justify-center' : ''
                            }`}
                    >
                        <LogOut size={20} className={expanded ? 'mr-3 shrink-0' : 'shrink-0'} />
                        {expanded && <span className="text-sm font-medium">Log out</span>}
                    </Link>
                </div>
            </aside>
        </>
    );
};

export const DashboardLayoutShell = ({ children }: { children: React.ReactNode }) => {
    const [expanded, setExpanded] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-white text-[#1A1A17]">
            <Sidebar
                expanded={expanded}
                toggleExpanded={() => setExpanded(!expanded)}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />

            <main className="flex-1 overflow-y-auto">
                {/* Mobile Header */}
                <div className="flex h-16 items-center justify-between border-b border-[#E8E7E0] bg-[#FAFAF7] px-4 lg:hidden">
                    <button onClick={() => setIsMobileOpen(true)} className="p-2 text-[#6B6960]">
                        <Menu size={24} />
                    </button>
                    <span className="text-sm font-bold uppercase tracking-[0.08em] text-[#1A1A17]">
                        Unplug
                    </span>
                    <div className="flex items-center gap-4">
                        <Bell size={20} className="text-[#6B6960]" />
                        <div className="h-8 w-8 rounded-full bg-[#E8E7E0]" />
                    </div>
                </div>

                <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};
