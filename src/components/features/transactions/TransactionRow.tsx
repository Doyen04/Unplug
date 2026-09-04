import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/format';
import { Button } from '@/components/ui/Button';
import { getAvatarClass } from '@/lib/utils/avatar';
import { getServiceIcon } from '@/lib/utils/service-icons';
import type { Transaction } from '@/lib/client/dashboard-api';

interface TransactionRowProps {
    transaction: Transaction;
    currency: string;
    index: number;
    onDelete?: (id: string) => void;
}

export const TransactionRow = ({ transaction, currency, index, onDelete }: TransactionRowProps) => {
    const merchantLabel = transaction.merchant_name ?? transaction.name;
    const dateStr = new Date(transaction.date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    });
    const amountFormatted = formatCurrency(Math.abs(transaction.amount), transaction.iso_currency_code ?? currency);
    const isOutflow = transaction.amount > 0;
    const category = transaction.category?.length ? transaction.category[0] : '—';

    const deleteBtn = onDelete && (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
            onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onDelete(transaction.transaction_id);
            }}
        >
            <Trash2 size={14} />
        </Button>
    );

    return (
        <>
            {/* ── Desktop table row ── */}
            <motion.tr
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1], delay: index * 0.02 }}
                className="hidden md:table-row group hover:bg-bg-muted/40 transition-colors"
            >
                {/* Merchant */}
                <td className="py-3.5 pl-6 pr-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getAvatarClass(merchantLabel)}`}>
                            {getServiceIcon(merchantLabel)}
                        </div>
                        <p className="truncate text-sm font-bold text-text-primary">{merchantLabel}</p>
                    </div>
                </td>

                {/* Date */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">{dateStr}</span>
                </td>

                {/* Category */}
                <td className="hidden lg:table-cell py-3.5 px-4">
                    <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider truncate max-w-[140px] block">{category}</span>
                </td>

                {/* Direction */}
                <td className="py-3.5 px-4">
                    <Badge variant={isOutflow ? 'warning' : 'success'}>
                        {isOutflow ? 'Outflow' : 'Inflow'}
                    </Badge>
                </td>

                {/* Amount */}
                <td className="py-3.5 px-4 text-right tabular-nums">
                    <span className={`text-sm font-bold ${isOutflow ? 'text-text-primary' : 'text-success'}`}>
                        {isOutflow ? '' : '+'}{amountFormatted}
                    </span>
                </td>

                {/* Action */}
                <td className="py-3.5 pl-4 pr-6 text-right">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex justify-end">
                        {deleteBtn}
                    </div>
                </td>
            </motion.tr>

            {/* ── Mobile list row ── */}
            <motion.article
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1], delay: index * 0.02 }}
                className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-bg-base/50 transition-colors group relative md:hidden"
            >
                <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getAvatarClass(merchantLabel)}`}>
                        {getServiceIcon(merchantLabel)}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-text-primary">{merchantLabel}</p>
                        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                            {dateStr}{transaction.category?.length ? ` · ${category}` : ''}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 tabular-nums shrink-0">
                    <div className="text-right">
                        <p className={`text-sm font-bold ${isOutflow ? 'text-text-primary' : 'text-success'}`}>
                            {isOutflow ? '' : '+'}{amountFormatted}
                        </p>
                        <Badge variant={isOutflow ? 'warning' : 'success'} className="mt-0.5">
                            {isOutflow ? 'Out' : 'In'}
                        </Badge>
                    </div>
                    {deleteBtn}
                </div>
            </motion.article>
        </>
    );
};
