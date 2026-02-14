import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useCompare } from '../context/CompareContext';
import { Star, ShoppingCart, Heart, Check, Scale, Eye } from 'lucide-react';
import { QuickViewModal } from './QuickViewModal';
import { motion } from 'framer-motion';

export function MarketplaceCard({ marketplace, viewMode = 'grid' }) {
    const { toggleFavorite, isFavorite, addToCart } = useShop();
    const { addToCompare, compareItems, removeFromCompare } = useCompare();
    const isFav = isFavorite(marketplace.id);

    const isInCompare = compareItems.some(i => i.id === marketplace.id);
    const [isAdded, setIsAdded] = React.useState(false);
    const [showQuickView, setShowQuickView] = React.useState(false);

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
                <div className="group relative flex overflow-hidden rounded-2xl border border-slate-200 bg-card transition-all hover:shadow-lg">
                    <div className="w-48 h-48 flex-shrink-0 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 p-6 relative">
                        <img
                            src={marketplace.image || "https://images.unsplash.com/photo-1472851294608-4151050801cd?auto=format&fit=crop&q=80&w=1000"}
                            alt={marketplace.name}
                            className="h-full w-full object-contain transition-all duration-300"
                        />
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setShowQuickView(true);
                            }}
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

                                <Link to={`/marketplaces/${marketplace.id}`}>
                                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors mb-2">{marketplace.name}</h3>
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
                                    className="rounded-full p-2.5 backdrop-blur-md transition-all shadow-lg bg-white/90 text-slate-600 hover:bg-white hover:scale-105 md:hidden"
                                    title="Быстрый просмотр"
                                >
                                    <Eye className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        isInCompare ? removeFromCompare(marketplace.id) : addToCompare(marketplace);
                                    }}
                                    className={`rounded-full p-2.5 backdrop-blur-md transition-all shadow-lg ${isInCompare ? 'bg-emerald-500 text-white' : 'bg-white/90 text-slate-600 hover:bg-white hover:scale-105'}`}
                                    title="Сравнить"
                                >
                                    <Scale className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleFavorite(marketplace);
                                    }}
                                    className={`rounded-full p-2.5 backdrop-blur-md transition-all shadow-lg ${isFav ? 'bg-red-500 text-white scale-110' : 'bg-white/90 text-slate-600 hover:bg-white hover:scale-105'}`}
                                >
                                    <Heart className={`h-5 w-5 ${isFav ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t pt-4 mt-auto">
                            <div className="flex flex-col">
                                {marketplace.discount > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground line-through decoration-red-500/50">
                                            {(marketplace.price || 4999000).toLocaleString()} So'm
                                        </span>
                                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                                            -{marketplace.discount}%
                                        </span>
                                    </div>
                                )}
                                <div className="text-2xl font-bold text-primary">
                                    {(Math.round((marketplace.price || 4999000) * (1 - (marketplace.discount || 0) / 100))).toLocaleString()} So'm
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
                className="group relative flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all shadow-sm hover:shadow-xl overflow-hidden"
            >
                <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 p-6 relative">
                    <img
                        src={marketplace.image || "https://images.unsplash.com/photo-1472851294608-4151050801cd?auto=format&fit=crop&q=80&w=1000"}
                        alt={marketplace.name}
                        className="h-full w-full object-contain transition-all duration-300 group-hover:scale-105"
                    />
                    {/* Quick View Button (Desktop overlay) */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setShowQuickView(true);
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold"
                    >
                        <div className="bg-white text-slate-900 rounded-full px-4 py-2 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <Eye className="w-4 h-4" />
                            <span>Быстрый просмотр</span>
                        </div>
                    </button>

                    <div className="absolute right-3 top-3 flex flex-col gap-2 z-10 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                toggleFavorite(marketplace);
                            }}
                            className={`rounded-full p-2.5 backdrop-blur-md transition-all shadow-lg ${isFav ? 'bg-red-500 text-white scale-110' : 'bg-white/90 text-slate-600 hover:bg-white hover:scale-105'}`}
                        >
                            <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                isInCompare ? removeFromCompare(marketplace.id) : addToCompare(marketplace);
                            }}
                            className={`rounded-full p-2.5 backdrop-blur-md transition-all shadow-lg ${isInCompare ? 'bg-emerald-500 text-white' : 'bg-white/90 text-slate-600 hover:bg-white hover:scale-105'}`}
                            title="Сравнить"
                        >
                            <Scale className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors border-primary/20 bg-primary/10 text-primary dark:text-white dark:border-white/20 dark:bg-white/10">
                                {marketplace.region}
                            </span>
                            {marketplace.isFeatured && (
                                <span className="inline-flex items-center rounded-full border border-yellow-500/20 bg-yellow-50 text-yellow-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                    <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                                    VIP
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-yellow-500">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{marketplace.rating ? marketplace.rating.toFixed(1) : 'Новинка'}</span>
                        </div>
                    </div>

                    {/* Category badges */}
                    <div className="mb-1 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        {["Квартиры", "Дома", "Коммерческая", "Земля", "Apartments", "Houses"].includes(marketplace.category) && (
                            <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5">
                                Недвижимость
                            </span>
                        )}
                        {["Седан", "Кроссовер", "Внедорожник", "Электромобиль", "Cars", "Transport"].includes(marketplace.category) && (
                            <span className="rounded-full bg-sky-50 text-sky-700 px-2 py-0.5">
                                Авто
                            </span>
                        )}
                    </div>


                    <Link to={`/marketplaces/${marketplace.id}`} className="mb-2 block">
                        <h3 className="line-clamp-1 text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{marketplace.name}</h3>
                    </Link>

                    {/* Attributes Display */}
                    <div className="mb-4 min-h-[40px] flex flex-col justify-start">
                        {(() => {
                            const parsed = marketplace.attributes ? (typeof marketplace.attributes === 'string' ? JSON.parse(marketplace.attributes) : marketplace.attributes) : {};
                            const attrs = parsed.specs || parsed; // Fallback to root or use specs

                            // Real Estate Attributes
                            if (["Квартиры", "Дома", "Коммерческая", "Земля", "Apartments", "Houses"].includes(marketplace.category)) {
                                if (attrs.area || attrs.rooms) {
                                    return (
                                        <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                                            {attrs.rooms && <div className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{attrs.rooms} комн.</div>}
                                            {attrs.area && <div className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{attrs.area} м²</div>}
                                            {attrs.floor && <div className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{attrs.floor} эт.</div>}
                                        </div>
                                    );
                                }
                            }

                            // Car Attributes
                            if (["Седан", "Кроссовер", "Внедорожник", "Электромобиль", "Cars", "Transport"].includes(marketplace.category)) {
                                if (attrs.year || attrs.mileage) {
                                    return (
                                        <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                                            {attrs.year && <div className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{attrs.year} г.</div>}
                                            {attrs.mileage && <div className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{attrs.mileage.toLocaleString()} км</div>}
                                            {attrs.transmission && <div className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{attrs.transmission}</div>}
                                        </div>
                                    );
                                }
                            }

                            return <p className="text-sm text-slate-500 line-clamp-2">{marketplace.description}</p>;
                        })()}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4 mt-auto">
                        <div className="flex flex-col">
                            {marketplace.discount > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 line-through decoration-red-500/50">
                                        {(marketplace.price || 4999000).toLocaleString()} So'm
                                    </span>
                                    <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1 rounded">
                                        -{marketplace.discount}%
                                    </span>
                                </div>
                            )}
                            <div className="font-bold text-slate-900 dark:text-white text-lg">
                                {(Math.round((marketplace.price || 4999000) * (1 - (marketplace.discount || 0) / 100))).toLocaleString()} So'm
                            </div>
                        </div>

                        {["Квартиры", "Дома", "Коммерческая", "Земля", "Седан", "Кроссовер", "Внедорожник", "Apartments", "Houses"].includes(marketplace.category) ? (
                            <Link
                                to={`/marketplaces/${marketplace.id}`}
                                className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-xs font-bold transition-all duration-300 shadow-md bg-slate-800 text-white hover:bg-slate-900 active:scale-95"
                            >
                                Подробнее
                            </Link>
                        ) : (
                            <button
                                onClick={handleAddToCart}
                                disabled={isAdded}
                                className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-xs font-bold transition-all duration-300 shadow-md active:scale-95 ${isAdded
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-600/30'
                                    }`}
                            >
                                {isAdded ? (
                                    <>
                                        <Check className="mr-2 h-3.5 w-3.5" />
                                        В Корзине
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="mr-2 h-3.5 w-3.5" />
                                        Купить
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
            {showQuickView && <QuickViewModal product={marketplace} onClose={() => setShowQuickView(false)} />}
        </>
    );
}
