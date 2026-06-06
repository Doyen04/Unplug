'use client';

import { useEffect, useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { NotificationsDrawer } from '@/components/features/notifications/NotificationsDrawer';
import { Sidebar } from './DashboardSidebar';




export const DashboardLayoutShell = ({ children }: { children: React.ReactNode }) => {
    const [expanded, setExpanded] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isAlertsOpen, setIsAlertsOpen] = useState(false);
    const { alerts } = useDashboardData({ includeDebrief: false });

    return (

        <div className="flex h-screen overflow-hidden bg-bg-base text-text-primary">
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
                <div className="flex h-16 items-center justify-between border-b border-border bg-bg-base px-4 lg:hidden">
                    <button onClick={() => setIsMobileOpen(true)} className="p-2 text-text-secondary">
                        <Menu size={24} />
                    </button>
                    <span className="text-sm font-bold uppercase tracking-[0.08em] text-text-primary">
                        Unplug
                    </span>
                    <button
                        onClick={() => setIsAlertsOpen(true)}
                        className="relative p-2 text-text-secondary"
                    >
                        <Bell size={20} />
                        {alerts.length > 0 && (
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-brand ring-2 ring-bg-base" />
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
