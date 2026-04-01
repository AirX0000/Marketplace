import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { MarketplaceCard } from '../components/MarketplaceCard';
import { ProductSkeleton } from '../components/ui/ProductSkeleton';
import { MapSearch } from '../components/MapSearch';
import { useCompare } from '../context/CompareContext';
import { LayoutGrid, Map as MapIcon, RotateCw, Filter, ArrowUpDown, Search, SortAsc, List as ListIcon, Shield, Calculator, FileText, Building2, Briefcase, ArrowLeft, X } from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils'; // Assuming cn utility is available here
import { Link } from 'react-router-dom'; // Assuming Link is available for the new card structure
import { useTranslation } from 'react-i18next';

export function MarketplaceListing() {
    const { t, i18n } = useTranslation();
    const isUz = i18n.language === 'uz';
    const [searchParams, setSearchParams] = useSearchParams();
    const [marketplaces, setMarketplaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
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
        brand: searchParams.get('brand') || "",
        color: searchParams.get('color') || "",

        bounds: searchParams.get('bounds') || "",
        sort: searchParams.get('sort') || "popular"
    });

    // Categories state
    const [categories, setCategories] = useState([]); // Full category objects
    const [regions, setRegions] = useState(["Все", "г.Ташкент", "Ташкентская область", "Самаркандская область", "Бухарская область", "Андижанская область", "Ферганская область"]);
    const catLowerState = (filters.category || "").toLowerCase();
    const isRealEstateCategory = ["недвижимость", "ko'chmas mulk", "real estate", "house", "apartment", "houses", "land", "new building", "private house", "новостройки", "вторичные", "вторичное жильё", "участки", "аренда"].includes(catLowerState);
    const isAutoCategory = ["автомобили", "avtomobillar", "cars", "car", "auto", "transport", "dealer", "private auto", "автосалон", "с пробегом", "новый без пробега", "бозор (авто с пробегом)", "автосалон (новые авто)"].includes(catLowerState);
    const isServicesCategory = ["услуги", "xizmatlar", "services"].includes(catLowerState);

    // Load categories from backend or use defaults
    useEffect(() => {
        api.getRegions().then(data => {
            if (data && data.length > 0) {
                setRegions(["Все", ...data.map(r => r.name)]);
            }
        }).catch(err => console.error("Failed to fetch regions", err));

        // Fallback static categories in case API is empty or we want to enforce structure
        const STATIC_CATEGORIES = [
            {
                name: "Недвижимость",
                sub: [
                    "Новостройки",
                    "Вторичные",
                    "Нежилое помещение",
                    "Аренда",
                    "Участки"
                ]
            },
            {
                name: "Автомобили",
                sub: [
                    "Автосалон",
                    "С пробегом",
                    "Новый без пробега"
                ]
            },
            {
                name: "Услуги",
                sub: [
                    "Страхование",
                    "Оценка",
                    "Нотариус",
                    "Риелтор"
                ]
            }
        ];

        api.getCategories().then(data => {
            if (data && data.length > 0) {
                // Normalize and merge categories
                let normalized = [];
                const seenNames = new Set();

                // Advanced Grouping / Merging
                const CATEGORY_MAP = {
                    'Real Estate': 'Недвижимость',
                    'RealEstate': 'Недвижимость',
                    'Properties': 'Недвижимость',
                    'Apartment': 'Недвижимость',
                    'House': 'Недвижимость'
                };

                // Helper to get normalized name
                const getNormalizedName = (item) => {
                    const rawName = typeof item === 'string' ? item : (item.name || "");
                    return CATEGORY_MAP[rawName] || rawName;
                };

                data.forEach(item => {
                    const name = getNormalizedName(item);
                    if (!name) return;

                    if (seenNames.has(name)) {
                        const existing = normalized.find(c => (typeof c === 'string' ? c : c.name) === name);
                        if (typeof existing === 'object' && typeof item === 'object' && item.sub) {
                            if (!existing.sub) existing.sub = [];
                            item.sub.forEach(s => {
                                if (!existing.sub.includes(s)) existing.sub.push(s);
                            });
                        }
                    } else {
                        seenNames.add(name);
                        if (typeof item === 'object') {
                            normalized.push({ ...item, name });
                        } else {
                            normalized.push(name);
                        }
                    }
                });

                // Merge with STATIC structures for subcategories
                let merged = [...normalized];
                STATIC_CATEGORIES.forEach(staticCat => {
                    const index = merged.findIndex(c => (typeof c === 'string' ? c : c.name) === staticCat.name);
                    if (index !== -1) {
                        const existing = merged[index];
                        if (typeof existing === 'string') {
                            merged[index] = { name: existing, sub: staticCat.sub };
                        } else {
                            // If API returns many subcategories, we strictly stick to our defined structure
                            // OR merge them while avoiding English/Russian duplicates
                            const combinedSub = [...staticCat.sub];
                            if (existing.sub) {
                                existing.sub.forEach(s => {
                                    const sl = s.toLowerCase();
                                    // Only add from API if it's not logically covered by our static list
                                    const isRedundant = combinedSub.some(st => 
                                        st.toLowerCase() === sl || 
                                        (sl === 'apartment' && st === 'Новостройки') ||
                                        (sl === 'house' && st === 'Дома')
                                    );
                                    if (!isRedundant) combinedSub.push(s);
                                });
                            }
                            merged[index] = { ...existing, sub: combinedSub };
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
            brand: searchParams.get('brand') || "",
            color: searchParams.get('color') || "",

            bounds: searchParams.get('bounds') || "",
            sort: searchParams.get('sort') || "popular"
        };
        // Only update if actually different to avoid loops
        if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
            // Smart normalization: If the category from URL is actually a subcategory, 
            // set the correct parent category and subcategory filter
            const cat = newFilters.category;
            const catL = cat.toLowerCase();
            
            const realEstateSubs = ["новостройки", "вторичные", "вторичное жильё", "нежилое помещение", "аренда", "участки"];
            const autoSubs = ["автосалон", "с пробегом", "новый без пробега", "бозор (авто с пробегом)", "автосалон (новые авто)"];
            
            if (realEstateSubs.includes(catL)) {
                newFilters.category = "Недвижимость";
                newFilters.subcategory = cat;
            } else if (autoSubs.includes(catL)) {
                newFilters.category = "Автомобили";
                newFilters.subcategory = cat;
            }

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


            const catLower = (filters.category || "").toLowerCase();
            const isRealEstate = ["недвижимость", "ko'chmas mulk", "real estate", "house", "apartment", "houses", "land", "new building", "private house", "новостройки", "вторичные", "вторичное жильё", "участки", "аренда"].includes(catLower);
            const isAuto = ["автомобили", "avtomobillar", "cars", "car", "auto", "transport", "dealer", "private auto", "автосалон", "с пробегом", "новый без пробега", "бозор (авто с пробегом)", "автосалон (новые авто)"].includes(catLower);
            const isServices = ["услуги", "xizmatlar", "services"].includes(catLower);

            if (catLower !== "все" && catLower !== "all" && catLower !== "") {
                if (isRealEstate) {
                    // Match any subcategory of Real Estate OR the main category itself
                    params.category = "Real Estate,Недвижимость,Квартиры,Дома,Коммерческая,Земля,Apartments,Houses,New Building,Private House,Property,Вторичные,Вторичное жильё,Новостройки,Нежилое помещение,Аренда,Участки";
                } else if (isAuto) {
                    // Match any subcategory of Cars OR the main category itself
                    params.category = "Transport,Cars,Автомобили,Авто,Автосалон,С пробегом,Новый без пробега,Dealer,Private Auto,Vehicle,Бозор (Авто с пробегом),Автосалон (Новые авто)";
                } else if (isServices) {
                    params.category = "Услуги,Services,Страхование,Оценка,Нотариус,Риелтор,Realtor";
                } else {
                    // Fallback: send the category string as is
                    params.category = filters.category;
                }

                // If a subcategory is selected OR if the category itself is a subcategory, 
                // override with specific subcategory mapping
                const currentSub = filters.subcategory || (isRealEstate && filters.category !== "Недвижимость" ? filters.category : "") || (isAuto && filters.category !== "Автомобили" ? filters.category : "");

                if (currentSub) {
                    params.category = currentSub;
                    
                    const subL = currentSub.toLowerCase();

                    // Specific mapping for car categories that match DB values
                    if (subL === "новый без пробега" || subL === "автосалон" || subL === "автосалон (новые авто)") {
                        params.category = "Автосалон,Новый без пробега,Автосалон (Новые авто)";
                    } else if (subL === "с пробегом" || subL === "бозор (авто с пробегом)") {
                        params.category = "С пробегом,Бозор (Авто с пробегом)";
                    } else if (subL === "вторичные" || subL === "вторичное жильё") {
                        params.category = "Вторичные,Вторичное жильё,Вторичка";
                    } else if (subL === "новостройки") {
                        params.category = "Новостройки,New Building,Infinity Luxury Residence,Golden House"; // Added more variants
                    } else if (subL === "нежилое помещение") {
                        params.category = "Нежилое помещение,Коммерческая недвижимость,Коммерческая";
                    } else if (subL === "участки") {
                        params.category = "Участки,Земля,Land";
                    }
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
            if (isRealEstate) {
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
                        const pCat = (p.category || "").toLowerCase();

                        // Ensure item is actually Real Estate
                        if (!pCat.match(/real estate|недвижимость|квартир|дом|земля|участ|аренд|новострой|вторич/)) return false;

                        // Subcategory (Type) Filter
                        const currentSub = filters.subcategory || (filters.category !== "Недвижимость" ? filters.category : "");
                        if (currentSub && currentSub !== "Все") {
                            const subL = currentSub.toLowerCase();
                            const pType = (attrs.type || specs.type || "").toLowerCase();

                            // Match if category name contains subcategory, OR if attributes.type matches
                            const matchesSub = pCat.includes(subL) || pType.includes(subL);
                            
                            // Special cases
                            if (subL === "новостройки") {
                                if (!matchesSub && !pCat.includes("new building") && !pType.includes("new building")) {
                                    if (!specs.yearBuilt || Number(specs.yearBuilt) < 2024) return false;
                                }
                            } else if (subL === "вторичные" || subL === "вторичное жильё") {
                                if (!matchesSub && !pCat.includes("вторич") && !pType.includes("вторич")) return false;
                            } else if (subL === "аренда") {
                                if (!pCat.includes("аренда") && !pType.includes("rent") && !p.name.toLowerCase().includes("аренд")) return false;
                            } else if (!matchesSub) {
                                return false;
                            }
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
                        return true;
                    }
                });
            }

            // Car Filtering (Client-side)
            if (isAuto) {
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
                        const pCat = (p.category || "").toLowerCase();

                        // Ensure item is actually Auto
                        if (!pCat.match(/transport|cars|авто|машин|седан|кроссовер|внедорож/)) return false;

                        // Year Filter
                        if (filters.minYear && (!specs.year || Number(specs.year) < Number(filters.minYear))) return false;
                        if (filters.maxYear && (!specs.year || Number(specs.year) > Number(filters.maxYear))) return false;

                        // Mileage Filter
                        if (filters.minMileage && (!specs.mileage || Number(specs.mileage) < Number(filters.minMileage))) return false;
                        if (filters.maxMileage && (!specs.mileage || Number(specs.mileage) > Number(filters.maxMileage))) return false;

                        // Brand & Color Filter
                        if (filters.brand && (!specs.brand || !specs.brand.toLowerCase().includes(filters.brand.toLowerCase()))) return false;
                        if (filters.color && (!specs.color || !specs.color.toLowerCase().includes(filters.color.toLowerCase()))) return false;

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
            brand: "",
            color: "",
            sort: "popular"
        });
        setSearchParams({});
    };

    const filteredMarketplaces = marketplaces; // Use this for the new structure

    return (
        <div className="bg-background min-h-screen py-8">
            {/* Dynamic SEO per category */}
            <Helmet>
                <title>
                    {isRealEstateCategory
                        ? (isUz ? 'O\'zbekistonda ko\'chmas mulk sotib olish — kvartiralar, uylar | Autohouse.uz' : 'Купить недвижимость в Узбекистане — квартиры, дома, участки | Autohouse.uz')
                        : isAutoCategory
                            ? (isUz ? 'O\'zbekistonda avtomobil sotib olish — yangi va b/u moshinalar | Autohouse.uz' : 'Купить автомобиль в Узбекистане — новые и б/у авто, цены | Autohouse.uz')
                            : isServicesCategory
                                ? (isUz ? 'Xizmatlar — sug\'urta, notarius, baholash | Autohouse.uz' : 'Услуги — страхование, нотариус, оценка, реалтор | Autohouse.uz')
                                : filters.search
                                    ? `${isUz ? 'Qidiruv' : 'Поиск'}: «${filters.search}» — Autohouse.uz`
                                    : (isUz ? 'E\'lonlar katalogi — Avto va ko\'chmas mulk | Autohouse.uz' : 'Каталог объявлений — Купить авто, недвижимость в Узбекистане | Autohouse.uz')}
                </title>
                <meta name="description" content={
                    isRealEstateCategory
                        ? (isUz ? 'Toshkent va O\'zbekistonda ko\'chmas mulk sotuvi. Yangi uylar yoki ikkinchi qo\'l kvartiralarni sotib oling.' : 'Продажа недвижимости в Ташкенте и Узбекистане. Купить квартиру в новостройке или вторичку. Огромный выбор домов и участков на Autohouse.uz.')
                        : isAutoCategory
                            ? (isUz ? 'O\'zbekistonda yangi va ishlatilgan avtomobillar sotuvi. Moshinalarni bo\'lib to\'lashga yoki avtosalondan sotib oling.' : 'Продажа новых и б/у автомобилей в Узбекистане. Купить машину в рассрочку или через автосалон. Проверенные объявления на Autohouse.uz.')
                            : (isUz ? 'Autohouse.uz — O\'zbekistonda avto va ko\'chmas mulk sotib olishning eng yaxshi usuli.' : 'Маркетплейс Autohouse.uz — лучший способ купить или продать авто, недвижимость и запчасти в Узбекистане.')
                } />
                <meta name="keywords" content={isUz ? "avto sotib olish Toshkent, moshina bozori, uy sotish, ko'chmas mulk narxlari, Autohouse" : "купить авто Ташкент, продажа машин Узбекистан, купить квартиру Ташкент, недвижимость цены, авторынок, Autohouse"} />
                <link rel="canonical" href={`https://autohouse.uz/marketplaces${filters.category !== 'Все' ? `?category=${encodeURIComponent(filters.category)}` : ''}`} />
                <meta property="og:title" content={isUz ? "E'lonlar katalogi | Autohouse.uz" : "Каталог объявлений | Autohouse.uz"} />
                <meta property="og:description" content={isUz ? "O'zbekistonda avto va ko'chmas mulk sotuvi bo'yicha eng yaxshi takliflar." : "Лучшие предложения по продаже авто и недвижимости в Узбекистане."} />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Autohouse.uz" />
            </Helmet>
            <div className="container mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar / Mobile Filters Modal */}
                    <aside className={cn(
                        "flex-shrink-0 z-[200] lg:block lg:w-64 lg:static",
                        isMobileFiltersOpen ? "fixed inset-0" : "hidden"
                    )}>
                        {/* Backdrop for mobile */}
                        {isMobileFiltersOpen && (
                            <div 
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity" 
                                onClick={() => setIsMobileFiltersOpen(false)} 
                            />
                        )}

                        <div className={cn(
                            "bg-white dark:bg-slate-800 shadow-sm border-slate-100 dark:border-slate-700 flex flex-col",
                            isMobileFiltersOpen 
                                ? "absolute bottom-0 w-full h-[85vh] rounded-t-3xl p-6 overflow-y-auto animate-in slide-in-from-bottom duration-300"
                                : "rounded-xl border p-6 space-y-8"
                        )}>
                            <div className="flex items-center justify-between mb-4 pb-2 border-b lg:border-none border-border">
                                <h3 className="flex items-center text-lg font-semibold text-slate-900 dark:text-white">
                                    <Filter className="mr-2 h-4 w-4" /> Фильтры
                                </h3>
                                <div className="flex items-center gap-4">
                                    <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-primary underline">
                                        Сбросить
                                    </button>
                                    {isMobileFiltersOpen && (
                                        <button onClick={() => setIsMobileFiltersOpen(false)} className="lg:hidden p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white">
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Search */}
                            <div className="relative mb-6">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Поиск..."
                                    value={filters.search}
                                    onChange={(e) => updateFilter('search', e.target.value)}
                                    className="w-full rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
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

                                        {/* Brand */}
                                        <div>
                                            <h4 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">Марка</h4>
                                            <input
                                                type="text"
                                                placeholder="Например, Toyota"
                                                value={filters.brand}
                                                onChange={(e) => updateFilter('brand', e.target.value)}
                                                className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                            />
                                        </div>

                                        {/* Color */}
                                        <div>
                                            <h4 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">Цвет</h4>
                                            <input
                                                type="text"
                                                placeholder="Например, Белый"
                                                value={filters.color}
                                                onChange={(e) => updateFilter('color', e.target.value)}
                                                className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}



                                {/* Subcategories Filter */}
                                {filters.category !== "Все" && categories.find(c => (c.name || c) === filters.category)?.sub && (
                                    <div className="animate-in slide-in-from-left-2 fade-in">
                                        <h4 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
                                            {filters.category === "Автомобили" ? "Тип кузова" :
                                                filters.category === "Услуги" ? "Вид услуги" :
                                                    "Тип недвижимости"}
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
                                    <h4 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">Цена (Sum)</h4>
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
                            
                            {/* Sticky Apply Button for Mobile */}
                            {isMobileFiltersOpen && (
                                <div className="sticky bottom-0 -mx-6 -mb-6 p-4 bg-white dark:bg-slate-800 border-t border-border mt-auto">
                                    <button 
                                        onClick={() => setIsMobileFiltersOpen(false)}
                                        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/25"
                                    >
                                        Показать {marketplaces.length} результатов
                                    </button>
                                </div>
                            )}
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
                                            : isServicesCategory
                                                ? "Услуги"
                                                : "Каталог"}
                                </h1>
                                <p className="text-muted-foreground text-sm dark:text-slate-400">
                                    Найдено {marketplaces.length} результатов.
                                </p>
                            </div>

                            {/* Sorting, View Toggle & Mobile Filters */}
                            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                                <button
                                    onClick={() => setIsMobileFiltersOpen(true)}
                                    className="lg:hidden flex-1 sm:flex-none flex items-center justify-center gap-2 h-9 px-4 rounded-md border border-input bg-background/50 text-sm font-medium focus:outline-none"
                                >
                                    <Filter className="h-4 w-4" />
                                    Фильтры
                                </button>
                                
                                <div className="flex items-center gap-2 flex-1 sm:flex-none">
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

                        {/* Pill Categories for Real Estate */}
                        {isRealEstateCategory && (
                            <div className="flex flex-wrap gap-2 mb-8 items-center">
                                {(() => {
                                    const currCat = categories.find(c => (c.name || c) === filters.category);
                                    const pills = currCat?.sub ? ["Все", ...currCat.sub] : ["Все", "Вторичные", "Новостройки", "Нежилое помещение", "Аренда", "Участки"];
                                    return pills.map(pill => {
                                        const isActive = filters.subcategory === (pill === "Все" ? "" : pill);
                                        return (
                                            <button
                                                key={pill}
                                                onClick={() => updateFilter('subcategory', pill === "Все" ? "" : pill)}
                                                className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 border ${isActive
                                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/25 scale-105'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-600 hover:text-emerald-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:border-emerald-500 hover:shadow-sm'
                                                    }`}
                                            >
                                                {pill}
                                            </button>
                                        );
                                    });
                                })()}
                            </div>
                        )}

                        {isAutoCategory && (
                            <div className="space-y-6 mb-8">
                                <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                                    <div className="relative z-10">
                                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100 mb-3">
                                            Машины от официальных дилеров
                                        </div>
                                        <h2 className="text-4xl font-black mb-4 tracking-tight leading-tight">
                                            Найдите свой идеальный <br />
                                            автомобиль в Ташкенте
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold border border-white/10">
                                                Выгодный автокредит
                                            </span>
                                            <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold border border-white/10">
                                                Trade-in
                                            </span>
                                            <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold border border-white/10">
                                                Рассрочка 0%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Pill Categories for Cars */}
                                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                                    {(() => {
                                        const currCat = categories.find(c => (c.name || c) === filters.category);
                                        const pills = currCat?.sub ? ["Все", ...currCat.sub] : ["Все", "Автосалон", "С пробегом", "Новый без пробега"];
                                        
                                        return pills.map(pill => {
                                            const isActive = filters.subcategory === (pill === "Все" ? "" : pill);
                                            return (
                                                <button
                                                    key={pill}
                                                    onClick={() => updateFilter('subcategory', pill === "Все" ? "" : pill)}
                                                    className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 border ${isActive
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:border-blue-500 hover:shadow-sm'
                                                        }`}
                                                >
                                                    {pill}
                                                </button>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        )}

                        {isServicesCategory && !filters.subcategory && (
                            <div className="mb-8">
                                <div className="mb-6 text-center sm:text-left">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Каталог услуг</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Выберите подходящую категорию услуг для решения ваших задач.</p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {["Страхование", "Оценка", "Нотариус", "Риелтор"].map(sub => {
                                        let Icon = Briefcase;
                                        if (sub === "Страхование") Icon = Shield;
                                        if (sub === "Оценка") Icon = Calculator;
                                        if (sub === "Нотариус") Icon = FileText;
                                        if (sub === "Риелтор") Icon = Building2;

                                        return (
                                            <button
                                                key={sub}
                                                onClick={() => updateFilter('subcategory', sub)}
                                                className="group flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-cyan-500 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer overflow-hidden relative"
                                            >
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-teal-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                                                <div className="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-sm">
                                                    <Icon size={28} strokeWidth={1.5} />
                                                </div>
                                                <span className="font-bold text-slate-800 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{sub}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {isServicesCategory && filters.subcategory && (
                            <div className="mb-6 flex">
                                <button
                                    onClick={() => updateFilter('subcategory', '')}
                                    className="flex items-center gap-2 text-sm text-cyan-700 hover:text-cyan-800 font-bold bg-cyan-50 hover:bg-cyan-100 px-5 py-2.5 rounded-xl transition-colors border border-cyan-100"
                                >
                                    <ArrowLeft size={16} /> Назад ко всем услугам
                                </button>
                            </div>
                        )}

                        {isServicesCategory && !filters.subcategory ? (
                            <div className="text-center py-16 text-slate-400 border border-slate-200 dark:border-slate-700 border-dashed rounded-2xl bg-white dark:bg-slate-800 flex flex-col items-center shadow-sm">
                                <Briefcase size={48} className="text-slate-300 mb-4" strokeWidth={1} />
                                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-1">Выберите услугу</h3>
                                <p className="text-sm">Нажмите на одну из категорий выше, чтобы просмотреть предложения.</p>
                            </div>
                        ) : loading ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {[...Array(8)].map((_, i) => (
                                    <ProductSkeleton key={i} />
                                ))}
                            </div>
                        ) : (
                            <>
                                {/* View Mode Logic */}
                                {viewMode === 'map' ? (
                                    <div className="animate-in fade-in zoom-in-95 duration-300 h-[60vh] lg:h-[70vh] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                                        <MapSearch
                                            products={marketplaces}
                                            onBoundsChange={(bounds) => updateFilter('bounds', bounds)}
                                        />
                                    </div>
                                ) : (
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
