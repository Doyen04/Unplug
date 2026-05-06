import { Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/format';

interface Transaction {
    transaction_id: string;
    name: string;
    amount: number;
    date: string;
    merchant_name: string | null;
    iso_currency_code?: string | null;
    category?: string[] | null;
}

interface TransactionRowProps {
    transaction: Transaction;
    currency: string;
    index: number;
}

export const TransactionRow = ({ transaction, currency, index }: TransactionRowProps) => {
    return (
        <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1], delay: index * 0.02 }}
            className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-bg-base/50 transition-colors group"
        >
            <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-text-primary text-white shadow-sm font-bold">
                    <Receipt size={16} />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-text-primary">
                        {transaction.merchant_name ?? transaction.name}
                    </p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {transaction.category?.length ? ` · ${transaction.category[0]}` : ''}
                    </p>
                </div>
            </div>

            <div className="text-right tabular-nums">
                <p className="text-sm font-bold text-text-primary">
                    {formatCurrency(Math.abs(transaction.amount), transaction.iso_currency_code ?? currency)}
                </p>
                <Badge variant={transaction.amount > 0 ? 'warning' : 'success'} className="mt-1">
                    {transaction.amount > 0 ? 'Outflow' : 'Inflow'}
                </Badge>
            </div>
        </motion.article>
    );
};
