import { authClient } from "@/lib/auth-client";
import { ChevronLeft, ChevronRight, Home, LinkIcon, List, LogOut, Receipt, Settings, User, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";




const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/subscriptions', label: 'Subscriptions', icon: List },
    { href: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
    { href: '/dashboard/connect', label: 'Linked Accounts', icon: LinkIcon },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];


interface SidebarProps {
    expanded: boolean;
    toggleExpanded: () => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar = ({ expanded, toggleExpanded, isMobileOpen, setIsMobileOpen }: SidebarProps) => {
    const pathname = usePathname();
    const [userName, setUserName] = useState('Account user');
    const [userEmail, setUserEmail] = useState('user@unplug.app');
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();

    const signOutAction = async () => {
        await authClient.signOut({
            fetchOptions: { onSuccess: () => router.push('/login') },
        });
    };

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
            } finally {
                setIsLoading(false);
            }
        };

        void fetchUser();
    }, []);

    return (
        <>
            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-bg-surface/60 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                className={`text-text-primary fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-bg-base transition-all duration-300 lg:static ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
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
                    {isLoading ? (
                        <div className={`flex items-center gap-3 py-2 ${!expanded ? 'justify-center' : ''}`}>
                            <div className="h-9 w-9 shrink-0 rounded-full bg-bg-muted animate-pulse" />
                            {expanded && (
                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="h-4 w-24 bg-bg-muted rounded animate-pulse" />
                                    <div className="h-3 w-32 bg-bg-muted rounded animate-pulse" />
                                </div>
                            )}
                        </div>
                    ) : (
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
                    )}

                    <div
                        className={`flex items-center rounded-btn px-2 py-2 text-text-secondary transition-colors hover:bg-bg-muted hover:text-danger ${!expanded ? 'justify-center' : ''
                            }`}
                        onClick={() => signOutAction()}
                    >
                        <LogOut size={18} className={expanded ? 'mr-3 shrink-0' : 'shrink-0'} />
                        {expanded && <span className="text-sm font-medium">Log out</span>}
                    </div>
                </div>
            </aside>
        </>
    );
};