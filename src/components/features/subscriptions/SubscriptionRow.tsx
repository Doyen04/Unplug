import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, Calendar, Ban } from 'lucide-react';

import { CancelButton } from './CancelButton';
import { CancellationGuideModal } from './CancellationGuideModal';
import { formatCurrencyPrecise, toSentenceCase } from '@/lib/utils/format';
import { getAvatarClass } from '@/lib/utils/avatar';
import { getServiceIcon } from '@/lib/utils/service-icons';
import type { Subscription } from '@/types/subscription';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
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

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{
                    opacity: isCancelled ? 0.5 : 1,
                    x: isCancelled ? 8 : 0,
                    y: 0,
                }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1], delay: index * 0.03 }}
                layout
            >
                <Card className={`group flex flex-col gap-4 p-4 sm:flex-row sm:items-center ${isCancelled ? 'opacity-60' : ''
                    } ${hasAlert && !isCancelled ? 'border-l-4 border-l-warning' : ''} ${subscription.status === 'unused' ? 'alert-pulse-border' : ''
                    }`}>
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-btn shadow-sm ${getAvatarClass(subscription.serviceName)} ${isCancelled ? 'grayscale' : ''}`}>
                        {getServiceIcon(subscription.serviceName)}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <p className={`truncate text-base font-bold ${isCancelled ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                                {subscription.serviceName}
                            </p>
                            {isCancelled ? (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    <Ban size={10} /> cancelled
                                </Badge>
                            ) : (
                                <Badge variant={subscription.verdict === 'active' ? 'success' : (subscription.verdict === 'unused' || subscription.verdict === 'likely_unused') ? 'danger' : 'secondary'}>
                                    {subscription.verdict.replace('_', ' ')}
                                </Badge>
                            )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-text-secondary uppercase tracking-wider">
                            <span className="flex items-center gap-1" title="Confidence Level"><Shield size={12} /> {subscription.confidence}</span>
                            <span className="h-1 w-1 rounded-full bg-border" aria-hidden="true" />
                            <span className="flex items-center gap-1"><Calendar size={12} /> {subscription.frequencyLabel}</span>
                        </div>

                        {hasAlert && !isCancelled && !subscription.alert?.message.toLowerCase().includes(subscription.verdict.replace('_', ' ').toLowerCase()) && (
                            <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-warning-light/30 px-2 py-1.5 border border-warning/10">
                                <AlertTriangle size={12} className="text-warning" />
                                <span className="text-[11px] font-semibold text-warning uppercase tracking-tight">
                                    {subscription.alert!.message}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="w-full text-left sm:w-auto sm:text-right tabular-nums">
                        <p className={`font-ui text-lg font-bold ${isCancelled ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                            {formatCurrencyPrecise(subscription.amountMonthly, currencyCode)}
                        </p>
                        {isCancelled && (
                            <p className="text-[10px] font-bold uppercase tracking-widest text-success mt-0.5">Saving this</p>
                        )}
                    </div>

                    <div className="w-full sm:w-auto">
                        {!isCancelled ? (
                            <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <CancelButton
                                    subscriptionId={subscription.id}
                                    serviceName={subscription.serviceName}
                                    onSuccess={() => setIsModalOpen(true)}
                                    disabled={false}
                                />
                            </div>
                        ) : (
                            <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
                                <Badge variant="success" className="text-[9px] px-2 py-0.5">
                                    <Ban size={10} className="mr-1" /> Unsubscribed
                                </Badge>
                            </div>
                        )}
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
