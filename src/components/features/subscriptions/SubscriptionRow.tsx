import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Calendar, Ban } from 'lucide-react';

import { CancelButton } from './CancelButton';
import { CancellationGuideModal } from './CancellationGuideModal';
import { formatCurrencyPrecise } from '@/lib/utils/format';
import { getAvatarClass } from '@/lib/utils/avatar';
import { getServiceIcon } from '@/lib/utils/service-icons';
import type { Subscription } from '@/types/subscription';
import { Badge } from '@/components/ui/Badge';

interface SubscriptionRowProps {
    subscription: Subscription;
    onCancel: (id: string) => void | Promise<void>;
    index: number;
    showAlerts?: boolean;
    currency?: string;
    viewMode?: 'table' | 'list';
}

export const SubscriptionRow = ({
    subscription,
    onCancel,
    index,
    showAlerts = true,
    currency,
    viewMode,
}: SubscriptionRowProps) => {
    const currencyCode = currency ?? 'USD';
    const hasAlert = Boolean(showAlerts && subscription.alert);
    const isCancelled = subscription.status === 'cancelled';
    const [isModalOpen, setIsModalOpen] = useState(false);

    const verdictVariant = isCancelled
        ? 'secondary'
        : subscription.verdict === 'active'
            ? 'success'
            : subscription.verdict === 'unused' || subscription.verdict === 'likely_unused'
                ? 'danger'
                : 'secondary';

    const statusBadge = isCancelled ? (
        <Badge variant="secondary" className="flex items-center gap-1 shrink-0 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
            <Ban size={10} /> cancelled
        </Badge>
    ) : (
        <Badge variant={verdictVariant} className="shrink-0 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
            {subscription.verdict.replace('_', ' ')}
        </Badge>
    );

    const alertChip = hasAlert && !isCancelled &&
        !subscription.alert?.message.toLowerCase().includes(subscription.verdict.replace('_', ' ').toLowerCase()) && (
            <div className="inline-flex items-center gap-1 rounded-full bg-warning-light px-2 py-0.5 border border-warning/20">
                <AlertTriangle size={10} className="text-warning shrink-0" />
                <span className="text-[10px] font-bold text-warning uppercase tracking-tight">
                    {subscription.alert!.message}
                </span>
            </div>
        );

    const cancelAction = !isCancelled ? (
        <CancelButton
            subscriptionId={subscription.id}
            serviceName={subscription.serviceName}
            onSuccess={() => setIsModalOpen(true)}
            disabled={false}
        />
    ) : (
        <Badge variant="success" className="text-[9px] px-2.5 py-1 font-bold">
            <Ban size={10} className="mr-1" /> Saved
        </Badge>
    );

    const modalComponent = (
        <CancellationGuideModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirmCancel={() => onCancel(subscription.id)}
            serviceName={subscription.serviceName}
        />
    );

    // Desktop table row ONLY
    if (viewMode === 'table') {
        return (
            <>
                <motion.tr
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: isCancelled ? 0.55 : 1, y: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1], delay: index * 0.03 }}
                    className="group hover:bg-bg-muted/40 transition-colors"
                >
                    {/* Service */}
                    <td className="py-3.5 pl-6 pr-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getAvatarClass(subscription.serviceName)} ${isCancelled ? 'grayscale' : ''}`}>
                                {getServiceIcon(subscription.serviceName)}
                            </div>
                            <div className="min-w-0 space-y-0.5">
                                <p className={`truncate text-sm font-bold leading-tight ${isCancelled ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                                    {subscription.serviceName}
                                </p>
                                {alertChip}
                            </div>
                        </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{statusBadge}</td>

                    {/* Frequency */}
                    <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary uppercase tracking-wider whitespace-nowrap">
                            <Calendar size={11} />
                            {subscription.frequencyLabel}
                        </span>
                    </td>

                    {/* Confidence */}
                    <td className="hidden lg:table-cell py-3.5 px-4">
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary uppercase tracking-wider whitespace-nowrap">
                            <Shield size={11} />
                            {subscription.confidence}
                        </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right tabular-nums">
                        <p className={`text-sm font-bold ${isCancelled ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                            {formatCurrencyPrecise(subscription.amountMonthly, currencyCode)}
                        </p>
                        {isCancelled && (
                            <p className="text-[9px] font-bold uppercase tracking-widest text-success mt-0.5">Saving</p>
                        )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 pl-4 pr-6 text-right">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex justify-end">
                            {cancelAction}
                        </div>
                    </td>
                </motion.tr>
                {modalComponent}
            </>
        );
    }

    // Mobile list item ONLY
    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isCancelled ? 0.6 : 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1], delay: index * 0.03 }}
                className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-bg-muted/40 active:bg-bg-muted/60 transition-colors group"
            >
                {/* Left: Icon & details */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${getAvatarClass(subscription.serviceName)} ${isCancelled ? 'grayscale' : ''} shadow-xs`}>
                        {getServiceIcon(subscription.serviceName)}
                    </div>

                    <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className={`truncate text-sm font-bold ${isCancelled ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                                {subscription.serviceName}
                            </p>
                            {statusBadge}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] font-medium text-text-secondary flex-wrap">
                            <span className="flex items-center gap-1 uppercase tracking-wider text-[10px] text-text-muted">
                                <Calendar size={11} className="text-text-muted" />
                                {subscription.frequencyLabel}
                            </span>
                            {hasAlert && !isCancelled && (
                                <span className="flex items-center gap-1 text-warning font-semibold text-[10px]">
                                    <AlertTriangle size={11} />
                                    {subscription.alert!.message}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right side: Amount & Action */}
                <div className="flex flex-col items-end gap-1 shrink-0 tabular-nums">
                    <p className={`text-sm font-bold ${isCancelled ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                        {formatCurrencyPrecise(subscription.amountMonthly, currencyCode)}
                    </p>
                    <div className="shrink-0 mt-0.5">
                        {cancelAction}
                    </div>
                </div>
            </motion.div>
            {modalComponent}
        </>
    );
};
