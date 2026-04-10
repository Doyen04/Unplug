import { motion } from 'framer-motion';

import { AlertBadge } from '../alerts/AlertBadge';
import { CancelButton } from './CancelButton';
import { formatCurrencyPrecise } from '../../../lib/utils/format';
import type { Subscription } from '../../../types/subscription';

interface SubscriptionRowProps {
  subscription: Subscription;
  onCancel: (id: string) => void | Promise<void>;
  index: number;
  showAlerts?: boolean;
}

const BRAND_COLORS: Record<string, string> = {
  Netflix: '#E50914',
  Spotify: '#1DB954',
  Adobe: '#FF0000',
  Duolingo: '#58CC02',
  Headspace: '#F47D2B',
  'Disney+': '#113CCF',
  Amazon: '#FF9900',
  Apple: '#555555',
  YouTube: '#FF0000',
  Hulu: '#1CE783',
  Notion: '#000000',
  Figma: '#A259FF',
  Slack: '#4A154B',
  Zoom: '#2D8CFF',
  Dropbox: '#0061FE',
  GitHub: '#24292E',
  ChatGPT: '#10A37F',
  Grammarly: '#15C39A',
};

const getAvatarColor = (name: string): string => {
  const match = Object.keys(BRAND_COLORS).find(
    (key) => name.toLowerCase().includes(key.toLowerCase())
  );
  return match ? BRAND_COLORS[match] : '#6B6960';
};

const borderStatusClass: Record<Subscription['status'], string> = {
  unused: 'border-l-[3px] border-l-danger',
  'trial-ending': 'border-l-[3px] border-l-warning',
  'price-hike': 'border-l-[3px] border-l-warning',
  healthy: '',
  cancelled: 'bg-bg-muted opacity-60',
};

export const SubscriptionRow = ({
  subscription,
  onCancel,
  index,
  showAlerts = true,
}: SubscriptionRowProps) => {
  const avatarColor = getAvatarColor(subscription.serviceName);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{
        opacity: subscription.status === 'cancelled' ? 0.6 : 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
        ease: [0.34, 1.56, 0.64, 1],
        delay: index * 0.04,
      }}
      layout
      className={`flex items-center gap-3 rounded-card border border-border bg-white px-4 py-[18px] shadow-card transition-shadow duration-200 hover:shadow-card-hover ${borderStatusClass[subscription.status]}`}
      style={{ minHeight: '72px' }}
    >
      {/* Service avatar */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] font-display text-lg font-bold text-white"
        style={{ backgroundColor: avatarColor }}
      >
        {subscription.serviceName.charAt(0)}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-text-primary">
          {subscription.serviceName}
        </p>
        <p className="mt-0.5 text-[13px] text-text-muted">
          {subscription.frequencyLabel.charAt(0).toUpperCase() + subscription.frequencyLabel.slice(1)} ·{' '}
          Confidence: {subscription.confidence.charAt(0).toUpperCase() + subscription.confidence.slice(1)}
        </p>
        {showAlerts && subscription.alert && (
          <div className="mt-1.5">
            <AlertBadge type={subscription.alert.type} message={subscription.alert.message} />
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="shrink-0 text-right">
        <p className="font-display text-base font-bold text-text-primary">
          {formatCurrencyPrecise(subscription.amountMonthly)}
        </p>
        <p className="text-[11px] uppercase tracking-[0.06em] text-text-muted">
          {subscription.frequencyLabel === 'monthly' ? '/mo' : subscription.frequencyLabel === 'yearly' ? '/yr' : '/wk'}
        </p>
      </div>

      {/* Cancel button */}
      <div className="shrink-0">
        <CancelButton
          subscriptionId={subscription.id}
          serviceName={subscription.serviceName}
          onSuccess={() => onCancel(subscription.id)}
          disabled={subscription.status === 'cancelled'}
        />
      </div>
    </motion.article>
  );
};
