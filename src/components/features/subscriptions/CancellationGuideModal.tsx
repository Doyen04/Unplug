"use client";

import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    ExternalLink,
    Search,
    X,
    CheckCircle,
    Loader2,
    Sparkles,
    AlertCircle,
} from "lucide-react";
import { toSentenceCase } from "@/lib/utils/format";
import { useState, useEffect } from "react";

interface CancellationGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmCancel: () => void | Promise<void>;
    serviceName: string;
}

interface AIInstructions {
    normalizedServiceName: string;
    difficulty: "easy" | "medium" | "hard";
    estimatedTimeMinutes: number;
    steps: string[];
    directLink: string;
}

export const CancellationGuideModal = ({
    isOpen,
    onClose,
    onConfirmCancel,
    serviceName,
}: CancellationGuideModalProps) => {
    const [isConfirming, setIsConfirming] = useState(false);
    const [isLoadingInstructions, setIsLoadingInstructions] = useState(true);
    const [instructions, setInstructions] = useState<AIInstructions | null>(
        null,
    );
    const [error, setError] = useState<string | null>(null);

    // Helper to generate a Google search URL for how to cancel (as fallback)
    const searchUrl = `https://www.google.com/search?q=how+to+cancel+${encodeURIComponent(serviceName)}+subscription`;

    useEffect(() => {
        if (!isOpen) {
            setInstructions(null);
            setError(null);
            return;
        }

        const loadInstructions = async () => {
            setIsLoadingInstructions(true);
            setError(null);
            try {
                const response = await fetch(
                    `/api/subscriptions/cancel-instructions?serviceName=${encodeURIComponent(serviceName)}`,
                );
                if (!response.ok) {
                    throw new Error("Failed to load cancellation steps");
                }
                const data = await response.json();
                setInstructions(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Something went wrong");
                toast.error("Could not load cancellation guide.");
            } finally {
                setIsLoadingInstructions(false);
            }
        };

        loadInstructions();
    }, [isOpen, serviceName]);

    const handleConfirm = async () => {
        setIsConfirming(true);
        try {
            await onConfirmCancel();
        } finally {
            setIsConfirming(false);
            onClose();
        }
    };

    const handleClose = () => {
        if (isConfirming) return; // Prevent closing while confirming
        onClose();
    };

    const getDifficultyColor = (diff: AIInstructions["difficulty"]) => {
        switch (diff) {
            case "easy":
                return "bg-success-light text-success ring-success/20";
            case "medium":
                return "bg-warning-light text-warning ring-warning/20";
            case "hard":
                return "bg-danger-light text-danger ring-danger/20";
            default:
                return "bg-bg-muted text-text-secondary ring-border";
        }
    };

    const displayServiceName =
        instructions?.normalizedServiceName || toSentenceCase(serviceName);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-10 pb-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-[#1A1A17]/40 backdrop-blur-sm"
                        aria-hidden="true"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative z-50 w-full max-w-md overflow-hidden rounded-2xl bg-white ring-1 ring-[#E8E7E0]"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                    >
                        {/* Loading overlay */}
                        <AnimatePresence>
                            {isConfirming && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-25 bg-white/80 backdrop-blur-[2px] flex items-center justify-center"
                                >
                                    <div className="flex flex-col items-center gap-3 animate-pulse">
                                        <Loader2
                                            size={28}
                                            className="animate-spin text-[#E53434]"
                                        />
                                        <p className="text-sm font-bold text-[#E53434] uppercase tracking-widest">
                                            Marking as cancelled...
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center justify-between border-b border-[#E8E7E0] px-5 py-4 bg-[#FAFAF7]">
                            <h2
                                id="modal-title"
                                className="text-lg font-bold text-[#1A1A17] flex items-center gap-2"
                            >
                                <span>Cancel {displayServiceName}</span>
                            </h2>
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isConfirming}
                                className="rounded-full p-1.5 text-[#A9A79E] transition-colors hover:bg-[#E8E7E0] hover:text-[#1A1A17] disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 max-h-[75vh] overflow-y-auto">
                            <p className="text-sm text-[#6B6960] mb-5 leading-relaxed">
                                Because bank connections are read-only to
                                protect your security, Unplug cannot
                                automatically stop payments on your behalf. You
                                must cancel the subscription directly with{" "}
                                <strong className="text-[#1A1A17]">
                                    {displayServiceName}
                                </strong>
                                .
                            </p>

                            {/* dynamic AI instructions layout */}
                            {isLoadingInstructions ? (
                                <div className="mb-6 rounded-xl border border-[#E8E7E0] bg-[#FAFAF7] p-5 space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF5C35]">
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                        <span>
                                            AI Tailoring Instructions...
                                        </span>
                                    </div>
                                    <div className="h-4 bg-[#E8E7E0] rounded animate-pulse w-3/4"></div>
                                    <div className="h-3 bg-[#E8E7E0] rounded animate-pulse w-full"></div>
                                    <div className="h-3 bg-[#E8E7E0] rounded animate-pulse w-5/6"></div>
                                </div>
                            ) : error ? (
                                /* Fallback to simple Google Search on error */
                                <div className="mb-6 rounded-xl border border-[#D0CFC7] bg-[#FAFAF7] p-4 text-sm">
                                    <div className="flex gap-3 mb-3 text-danger">
                                        <AlertCircle
                                            size={18}
                                            className="shrink-0 mt-0.5"
                                        />
                                        <div>
                                            <p className="font-semibold">
                                                Unable to fetch AI guide
                                            </p>
                                            <p className="text-xs text-[#6B6960]">
                                                Proceed with manual cancellation
                                                search.
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={searchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#D0CFC7] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.05em] text-[#FF5C35] hover:bg-[#F4F3EE]"
                                    >
                                        Search Google <ExternalLink size={12} />
                                    </a>
                                </div>
                            ) : instructions ? (
                                /* AI Instructions Loaded successfully */
                                <div className="mb-6 space-y-4">
                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-2">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ring-1 ring-inset ${getDifficultyColor(instructions.difficulty)}`}
                                        >
                                            {instructions.difficulty} difficulty
                                        </span>
                                        <span className="inline-flex items-center rounded-full bg-bg-muted px-2.5 py-0.5 text-xs font-semibold text-text-secondary ring-1 ring-inset ring-border">
                                            ~{instructions.estimatedTimeMinutes}{" "}
                                            min
                                            {instructions.estimatedTimeMinutes >
                                            1
                                                ? "s"
                                                : ""}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF5C35] ml-auto">
                                            <Sparkles size={12} /> AI Tailored
                                        </span>
                                    </div>

                                    {/* Steps */}
                                    <div className="rounded-xl border border-[#E8E7E0] bg-[#FAFAF7] p-4">
                                        <p className="font-semibold text-xs uppercase tracking-wider text-text-primary mb-3">
                                            Cancellation Steps
                                        </p>
                                        <ol className="list-decimal pl-5 space-y-2.5 text-sm text-[#6B6960]">
                                            {instructions.steps.map(
                                                (step, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="leading-relaxed pl-1"
                                                    >
                                                        {step}
                                                    </li>
                                                ),
                                            )}
                                        </ol>
                                    </div>

                                    {/* Direct Link / Google Link */}
                                    <div className="flex flex-col gap-2">
                                        {instructions.directLink ? (
                                            <a
                                                href={instructions.directLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF5C35] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.05em] text-white hover:bg-[#C93A1A] transition-colors"
                                            >
                                                Go to Cancellation Page{" "}
                                                <ExternalLink size={12} />
                                            </a>
                                        ) : null}

                                        <a
                                            href={searchUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#D0CFC7] bg-white px-4 py-2 text-xs font-semibold text-[#6B6960] hover:bg-[#F4F3EE] hover:text-[#1A1A17]"
                                        >
                                            <Search size={12} /> Search Google
                                            instead
                                        </a>
                                    </div>
                                </div>
                            ) : null}

                            <div className="border-t border-[#E8E7E0] pt-4">
                                <p className="text-sm font-semibold text-[#1A1A17] mb-3">
                                    Did you successfully cancel?
                                </p>
                                <div className="flex flex-col gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleConfirm()}
                                        disabled={isConfirming}
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#E53434] px-4 py-2.5 text-sm font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-[#C93A1A] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isConfirming ? (
                                            <>
                                                <Loader2
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                                <span className="animate-pulse">
                                                    Marking as cancelled...
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={16} /> Yes,
                                                mark as cancelled
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        disabled={isConfirming}
                                        className="w-full rounded-xl border border-[#D0CFC7] bg-white px-4 py-2.5 text-sm font-semibold text-[#6B6960] transition-colors hover:bg-[#F4F3EE] hover:text-[#1A1A17] disabled:opacity-30 disabled:cursor-not-allowed"
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
