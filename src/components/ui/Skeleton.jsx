import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Skeleton({ className, ...props }) {
    return (
        <div className={cn("relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800/50", className)} {...props}>
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear",
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent skew-x-12"
            />
        </div>
    );
}

export function MarketplaceCardSkeleton() {
    return (
        <div className="flex flex-col rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm h-full">
            <Skeleton className="aspect-[4/3] rounded-none border-b border-slate-50 dark:border-slate-800/50" />
            <div className="p-6 space-y-6 flex-1 flex flex-col">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-20 rounded-lg" />
                    <Skeleton className="h-5 w-10 rounded-lg" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-7 w-3/4 rounded-xl" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-lg" />
                        <Skeleton className="h-6 w-16 rounded-lg" />
                    </div>
                </div>
                <div className="mt-auto pt-5 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-28 rounded-lg" />
                        <Skeleton className="h-3 w-32 rounded-lg" />
                    </div>
                    <Skeleton className="h-12 w-28 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}

export function DetailSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Image Gallery Skeleton */}
                <div className="space-y-4">
                    <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
                    <div className="grid grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="aspect-square rounded-2xl" />
                        ))}
                    </div>
                </div>

                {/* Info Skeleton */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-24 rounded-lg" />
                            <Skeleton className="h-6 w-24 rounded-lg" />
                        </div>
                        <Skeleton className="h-12 w-full rounded-2xl" />
                        <Skeleton className="h-8 w-1/2 rounded-xl" />
                    </div>

                    <div className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-10 w-40 rounded-xl" />
                            <Skeleton className="h-6 w-24 rounded-lg" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-14 w-full rounded-2xl" />
                            <Skeleton className="h-14 w-full rounded-2xl" />
                        </div>
                        <Skeleton className="h-16 w-full rounded-2xl" />
                    </div>

                    <div className="space-y-4">
                        <Skeleton className="h-6 w-40 rounded-lg" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
