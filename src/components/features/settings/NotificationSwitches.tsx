'use client';

import { useEffect, useState } from 'react';
import { fetchUserSettings, updateUserSetting } from '@/lib/client/dashboard-api';

interface SettingState {
    new_subscriptions_alerts: boolean;
    monthly_summary: boolean;
    price_increase_alert: boolean;
}

export const NotificationSwitches = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, setIsPending] = useState(false);
    const [settings, setSettings] = useState<SettingState>({
        new_subscriptions_alerts: true,
        monthly_summary: true,
        price_increase_alert: false,
    });

    // Fetch settings on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await fetchUserSettings();
                setSettings(data);
            } catch (error) {
                console.error('Failed to load settings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, []);

    const handleToggle = async (key: keyof SettingState) => {
        const newValue = !settings[key];
        setSettings(prev => ({ ...prev, [key]: newValue }));
        setIsPending(true);

        try {
            const updated = await updateUserSetting(key, newValue);
            setSettings(updated);
        } catch (error) {
            console.error('Failed to update setting:', error);
            // Revert on error
            setSettings(prev => ({ ...prev, [key]: !newValue }));
        } finally {
            setIsPending(false);
        }
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

    if (isLoading) {
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
            {switches.map((sw) => {
                const isOn = settings[sw.id];
                return (
                    <label
                        key={sw.id}
                        className={`flex items-center justify-between gap-4 cursor-pointer p-4 transition-colors border border-transparent ${isPending ? 'opacity-80 pointer-events-none' : ''}`}
                    >
                        <div>
                            <p className="text-sm font-bold text-text-primary">{sw.title}</p>
                            <p className="text-xs text-text-secondary mt-1 leading-relaxed">{sw.description}</p>
                        </div>

                        <button
                            type="button"
                            role="switch"
                            aria-checked={isOn}
                            onClick={() => handleToggle(sw.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full shrink-0 border transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand ${isOn ? 'bg-success border-success' : 'bg-bg-muted border-border'
                                }`}
                            disabled={isPending}
                        >
                            <span className="sr-only">Enable {sw.title}</span>
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ease-in-out shadow-sm ${isOn ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </label>
                );
            })}
        </>
    );
};
