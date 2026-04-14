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
      className="h-10 min-w-20 w-full rounded-lg border-[1.5px] border-[#E53434] bg-white px-3 py-2 text-center text-[12px] font-medium uppercase tracking-[0.04em] text-[#E53434] transition-all duration-150 ease-in-out hover:bg-[#E53434] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      disabled={disabled || isCancelling}
      onClick={() => setIsCancelling(true)}
      aria-label={`Cancel ${serviceName} subscription (${subscriptionId})`}
    >
      {isCancelling ? 'CANCELLING...' : 'CANCEL'}
    </button>
  );
};
