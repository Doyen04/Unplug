'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Search, X, CheckCircle } from 'lucide-react';
import { toSentenceCase } from '@/lib/utils/format';
import { useState } from 'react';

interface CancellationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: () => void | Promise<void>;
  serviceName: string;
}

export const CancellationGuideModal = ({
  isOpen,
  onClose,
  onConfirmCancel,
  serviceName,
}: CancellationGuideModalProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  // Helper to generate a Google search URL for how to cancel
  const searchUrl = `https://www.google.com/search?q=how+to+cancel+${encodeURIComponent(serviceName)}+subscription`;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirmCancel();
    } finally {
      setIsConfirming(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-10 pb-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1A1A17]/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative z-50 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-[#E8E7E0]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="flex items-center justify-between border-b border-[#E8E7E0] px-5 py-4 bg-[#FAFAF7]">
              <h2 id="modal-title" className="text-lg font-bold text-[#1A1A17]">Cancel {toSentenceCase(serviceName)}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-[#A9A79E] transition-colors hover:bg-[#E8E7E0] hover:text-[#1A1A17]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm text-[#6B6960] mb-5 leading-relaxed">
                Because bank connections are read-only to protect your security, Unplug cannot automatically stop payments on your behalf.
                You must cancel the subscription directly with <strong className="text-[#1A1A17]">{serviceName}</strong>.
              </p>

              <div className="mb-6 rounded-xl border border-[#D0CFC7] bg-[#FAFAF7] p-4 text-sm flex gap-3">
                <Search size={18} className="text-[#A9A79E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1A1A17] mb-1">Find Cancellation Instructions</p>
                  <p className="text-[#6B6960] mb-2 text-xs">Search for the exact steps to cancel your account.</p>
                  <a
                    href={searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.05em] text-[#FF5C35] hover:text-[#C93A1A]"
                  >
                    Search Google <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <div className="border-t border-[#E8E7E0] pt-4">
                <p className="text-sm font-semibold text-[#1A1A17] mb-3">Did you successfully cancel?</p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleConfirm()}
                    disabled={isConfirming}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#E53434] px-4 py-2.5 text-sm font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-[#C93A1A] disabled:opacity-50"
                  >
                    {isConfirming ? (
                      <span className="animate-pulse">Marking...</span>
                    ) : (
                      <>
                        <CheckCircle size={16} /> Yes, mark as cancelled
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full rounded-xl border border-[#D0CFC7] bg-white px-4 py-2.5 text-sm font-semibold text-[#6B6960] transition-colors hover:bg-[#F4F3EE] hover:text-[#1A1A17]"
                  >
                    Not yet, remind me later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
