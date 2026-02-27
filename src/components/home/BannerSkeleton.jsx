import { cn } from '../../lib/utils';

export function BannerSkeleton({ className }) {
    return (
        <div className={cn("relative w-full h-full overflow-hidden bg-slate-200 dark:bg-slate-800 animate-pulse", className)}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
    );
}
