import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MarketplaceCard } from '../components/MarketplaceCard';
import { ProductSkeleton } from '../components/ui/ProductSkeleton';
import { MapSearch } from '../components/MapSearch';
import { useCompare } from '../context/CompareContext';
import { LayoutGrid, Map as MapIcon, RotateCw, Filter, ArrowUpDown, Search, SortAsc, List as ListIcon } from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils'; // Assuming cn utility is available here
import { Link } from 'react-router-dom'; // Assuming Link is available for the new card structure

export function MarketplaceListing() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [marketplaces, setMarketplaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
    const { addToCompare } = useCompare();

    const getInitialCategory = () => {
        const param = searchParams.get('category');
        return param || "Все";
    };

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || "",
        region: searchParams.get('region') || "Все",
        category: getInitialCategory(),
        minPrice: searchParams.get('minPrice') || "",
        maxPrice: searchParams.get('maxPrice') || "",
        minArea: searchParams.get('minArea') || "",
        subcategory: searchParams.get('subcategory') || "", // Add subcategory state
        maxArea: searchParams.get('maxArea') || "",
        rooms: searchParams.get('attr_rooms') || searchParams.get('rooms') || "",

        // Car Filters
        minYear: searchParams.get('minYear') || "",
        maxYear: searchParams.get('maxYear') || "",
        minMileage: searchParams.get('minMileage') || "",
        maxMileage: searchParams.get('maxMileage') || "",

        bounds: searchParams.get('bounds') || "",
        sort: searchParams.get('sort') || "popular"
    });

    // Categories state
    const [categories, setCategories] = useState([]); // Full category objects
    const regions = ["Все", "Tashkent", "Tashkent Region", "Samarkand", "Bukhara", "Andijan", "Fergana"];
    const isRealEstateCategory = ["Недвижимость", "Real Estate", "House", "Apartment", "Houses", "Land", "New Building", "Private House"].includes(filters.category);
    const isAutoCategory = ["Автомобили", "Cars", "Car", "Auto", "Transport", "Dealer", "Private Auto"].includes(filters.category);

    // Load categories from backend or use defaults
    useEffect(() => {
        // Fallback static categories in case API is empty or we want to enforce structure
        const STATIC_CATEGORIES = [
            {
                name: "Недвижимость",
                sub: [
                    "Новостройки",
                    "Вторичное жильё",
                    "Коммерческая недвижимость",
                    "Земельные участки",
                    "Квартиры в рассрочку"
                ]
            },
            {
                name: "Автомобили",
                sub: [
                    "Новые автомобили",
                    "Авто с пробегом",
                    "Коммерческий транспорт"
                ]
            },
            { name: "Электроника", sub: ["Смартфоны", "Ноутбуки", "Аксессуары"] },
            { name: "Одежда", sub: ["Мужская", "Женская", "Детская"] },
            { name: "Товары для дома", sub: ["Мебель", "Декор", "Сад"] },
        ];

        api.getCategories().then(data => {
            if (data && data.length > 0) {
                // If backend has data, you might want to merge or just use backend. 
                // For now, let's use backend BUT ensure our new subcategories exist in specific groups if they are missing.
                // Or simply prefer static if backend is barebones.
                // Let's merge: Find matching name, merge 'sub' arrays
                let merged = [...data];
                STATIC_CATEGORIES.forEach(staticCat => {
                    const index = merged.findIndex(c => (c.name || c) === staticCat.name);
                    if (index !== -1) {
                        const existing = merged[index];
                        if (typeof existing === 'string') {
                            // Convert string to object to attach subcategories
                            merged[index] = { name: existing, sub: staticCat.sub };
                        } else if (typeof existing === 'object') {
                            // Merge subs
                            if (!existing.sub) existing.sub = [];
                            staticCat.sub.forEach(s => {
                                if (!existing.sub.includes(s)) existing.sub.push(s);
                            });
                        }
                    } else {
                        merged.push(staticCat);
                    }
                });
                setCategories(merged);
            } else {
                setCategories(STATIC_CATEGORIES);
            }
        }).catch(err => {
            console.error("Failed to load categories, using static", err);
            setCategories(STATIC_CATEGORIES);
        });
    }, []);

    useEffect(() => {
        // Sync filters from URL when params change
        const newFilters = {
            search: searchParams.get('search') || "",
            region: searchParams.get('region') || "Все",
            category: getInitialCategory(),
            minPrice: searchParams.get('minPrice') || "",
            maxPrice: searchParams.get('maxPrice') || "",
            minArea: searchParams.get('minArea') || "",

            maxArea: searchParams.get('maxArea') || "",
            subcategory: searchParams.get('subcategory') || "", // Add subcategory sync
            rooms: searchParams.get('attr_rooms') || searchParams.get('rooms') || "",

            // Car Filters
            minYear: searchParams.get('minYear') || "",
            maxYear: searchParams.get('maxYear') || "",
            minMileage: searchParams.get('minMileage') || "",
            maxMileage: searchParams.get('maxMileage') || "",

            bounds: searchParams.get('bounds') || "",
            sort: searchParams.get('sort') || "popular"
        };
        // Only update if actually different to avoid loops
        if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
            setFilters(newFilters);
        }
    }, [searchParams]);

    useEffect(() => {
        loadMarketplaces();
    }, [filters]);

    async function loadMarketplaces() {
        setLoading(true);
        try {
            const params = {};
            if (filters.search) params.search = filters.search;
            if (filters.region !== "Все") params.region = filters.region;
            if (filters.bounds) params.bounds = filters.bounds;


            if (filters.category !== "Все") {
                if (["Недвижимость", "Real Estate", "House", "Apartment", "Houses", "Land", "New Building", "Private House"].includes(filters.category)) {
                    // Match any subcategory of Real Estate OR the main category itself
                    params.category = "Real Estate,Недвижимость,Квартиры,Дома,Коммерческая,Земля,Apartments,Houses,New Building,Private House";
                } else if (["Автомобили", "Cars", "Car", "Auto", "Transport", "Dealer", "Private Auto"].includes(filters.category)) {
                    // Match any subcategory of Cars OR the main category itself
                    params.category = "Transport,Cars,Автомобили,Авто,Седан,Кроссовер,Внедорожник,Электромобиль,Dealer,Private Auto";
                } else if (["Электроника", "Electronics"].includes(filters.category)) {
                    params.category = "Смартфоны,Ноутбуки,Планшеты,Аксессуары,Electronics";
                } else if (filters.subcategory) {
                    // If explicit subcategory is selected for other categories
                    params.category = filters.subcategory;
                } else {
                    params.category = filters.category;
                }
            }

            if (filters.minPrice) params.minPrice = filters.minPrice;

            // Execute API Call
            const response = await api.getMarketplaces(params);
            let filtered = response.listings || [];

            if (filters.minPrice) {
                filtered = filtered.filter(p => p.price >= Number(filters.minPrice));
            }
            if (filters.maxPrice) {
                filtered = filtered.filter(p => p.price <= Number(filters.maxPrice));
            }

            // Real Estate Filtering (Client-side)
            if (["Недвижимость", "Real Estate", "House", "Apartment", "Houses", "Land", "New Building", "Private House"].includes(filters.category)) {
                console.log("Filtering Real Estate. Total items:", filtered.length);
                filtered = filtered.filter(p => {
                    try {
                        let attrs = {};
                        if (typeof p.attributes === 'string') {
                            try { attrs = JSON.parse(p.attributes); } catch (e) { console.warn("JSON parse failed", e); return true; }
                        } else if (typeof p.attributes === 'object' && p.attributes !== null) {
                            attrs = p.attributes;
                        }

                        const specs = attrs.specs || {};

                        // Subcategory (Type) Filter
                        if (filters.subcategory) {
                            const pType = attrs.type || specs.type || "";
                            if (pType !== filters.subcategory) return false;
                        }

                        // Room Filter
                        if (filters.rooms) {
                            if (filters.rooms === '4+') {
                                if (!specs.rooms || Number(specs.rooms) < 4) return false;
                            } else {
                                if (Number(specs.rooms) !== Number(filters.rooms)) return false;
                            }
                        }

                        // Area Filter
                        if (filters.minArea && (!specs.area || Number(specs.area) < Number(filters.minArea))) return false;
                        if (filters.maxArea && (!specs.area || Number(specs.area) > Number(filters.maxArea))) return false;

                        return true;
                    } catch (e) {
                        console.error("Filter error", e);
                        return true; // Don't hide if filter crashes
                    }
                });
            }

            // Car Filtering (Client-side)
            if (["Автомобили", "Cars", "Car", "Auto", "Transport", "Dealer", "Private Auto"].includes(filters.category)) {
                console.log("Filtering Cars");
                filtered = filtered.filter(p => {
                    try {
                        let attrs = {};
                        if (typeof p.attributes === 'string') {
                            try { attrs = JSON.parse(p.attributes); } catch (e) { return true; }
                        } else if (typeof p.attributes === 'object' && p.attributes !== null) {
                            attrs = p.attributes;
                        }

                        const specs = attrs.specs || {};

                        // Subcategory (Type) Filter
                        if (filters.subcategory) {
                            const pType = attrs.type || specs.type || "";
                            if (pType !== filters.subcategory) return false;
                        }


                        // Year Filter
                        if (filters.minYear && (!specs.year || Number(specs.year) < Number(filters.minYear))) return false;
                        if (filters.maxYear && (!specs.year || Number(specs.year) > Number(filters.maxYear))) return false;

                        // Mileage Filter
                        if (filters.minMileage && (!specs.mileage || Number(specs.mileage) < Number(filters.minMileage))) return false;
                        if (filters.maxMileage && (!specs.mileage || Number(specs.mileage) > Number(filters.maxMileage))) return false;

                        return true;
                    } catch (e) {
                        console.error("Car Filter error", e);
                        return true;
                    }
                });
            }

            // Client-side sorting
            if (filters.sort === 'price_asc') {
                filtered.sort((a, b) => a.price - b.price);
            } else if (filters.sort === 'price_desc') {
                filtered.sort((a, b) => b.price - a.price);
            } else if (filters.sort === 'newest') {
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            }

            setMarketplaces(filtered);
        } catch (error) {
            console.error("Failed to load marketplaces", error);
        } finally {
            setLoading(false);
        }
    }

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            search: "",
            region: "Все",
            category: "Все",
            minPrice: "",
            maxPrice: "",
            minArea: "",
            maxArea: "",
            rooms: "",
            // Car Reset
            minYear: "",
            maxYear: "",
            minMileage: "",
            maxMileage: "",
            sort: "popular"
        });
        setSearchParams({});
    };

    const filteredMarketplaces = marketplaces; // Use this for the new structure

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="flex items-center text-lg font-semibold text-slate-900 dark:text-white">
                                    <Filter className="mr-2 h-4 w-4" /> Фильтры
                                </h3>
                                <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-primary underline">
                                    Сбросить
                                </button>
                            </div>

                            {/* Search */}
                            <div className="relative mb-6">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Поиск..."
                                    value={filters.search}
                                    onChange={(e) => updateFilter('search', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background dark:bg-slate-700 dark:border-slate-600 dark:text-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            <div className="space-y-6">
                                {/* Region */}
                                <div>
                                    <h4 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">Регион</h4>
                                    <div className="space-y-2">
                                        {regions.map((region) => (
                                            <label key={region} className="flex items-center space-x-2 text-sm cursor-pointer hover:text-primary transition-colors text-slate-700 dark:text-slate-300">
                                                <input
                                                    type="radio"
                                                    name="region"
                                                    checked={filters.region === region}
                                                    onChange={() => updateFilter('region', region)}
                                                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600"
                                                />
                                                <span>{region}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Real Estate Filters */}
                                {isRealEstateCategory && (
                                    <div className="space-y-6 animate-in slide-in-from-left-2 fade-in">
                                        {/* Rooms */}
                                        <div>
                                            <h4 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">Количество комнат</h4>
                                            <div className="flex gap-2">
                                                {['1', '2', '3', '4+'].map(r => (
                                                    <button
                                                        key={r}
                                                        onClick={() => updateFilter('rooms', filters.rooms === r ? "" : r)}
                                                        className={`flex-1 h-9 rounded-lg border text-sm font-medium transition-all ${filters.rooms === r ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:text-emerald-500'}`}
                                                    >
                                                        {r}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Area */}
                                        <div>
                                            <h4 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">Площадь (м²)</h4>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="От"
                                                    value={filters.minArea}
                                                    onChange={(e) => updateFilter('minArea', e.target.value)}
                                                    className="w-full rounded-md border border-input px-3 py-1 text-sm bg-background dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                                />
                                                <span className="text-muted-foreground self-center dark:text-slate-400">-</span>
                                                <input
                                                    type="number"
                                                    placeholder="До"
                                                    value={filters.maxArea}
                                                    onChange={(e) => updateFilter('maxArea', e.target.value)}
                                                    className="w-full rounded-md border border-input px-3 py-1 text-sm bg-background dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Car Filters */}
                                {isAutoCategory && (
                                    <div className="space-y-6 animate-in slide-in-from-left-2 fade-in">
                                        {/* Year */}
                                        <div>
                                            <h4 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">Год выпуска</h4>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="От"
                                                    value={filters.minYear}
                                                    onChange={(e) => updateFilter('minYear', e.target.value)}
                                                    className="w-full rounded-md border border-input px-3 py-1 text-sm bg-background dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                                />
                                                <span className="text-muted-foreground self-center dark:text-slate-400">-</span>
                                                <input
                                                    type="number"
                                                    placeholder="До"
                                                    value={filters.maxYear}
                                                    onChange={(e) => updateFilter('maxYear', e.target.value)}
                                                    className="w-full rounded-md border border-input px-3 py-1 text-sm bg-background dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        {/* Mileage */}
                                        <div>
                                            <h4 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">Пробег (км)</h4>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="От"
                                                    value={filters.minMileage}
                                                    onChange={(e) => updateFilter('minMileage', e.target.value)}
                                                    className="w-full rounded-md border border-input px-3 py-1 text-sm bg-background dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                                />
                                                <span className="text-muted-foreground self-center dark:text-slate-400">-</span>
                                                <input
                                                    type="number"
                                                    placeholder="До"
                                                    value={filters.maxMileage}
                                                    onChange={(e) => updateFilter('maxMileage', e.target.value)}
                                                    className="w-full rounded-md border border-input px-3 py-1 text-sm bg-background dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Category */}
                                <div>
                                    <h4 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">Категория</h4>
                                    <div className="space-y-2">
                                        {categories.map((c) => {
                                            const catName = c.name || c;
                                            return (
                                                <label key={catName} className="flex items-center space-x-2 text-sm cursor-pointer hover:text-primary transition-colors text-slate-700 dark:text-slate-300">
                                                    <input
                                                        type="radio"
                                                        name="category"
                                                        checked={filters.category === catName}
                                                        onChange={() => {
                                                            // Reset subcategory when changing main category
                                                            const newFilters = { ...filters, category: catName, subcategory: "" };
                                                            setFilters(newFilters);
                                                        }}
                                                        className="h-4 w-4 border-gray-300 text-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600"
                                                    />
                                                    <span>{catName}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Subcategories Filter */}
                                {filters.category !== "Все" && categories.find(c => (c.name || c) === filters.category)?.sub && (
                                    <div className="animate-in slide-in-from-left-2 fade-in">
                                        <h4 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
                                            Тип {filters.category === "Автомобили" ? "кузова" : "недвижимости"}
                                        </h4>
                                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                            <label className="flex items-center space-x-2 text-sm cursor-pointer hover:text-primary text-slate-700 dark:text-slate-300">
                                                <input
                                                    type="radio"
                                                    name="subcategory"
                                                    checked={filters.subcategory === ""}
                                                    onChange={() => updateFilter('subcategory', "")}
                                                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <span>Все</span>
                                            </label>
                                            {categories.find(c => (c.name || c) === filters.category)?.sub?.map((sub) => (
                                                <label key={sub} className="flex items-center space-x-2 text-sm cursor-pointer hover:text-primary text-slate-700 dark:text-slate-300">
                                                    <input
                                                        type="radio"
                                                        name="subcategory"
                                                        checked={filters.subcategory === sub}
                                                        onChange={() => updateFilter('subcategory', sub)}
                                                        className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                                                    />
                                                    <span>{sub}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Price Range */}
                                <div>
                                    <h4 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">Цена (So'm)</h4>
                                    <div className="flex gap-2">
                                        <select
                                            value={filters.minPrice}
                                            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                            className="w-full rounded-md border border-slate-200 dark:border-slate-700 p-2 text-sm dark:bg-slate-700 dark:text-white"
                                        >
                                            <option value="">От</option>
                                            <option value="1000000">1 млн</option>
                                            <option value="5000000">5 млн</option>
                                            <option value="10000000">10 млн</option>
                                            <option value="20000000">20 млн</option>
                                            <option value="50000000">50 млн</option>
                                            <option value="100000000">100 млн</option>
                                        </select>
                                        <span className="text-muted-foreground self-center dark:text-slate-400">-</span>
                                        <select
                                            value={filters.maxPrice}
                                            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                            className="w-full rounded-md border border-slate-200 dark:border-slate-700 p-2 text-sm dark:bg-slate-700 dark:text-white"
                                        >
                                            <option value="">До</option>
                                            <option value="1000000">1 млн</option>
                                            <option value="5000000">5 млн</option>
                                            <option value="10000000">10 млн</option>
                                            <option value="20000000">20 млн</option>
                                            <option value="50000000">50 млн</option>
                                            <option value="100000000">100 млн</option>
                                            <option value="500000000">500 млн</option>
                                            <option value="1000000000">1 млрд</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">
                                    {isRealEstateCategory
                                        ? "Недвижимость"
                                        : isAutoCategory
                                            ? "Автомобили"
                                            : "Каталог Магазинов"}
                                </h1>
                                <p className="text-muted-foreground text-sm dark:text-slate-400">
                                    Найдено {marketplaces.length} результатов.
                                </p>
                            </div>

                            {/* Sorting & View Toggle */}
                            <div className="flex items-center gap-4 flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <SortAsc className="h-4 w-4 text-muted-foreground dark:text-slate-400" />
                                    <select
                                        value={filters.sort}
                                        onChange={(e) => updateFilter('sort', e.target.value)}
                                        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    >
                                        <option value="popular">По популярности</option>
                                        <option value="newest">Новинки</option>
                                        <option value="price_asc">Сначала дешевые</option>
                                        <option value="price_desc">Сначала дорогие</option>
                                    </select>
                                </div>

                                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-slate-900 dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}`}
                                        title="Список"
                                    >
                                        <ListIcon size={16} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('map')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'map' ? 'bg-white shadow text-slate-900 dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}`}
                                        title="Карта"
                                    >
                                        <MapIcon size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Category Intro / Info */}
                        {isRealEstateCategory && (
                            <div className="mb-6 rounded-2xl border border-emerald-100 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-900/10 p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600 mb-1">
                                        Раздел: Недвижимость
                                    </div>
                                    <p className="text-sm text-emerald-900 dark:text-emerald-100">
                                        Квартиры в новостройках и вторичном фонде, коммерческая недвижимость и участки. Подберите объект, сравните варианты и рассчитайте ипотеку.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="px-3 py-1 rounded-full bg-white text-emerald-700 border border-emerald-100">
                                        Ипотечный калькулятор в карточке объекта
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-white text-emerald-700 border border-emerald-100">
                                        Выгодные программы от банков и застройщиков
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-white text-emerald-700 border border-emerald-100">
                                        Квартиры в рассрочку от застройщика
                                    </span>
                                </div>
                            </div>
                        )}

                        {isAutoCategory && (
                            <div className="mb-6 rounded-2xl border border-sky-100 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-900/10 p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600 mb-1">
                                        Раздел: Автомобили
                                    </div>
                                    <p className="text-sm text-sky-900 dark:text-sky-100">
                                        Новые автомобили от дилеров и авто с пробегом от частных продавцов. Проверяйте историю, сравнивайте комплектации и подбирайте условия автокредита или лизинга.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="px-3 py-1 rounded-full bg-white text-sky-700 border border-sky-100">
                                        Проверка VIN и истории авто
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-white text-sky-700 border border-sky-100">
                                        Автокредит и лизинг
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-white text-sky-700 border border-sky-100">
                                        Сравнение автомобилей
                                    </span>
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {[...Array(6)].map((_, i) => (
                                    <ProductSkeleton key={i} />
                                ))}
                            </div>
                        ) : (
                            <>
                                {/* View Mode Logic */}
                                {viewMode === 'map' ? (
                                    <div className="animate-in fade-in zoom-in-95 duration-300">
                                        <MapSearch
                                            products={marketplaces}
                                            onBoundsChange={(bounds) => updateFilter('bounds', bounds)}
                                        />
                                    </div>
                                ) : (
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {marketplaces.map((item) => (
                                            <MarketplaceCard key={item.id} marketplace={item} />
                                        ))}
                                    </div>
                                )}

                                {marketplaces.length === 0 && (
                                    <div className="text-center py-20 text-muted-foreground border rounded-lg bg-muted/20 dark:bg-slate-800/20 dark:border-slate-700 dark:text-slate-400">
                                        <div className="text-lg font-semibold">Ничего не найдено</div>
                                        <p className="text-sm">Попробуйте изменить параметры поиска.</p>
                                        <button onClick={clearFilters} className="mt-4 text-primary hover:underline">Сбросить фильтры</button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div >
            </div >
        </div >
    );
}
