'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

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
  const [state, setState] = useState<'idle' | 'cancelling' | 'done'>('idle');

  useEffect(() => {
    if (state !== 'cancelling') return;

    const timeoutId = setTimeout(async () => {
      // Fire confetti celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#1C9E5B', '#EDFAF3', '#FF5C35'],
      });

      setState('done');
      await onSuccess();
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [state, onSuccess]);

  if (state === 'done' || disabled) {
    return (
      <span className="inline-flex items-center gap-1 rounded-btn px-3 py-2 text-[13px] font-semibold text-success">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
          <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Cancelled
      </span>
    );
  }

  return (
    <button
      type="button"
      className="w-full rounded-btn border border-transparent bg-danger-light px-3 py-2 text-[13px] font-semibold text-danger transition-all duration-150 hover:border-danger sm:w-auto"
      onClick={() => setState('cancelling')}
      aria-label={`Cancel ${serviceName} subscription (${subscriptionId})`}
    >
      {state === 'cancelling' ? (
        <span className="inline-flex items-center gap-1.5">
          <svg className="h-3 w-3 animate-spin" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="8" strokeLinecap="round" />
          </svg>
          Cancelling...
        </span>
      ) : (
        'Cancel'
      )}
    </button>
  );
};
