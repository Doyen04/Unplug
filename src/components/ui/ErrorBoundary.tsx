'use client';

import React, { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error boundary component to catch and display errors gracefully
 * Prevents entire page from crashing due to component errors
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, info);
        this.props.onError?.(error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <Card className="border border-danger/20 bg-danger/5 p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/20 text-danger">
                                <AlertTriangle size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-text-primary">Something went wrong</h3>
                                <p className="mt-1 text-sm text-text-secondary">
                                    {this.state.error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4"
                                    onClick={() => {
                                        this.setState({ hasError: false, error: null });
                                        window.location.reload();
                                    }}
                                >
                                    Reload Page
                                </Button>
                            </div>
                        </div>
                    </Card>
                )
            );
        }

        return this.props.children;
    }
}
