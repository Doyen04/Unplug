import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Calendar, Ban } from 'lucide-react';

import { CancelButton } from './CancelButton';
import { CancellationGuideModal } from './CancellationGuideModal';
import { formatCurrencyPrecise, toSentenceCase } from '@/lib/utils/format';
import { getAvatarClass } from '@/lib/utils/avatar';
import { getServiceIcon } from '@/lib/utils/service-icons';
import type { Subscription } from '@/types/subscription';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

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
        <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
            <Ban size={10} /> cancelled
        </Badge>
    ) : (
        <Badge variant={verdictVariant} className="shrink-0">
            {subscription.verdict.replace('_', ' ')}
        </Badge>
    );

    const alertRow = hasAlert && !isCancelled &&
        !subscription.alert?.message.toLowerCase().includes(subscription.verdict.replace('_', ' ').toLowerCase()) && (
            <div className="mt-1 flex items-center gap-1.5 rounded bg-warning-light/40 px-2 py-1 border border-warning/10">
                <AlertTriangle size={10} className="text-warning shrink-0" />
                <span className="text-[10px] font-semibold text-warning uppercase tracking-tight truncate">
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
        <Badge variant="success" className="text-[9px] px-2 py-0.5">
            <Ban size={10} className="mr-1" /> Saved
        </Badge>
    );

    return (
        <>
            {/* ── Desktop table row ── */}
            <motion.tr
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: isCancelled ? 0.55 : 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1], delay: index * 0.03 }}
                className={`hidden md:table-row group hover:bg-bg-muted/40 transition-colors
                    ${hasAlert && !isCancelled ? 'border-l-4 border-l-warning' : ''}
                    ${subscription.status === 'unused' ? 'alert-pulse-border' : ''}`}
            >
                {/* Service */}
                <td className="py-3.5 pl-6 pr-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getAvatarClass(subscription.serviceName)} ${isCancelled ? 'grayscale' : ''}`}>
                            {getServiceIcon(subscription.serviceName)}
                        </div>
                        <div className="min-w-0">
                            <p className={`truncate text-sm font-bold leading-tight ${isCancelled ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                                {subscription.serviceName}
                            </p>
                            {alertRow}
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

            {/* ── Mobile card ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: isCancelled ? 0.55 : 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1], delay: index * 0.03 }}
                className="block md:hidden"
            >
                <Card className={`group flex flex-col gap-3 p-4
                    ${isCancelled ? 'opacity-60' : ''}
                    ${hasAlert && !isCancelled ? 'border-l-4 border-l-warning' : ''}
                    ${subscription.status === 'unused' ? 'alert-pulse-border' : ''}`}
                >
                    {/* Top: avatar + name + badge */}
                    <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${getAvatarClass(subscription.serviceName)} ${isCancelled ? 'grayscale' : ''}`}>
                            {getServiceIcon(subscription.serviceName)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <p className={`truncate text-sm font-bold ${isCancelled ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                                    {subscription.serviceName}
                                </p>
                                {statusBadge}
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-medium text-text-secondary uppercase tracking-wider">
                                <span className="flex items-center gap-1"><Shield size={10} /> {subscription.confidence}</span>
                                <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
                                <span className="flex items-center gap-1"><Calendar size={10} /> {subscription.frequencyLabel}</span>
                            </div>
                        </div>
                    </div>

                    {alertRow}

                    {/* Bottom: amount + action */}
                    <div className="flex items-center justify-between border-t border-border/50 pt-2.5">
                        <div className="tabular-nums">
                            <p className={`font-ui text-base font-bold ${isCancelled ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                                {formatCurrencyPrecise(subscription.amountMonthly, currencyCode)}
                            </p>
                            {isCancelled && (
                                <p className="text-[9px] font-bold uppercase tracking-widest text-success mt-0.5">Saving this</p>
                            )}
                        </div>
                        {cancelAction}
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
