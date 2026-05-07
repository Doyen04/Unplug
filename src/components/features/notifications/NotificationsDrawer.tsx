'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, Bell } from 'lucide-react';
import type { DashboardAlert } from '@/types/subscription';

interface NotificationsDrawerProps {
    isOpen: boolean;
    alerts: DashboardAlert[];
    onClose: () => void;
}

export function NotificationsDrawer({ isOpen, alerts, onClose }: NotificationsDrawerProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-60 bg-black/20 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-70 w-full max-w-sm border-l border-border bg-bg-surface shadow-2xl"
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
}
