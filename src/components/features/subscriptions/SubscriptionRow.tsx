import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppWindow, AlertTriangle } from 'lucide-react';

import { CancelButton } from './CancelButton';
import { CancellationGuideModal } from './CancellationGuideModal';
import { formatCurrencyPrecise, toSentenceCase } from '@/lib/utils/format';
import { getAvatarClass } from '@/lib/utils/avatar';
import type { Subscription } from '@/types/subscription';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

interface SubscriptionRowProps {
  subscription: Subscription;
  onCancel: (id: string) => void | Promise<void>;
  index: number;
  showAlerts?: boolean;
  currency?: string;
}

export const SubscriptionRow = ({
  subscription,
  onCancel,
  index,
  showAlerts = true,
  currency,
}: SubscriptionRowProps) => {
  const currencyCode = currency ?? 'USD';
  const hasAlert = Boolean(showAlerts && subscription.alert);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{
          opacity: subscription.status === 'cancelled' ? 0.5 : 1,
          x: subscription.status === 'cancelled' ? 8 : 0,
          y: 0,
        }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1], delay: index * 0.03 }}
        layout
      >
        <Card className={`flex flex-col gap-4 p-4 sm:flex-row sm:items-center ${subscription.status === 'cancelled' ? 'opacity-60' : ''
          } ${hasAlert ? 'border-l-4 border-l-warning' : ''} ${subscription.status === 'unused' ? 'alert-pulse-border' : ''
          }`}>
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-btn shadow-sm ${getAvatarClass(subscription.serviceName)}`}>
            <AppWindow size={20} aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-base font-bold text-text-primary">{subscription.serviceName}</p>
              <Badge variant={subscription.verdict === 'active' ? 'success' : (subscription.verdict === 'unused' || subscription.verdict === 'likely_unused') ? 'danger' : 'secondary'}>
                {subscription.verdict.replace('_', ' ')}
              </Badge>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-text-secondary uppercase tracking-wider">
              <span>Confidence: {subscription.confidence}</span>
              <span className="h-1 w-1 rounded-full bg-border" aria-hidden="true" />
              <span>{subscription.frequencyLabel}</span>
            </div>

            {hasAlert && (
              <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-warning-light/30 px-2 py-1.5 border border-warning/10">
                <AlertTriangle size={12} className="text-warning" />
                <span className="text-[11px] font-semibold text-warning uppercase tracking-tight">
                  {toSentenceCase(subscription.alert!.message)}
                </span>
              </div>
            )}
          </div>

          <div className="w-full text-left sm:w-auto sm:text-right tabular-nums">
            <p className="font-ui text-lg font-bold text-text-primary">
              {formatCurrencyPrecise(subscription.amountMonthly, currencyCode)}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-0.5">Monthly</p>
          </div>

          <div className="w-full sm:w-auto">
            <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
              {subscription.status !== 'cancelled' && subscription.verdict === 'active' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-4"
                >
                  Keep
                </Button>
              )}
              <CancelButton
                subscriptionId={subscription.id}
                serviceName={subscription.serviceName}
                onSuccess={() => setIsModalOpen(true)}
                disabled={subscription.status === 'cancelled'}
              />
            </div>
          </div>
        </Card>
      </motion.div>
      <CancellationGuideModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirmCancel={() => onCancel(subscription.id)}
        serviceName={subscription.serviceName}
      />
    </>
  );
};
