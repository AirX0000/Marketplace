import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { MarketplaceCard } from '../components/MarketplaceCard';
import { ProductSkeleton } from '../components/ui/ProductSkeleton';
import { MapSearch } from '../components/MapSearch';
import { useCompare } from '../context/CompareContext';
import { 
    LayoutGrid, Map as MapIcon, RotateCw, Filter, ArrowUpDown, 
    Search, SortAsc, List as ListIcon, Shield, Calculator, 
    FileText, Building2, Briefcase, ArrowLeft, X, Check 
} from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

export function MarketplaceListing() {
    const { t, i18n } = useTranslation();
    const isUz = i18n.language === 'uz';
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToCompare } = useCompare();
    
    // Pagination & Loading States
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [marketplaces, setMarketplaces] = useState([]);
    
    // UI States
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const observerRef = React.useRef();

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
        maxArea: searchParams.get('maxArea') || "",
        subcategory: searchParams.get('subcategory') || "",
        rooms: searchParams.get('rooms') || searchParams.get('attr_rooms') || "",
        minYear: searchParams.get('minYear') || "",
        maxYear: searchParams.get('maxYear') || "",
        minMileage: searchParams.get('minMileage') || "",
        maxMileage: searchParams.get('maxMileage') || "",
        brand: searchParams.get('brand') || "",
        transmission: searchParams.get('transmission') || "Все",
        bodyType: searchParams.get('bodyType') || "Все",
        bounds: searchParams.get('bounds') || "",
        sort: searchParams.get('sort') || "popular"
    });

    const [categories, setCategories] = useState([]); 
    const [regions, setRegions] = useState(["Все"]);
    
    const catName = filters.category || "Все";
    const isRealEstateCategory = ["недвижимость", "real estate"].includes(catName.toLowerCase());
    const isAutoCategory = ["транспорт", "автомобили", "cars", "transport"].includes(catName.toLowerCase());
    const isServicesCategory = ["услуги", "services"].includes(catName.toLowerCase());

    // Initial Load
    useEffect(() => {
        api.getRegions().then(data => {
            if (data && data.length > 0) {
                setRegions(["Все", ...data.map(r => r.name)]);
            }
        }).catch(err => console.error("Failed to fetch regions", err));

        api.getCategories().then(data => {
            if (data && data.length > 0) {
                // Show all categories in the listing too
                setCategories(data);
            }
        }).catch(err => console.error("Failed to load categories", err));
    }, []);

    // Sync URL -> State
    useEffect(() => {
        const newFilters = {
            search: searchParams.get('search') || "",
            region: searchParams.get('region') || "Все",
            category: getInitialCategory(),
            minPrice: searchParams.get('minPrice') || "",
            maxPrice: searchParams.get('maxPrice') || "",
            minArea: searchParams.get('minArea') || "",
            maxArea: searchParams.get('maxArea') || "",
            subcategory: searchParams.get('subcategory') || "",
            rooms: searchParams.get('rooms') || searchParams.get('attr_rooms') || "",
            minYear: searchParams.get('minYear') || "",
            maxYear: searchParams.get('maxYear') || "",
            minMileage: searchParams.get('minMileage') || "",
            maxMileage: searchParams.get('maxMileage') || "",
            brand: searchParams.get('brand') || "",
            transmission: searchParams.get('transmission') || "Все",
            bodyType: searchParams.get('bodyType') || "Все",
            bounds: searchParams.get('bounds') || "",
            sort: searchParams.get('sort') || "popular"
        };
        
        if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
            setFilters(newFilters);
        }
    }, [searchParams]);

    // Filters Change -> Reset Pagination & Load
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        loadMarketplaces(1);
    }, [filters]);

    // Infinite Scroll
    const loadMore = () => {
        if (!loading && !loadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadMarketplaces(nextPage);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );
        if (observerRef.current) observer.observe(observerRef.current);
        return () => {
            if (observerRef.current) observer.unobserve(observerRef.current);
        };
    }, [hasMore, loading, loadingMore, page]);

    async function loadMarketplaces(pageNum = 1) {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const params = {
                page: pageNum,
                limit: 12
            };
            if (filters.search) params.search = filters.search;
            if (filters.region !== "Все") params.region = filters.region;
            if (filters.bounds) params.bounds = filters.bounds;
            if (filters.sort) params.sort = filters.sort;
            if (filters.transmission && filters.transmission !== "Все") params.transmission = filters.transmission;
            if (filters.bodyType && filters.bodyType !== "Все") params.bodyType = filters.bodyType;

            const catLower = (filters.category || "").toLowerCase();
            const isRealEstate = ["недвижимость", "ko'chmas mulk", "real estate", "house", "apartment", "houses", "land", "new building", "private house", "новостройки", "вторичные", "вторичное жильё", "участки", "аренда"].includes(catLower);
            const isAuto = ["автомобили", "avtomobillar", "cars", "car", "auto", "transport", "dealer", "private auto", "автосалон", "с пробегом", "новый без пробега", "бозор (авто с пробегом)", "автосалон (новые авто)"].includes(catLower);
            const isServices = ["услуги", "xizmatlar", "services"].includes(catLower);

            if (catLower !== "все" && catLower !== "" && catLower !== "all") {
                if (isRealEstate) params.category = "Недвижимость";
                else if (isAuto) params.category = "Транспорт";
                else if (isServices) params.category = "Услуги";
                else params.category = filters.category;

                const currentSub = filters.subcategory || (isRealEstate && filters.category !== "Недвижимость" ? filters.category : "") || (isAuto && filters.category !== "Автомобили" ? filters.category : "");
                if (currentSub) {
                    const subL = currentSub.toLowerCase();
                    if (subL === "новый без пробега" || subL === "автосалон" || subL === "автосалон (новые авто)") {
                        params.category = "Автосалон,Новый без пробега,Автосалон (Новые авто)";
                    } else if (subL === "с пробегом" || subL === "бозор (авто с пробегом)") {
                        params.category = "С пробегом,Бозор (Авто с пробегом)";
                    } else if (subL === "вторичные" || subL === "вторичное жильё") {
                        params.category = "Вторичные,Вторичное жильё,Вторичка";
                    } else if (subL === "новостройки") {
                        params.category = "Новостройки,New Building,Infinity Luxury Residence,Golden House";
                    } else if (subL === "нежилое помещение") {
                        params.category = "Нежилое помещение,Коммерческая недвижимость,Коммерческая";
                    } else if (subL === "участки") {
                        params.category = "Участки,Земля,Land";
                    } else {
                        params.category = currentSub;
                    }
                }
            }

            if (filters.minPrice) params.minPrice = filters.minPrice;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;
            if (filters.minYear) params.minYear = filters.minYear;
            if (filters.maxYear) params.maxYear = filters.maxYear;
            if (filters.minMileage) params.minMileage = filters.minMileage;
            if (filters.maxMileage) params.maxMileage = filters.maxMileage;
            if (filters.brand) params.brand = filters.brand;
            if (filters.minArea) params.minArea = filters.minArea;
            if (filters.maxArea) params.maxArea = filters.maxArea;
            if (filters.rooms) params.rooms = filters.rooms;

            const response = await api.getMarketplaces(params);
            const filtered = response.listings || [];

            if (pageNum === 1) setMarketplaces(filtered);
            else setMarketplaces(prev => [...prev, ...filtered]);

            if (response.pagination) setHasMore(pageNum < response.pagination.pages);
            else setHasMore(filtered.length >= 12);

        } catch (error) {
            console.error("Failed to load marketplaces", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }

    const translateCategory = (name) => {
        if (name === "Все") return t('common.all', 'Все');
        const keyMap = { 'Транспорт': 'cat_transport', 'Недвижимость': 'cat_real_estate', 'Услуги': 'cat_services', 'Электроника': 'cat_electronics' };
        return t(`ads.${keyMap[name] || name.toLowerCase()}`, name);
    };

    const translateSubcategory = (name) => {
        const subKeyMap = {
            'Бозор (Авто с пробегом)': 'sub_used_cars', 'Автосалон (Новые авто)': 'sub_new_cars',
            'Вторичное жильё': 'sub_resale', 'Новостройки': 'sub_new_build', 'Аренда': 'sub_rent',
            'Участки': 'sub_land', 'Коммерческая недвижимость': 'sub_commercial'
        };
        return subKeyMap[name] ? t(`ads.${subKeyMap[name]}`, name) : name;
    };

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        const nextParams = new URLSearchParams(searchParams);
        if (value && value !== "Все") nextParams.set(key, value);
        else nextParams.delete(key);
        if (key === 'category') nextParams.delete('subcategory');
        setSearchParams(nextParams, { replace: true });
    };

    const clearFilters = () => {
        setFilters({
            search: "", region: "Все", category: "Все", minPrice: "", maxPrice: "",
            minArea: "", maxArea: "", rooms: "", minYear: "", maxYear: "",
            minMileage: "", maxMileage: "", brand: "", color: "", 
            transmission: t('common.all'), bodyType: t('common.all'), sort: "popular"
        });
        setSearchParams({});
    };

    return (
        <div className="bg-background min-h-screen py-8">
            <Helmet>
                <title>{filters.search ? `Поиск: ${filters.search}` : t('common.catalog', 'Каталог')} | Autohouse.uz</title>
            </Helmet>

            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Sidebar */}
                    <aside className={cn(
                        "flex-shrink-0 z-[200] lg:block lg:w-64 lg:static",
                        isMobileFiltersOpen ? "fixed inset-0" : "hidden"
                    )}>
                        {isMobileFiltersOpen && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileFiltersOpen(false)} />}
                        
                        <div className={cn(
                            "bg-white dark:bg-slate-900 shadow-xl lg:shadow-none border-slate-100 dark:border-slate-800 flex flex-col h-full lg:h-auto",
                            isMobileFiltersOpen ? "absolute bottom-0 w-full h-[85vh] rounded-t-3xl p-6 overflow-y-auto" : "rounded-2xl border p-6 space-y-8"
                        )}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="flex items-center text-lg font-bold text-slate-900 dark:text-white">
                                    <Filter className="mr-2 h-4 w-4 text-primary" /> {t('ads.filter_title')}
                                </h3>
                                {isMobileFiltersOpen && <button onClick={() => setIsMobileFiltersOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>}
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h4 className="text-xs font-black uppercase text-slate-400 mb-4">{t('ads.category')}</h4>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 text-sm cursor-pointer group">
                                            <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-all", filters.category === "Все" ? "bg-primary border-primary text-white" : "border-slate-200 dark:border-slate-700")}>
                                                {filters.category === "Все" && <Check size={12} />}
                                            </div>
                                            <input type="radio" className="hidden" checked={filters.category === "Все"} onChange={() => updateFilter("category", "Все")} />
                                            <span className={filters.category === "Все" ? "text-primary font-bold" : "text-slate-600 dark:text-slate-400"}>{t('common.all')}</span>
                                        </label>
                                        {categories.map(cat => (
                                            <label key={cat.name} className="flex items-center gap-3 text-sm cursor-pointer group">
                                                <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-all", filters.category === cat.name ? "bg-primary border-primary text-white" : "border-slate-200 dark:border-slate-700")}>
                                                    {filters.category === cat.name && <Check size={12} />}
                                                </div>
                                                <input type="radio" className="hidden" checked={filters.category === cat.name} onChange={() => updateFilter("category", cat.name)} />
                                                <span className={filters.category === cat.name ? "text-primary font-bold" : "text-slate-600 dark:text-slate-400"}>{translateCategory(cat.name)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-black uppercase text-slate-400 mb-4">{t('ads.region')}</h4>
                                    <select value={filters.region} onChange={e => updateFilter('region', e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold">
                                        {regions.map(r => <option key={r} value={r}>{r === 'Все' ? t('common.all') : r}</option>)}
                                    </select>
                                </div>

                                {filters.category !== "Все" && categories.find(c => c.name === filters.category)?.sub && (
                                    <div>
                                        <h4 className="text-xs font-black uppercase text-slate-400 mb-4">{t('ads.subcategory')}</h4>
                                        <div className="space-y-3">
                                            {categories.find(c => c.name === filters.category).sub.map(sub => (
                                                <label key={sub} className="flex items-center gap-3 text-sm cursor-pointer group">
                                                    <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-all", filters.subcategory === sub ? "bg-primary border-primary text-white" : "border-slate-200 dark:border-slate-700")}>
                                                        {filters.subcategory === sub && <Check size={12} />}
                                                    </div>
                                                    <input type="radio" className="hidden" checked={filters.subcategory === sub} onChange={() => updateFilter('subcategory', sub)} />
                                                    <span className={filters.subcategory === sub ? "text-primary font-bold" : "text-slate-600 dark:text-slate-400"}>{translateSubcategory(sub)}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h4 className="text-xs font-black uppercase text-slate-400 mb-4">{t('ads.price')}</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="number" placeholder={t('common.from')} value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold" />
                                        <input type="number" placeholder={t('common.to')} value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold" />
                                    </div>
                                </div>

                                {/* Auto Specific Filters */}
                                {isAutoCategory && (
                                    <>
                                        <div>
                                            <h4 className="text-xs font-black uppercase text-slate-400 mb-4">{t('ads.year')}</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="number" placeholder={t('common.from')} value={filters.minYear} onChange={e => updateFilter('minYear', e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold" />
                                                <input type="number" placeholder={t('common.to')} value={filters.maxYear} onChange={e => updateFilter('maxYear', e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase text-slate-400 mb-4">{t('ads.mileage')}</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="number" placeholder={t('common.from')} value={filters.minMileage} onChange={e => updateFilter('minMileage', e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold" />
                                                <input type="number" placeholder={t('common.to')} value={filters.maxMileage} onChange={e => updateFilter('maxMileage', e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase text-slate-400 mb-4">{t('ads.brand')}</h4>
                                            <input type="text" placeholder="Напр: BMW, Chevrolet" value={filters.brand} onChange={e => updateFilter('brand', e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase text-slate-400 mb-4">{t('ads.transmission')}</h4>
                                            <select value={filters.transmission} onChange={e => updateFilter('transmission', e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold">
                                                <option value="Все">{t('common.all')}</option>
                                                <option value="Автомат">{isUz ? 'Avtomat' : 'Автомат'}</option>
                                                <option value="Механика">{isUz ? 'Mexanika' : 'Механика'}</option>
                                                <option value="Вариатор">{isUz ? 'Variator' : 'Вариатор'}</option>
                                                <option value="Робот">{isUz ? 'Robot' : 'Робот'}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase text-slate-400 mb-4">{t('ads.body_type')}</h4>
                                            <select value={filters.bodyType} onChange={e => updateFilter('bodyType', e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold">
                                                <option value="Все">{t('common.all')}</option>
                                                <option value="Седан">{isUz ? 'Sedan' : 'Седан'}</option>
                                                <option value="Внедорожник">{isUz ? 'Yo’ltanlamas' : 'Внедорожник'}</option>
                                                <option value="Хэтчбек">{isUz ? 'Xetchbek' : 'Хэтчбек'}</option>
                                                <option value="Купе">{isUz ? 'Kupe' : 'Купе'}</option>
                                                <option value="Минивэн">{isUz ? 'Miniven' : 'Минивэн'}</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {/* Real Estate Specific Filters */}
                                {isRealEstateCategory && (
                                    <>
                                        <div>
                                            <h4 className="text-xs font-black uppercase text-slate-400 mb-4">{t('ads.rooms')}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {['1', '2', '3', '4+'].map(num => (
                                                    <button
                                                        key={num}
                                                        onClick={() => updateFilter('rooms', filters.rooms === num ? "" : num)}
                                                        className={cn(
                                                            "h-10 w-12 rounded-xl border text-sm font-bold transition-all",
                                                            filters.rooms === num 
                                                                ? "bg-primary border-primary text-white shadow-lg shadow-primary/25" 
                                                                : "border-slate-200 dark:border-slate-800 hover:border-primary/50"
                                                        )}
                                                    >
                                                        {num}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase text-slate-400 mb-4">{t('ads.area')}</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="number" placeholder={t('common.from')} value={filters.minArea} onChange={e => updateFilter('minArea', e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold" />
                                                <input type="number" placeholder={t('common.to')} value={filters.maxArea} onChange={e => updateFilter('maxArea', e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <button onClick={clearFilters} className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-400 hover:text-red-500 flex items-center justify-center gap-2 transition-colors">
                                    <RotateCw size={14} /> {t('common.reset_filters')}
                                </button>
                            </div>

                            {isMobileFiltersOpen && (
                                <button onClick={() => setIsMobileFiltersOpen(false)} className="mt-auto w-full h-14 bg-primary text-white rounded-2xl font-black shadow-xl">{t('ads.apply_results')}</button>
                            )}
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{translateCategory(filters.category)}</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Найдено {marketplaces.length} предложений</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 rounded-xl px-3 border border-slate-100 dark:border-slate-800">
                                    <SortAsc size={14} className="text-slate-400" />
                                    <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)} className="h-10 bg-transparent text-sm font-bold outline-none">
                                        <option value="popular">Популярные</option>
                                        <option value="newest">Новые</option>
                                        <option value="price_asc">Дешевле</option>
                                        <option value="price_desc">Дороже</option>
                                    </select>
                                </div>
                                
                                <div className="hidden sm:flex bg-slate-50 dark:bg-slate-900 rounded-xl p-1 border border-slate-100 dark:border-slate-800">
                                    <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded-lg transition-all", viewMode === 'grid' ? "bg-white dark:bg-slate-800 shadow-sm text-primary" : "text-slate-400")}><LayoutGrid size={18} /></button>
                                    <button onClick={() => setViewMode('map')} className={cn("p-1.5 rounded-lg transition-all", viewMode === 'map' ? "bg-white dark:bg-slate-800 shadow-sm text-primary" : "text-slate-400")}><MapIcon size={18} /></button>
                                </div>
                                
                                <button onClick={() => setIsMobileFiltersOpen(true)} className="lg:hidden h-10 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-black flex items-center gap-2">
                                    <Filter size={16} /> Фильтры
                                </button>
                            </div>
                        </div>

                        {loading && marketplaces.length === 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
                            </div>
                        ) : marketplaces.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 text-slate-300"><Search size={40} /></div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ничего не найдено</h3>
                                <p className="text-slate-500 mb-8 max-w-xs">Попробуйте изменить параметры поиска или сбросить фильтры.</p>
                                <button onClick={clearFilters} className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20">Сбросить фильтры</button>
                            </div>
                        ) : (
                            <>
                                {viewMode === 'map' ? (
                                    <div className="h-[70vh] rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-inner">
                                        <MapSearch products={marketplaces} onBoundsChange={b => updateFilter('bounds', b)} />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                        {marketplaces.map(item => <MarketplaceCard key={item.id} marketplace={item} />)}
                                        {loadingMore && [...Array(4)].map((_, i) => <ProductSkeleton key={`lm-${i}`} />)}
                                    </div>
                                )}
                                
                                <div ref={observerRef} className="h-20 flex items-center justify-center mt-12">
                                    {loadingMore && (
                                        <div className="flex items-center gap-2 text-slate-400 font-bold animate-pulse">
                                            <RotateCw size={16} className="animate-spin" /> Загрузка еще...
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
