import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Phone, MessageSquare, Heart, Bell, ShoppingCart, Star, Zap 
} from 'lucide-react';
import { cn } from '../../lib/utils';

const MagneticButton = ({ children, className, onClick, ...props }) => {
    const ref = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e) => {
        const { clientX, clientY } = e;
        const rect = ref.current.getBoundingClientRect();
        const middleX = clientX - (rect.left + rect.width / 2);
        const middleY = clientY - (rect.top + rect.height / 2);
        setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
    };

    const reset = () => setPosition({ x: 0, y: 0 });

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={className}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export const ProductActions = ({ 
    marketplace, 
    displayPrice, 
    isFav, 
    toggleFavorite, 
    addToCart, 
    isWatchingPrice, 
    setIsWatchingPrice,
    setOfferModalOpen,
    selectedMod,
    isAuthenticated
}) => {
    return (
        <div className="bg-[#191624] rounded-[32px] p-8 shadow-2xl border border-white/5 space-y-8 sticky top-24" id="contact-sidebar">
            {/* Price section */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                        {selectedMod?.name || 'Цена'}
                    </span>
                    {marketplace.isFeatured && (
                        <div className="flex items-center gap-1 text-[8px] font-black text-indigo-400 uppercase tracking-widest italic">
                            <Star className="h-3 w-3 fill-current" /> Featured
                        </div>
                    )}
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white italic tracking-tighter">
                        {displayPrice.toLocaleString()}
                    </span>
                    <span className="text-sm font-black text-slate-500 uppercase italic">Sum</span>
                </div>
            </div>

            {/* CTAs */}
            <div className="space-y-4 pt-4">
                <MagneticButton 
                    onClick={() => window.location.href = `tel:${marketplace.phone || '+998900000000'}`}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] flex gap-3 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 italic overflow-hidden"
                >
                    <div className="w-16 h-full bg-indigo-700/50 flex items-center justify-center shrink-0">
                        <Phone className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col items-start justify-center text-left py-2">
                        <span className="text-[9px] text-indigo-200 uppercase tracking-widest">Связаться с продавцом</span>
                        <span className="text-sm font-bold tracking-wider">{marketplace.phone || 'Номер не указан'}</span>
                    </div>
                </MagneticButton>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => addToCart(marketplace)}
                        className="h-14 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 transition-all border border-white/5 italic"
                    >
                        <ShoppingCart className="h-4 w-4" /> В корзину
                    </button>
                    <button 
                        onClick={() => toggleFavorite(marketplace)}
                        className={cn(
                            "h-14 rounded-2xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 transition-all border italic",
                            isFav ? "bg-red-500/10 border-red-500/50 text-red-500" : "bg-white/5 border-white/5 text-white hover:bg-white/10"
                        )}
                    >
                        <Heart className={cn("h-4 w-4", isFav && "fill-current")} /> {isFav ? 'В избранном' : 'Избранное'}
                    </button>
                </div>

                <button 
                    onClick={() => setOfferModalOpen(true)}
                    className="w-full h-14 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 transition-all border border-white/5 italic"
                >
                    <Zap className="h-4 w-4 text-yellow-400" /> Предложить свою цену
                </button>
            </div>

            <div className="pt-8 border-t border-white/5 space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                            <Bell className={cn("h-4 w-4", isWatchingPrice ? "text-purple-400 fill-current" : "text-slate-500")} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-white uppercase tracking-widest italic">Следить за ценой</div>
                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Уведомим о снижении</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsWatchingPrice(!isWatchingPrice)}
                        className={cn(
                            "w-12 h-6 rounded-full relative transition-all duration-300",
                            isWatchingPrice ? "bg-purple-600" : "bg-white/10"
                        )}
                    >
                        <div className={cn(
                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
                            isWatchingPrice ? "left-7" : "left-1"
                        )} />
                    </button>
                </div>
            </div>
        </div>
    );
};
