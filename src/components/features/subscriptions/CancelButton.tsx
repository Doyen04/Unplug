'use client';

import { useEffect, useState } from 'react';

interface CancelButtonProps {
  subscriptionId: string;
  serviceName: string;
  onSuccess: () => void | Promise<void>;
  disabled?: boolean;
}

export const CancelButton = ({
  subscriptionId,
  serviceName,
  onSuccess,
  disabled = false,
}: CancelButtonProps) => {
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!isCancelling) return;

    const timeoutId = setTimeout(async () => {
      setIsCancelling(false);
      await onSuccess();
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [isCancelling, onSuccess]);

  return (
    <button
      type="button"
      className="h-10 min-w-20 w-full rounded-[10px] border border-[#D0CFC7] bg-[#FEF0F0] px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.06em] text-[#E53434] transition-colors hover:border-[#E53434] hover:bg-[#FDE7E7] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      disabled={disabled || isCancelling}
      onClick={() => setIsCancelling(true)}
      aria-label={`Cancel ${serviceName} subscription (${subscriptionId})`}
    >
      {isCancelling ? 'CANCELLING...' : 'CANCEL'}
    </button>
  );
};
