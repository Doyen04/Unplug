import React from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle, Search } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface DataTableProps<T> {
    data: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    isLoading?: boolean;
    isError?: boolean;
    errorTitle?: string;
    errorMessage?: string;
    onRetry?: () => void;
    emptyIcon?: React.ReactNode;
    emptyTitle?: string;
    emptyMessage?: string;
    emptyAction?: React.ReactNode;
    pagination?: {
        page: number;
        pageCount: number;
        total?: number;
        pageSize?: number;
        onPageChange: (page: number) => void;
    };
    header?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    containerClassName?: string;
    /** Column header row rendered inside <thead> on desktop */
    tableHead?: React.ReactNode;
    /** When true the rows are rendered inside a real <table> on desktop */
    asTable?: boolean;
    showDivider?: boolean;
    itemsClassName?: string;
}

export function DataTable<T>({
    data,
    renderItem,
    isLoading,
    isError,
    errorTitle = 'Failed to load data',
    errorMessage = 'There was a problem fetching the records.',
    onRetry,
    emptyIcon = <Search size={32} />,
    emptyTitle = 'No results found',
    emptyMessage = 'Try adjusting your search or filters.',
    emptyAction,
    pagination,
    header,
    footer,
    className = '',
    containerClassName = 'p-0 overflow-hidden',
    tableHead,
    asTable = false,
    showDivider = true,
    itemsClassName = '',
}: DataTableProps<T>) {

    if (isError) {
        return (
            <Card className="p-12 text-center">
                <AlertTriangle size={32} className="mx-auto mb-4 text-danger opacity-20" />
                <p className="font-semibold text-text-primary">{errorTitle}</p>
                <p className="text-sm text-text-secondary mt-1 mb-6">{errorMessage}</p>
                {onRetry && (
                    <Button variant="secondary" onClick={onRetry} className="mx-auto">
                        Try again
                    </Button>
                )}
            </Card>
        );
    }

    const hasData = data.length > 0;

    const bodyContent = isLoading ? (
        <div className="p-12 text-center animate-pulse space-y-4">
            <div className="h-12 w-12 bg-bg-muted rounded-full mx-auto" />
            <div className="h-4 w-48 bg-bg-muted rounded mx-auto" />
            <div className="h-4 w-32 bg-bg-muted rounded mx-auto" />
        </div>
    ) : !hasData ? (
        <div className="p-12 text-center text-text-secondary">
            <div className="opacity-20 mb-4 flex justify-center">{emptyIcon}</div>
            <p className="font-semibold text-text-primary">{emptyTitle}</p>
            <p className="text-sm mt-1 mb-6">{emptyMessage}</p>
            {emptyAction}
        </div>
    ) : null;

    return (
        <Card className={`${containerClassName} ${className}`}>
            {header}

            {/* ── Desktop table view ── */}
            {asTable && !bodyContent && (
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full min-w-[640px] border-collapse text-sm">
                        {tableHead && <thead>{tableHead}</thead>}
                        <tbody className={showDivider ? 'divide-y divide-border' : ''}>
                            {data.map((item, index) => renderItem(item, index))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Mobile card list (always shown) / fallback on desktop when asTable=false ── */}
            <div className={`${asTable ? 'md:hidden' : ''} ${showDivider ? 'divide-y divide-border' : ''} ${itemsClassName}`}>
                {bodyContent ?? data.map((item, index) => renderItem(item, index))}
            </div>

            {/* Loading / empty for table mode */}
            {asTable && bodyContent && (
                <div>{bodyContent}</div>
            )}

            {footer}

            {pagination && pagination.pageCount > 1 && (
                <div className="flex items-center justify-between border-t border-border px-4 sm:px-6 py-4 bg-bg-muted/30">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                        Page {pagination.page} / {pagination.pageCount}
                        {pagination.total !== undefined && ` · ${pagination.total} total`}
                        {pagination.pageSize && pagination.total && (
                            <span className="ml-1 hidden sm:inline">
                                (Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)}-{Math.min(pagination.page * pagination.pageSize, pagination.total)})
                            </span>
                        )}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => pagination.onPageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="h-9 w-9 rounded-full"
                        >
                            <ChevronLeft size={18} className="text-text-primary" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => pagination.onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.pageCount}
                            className="h-9 w-9 rounded-full"
                        >
                            <ChevronRight size={18} className="text-text-primary" />
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
