import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid, List, Map as MapIcon, X, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { MarketplaceCard } from '../components/MarketplaceCard';
import { SearchFilters } from '../components/SearchFilters';
import { MapSearch } from '../components/MapSearch';

export function CatalogPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);

    // Initial state from URL
    const getInitialFilters = () => {
        const initial = {};
        for (const [key, value] of searchParams.entries()) {
            initial[key] = value;
        }
        return {
            search: searchParams.get('q') || '',
            category: searchParams.get('category') || '',
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
            region: searchParams.get('region') || '',
            sortBy: searchParams.get('sort') || 'newest',
            ...initial
        };
    };

    const [filters, setFilters] = useState(getInitialFilters());

    useEffect(() => {
        setFilters(getInitialFilters());
    }, [searchParams]);

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const apiParams = { ...filters };
            if (apiParams.search) apiParams.q = apiParams.search;
            if (apiParams.sortBy) apiParams.sort = apiParams.sortBy;
            const data = await api.getMarketplaces(apiParams);
            setProducts(data.listings || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        if (key === 'reset') {
            setSearchParams({});
            setFilters({ search: '', sortBy: 'newest' });
            return;
        }

        const newFilters = { ...filters, [key]: value };
        if (!value) delete newFilters[key];
        setFilters(newFilters);

        const params = {};
        const urlKeys = ['q', 'category', 'minPrice', 'maxPrice', 'region', 'sort', 'minYear', 'maxYear', 'minMileage', 'maxMileage', 'transmission', 'bodyType', 'brand', 'model', 'minArea', 'maxArea', 'rooms', 'floor'];

        Object.keys(newFilters).forEach(k => {
            if (k === 'search') params.q = newFilters[k];
            else if (k === 'sortBy') params.sort = newFilters[k];
            else if (k.startsWith('attr_') || urlKeys.includes(k) || k === 'category' || k === 'minPrice' || k === 'maxPrice' || k === 'region') {
                params[k] = newFilters[k];
            }
        });
        setSearchParams(params);
    };

    return (
        <main className="min-h-screen bg-[#13111C] text-white">
            <Helmet>
                <title>Каталог Товаров | Autohouse.uz Premium</title>
                <link rel="canonical" href="https://autohouse.uz/catalog" />
            </Helmet>

            {/* Decorative BG Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px]" />
            </div>

            <div className="container mx-auto py-12 relative z-10">
                {/* Header Section - Hidden in Map Mode for immersive experience */}
                {viewMode !== 'map' && (
                    <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-12 bg-purple-600 rounded-full" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">Маркетплейс</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                                Каталог <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Объявлений</span>
                            </h1>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                                Найдено {products.length} предложений
                            </p>
                        </div>

                        {/* View Controls & Sort */}
                        <div className="flex flex-wrap items-center gap-4 bg-[#191624] p-3 rounded-3xl border border-white/5 shadow-2xl">
                            <div className="flex bg-[#13111C] p-1.5 rounded-2xl border border-white/10">
                                {[
                                    { id: 'grid', icon: Grid, label: 'Сетка' },
                                    { id: 'list', icon: List, label: 'Список' },
                                    { id: 'map', icon: MapIcon, label: 'Карта' }
                                ].map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() => setViewMode(mode.id)}
                                        className={cn(
                                            "p-2.5 rounded-xl transition-all active:scale-90 flex items-center gap-2",
                                            viewMode === mode.id
                                                ? "bg-purple-600 text-white shadow-lg"
                                                : "text-slate-500 hover:text-white hover:bg-white/5"
                                        )}
                                        title={mode.label}
                                    >
                                        <mode.icon size={18} />
                                        {viewMode === mode.id && <span className="text-[10px] font-black uppercase tracking-widest overflow-hidden block max-w-[100px] transition-all">{mode.label}</span>}
                                    </button>
                                ))}
                            </div>

                            <div className="h-8 w-[1px] bg-white/10 mx-2 hidden sm:block" />

                            <div className="relative group">
                                <select
                                    value={filters.sortBy || 'newest'}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                    className="pl-4 pr-10 py-3 bg-[#13111C] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer group-hover:bg-white/5 transition-all outline-none"
                                >
                                    <option value="newest">Новинки</option>
                                    <option value="price_asc">Дешевле</option>
                                    <option value="price_desc">Дороже</option>
                                    <option value="popular">Популярные</option>
                                </select>
                                <SlidersHorizontal size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-purple-400 transition-colors" />
                            </div>
                        </div>
                    </header>
                )}

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Desktop Filters Sidebar - Hidden in Map Mode */}
                    {viewMode !== 'map' && (
                        <aside className="hidden lg:block w-72 shrink-0 space-y-8">
                            <div className="bg-[#191624] rounded-[2.5rem] border border-white/5 p-8 shadow-2xl sticky top-28">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Фильтры</h3>
                                    <button onClick={() => handleFilterChange('reset', null)} className="text-[9px] font-black uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors">Сбросить</button>
                                </div>
                                <SearchFilters
                                    filters={filters}
                                    onChange={handleFilterChange}
                                    onClose={() => { }}
                                />
                            </div>
                        </aside>
                    )}

                    {/* Main Content Area */}
                    <section className="flex-1">
                        {/* Instant Search Bar - Hidden in Map Mode (MapSearch has its own) */}
                        {viewMode !== 'map' && (
                            <div className="bg-[#191624] rounded-[2.5rem] border border-white/5 p-4 mb-10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-blue-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                                <div className="relative flex items-center gap-4">
                                    <Search className="ml-2 md:ml-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Поиск..."
                                        value={filters.search || ''}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="flex-1 bg-transparent py-3 md:py-4 text-sm md:text-lg font-bold placeholder:text-slate-700 outline-none text-white uppercase tracking-tight"
                                    />
                                    <button
                                        onClick={() => setShowFilters(true)}
                                        className="lg:hidden p-3 md:p-4 bg-white/5 border border-white/5 rounded-2xl md:rounded-3xl hover:bg-white/10 text-white transition-all active:scale-90"
                                    >
                                        <SlidersHorizontal size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Mobile Filters Drawer */}
                        <AnimatePresence>
                            {showFilters && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setShowFilters(false)}
                                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] lg:hidden"
                                    />
                                    <motion.div
                                        initial={{ x: '100%' }}
                                        animate={{ x: 0 }}
                                        exit={{ x: '100%' }}
                                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                        className="fixed top-0 right-0 h-full w-[320px] bg-[#191624] z-[101] shadow-2xl border-l border-white/10 lg:hidden overflow-hidden flex flex-col"
                                    >
                                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                            <h3 className="font-black text-lg uppercase tracking-tight">Фильтры</h3>
                                            <button
                                                onClick={() => setShowFilters(false)}
                                                className="h-10 w-10 flex items-center justify-center bg-white/5 rounded-xl hover:bg-white/10 transition-all text-slate-400 hover:text-white"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                                            <SearchFilters
                                                filters={filters}
                                                onChange={handleFilterChange}
                                                onClose={() => setShowFilters(false)}
                                            />
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>

                        {/* Content States */}
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center py-32"
                                >
                                    <div className="inline-block relative">
                                        <div className="w-20 h-20 border-4 border-purple-600/20 border-t-purple-600 rounded-full animate-spin" />
                                        <Bot size={32} className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-purple-500" />
                                    </div>
                                    <p className="mt-8 text-slate-500 font-bold uppercase tracking-[0.3em] text-xs animate-pulse">Сканирование базы данных...</p>
                                </motion.div>
                            ) : products.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-32 bg-[#191624] rounded-[3rem] border border-white/5 border-dashed"
                                >
                                    <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                                        <Search size={40} className="text-slate-700" />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Ничего не найдено</h3>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-8">Попробуйте изменить параметры поиска</p>
                                    <button
                                        onClick={() => handleFilterChange('reset', null)}
                                        className="px-10 py-4 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 transition-all shadow-[0_15px_30px_rgba(147,51,234,0.3)] active:scale-95"
                                    >
                                        Сбросить фильтры
                                    </button>
                                </motion.div>
                            ) : viewMode === 'map' ? (
                                <motion.div
                                    key="map"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-[calc(100vh-100px)] -mt-10 -mx-4 md:-mx-10 lg:-mx-4 rounded-none md:rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative z-[100]"
                                >
                                    <MapSearch
                                        products={products}
                                        onBoundsChange={() => { }}
                                        viewMode={viewMode}
                                        setViewMode={setViewMode}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={viewMode}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "grid gap-4 md:gap-8",
                                        viewMode === 'grid'
                                            ? "grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                                            : "space-y-4 md:space-y-6"
                                    )}
                                >
                                    {products.map((product, idx) => (
                                        <motion.article
                                            key={product.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: (idx % 6) * 0.05 }}
                                        >
                                            <MarketplaceCard
                                                marketplace={product}
                                                viewMode={viewMode}
                                            />
                                        </motion.article>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Pagination Placeholder */}
                        {!loading && products.length > 0 && (
                            <div className="mt-20 flex justify-center">
                                <div className="bg-[#191624] p-2 rounded-3xl border border-white/5 flex gap-2">
                                    {[1, 2, 3, '...', 12].map((page, i) => (
                                        <button
                                            key={i}
                                            className={cn(
                                                "h-12 w-12 rounded-2xl flex items-center justify-center text-xs font-black transition-all",
                                                page === 1
                                                    ? "bg-purple-600 text-white shadow-lg"
                                                    : "text-slate-500 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
