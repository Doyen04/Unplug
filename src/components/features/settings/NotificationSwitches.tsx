'use client';

import { useTransition, useState } from 'react';
import { toggleNotificationAction } from '../../../app/dashboard/settings/actions';

interface SettingState {
  new_subscriptions_alerts: boolean;
  monthly_summary: boolean;
  price_increase_alert: boolean;
}

export const NotificationSwitches = ({ initialSettings }: { initialSettings: SettingState }) => {
  const [isPending, startTransition] = useTransition();
  const [settings, setSettings] = useState<SettingState>(initialSettings);

  const handleToggle = (key: keyof SettingState) => {
    // Optimistic UI update
    const newValue = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newValue }));

    startTransition(async () => {
      const res = await toggleNotificationAction(key, newValue);
      if (!res.success) {
        // Revert on error
        setSettings(prev => ({ ...prev, [key]: !newValue }));
      }
    });
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

  return (
    <>
      {switches.map((sw) => {
        const isOn = settings[sw.id];
        return (
          <label 
            key={sw.id} 
            className={`flex items-center justify-between gap-4 cursor-pointer p-4 rounded-xl hover:bg-[#FAFAF7] transition-colors border border-transparent ${isPending ? 'opacity-80 pointer-events-none' : ''}`}
          >
            <div>
              <p className="text-sm font-bold text-[#1A1A17] hover:text-[#1A1A17]">{sw.title}</p>
              <p className="text-xs text-[#6B6960] mt-1.5 leading-relaxed">{sw.description}</p>
            </div>
            
            <button
               type="button"
               role="switch"
               aria-checked={isOn}
               onClick={() => handleToggle(sw.id)}
               className={`relative inline-flex h-6 w-11 items-center rounded-full shrink-0 border shadow-inner transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A1A17] ${
                  isOn ? 'bg-[#1C9E5B] border-[#1C9E5B]' : 'bg-[#E8E7E0] border-[#D0CFC7]'
               }`}
            >
              <span className="sr-only">Enable {sw.title}</span>
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ease-in-out shadow-sm ${
                   isOn ? 'translate-x-6' : 'translate-x-1'
                }`} 
              />
            </button>
          </label>
        );
      })}
    </>
  );
};
