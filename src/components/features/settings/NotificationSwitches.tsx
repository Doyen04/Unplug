'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { fetchUserSettings, updateUserSetting } from '@/lib/client/dashboard-api';
import { dashboardKeys } from '@/lib/query-keys';

interface SettingState {
    new_subscriptions_alerts: boolean;
    monthly_summary: boolean;
    price_increase_alert: boolean;
}

export const NotificationSwitches = () => {
    const queryClient = useQueryClient();

    const settingsQuery = useQuery({
        queryKey: dashboardKeys.userSettings(),
        queryFn: fetchUserSettings,
    });

    const toggleMutation = useMutation({
        mutationFn: ({ key, value }: { key: keyof SettingState; value: boolean }) =>
            updateUserSetting(key, value),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: dashboardKeys.userSettings() });
        },
    });

    const settings = settingsQuery.data ?? {
        new_subscriptions_alerts: true,
        monthly_summary: true,
        price_increase_alert: false,
    };

    const handleToggle = async (key: keyof SettingState) => {
        const newValue = !settings[key];
        await toggleMutation.mutateAsync({ key, value: newValue });
    };

    const switches = [
        {
            id: 'new_subscriptions_alerts',
            title: 'New Subscriptions Detected',
            description: 'Receive an email when we notice a new recurring charge.',
        },
        {
            id: 'monthly_summary',
            title: 'Monthly Unplug Summary',
            description: 'Get a monthly report of your burn rate and shame score.',
        },
        {
            id: 'price_increase_alert',
            title: 'Price Increase Alerts',
            description: 'Notify me when a subscription increases its price.',
        }
    ] as const;

    if (settingsQuery.isLoading) {
        return (
            <div className="space-y-4">
                {switches.map((sw) => (
                    <div key={sw.id} className={`flex items-center justify-between gap-4 cursor-pointer p-4 transition-colors border border-transparent animate-pulse`}>
                        <div className="space-y-2">
                            <div className="h-4 w-40 bg-bg-muted rounded"></div>
                            <div className="h-3 w-64 bg-bg-muted rounded"></div>
                        </div>
                        <div className="h-6 w-11 bg-bg-muted rounded-full"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            {settingsQuery.isError && (
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-light/20 p-4 text-sm text-text-secondary">
                    <AlertCircle size={16} className="mt-0.5 text-warning" />
                    <div className="space-y-2">
                        <p className="font-semibold text-text-primary">Could not load notification settings.</p>
                        <p className="text-xs leading-relaxed">You may be offline or the settings API is unavailable. Try again when the connection is restored.</p>
                        <button
                            type="button"
                            onClick={() => settingsQuery.refetch()}
                            className="inline-flex items-center rounded-full border border-border bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-text-primary hover:bg-bg-muted transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {switches.map((sw, idx) => {
                const isOn = settings[sw.id];
                return (
                    <div
                        key={sw.id}
                        className={`flex items-center justify-between gap-4 py-3.5 border-b border-[var(--color-border)] last:border-b-0 ${toggleMutation.isPending ? 'opacity-80 pointer-events-none' : ''}`}
                    >
                        <div>
                            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{sw.title}</p>
                            <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">{sw.description}</p>
                        </div>

                        <button
                            type="button"
                            role="switch"
                            aria-checked={isOn}
                            onClick={() => handleToggle(sw.id)}
                            className={`relative inline-flex h-[22px] w-10 shrink-0 items-center rounded-[var(--radius-pill)] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] ${isOn ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-border-strong)]'
                                }`}
                            disabled={toggleMutation.isPending}
                        >
                            <span className="sr-only">Enable {sw.title}</span>
                            <span
                                className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white transition duration-200 ease-in-out ${isOn ? 'translate-x-[20px]' : 'translate-x-[2px]'
                                    }`}
                            />
                        </button>
                    </div>
                );
            })}
        </>
    );
};
