import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid, List, Map as MapIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { api } from '../lib/api';
import { MarketplaceCard } from '../components/MarketplaceCard';
import { SearchFilters } from '../components/SearchFilters';
import { MapSearch } from '../components/MapSearch'; // Import MapSearch

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
            ...initial // Spread other params like attr_color, minYear, etc.
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
            // Pass all filters directly to API which now handles attributes
            const apiParams = { ...filters };
            if (apiParams.search) {
                apiParams.q = apiParams.search;
            }
            if (apiParams.sortBy) {
                apiParams.sort = apiParams.sortBy;
            }

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

        // Remove empty keys
        if (!value) delete newFilters[key];

        setFilters(newFilters);

        // Sync to URL
        const params = {};
        const urlKeys = [
            'q', 'category', 'minPrice', 'maxPrice', 'region', 'sort',
            // Car Filters
            'minYear', 'maxYear', 'minMileage', 'maxMileage', 'transmission', 'bodyType', 'brand', 'model',
            // Недвижимость Filters
            'minArea', 'maxArea', 'rooms', 'floor'
        ];

        // Map internal keys to URL keys if identical, else handle specific mapping
        // Our keys mostly match. 'search' -> 'q', 'sortBy' -> 'sort' mapped above.
        // We iterate newFilters and check if they should be in URL.
        Object.keys(newFilters).forEach(k => {
            if (k === 'search') params.q = newFilters[k];
            else if (k === 'sortBy') params.sort = newFilters[k];
            else if (k.startsWith('attr_') || urlKeys.includes(k) || k === 'q' || k === 'sort' || k === 'category' || k === 'minPrice' || k === 'maxPrice' || k === 'region') {
                params[k] = newFilters[k];
            }
        });

        setSearchParams(params);
    };

    return (
        <main className="container py-8 px-4">
            <Helmet>
                <title>Каталог Товаров | Autohouse.uz</title>
                <link rel="canonical" href="https://autohouse.uz/catalog" />
            </Helmet>
            {/* Header */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Каталог Товаров</h1>
                <p className="text-muted-foreground">Найдено {products.length} товаров</p>
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Desktop Filters Sidebar */}
                <aside className="hidden lg:block w-64 shrink-0">
                    <SearchFilters
                        filters={filters}
                        onChange={handleFilterChange}
                        onClose={() => { }}
                    />
                </aside>

                {/* Mobile/Main Content */}
                <section className="flex-1">
                    {/* Top Bar for Mobile */}
                    <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 mb-6 sticky top-20 z-10 lg:static">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Поиск..."
                                    value={filters.search || ''}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400"
                                />
                            </div>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                                <SlidersHorizontal size={20} />
                            </button>

                            {/* Sort Dropdown */}
                            <select
                                value={filters.sortBy || 'newest'}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-[#1a202c] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary shrink-0 cursor-pointer"
                            >
                                <option value="newest">📅 Новые</option>
                                <option value="price_asc">💰 Цена ↑</option>
                                <option value="price_desc">💰 Цена ↓</option>
                                <option value="popular">🔥 Популярные</option>
                            </select>

                            <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shrink-0">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-400'}`}
                                    title="Сетка"
                                >
                                    <Grid size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-400'}`}
                                    title="Список"
                                >
                                    <List size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode('map')}
                                    className={`p-2 ${viewMode === 'map' ? 'bg-primary text-white' : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-400'}`}
                                    title="На карте"
                                >
                                    <MapIcon size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Filters Drawer */}
                    <AnimatePresence>
                        {showFilters && (
                            <>
                                {/* Backdrop */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowFilters(false)}
                                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
                                />
                                {/* Drawer */}
                                <motion.div
                                    initial={{ x: '-100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '-100%' }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className="fixed top-0 left-0 h-full w-[280px] bg-white dark:bg-slate-900 z-50 shadow-2xl overflow-y-auto lg:hidden"
                                >
                                    <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between">
                                        <h3 className="font-bold text-lg">Фильтры</h3>
                                        <button
                                            onClick={() => setShowFilters(false)}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="p-4">
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

                    {/* Products Grid */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border">
                            <p className="text-xl font-semibold mb-2">Товары не найдены</p>
                            <button onClick={() => handleFilterChange('reset', null)} className="text-primary hover:underline">
                                Сбросить фильтры
                            </button>
                        </div>
                    ) : viewMode === 'map' ? (
                        <MapSearch products={products} onBoundsChange={() => { }} />
                    ) : (
                        <div className={viewMode === 'grid'
                            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6'
                            : 'space-y-4'
                        }>
                            {products.map(product => (
                                <article key={product.id}>
                                    <MarketplaceCard
                                        marketplace={product}
                                        viewMode={viewMode}
                                    />
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
