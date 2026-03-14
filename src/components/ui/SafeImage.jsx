import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Skeleton } from './Skeleton';

export function SafeImage({ src, alt, className, ...props }) {
    const [status, setStatus] = useState('loading'); // loading | loaded | error
    const [currentSrc, setCurrentSrc] = useState(src);

    useEffect(() => {
        if (!src) {
            setStatus('error');
            return;
        }
        setStatus('loading');
        setCurrentSrc(src);
    }, [src]);

    return (
        <div className={cn("relative overflow-hidden bg-muted/20", className)}>
            <AnimatePresence mode="wait">
                {status === 'loading' && (
                    <motion.div
                        key="shimmer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10"
                    >
                        <Skeleton className="w-full h-full rounded-none" />
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-muted/40 text-muted-foreground/50"
                    >
                        <ImageIcon size={className?.includes('h-') ? parseInt(className?.match(/h-(\d+)/)?.[1]) * 0.2 : 24} />
                        <span className="text-[8px] font-black uppercase tracking-widest mt-2">Image Error</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <img
                src={currentSrc}
                alt={alt}
                className={cn(
                    "w-full h-full object-cover transition-all duration-700",
                    status === 'loaded' ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-lg'
                )}
                onLoad={() => setStatus('loaded')}
                onError={() => setStatus('error')}
                {...props}
            />
        </div>
    );
}
