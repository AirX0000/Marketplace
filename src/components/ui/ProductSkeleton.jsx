import React from 'react';
import { cn } from '../../lib/utils';

export function ProductSkeleton({ className }) {
    return (
        <div className={cn("flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-card overflow-hidden h-[380px]", className)}>
            {/* Image Skeleton */}
            <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800 animate-pulse relative p-6">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer" />
            </div>

            {/* Content Skeleton */}
            <div className="flex flex-1 flex-col p-5 space-y-4">
                {/* Badges */}
                <div className="flex justify-between">
                    <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                    <div className="h-5 w-12 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>

                {/* Description/Attributes */}
                <div className="flex gap-2">
                    <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>

                {/* Price & Action */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="h-7 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                </div>
            </div>
        </div>
    );
}
