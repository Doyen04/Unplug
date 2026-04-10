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

const borderClassMap: Record<Subscription['status'], string> = {
  unused: 'border-l-4 border-l-[#E53434]',
  'trial-ending': 'border-l-4 border-l-[#E8860A]',
  'price-hike': 'border-l-4 border-l-[#E8860A]',
  healthy: 'border-l-4 border-l-transparent',
  cancelled: 'border-l-4 border-l-[#1C9E5B] opacity-60',
};

export const SubscriptionRow = ({
  subscription,
  onCancel,
  index,
  showAlerts = true,
}: SubscriptionRowProps) => (
  <motion.article
    initial={{ opacity: 0, y: 12 }}
    animate={{
      opacity: subscription.status === 'cancelled' ? 0.5 : 1,
      x: subscription.status === 'cancelled' ? 8 : 0,
      y: 0,
    }}
    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1], delay: index * 0.03 }}
    layout
    className={`flex flex-col gap-3 rounded-2xl border border-[#E8E7E0] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center ${borderClassMap[subscription.status]} ${subscription.status === 'unused' ? 'alert-pulse-border' : ''}`}
  >
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#6B6960] text-xs font-semibold uppercase text-white">
      {subscription.serviceName.slice(0, 1)}
    </div>

    <div className="min-w-0 flex-1">
      <p className="truncate text-[15px] text-[#1A1A17]">{subscription.serviceName}</p>
      <p className="mt-1 text-xs text-[#6B6960]">
        Confidence: {subscription.confidence.toUpperCase()} · Verdict: {subscription.verdict.replace('_', ' ')}
      </p>
      {showAlerts && subscription.alert ? (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs font-medium text-[#E8860A]">ALERT</span>
          <AlertBadge type={subscription.alert.type} message={subscription.alert.message} />
        </div>
      ) : null}
    </div>

    <div className="w-full text-left sm:w-auto sm:text-right">
      <p className="font-display text-[15px] text-[#1A1A17]">{formatCurrencyPrecise(subscription.amountMonthly)}</p>
      <p className="text-xs uppercase tracking-[0.06em] text-[#A9A79E]">{subscription.frequencyLabel}</p>
    </div>

    <div className="w-full sm:w-auto">
      <CancelButton
        subscriptionId={subscription.id}
        serviceName={subscription.serviceName}
        onSuccess={() => onCancel(subscription.id)}
        disabled={subscription.status === 'cancelled'}
      />
    </div>
  </motion.article>
);
