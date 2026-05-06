'use client';

import { useState, useEffect } from 'react';
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
    Zap,
    User,
    X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { useDashboardData } from '@/hooks/useDashboardData';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/subscriptions', label: 'Subscriptions', icon: List },
    { href: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
    { href: '/dashboard/connect', label: 'Linked Accounts', icon: LinkIcon },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const NotificationsDrawer = ({ isOpen, onClose, alerts }: { isOpen: boolean; onClose: () => void; alerts: any[] }) => (
    <AnimatePresence>
        {isOpen && (
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-y-0 right-0 z-[70] w-full max-w-sm border-l border-border bg-bg-surface shadow-2xl"
                >
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between border-b border-border p-4">
                            <h2 className="text-lg font-bold text-text-primary">Notifications</h2>
                            <button onClick={onClose} className="rounded-full p-2 hover:bg-bg-muted transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {alerts.length > 0 ? (
                                <div className="space-y-4">
                                    {alerts.map((alert, i) => (
                                        <div key={i} className="flex gap-3 rounded-xl border border-border bg-bg-base p-4 shadow-sm">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning-light/30 text-warning">
                                                <Bell size={18} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-text-primary uppercase tracking-tight">{alert.type?.replace(/_/g, ' ') || 'Alert'}</p>
                                                <p className="text-xs text-text-muted leading-relaxed">{alert.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-center text-text-muted space-y-2">
                                    <Bell size={32} className="opacity-20" />
                                    <p className="text-sm">No new notifications</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
);

interface SidebarProps {
    expanded: boolean;
    toggleExpanded: () => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
}

const Sidebar = ({ expanded, toggleExpanded, isMobileOpen, setIsMobileOpen }: SidebarProps) => {
    const pathname = usePathname();
    const [userName, setUserName] = useState('Account user');
    const [userEmail, setUserEmail] = useState('user@unplug.app');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/user', { cache: 'no-store' });
                if (!response.ok) return;

                const payload = (await response.json()) as { name?: string; email?: string };
                if (payload.name?.trim()) setUserName(payload.name.trim());
                if (payload.email?.trim()) setUserEmail(payload.email.trim());
            } catch {
                // no-op: keep fallback values
            }
        };

        void fetchUser();
    }, []);

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
                className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-bg-base transition-all duration-300 lg:static ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    } ${expanded ? 'w-60' : 'w-16'}`}
            >
                <div className={`flex h-20 items-center justify-between pb-3 pt-7 transition-all ${expanded ? 'px-4' : 'px-2'}`}>
                    {expanded ? (
                        <Link href="/" className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.08em] text-text-primary">
                            <Zap size={18} className="text-brand fill-brand" />
                            Unplug
                        </Link>
                    ) : (
                        <Link href="/" className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-text-primary shadow-lg shadow-brand/10 transition-transform hover:scale-105">
                            <Zap size={22} className="text-brand fill-brand" />
                        </Link>
                    )}

                    {expanded && (
                        <button
                            onClick={toggleExpanded}
                            className="hidden h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-muted hover:text-text-primary lg:flex"
                            aria-label="Collapse sidebar"
                        >
                            <ChevronLeft size={16} />
                        </button>
                    )}
                </div>
                
                {!expanded && (
                    <div className="flex justify-center py-2">
                        <button
                            onClick={toggleExpanded}
                            className="hidden h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-muted hover:text-text-primary lg:flex"
                            aria-label="Expand sidebar"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}

                <nav className="flex-1 space-y-1 overflow-y-auto py-2">
                    {NAV_ITEMS.map((item, index) => {
                        const isActive = item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname.startsWith(item.href);
                        const Icon = item.icon;

                        return (
                            <div key={item.href}>
                                {index === 3 ? <div className="mx-4 my-4 h-px bg-border" /> : null}
                                <Link
                                    href={item.href}
                                    className={`mx-2 flex items-center rounded-btn px-3 py-3 transition-colors ${isActive
                                        ? 'bg-brand-light text-brand'
                                        : 'text-text-secondary hover:bg-bg-muted hover:text-text-primary'
                                        } ${!expanded ? 'justify-center' : ''}`}
                                    onClick={() => setIsMobileOpen(false)}
                                >
                                    <Icon size={18} className={expanded ? 'mr-3 shrink-0' : 'shrink-0'} />
                                    {expanded && <span className="text-sm font-medium">{item.label}</span>}
                                </Link>
                            </div>
                        );
                    })}
                </nav>

                <div className="border-t border-border p-4 space-y-4">
                    <div className={`flex items-center gap-3 py-2 ${!expanded ? 'justify-center' : ''}`}>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-muted text-text-secondary ring-1 ring-border shadow-sm transition-colors group-hover:bg-text-primary group-hover:text-white">
                            <User size={18} />
                        </div>
                        {expanded ? (
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold capitalize text-text-primary leading-tight">{userName}</p>
                                <p className="truncate text-[11px] font-medium text-text-muted mt-0.5">{userEmail}</p>
                            </div>
                        ) : null}
                    </div>

                    <Link
                        href="/logout"
                        className={`flex items-center rounded-btn px-2 py-2 text-text-secondary transition-colors hover:bg-bg-muted hover:text-danger ${!expanded ? 'justify-center' : ''
                            }`}
                    >
                        <LogOut size={18} className={expanded ? 'mr-3 shrink-0' : 'shrink-0'} />
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
    const [isAlertsOpen, setIsAlertsOpen] = useState(false);
    const { alerts } = useDashboardData({ includeDebrief: false });

    return (
        <div className="flex h-screen overflow-hidden bg-white text-[#1A1A17]">
            <Sidebar
                expanded={expanded}
                toggleExpanded={() => setExpanded(!expanded)}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />

            <NotificationsDrawer 
                isOpen={isAlertsOpen} 
                onClose={() => setIsAlertsOpen(false)} 
                alerts={alerts} 
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
                    <button 
                        onClick={() => setIsAlertsOpen(true)} 
                        className="relative p-2 text-[#6B6960]"
                    >
                        <Bell size={20} />
                        {alerts.length > 0 && (
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-brand ring-2 ring-[#FAFAF7]" />
                        )}
                    </button>
                </div>

                <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};
