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

    return (
        <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1], delay: index * 0.02 }}
            className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-bg-base/50 transition-colors group relative"
        >
            <div className="flex min-w-0 items-center gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getAvatarClass(merchantLabel)}`}>
                    {getServiceIcon(merchantLabel)}
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-text-primary">{merchantLabel}</p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {transaction.category?.length ? ` · ${transaction.category[0]}` : ''}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 tabular-nums">
                <div className="text-right">
                    <p className="text-sm font-bold text-text-primary">
                        {formatCurrency(Math.abs(transaction.amount), transaction.iso_currency_code ?? currency)}
                    </p>
                    <Badge variant={transaction.amount > 0 ? 'warning' : 'success'} className="mt-1">
                        {transaction.amount > 0 ? 'Outflow' : 'Inflow'}
                    </Badge>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-text-muted hover:text-danger hover:bg-danger/10 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200"
                    onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onDelete?.(transaction.transaction_id);
                    }}
                >
                    <Trash2 size={14} />
                </Button>
            </div>
        </motion.article>
    );
};
