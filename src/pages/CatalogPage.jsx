import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid, List, Map as MapIcon } from 'lucide-react';
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
            'minYear', 'maxYear', 'minMileage', 'maxMileage', 'transmission', 'bodyType',
            // Real Estate Filters
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
        <div className="container py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Каталог Товаров</h1>
                <p className="text-muted-foreground">Найдено {products.length} товаров</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Desktop Filters Sidebar */}
                <div className="hidden lg:block w-64 shrink-0">
                    <SearchFilters
                        filters={filters}
                        onChange={handleFilterChange}
                        onClose={() => { }}
                    />
                </div>

                {/* Mobile/Main Content */}
                <div className="flex-1">
                    {/* Top Bar for Mobile */}
                    <div className="bg-white rounded-xl border shadow-sm p-4 mb-6 sticky top-20 z-10 lg:static">
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
                                className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                <SlidersHorizontal size={20} />
                            </button>

                            <div className="flex border rounded-lg overflow-hidden shrink-0">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'hover:bg-gray-50'}`}
                                    title="Сетка"
                                >
                                    <Grid size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'hover:bg-gray-50'}`}
                                    title="Список"
                                >
                                    <List size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode('map')}
                                    className={`p-2 ${viewMode === 'map' ? 'bg-primary text-white' : 'hover:bg-gray-50'}`}
                                    title="На карте"
                                >
                                    <MapIcon size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Filters Drawer/Expansion */}
                    {showFilters && (
                        <div className="lg:hidden mb-6">
                            <SearchFilters
                                filters={filters}
                                onChange={handleFilterChange}
                                onClose={() => setShowFilters(false)}
                            />
                        </div>
                    )}

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
                            ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                            : 'space-y-4'
                        }>
                            {products.map(product => (
                                <MarketplaceCard
                                    key={product.id}
                                    marketplace={product}
                                    viewMode={viewMode}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
