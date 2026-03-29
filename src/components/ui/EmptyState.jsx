import React from 'react';
import { motion } from 'framer-motion';
import { Search, RotateCcw, PackageSearch } from 'lucide-react';
import { cn } from '../../lib/utils';

export function EmptyState({ 
    title = "Ничего не найдено", 
    description = "Попробуйте изменить параметры поиска или сбросить фильтры", 
    onReset,
    icon: Icon = PackageSearch,
    className
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={cn(
                "flex flex-col items-center justify-center py-20 px-6 text-center bg-[#191624] rounded-[3rem] border border-white/5 border-dashed relative overflow-hidden group",
                className
            )}
        >
            {/* Background Decorative Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10">
                <div className="w-24 h-24 mb-8 relative mx-auto">
                    <div className="absolute inset-0 bg-purple-600/20 blur-2xl rounded-full animate-pulse" />
                    <div className="relative w-full h-full bg-[#13111C] rounded-[2rem] border border-white/10 flex items-center justify-center shadow-2xl transform transition-transform group-hover:rotate-12 duration-500">
                        <Icon size={40} className="text-purple-500" />
                    </div>
                </div>

                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white mb-4 italic">
                    {title}
                </h3>
                
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] md:text-xs max-w-sm mx-auto leading-relaxed mb-10">
                    {description}
                </p>

                {onReset && (
                    <button
                        onClick={onReset}
                        className="group/btn flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_15px_30px_rgba(147,51,234,0.3)] hover:-translate-y-1 active:translate-y-0"
                    >
                        <RotateCcw size={14} className="group-hover/btn:rotate-180 transition-transform duration-500" />
                        Сбросить фильтры
                    </button>
                )}
            </div>
            
            {/* Floating particles (CSS only simple) */}
            <div className="absolute top-10 left-10 w-2 h-2 bg-purple-500/20 rounded-full blur-sm animate-bounce" />
            <div className="absolute bottom-20 right-20 w-3 h-3 bg-blue-500/20 rounded-full blur-sm animate-pulse" />
        </motion.div>
    );
}
