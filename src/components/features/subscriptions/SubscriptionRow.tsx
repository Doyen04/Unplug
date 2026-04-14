import { motion } from 'framer-motion';

import { CancelButton } from './CancelButton';
import { formatCurrencyPrecise } from '../../../lib/utils/format';
import type { Subscription } from '../../../types/subscription';

interface SubscriptionRowProps {
  subscription: Subscription;
  onCancel: (id: string) => void | Promise<void>;
  index: number;
  showAlerts?: boolean;
}

const avatarStyleByInitial: Record<string, string> = {
  A: 'bg-[#F5E6C8] text-[#7A4E12]',
  C: 'bg-[#D4E8D0] text-[#2F5A2D]',
  U: 'bg-[#F5D5C8] text-[#8A3E2B]',
  N: 'bg-[#E8E4DC] text-[#3B3934]',
};

const fallbackAvatarStyle = 'bg-[#E8E4DC] text-[#3B3934]';

const getAvatarClass = (name: string) => {
  const initial = name.trim().charAt(0).toUpperCase();
  return avatarStyleByInitial[initial] ?? fallbackAvatarStyle;
};

const toSentenceCase = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return '';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const SubscriptionRow = ({
  subscription,
  onCancel,
  index,
  showAlerts = true,
}: SubscriptionRowProps) => {
  const hasAlert = Boolean(showAlerts && subscription.alert);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: subscription.status === 'cancelled' ? 0.5 : 1,
        x: subscription.status === 'cancelled' ? 8 : 0,
        y: 0,
      }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1], delay: index * 0.03 }}
      layout
      className={`flex flex-col gap-3 rounded-2xl border border-[#E8E7E0] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] transition-colors hover:bg-[#FAFAF7] sm:flex-row sm:items-center ${subscription.status === 'cancelled' ? 'opacity-60' : ''} ${hasAlert ? 'border-l-[3px] border-l-[#E8860A]' : ''} ${subscription.status === 'unused' ? 'alert-pulse-border' : ''}`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-xs font-semibold uppercase ${getAvatarClass(subscription.serviceName)}`}>
        {subscription.serviceName.slice(0, 1)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-[#1A1A17]">{subscription.serviceName}</p>
        <p className="mt-1 text-[12px] font-medium text-[#57554D]">
          Confidence: {subscription.confidence.toUpperCase()} · Verdict: {subscription.verdict.replace('_', ' ')}
        </p>
        {hasAlert ? (
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex h-5 items-center gap-1 rounded-full bg-[#FEF6EC] px-2 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#E8860A]">
              <span aria-hidden="true">⚠</span>
              ALERT
            </span>
            <span className="text-[12px] text-[#6B6960]">{toSentenceCase(subscription.alert!.message)}</span>
          </div>
        ) : null}
      </div>

      <div className="w-full text-left sm:w-auto sm:text-right">
        <p className="font-display text-[15px] text-[#1A1A17]">{formatCurrencyPrecise(subscription.amountMonthly)}</p>
        <p className="text-xs uppercase tracking-[0.06em] text-[#A9A79E]">{subscription.frequencyLabel}</p>
      </div>

      <div className="w-full sm:w-auto">
        <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
          {!hasAlert && subscription.status !== 'cancelled' ? (
            <button
              type="button"
              className="h-10 min-w-18 rounded-lg border border-[#D0CFC7] px-3 text-xs font-medium text-[#6B6960] transition-colors hover:bg-[#F4F3EE] hover:text-[#1A1A17]"
            >
              Keep
            </button>
          ) : null}
          <CancelButton
            subscriptionId={subscription.id}
            serviceName={subscription.serviceName}
            onSuccess={() => onCancel(subscription.id)}
            disabled={subscription.status === 'cancelled'}
          />
        </div>
      </div>
    </motion.article>
  );
};
