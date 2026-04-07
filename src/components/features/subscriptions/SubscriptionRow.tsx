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
  unused: 'border-l-4 border-red-500',
  'trial-ending': 'border-l-4 border-amber-500',
  'price-hike': 'border-l-4 border-amber-500',
  healthy: 'border-l-4 border-stone-700',
  cancelled: 'border-l-4 border-green-600 opacity-50',
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
    className={`flex flex-col gap-3 border border-stone-800 bg-stone-900 p-4 sm:flex-row sm:items-center ${borderClassMap[subscription.status]} ${subscription.status === 'unused' ? 'alert-pulse-border' : ''}`}
  >
    <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-stone-700 text-xs uppercase text-stone-300">
      {subscription.serviceName.slice(0, 1)}
    </div>

    <div className="min-w-0 flex-1">
      <p className="truncate text-[15px] text-stone-100">{subscription.serviceName}</p>
      <p className="mt-1 text-xs text-stone-500">
        Confidence: {subscription.confidence.toUpperCase()} · Verdict: {subscription.verdict.replace('_', ' ')}
      </p>
      {showAlerts && subscription.alert ? (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-amber-400">ALERT</span>
          <AlertBadge type={subscription.alert.type} message={subscription.alert.message} />
        </div>
      ) : null}
    </div>

    <div className="w-full text-left sm:w-auto sm:text-right">
      <p className="text-[15px] text-stone-100">{formatCurrencyPrecise(subscription.amountMonthly)}</p>
      <p className="text-xs uppercase tracking-[0.06em] text-stone-500">{subscription.frequencyLabel}</p>
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
