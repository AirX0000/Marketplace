import React from 'react';
import { motion } from 'framer-motion';

export function Skeleton({ className, ...props }) {
    return (
        <div className={cn("relative overflow-hidden rounded-md bg-white/5", className)} {...props}>
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear",
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            />
        </div>
    );
}

export function MarketplaceCardSkeleton() {
    return (
        <div className="flex flex-col rounded-2xl border border-white/5 bg-[#191624] overflow-hidden shadow-sm h-full">
            <div className="aspect-[4/3] bg-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
            <div className="p-5 space-y-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-10" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
            </div>
        </div>
    );
}
