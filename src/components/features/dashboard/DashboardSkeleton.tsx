import * as React from "react";
import { Card } from "@/components/ui/Card";

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="h-8 w-40 bg-bg-muted rounded-pill animate-pulse" />
                <div className="flex gap-4">
                    <div className="h-10 w-10 bg-bg-muted rounded-full animate-pulse" />
                </div>
            </div>

            {/* Stats Skeleton — mirrors DashboardStats layout */}
            <section className="relative">
                {/* Mobile: horizontal scroll strip */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hidden md:hidden -mx-4 px-4 snap-x snap-mandatory">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Card key={i} className="w-[72vw] max-w-[260px] shrink-0 snap-center h-32 bg-bg-muted animate-pulse" />
                    ))}
                </div>

                {/* Desktop: 4-col grid */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="h-32 bg-bg-muted animate-pulse" />
                    ))}
                </div>
            </section>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="col-span-2 h-80 bg-bg-muted animate-pulse" />
                <div className="space-y-4">
                    <Card className="h-38 bg-bg-muted animate-pulse" />
                    <Card className="h-38 bg-bg-muted animate-pulse" />
                </div>
            </div>

            {/* Ledger Skeleton */}
            <Card className="h-96 bg-bg-muted animate-pulse" />
        </div>
    );
}
