import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useCompare } from '../context/CompareContext';
import { Star, Heart, Check, Share2, Flame, Clock } from 'lucide-react';
import { getImageUrl, cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

export function MarketplaceCard({ marketplace, viewMode = 'grid' }) {
    const { toggleFavorite, isFavorite } = useShop();
    const { compareItems } = useCompare();
    const { i18n, t } = useTranslation();
    const navigate = useNavigate();
    const isUz = i18n.language === 'uz';

    const displayName = (isUz && marketplace.name_uz) ? marketplace.name_uz : marketplace.name;
    const displayDescription = (isUz && marketplace.description_uz) ? marketplace.description_uz : marketplace.description;

    const isFav = isFavorite(marketplace.id);

    const handleCardClick = (e) => {
        if (e.target.closest('button')) return;
        navigate(`/marketplaces/${marketplace.slug || marketplace.id}`);
    };

    const handleShare = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/marketplaces/${marketplace.slug || marketplace.id}`;
        if (navigator.share) {
            navigator.share({ title: marketplace.name, url }).catch(console.error);
        } else {
            navigator.clipboard.writeText(url);
            toast.success('Ссылка скопирована!');
        }
    };

    const isService = ["услуги", "services", "xizmatlar"].includes(marketplace.category?.toLowerCase());
    const price = marketplace.price || 0;
    const discountedPrice = Math.round(price * (1 - (marketplace.discount || 0) / 100));
    const monthlyPayment = Math.round(price * 0.035);

    // List View
    if (viewMode === 'list') {
        return (
            <div 
                onClick={handleCardClick}
                className="group cursor-pointer relative flex flex-col md:flex-row overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
            >
                <div className="w-full md:w-64 aspect-[4/3] md:aspect-square flex-shrink-0 overflow-hidden bg-slate-50 dark:bg-slate-800/30 relative">
                    <img
                        src={getImageUrl(marketplace.images || marketplace.image) || "/images/car_mock.png"}
                        alt={displayName}
                        loading="lazy" className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { e.target.src = "/images/car_mock.png"; }}
                    />
                    {marketplace.isFeatured && (
                        <div className="absolute top-3 left-3 z-10 bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg uppercase tracking-widest animate-pulse">
                            <Star size={10} className="inline mr-1 fill-current" /> TOP
                        </div>
                    )}
                </div>

                <div className="flex flex-1 flex-col p-6 md:p-8">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                    {marketplace.region}
                                </span>
                                {marketplace.isVerified && (
                                    <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                        <Check size={10} className="mr-1" /> OK
                                    </span>
                                )}
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors mb-3 leading-tight tracking-tight">
                                {displayName}
                            </h3>

                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6">
                                {displayDescription || "Ведущая интеграционная платформа."}
                            </p>
                        </div>

                        <div className="flex gap-2 relative z-10">
                            <button onClick={handleShare} className="rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-all">
                                <Share2 className="h-5 w-5" />
                            </button>
                            <button onClick={(e) => { e.preventDefault(); toggleFavorite(marketplace); }} className={cn("rounded-xl p-3 transition-all", isFav ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500")}>
                                <Heart className={cn("h-5 w-5", isFav && "fill-current")} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mt-auto pt-6 border-t border-slate-50 dark:border-slate-800/50">
                        <div className="space-y-1.5 font-bold">
                            {!isService ? (
                                <>
                                    {marketplace.discount > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-400 line-through font-bold">
                                                {price.toLocaleString()} Sum
                                            </span>
                                            <span className="text-[10px] font-black text-white bg-rose-500 px-2 py-0.5 rounded-full">
                                                -{marketplace.discount}%
                                            </span>
                                        </div>
                                    )}
                                    <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                        {discountedPrice.toLocaleString()} <span className="text-sm font-bold text-slate-400 uppercase">Sum</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest">
                                        <span className="text-purple-600 dark:text-purple-400">В РАССРОЧКУ</span>
                                        <span className="text-slate-400">ОТ {monthlyPayment.toLocaleString()} <span className="text-[10px]">UZS/МЕС</span></span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                    {price > 0 ? `${price.toLocaleString()} UZS` : 'Цена по запросу'}
                                </div>
                            )}
                        </div>
                        <button onClick={(e) => { e.preventDefault(); navigate(`/marketplaces/${marketplace.slug || marketplace.id}#contact-sidebar`); }} className="h-14 px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-xl hover:shadow-primary/20">
                            {isService ? 'Связаться' : 'Консультация'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Grid View
    return (
        <motion.div
            onClick={handleCardClick}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            className={cn(
                "group cursor-pointer relative flex flex-col rounded-[2rem] border bg-white dark:bg-slate-900 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden",
                marketplace.isFeatured ? "border-primary/30 ring-8 ring-primary/5 shadow-xl" : "border-slate-100 dark:border-slate-800 shadow-sm"
            )}
        >
            <div className="aspect-[4/3] overflow-hidden bg-slate-50 dark:bg-slate-800/20 p-6 relative">
                <img
                    src={getImageUrl(marketplace.images || marketplace.image) || "/images/car_mock.png"}
                    alt={displayName}
                    loading="lazy" className="h-full w-full object-contain transition-transform duration-1000 group-hover:scale-110"
                    onError={(e) => { e.target.src = "/images/car_mock.png"; }}
                />
                
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 transition-all group-hover:scale-105">
                    {marketplace.isFeatured && (
                        <div className="bg-indigo-600 text-white text-[9px] font-black px-2.5 py-1.5 rounded-xl shadow-2xl uppercase tracking-widest flex items-center gap-1.5">
                            <Star size={10} className="fill-current" /> TOP
                        </div>
                    )}
                    {marketplace.discount >= 10 && (
                        <div className="bg-rose-500 text-white text-[9px] font-black px-2.5 py-1.5 rounded-xl shadow-2xl uppercase tracking-widest">
                            SALE -{marketplace.discount}%
                        </div>
                    )}
                </div>

                <div className="absolute right-4 top-4 z-10 flex flex-col gap-2 translate-x-16 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                    <button onClick={(e) => { e.preventDefault(); toggleFavorite(marketplace); }} className={cn("p-3 rounded-2xl backdrop-blur-xl shadow-2xl transition-all hover:scale-110", isFav ? "bg-red-500 text-white" : "bg-white/90 dark:bg-slate-800/90 text-slate-400")}>
                        <Heart size={18} className={cn(isFav && "fill-current")} />
                    </button>
                    <button onClick={handleShare} className="p-3 rounded-2xl backdrop-blur-xl shadow-2xl bg-white/90 dark:bg-slate-800/90 text-slate-400 transition-all hover:scale-110 hover:text-primary">
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-800">
                        {marketplace.region}
                    </span>
                    <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
                        <span className="text-xs font-black text-slate-900 dark:text-white leading-none">{marketplace.rating ? marketplace.rating.toFixed(1) : 'NEW'}</span>
                    </div>
                </div>

                <h3 className="line-clamp-1 text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors mb-3 tracking-tighter lg:text-xl">
                    {displayName}
                </h3>

                <div className="mb-6 min-h-[36px]">
                        {(() => {
                            const parsed = marketplace.attributes ? (typeof marketplace.attributes === 'string' ? JSON.parse(marketplace.attributes) : marketplace.attributes) : {};
                            const specs = parsed.specs || parsed;
                            
                            if (isService) {
                                return (
                                    <div className="flex flex-wrap gap-2.5">
                                        {specs.experience && (
                                            <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                                СТАЖ: {specs.experience} ЛЕТ
                                            </span>
                                        )}
                                        {specs.license && (
                                            <span className="text-[11px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                                ЛИЦЕНЗИЯ: {specs.license}
                                            </span>
                                        )}
                                        {!specs.experience && !specs.license && (
                                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-medium">Профессиональные услуги: {(marketplace.subcategory || marketplace.category)}</p>
                                        )}
                                    </div>
                                );
                            }

                            if (specs.year || specs.mileage || specs.rooms || specs.area) {
                                return (
                                    <div className="flex flex-wrap gap-2.5">
                                        {(specs.year || specs.rooms) && (
                                            <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-xl border border-slate-100 dark:border-slate-800">
                                                {specs.year || `${specs.rooms} КОМН`}
                                            </span>
                                        )}
                                        {(specs.mileage !== undefined || specs.area) && (
                                            <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-xl border border-slate-100 dark:border-slate-800">
                                                {specs.mileage !== undefined ? `${specs.mileage.toLocaleString()} КМ` : `${specs.area} М²`}
                                            </span>
                                        )}
                                    </div>
                                );
                            }
                            return <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-medium">{displayDescription}</p>;
                        })()}
                </div>

                <div className="mt-auto pt-5 border-t border-slate-50 dark:border-slate-800 flex flex-col gap-5">
                    <div className="flex flex-col">
                        <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                            {isService ? (price > 0 ? `${price.toLocaleString()} UZS` : 'По запросу') : `${discountedPrice.toLocaleString()} Sum`}
                        </div>
                        {!isService && (
                            <div className="mt-1 flex items-center gap-1.5 text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest opacity-80">
                                В рассрочку от {monthlyPayment.toLocaleString()}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={(e) => { e.preventDefault(); navigate(`/marketplaces/${marketplace.slug || marketplace.id}#contact-sidebar`); }}
                        className={cn(
                            "h-12 rounded-2xl text-sm font-black transition-all active:scale-95 shadow-xl",
                            isService ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-slate-900/20" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                        )}
                    >
                        {isService ? 'Связаться' : 'Заказать'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
