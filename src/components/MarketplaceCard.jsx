import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useCompare } from '../context/CompareContext';
import { Star, ShoppingCart, Heart, Check, Scale, Eye, Share2 } from 'lucide-react';
import { QuickViewModal } from './QuickViewModal';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function MarketplaceCard({ marketplace, viewMode = 'grid' }) {
    const { toggleFavorite, isFavorite, addToCart } = useShop();
    const { addToCompare, compareItems, removeFromCompare } = useCompare();
    const { i18n } = useTranslation();
    const isUz = i18n.language === 'uz';

    // Use UZ translations if available and language is UZ, otherwise fall back to RU
    const displayName = (isUz && marketplace.name_uz) ? marketplace.name_uz : marketplace.name;
    const displayDescription = (isUz && marketplace.description_uz) ? marketplace.description_uz : marketplace.description;

    const isFav = isFavorite(marketplace.id);
    const isInCompare = compareItems.some(i => i.id === marketplace.id);
    const [isAdded, setIsAdded] = React.useState(false);
    const [showQuickView, setShowQuickView] = React.useState(false);

    const handleShare = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/marketplaces/${marketplace.slug || marketplace.id}`;
        if (navigator.share) {
            navigator.share({
                title: marketplace.name,
                url: url
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(url);
            alert('Ссылка скопирована!');
        }
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(marketplace);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    // List View
    if (viewMode === 'list') {
        return (
            <>
                <div className="group relative flex overflow-hidden rounded-2xl border border-border bg-card transition-all hover-scale">
                    <div className="w-48 h-48 flex-shrink-0 overflow-hidden bg-muted/30 p-6 relative">
                        <img
                            src={marketplace.image || "https://images.unsplash.com/photo-1472851294608-4151050801cd?auto=format&fit=crop&q=80&w=1000"}
                            alt={displayName}
                            loading="lazy" decoding="async" className="h-full w-full object-contain transition-all duration-500 group-hover:scale-110"
                        />
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setShowQuickView(true);
                            }}
                            aria-label="Быстрый просмотр"
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold"
                        >
                            <Eye className="w-8 h-8" />
                        </button>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-primary/10 text-primary dark:text-white dark:border-white/20 dark:bg-white/10">
                                        {marketplace.region}
                                    </span>
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <Star className="h-3 w-3 fill-current" />
                                        <span className="text-xs font-bold text-foreground">{marketplace.rating ? marketplace.rating.toFixed(1) : 'Новинка'}</span>
                                    </div>
                                </div>

                                <Link to={`/marketplaces/${marketplace.slug || marketplace.id}`}>
                                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors mb-2">{displayName}</h3>
                                </Link>

                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {marketplace.description || "Ведущая интеграционная платформа."}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowQuickView(true);
                                    }}
                                    aria-label="Быстрый просмотр"
                                    className="rounded-full p-2.5 backdrop-blur-md transition-all shadow-lg bg-card/90 text-foreground hover:bg-card hover:scale-105 md:hidden"
                                    title="Быстрый просмотр"
                                >
                                    <Eye className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={handleShare}
                                    aria-label="Поделиться"
                                    className="rounded-full p-2.5 bg-card/90 text-foreground hover:bg-card hover:scale-105 backdrop-blur-md transition-all shadow-lg"
                                    title="Поделиться"
                                >
                                    <Share2 className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        isInCompare ? removeFromCompare(marketplace.id) : addToCompare(marketplace);
                                    }}
                                    aria-label="Сравнить"
                                    className={`rounded-full p-2.5 backdrop-blur-md transition-all shadow-lg ${isInCompare ? 'bg-emerald-500 text-white' : 'bg-card/90 text-foreground hover:bg-card hover:scale-105'}`}
                                    title="Сравнить"
                                >
                                    <Scale className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleFavorite(marketplace);
                                    }}
                                    aria-label="В избранное"
                                    className={`rounded-full p-2.5 backdrop-blur-md transition-all shadow-lg ${isFav ? 'bg-red-500 text-white scale-110' : 'bg-card/90 text-foreground hover:bg-card hover:scale-105'}`}
                                >
                                    <Heart className={`h-5 w-5 ${isFav ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                            <div className="flex flex-col">
                                {marketplace.discount > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground line-through decoration-red-500/50">
                                            {(marketplace.price || 4999000).toLocaleString()} Sum
                                        </span>
                                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                                            -{marketplace.discount}%
                                        </span>
                                    </div>
                                )}
                                <div className="text-2xl font-bold text-primary">
                                    {(Math.round((marketplace.price || 4999000) * (1 - (marketplace.discount || 0) / 100))).toLocaleString()} Sum
                                </div>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                disabled={isAdded}
                                className={`inline-flex h-10 items-center justify-center rounded-md px-6 text-sm font-medium transition-all duration-200 btn-press ${isAdded ? 'bg-accent text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                            >
                                {isAdded ? (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        В Корзине
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        Купить
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                {showQuickView && <QuickViewModal product={marketplace} onClose={() => setShowQuickView(false)} />}
            </>
        );
    }

    // Grid View (default)
    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative flex flex-col rounded-2xl border border-border bg-card transition-all shadow-sm hover:shadow-xl overflow-hidden"
            >
                <div className="aspect-[4/3] overflow-hidden bg-muted/30 p-2 md:p-6 relative">
                    <img
                        src={marketplace.image || "https://images.unsplash.com/photo-1472851294608-4151050801cd?auto=format&fit=crop&q=80&w=1000"}
                        alt={displayName}
                        loading="lazy" decoding="async" className="h-full w-full object-contain transition-all duration-300 group-hover:scale-105"
                    />

                    {/* Brand Logo Overlay for Transport */}
                    {["Седан", "Кроссовер", "Внедорожник", "Электромобиль", "Cars", "Transport"].includes(marketplace.category) && (
                        (() => {
                            const parsed = marketplace.attributes ? (typeof marketplace.attributes === 'string' ? JSON.parse(marketplace.attributes) : marketplace.attributes) : {};
                            if (parsed.brandLogo) {
                                return (
                                    <div className="absolute top-3 left-3 w-10 h-10 bg-card/90 backdrop-blur-sm rounded-lg p-1.5 shadow-sm border border-border flex items-center justify-center z-10">
                                        <img src={parsed.brandLogo} alt="brand" loading="lazy" decoding="async" className="w-full h-full object-contain" />
                                    </div>
                                );
                            }
                            return null;
                        })()
                    )}
                    {/* Quick View Button (Desktop overlay) */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setShowQuickView(true);
                        }}
                        aria-label="Быстрый просмотр"
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold"
                    >
                        <div className="bg-card text-foreground rounded-full px-4 py-2 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg border border-border">
                            <Eye className="w-4 h-4" />
                            <span>Быстрый просмотр</span>
                        </div>
                    </button>

                    <div className="absolute right-2 top-2 flex flex-col gap-2 z-10 md:translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                toggleFavorite(marketplace);
                            }}
                            aria-label="В избранное"
                            className={`rounded-full p-2 backdrop-blur-md transition-all shadow-lg ${isFav ? 'bg-red-500 text-white scale-110' : 'bg-card/90 text-foreground hover:bg-card hover:scale-105'}`}
                        >
                            <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 flex-col p-3 md:p-5">
                    <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] md:text-xs font-semibold border-primary/20 bg-primary/10 text-primary">
                                {marketplace.region}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="text-[10px] md:text-sm font-bold text-foreground">{marketplace.rating ? marketplace.rating.toFixed(1) : 'NEW'}</span>
                        </div>
                    </div>

                    {/* Category badges */}
                    <div className="mb-2 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                        {marketplace.isVerified && (
                            <span className="rounded-md bg-emerald-500 text-white px-2 py-0.5 shadow-sm shadow-emerald-500/20 flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" /> Проверено
                            </span>
                        )}
                        {["Квартиры", "Дома", "Коммерческая", "Земля", "Apartments", "Houses", "Недвижимость"].includes(marketplace.category) && (
                            <span className="rounded-md bg-emerald-50 text-emerald-700 px-2 py-0.5 border border-emerald-100 italic">
                                Недвижимость
                            </span>
                        )}
                        {["Седан", "Кроссовер", "Внедорожник", "Электромобиль", "Cars", "Transport"].includes(marketplace.category) && (
                            <>
                                <span className="rounded-md bg-blue-600 text-white px-2 py-0.5 shadow-sm shadow-blue-600/20">
                                    Рассрочка
                                </span>
                                <span className="rounded-md bg-emerald-500 text-white px-2 py-0.5 shadow-sm shadow-emerald-500/20">
                                    Аванс 25%
                                </span>
                                {marketplace.isOfficial && (
                                    <span className="rounded-md bg-amber-500 text-white px-2 py-0.5 shadow-sm shadow-amber-500/20">
                                        Official Dealer
                                    </span>
                                )}
                            </>
                        )}
                    </div>


                    <Link to={`/marketplaces/${marketplace.slug || marketplace.id}`} className="mb-2 block">
                        <h3 className="line-clamp-1 text-sm md:text-lg font-bold text-foreground group-hover:text-primary transition-colors">{displayName}</h3>
                    </Link>

                    {/* Attributes Display */}
                    <div className="mb-4 min-h-[40px] flex flex-col justify-start">
                        {(() => {
                            const parsed = marketplace.attributes ? (typeof marketplace.attributes === 'string' ? JSON.parse(marketplace.attributes) : marketplace.attributes) : {};
                            const attrs = parsed.specs || parsed;

                            if (["Квартиры", "Дома", "Коммерческая", "Земля", "Apartments", "Houses"].includes(marketplace.category)) {
                                if (attrs.area || attrs.rooms) {
                                    return (
                                        <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                                            {attrs.rooms && <div className="bg-muted px-2 py-1 rounded">{attrs.rooms} комн.</div>}
                                            {attrs.area && <div className="bg-muted px-2 py-1 rounded">{attrs.area} м²</div>}
                                            {attrs.floor && <div className="bg-muted px-2 py-1 rounded">{attrs.floor} эт.</div>}
                                        </div>
                                    );
                                }
                            }

                            if (["Седан", "Кроссовер", "Внедорожник", "Электромобиль", "Cars", "Transport"].includes(marketplace.category)) {
                                if (attrs.year || attrs.mileage) {
                                    return (
                                        <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                                            {attrs.year && <span className="flex items-center">{attrs.year} г.</span>}
                                            {attrs.mileage !== undefined && <span className="flex items-center text-slate-400">•</span>}
                                            {attrs.mileage !== undefined && <span className="flex items-center">{attrs.mileage.toLocaleString()} км</span>}
                                            {attrs.transmission && <span className="flex items-center text-slate-400">•</span>}
                                            {attrs.transmission && <span className="flex items-center">{attrs.transmission}</span>}
                                        </div>
                                    );
                                }
                            }

                            return <p className="text-sm text-slate-500 line-clamp-2">{displayDescription}</p>;
                        })()}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between border-t border-border pt-3 mt-auto gap-2">
                        <div className="flex flex-col">
                            <div className="font-black text-foreground text-sm md:text-xl tracking-tighter">
                                {(Math.round((marketplace.price || 4999000) * (1 - (marketplace.discount || 0) / 100))).toLocaleString()} Sum
                            </div>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={isAdded}
                            className={`flex h-9 md:h-10 items-center justify-center rounded-xl px-4 text-xs md:text-sm font-bold transition-all duration-300 shadow-sm active:scale-95 ${isAdded
                                ? 'bg-emerald-500 text-white'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                }`}
                        >
                            {isAdded ? 'В корзине' : 'Купить'}
                        </button>
                    </div>
                </div>
            </motion.div >
            {showQuickView && <QuickViewModal product={marketplace} onClose={() => setShowQuickView(false)} />
            }
        </>
    );
}
