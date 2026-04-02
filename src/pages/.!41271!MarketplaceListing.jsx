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

    const [categories, setCategories] = useState([]); // Full category objects
    const [regions, setRegions] = useState(["Все"]);
    
    const catName = filters.category || "Все";
    const isRealEstateCategory = ["недвижимость", "real estate"].includes(catName.toLowerCase());
    const isAutoCategory = ["транспорт", "автомобили", "cars", "transport"].includes(catName.toLowerCase());
    const isServicesCategory = ["услуги", "services"].includes(catName.toLowerCase());
    const isElectronicsCategory = ["электроника", "electronics"].includes(catName.toLowerCase());

    // Load categories from backend or use defaults
    useEffect(() => {
        api.getRegions().then(data => {
            if (data && data.length > 0) {
                setRegions(["Все", ...data.map(r => r.name)]);
            }
        }).catch(err => console.error("Failed to fetch regions", err));

        api.getCategories().then(data => {
            if (data && data.length > 0) {
                // Filter categories with at least 1 product as per user request
                const activeCats = data.filter(c => c.count > 0);
                setCategories(activeCats);
            }
        }).catch(err => {
            console.error("Failed to load categories", err);
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
            
            const realEstateSubs = ["новостройки", "вторичные", "вторичное жильё", "нежилое помещение", "аренда", "участки", "внешний вид", "дизайн"];
            const autoSubs = ["автосалон", "с пробегом", "новый без пробега", "бозор (авто с пробегом)", "автосалон (новые авто)", "мотоциклы", "спецтехника"];
            
            if (realEstateSubs.includes(catL)) {
                newFilters.category = "Недвижимость";
                newFilters.subcategory = cat;
            } else if (autoSubs.includes(catL)) {
                newFilters.category = "Транспорт";
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
                    params.category = "Недвижимость";
                } else if (isAuto) {
                    params.category = "Транспорт";
                } else if (isServices) {
                    params.category = "Услуги";
                } else if (isElectronicsCategory) {
                    params.category = "Электроника";
                } else {
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

    const translateCategory = (name) => {
        if (name === "Все") return t('common.all', 'Все');
        const keyMap = {
            'Транспорт': 'cat_transport',
            'Недвижимость': 'cat_real_estate',
            'Услуги': 'cat_services',
            'Электроника': 'cat_electronics'
        };
        const key = keyMap[name] || name.toLowerCase();
        return t(`ads.${key}`, name);
    };

    const translateSubcategory = (name) => {
        const subKeyMap = {
            'Бозор (Авто с пробегом)': 'sub_used_cars',
            'Автосалон (Новые авто)': 'sub_new_cars',
            'Мотоциклы': 'sub_moto',
            'Спецтехника': 'sub_special',
            'Вторичное жильё': 'sub_resale',
            'Новостройки': 'sub_new_build',
            'Аренда': 'sub_rent',
            'Участки': 'sub_land',
            'Коммерческая недвижимость': 'sub_commercial'
        };
        const key = subKeyMap[name];
        return key ? t(`ads.${key}`, name) : name;
    };

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
