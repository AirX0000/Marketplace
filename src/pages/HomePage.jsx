import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Search, Gift, Zap, Crown, Flame, Clock, Percent, Smartphone, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { MarketplaceCard } from '../components/MarketplaceCard';
import { ServiceGrid } from '../components/home/ServiceGrid';
import { BannerSlider } from '../components/home/BannerSlider';
import { RecentlyViewed } from '../components/RecentlyViewed';
import { BrandCarousel } from '../components/home/BrandCarousel';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { useShop } from '../context/ShopContext';
import { EmptyState } from '../components/ui/EmptyState';

const SEMANTIC_CATEGORIES = [
    { id: 'popular', label: 'Популярное', search: 'hot', icon: Flame, color: 'text-orange-500 bg-orange-100 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20' },
    { id: 'electric', label: 'Электро', search: 'электромобиль', icon: Zap, color: 'text-blue-500 bg-blue-100 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' },
    { id: 'premium', label: 'Премиум', search: 'premium', icon: Crown, color: 'text-amber-500 bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' },
    { id: 'discounts', label: 'Супер Цена', search: 'скидка', icon: Percent, color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' },
    { id: 'gifts', label: 'В подарок', search: 'подарок', icon: Gift, color: 'text-pink-500 bg-pink-100 dark:bg-pink-500/10 border-pink-200 dark:border-pink-500/20' },
    { id: 'soon', label: 'Скоро', search: 'скоро', icon: Clock, color: 'text-slate-500 bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600' },
];

const MOCK_LISTINGS = [
    {
        id: 'mock-1',
        name: 'Современная Вилла в Ташкенте',
        name_uz: 'Toshkentdagi zamonaviy villa',
        description: 'Роскошная вилла с панорамным видом, бассейном и современным дизайном.',
        price: 1500000000,
        category: 'Недвижимость',
        region: 'Ташкент',
        image: '/images/house_mock.png',
        images: '[]',
        rating: 4.9,
        views: 1250,
        status: 'APPROVED',
        isFeatured: true
    },
    {
        id: 'mock-2',
        name: 'Premium SUV Black Edition',
        name_uz: 'SUV Black Edition Premum',
        description: 'Стильный и мощный внедорожник для тех, кто ценит комфорт и статус.',
        price: 450000000,
        category: 'Transport',
        region: 'Ташкент',
        image: '/images/car_mock.png',
        images: '[]',
        rating: 5.0,
        views: 840,
        status: 'APPROVED',
        isFeatured: true
    },
    {
        id: 'mock-3',
        name: 'Квартира в ЖК "Infinity"',
        name_uz: '"Infinity" turar-joy majmuasidagi kvartira',
        description: 'Уютная квартира с дизайнерским ремонтом в центре города.',
        price: 850000000,
        category: 'Недвижимость',
        region: 'Ташкент',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800',
        images: '[]',
        rating: 4.8,
        views: 2100,
        status: 'APPROVED',
        isFeatured: true
    }
];

export function HomePage() {
    const { t } = useTranslation();
    const { isAuthenticated } = useShop();
    const [featured, setFeatured] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('popular');

    const [error, setError] = useState(null);
    const [searchTab, setSearchTab] = useState('realestate'); // 'realestate' | 'auto'
    const [searchQuery, setSearchQuery] = useState('');
    const [searchRegion, setSearchRegion] = useState('Все');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                // Always fetch via getMarketplaces using the new 'tag' backend parameter
                const params = { tag: activeTab, limit: 12 };
                if (minPrice) params.minPrice = minPrice;
                if (maxPrice) params.maxPrice = maxPrice;
                
                const data = await api.getMarketplaces(params);
                console.log("Tab data received:", data);
                let listings = Array.isArray(data) ? data : (data?.listings || []);
                
                // Filter out the persistent seeded mock items that user wants removed
                const mockNamesToRemove = [
                    "bmw x5", "tesla model", "li auto l9", "пентхаус в центре", "современная вилла"
                ];
                listings = listings.filter(item => {
                    const itemName = (item.name || "").toLowerCase();
                    return !mockNamesToRemove.some(mock => itemName.includes(mock));
                });

                setFeatured(listings);

                if (isAuthenticated) {
                    try {
                        const recs = await api.getRecommendations();
                        setRecommendations(Array.isArray(recs) ? recs : []);
                    } catch (e) {
                        console.error("Failed to load recommendations", e);
                    }
                }
            } catch (error) {
                console.error("Failed to load featured", error);
                setError(t('home.load_error', 'Не удалось загрузить данные. Возможно, проблема с подключением к серверу.'));
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [activeTab, isAuthenticated, minPrice, maxPrice]);
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set('search', searchQuery.trim());
        if (searchRegion !== 'Все') params.set('region', searchRegion);

        if (searchTab === 'realestate') {
            params.set('category', 'Недвижимость');
        } else if (searchTab === 'auto') {
            params.set('category', 'Transport');
        }

        navigate(`/marketplaces?${params.toString()}`);
    };

    const quickLink = (type) => {
        const params = new URLSearchParams();
        if (type === 'new-buildings') {
            params.set('category', 'Недвижимость');
            params.set('subcategory', 'Новостройки');
        } else if (type === 'secondary') {
            params.set('category', 'Недвижимость');
            params.set('subcategory', 'Вторичное жильё');
        } else if (type === 'new-cars') {
            params.set('category', 'Transport');
            params.set('subcategory', 'Новые автомобили');
        } else if (type === 'used-cars') {
            params.set('category', 'Transport');
            params.set('subcategory', 'Авто с пробегом');
        }
        navigate(`/marketplaces?${params.toString()}`);
    };

    const handleSemanticClick = (searchKeyword) => {
        const params = new URLSearchParams();
        if (searchKeyword) params.set('search', searchKeyword);
        navigate(`/marketplaces?${params.toString()}`);
    };

    return (
        <main className="min-h-screen bg-transparent">
            <Helmet>
                <title>{t('seo.home_title')}</title>
                <meta name="description" content={t('seo.home_description')} />
                <link rel="canonical" href="https://autohouse.uz/" />
                <meta property="og:title" content={t('seo.home_title')} />
                <meta property="og:description" content={t('seo.home_description')} />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://autohouse.uz/og-image.jpg" />
                
                {/* Structured Data (JSON-LD) */}
                <script type="application/ld+json">
                    {JSON.stringify([
                        {
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            "name": "Autohouse",
                            "url": "https://autohouse.uz/",
                            "potentialAction": {
                                "@type": "SearchAction",
                                "target": "https://autohouse.uz/marketplaces?search={search_term_string}",
                                "query-input": "required name=search_term_string"
                            }
                        },
                        {
                            "@context": "https://schema.org",
                            "@type": "LocalBusiness",
                            "name": "Autohouse.uz",
                            "image": "https://autohouse.uz/logo.png",
                            "address": {
                                "@type": "PostalAddress",
                                "streetAddress": "Tashkent City",
                                "addressLocality": "Tashkent",
                                "addressCountry": "UZ"
                            },
                            "url": "https://autohouse.uz/",
                            "telephone": "+998710000000"
                        }
                    ])}
                </script>
            </Helmet>
            <h1 className="sr-only">Autohouse.uz - Автомобили и недвижимость в Узбекистане</h1>
            <div className="flex flex-col min-h-screen">
                {/* HERO SEARCH SECTION */}
                <section className="relative bg-[#0F1117] pt-6 pb-12 overflow-hidden">
                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                         <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/30 blur-[120px] rounded-full" />
                         <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/20 blur-[120px] rounded-full" />
                    </div>

                    <div className="container relative z-10">
                        <div className="max-w-4xl mx-auto flex flex-col items-center">
                            {/* Heading */}
                            <div className="text-center mb-8">
                                <h2 className="text-white text-3xl md:text-5xl font-black italic uppercase tracking-tighter drop-shadow-2xl">
                                    {t('home.hero_title', 'Найди свой дом или авто')}
                                </h2>
                                <p className="text-white/50 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mt-3">
                                    {t('home.hero_subtitle', 'Премиальный маркетплейс в Узбекистане')}
                                </p>
                            </div>

                            {/* Main Search Bar - Restored per user request */}
                            <div className="w-full max-w-3xl mb-12">
                                <div className="flex bg-[#1a1c23]/60 backdrop-blur-2xl rounded-3xl p-1.5 shadow-2xl border border-white/5">
                                    <div className="flex flex-1 items-center bg-[#0F1117] rounded-[1.25rem] p-1.5 relative group">
                                        <div className="flex gap-1 mr-3 p-1 bg-white/5 rounded-xl">
                                            <button 
                                                onClick={() => setSearchTab('realestate')}
                                                className={cn(
                                                    "px-6 py-2 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all",
                                                    searchTab === 'realestate' ? "bg-white text-slate-900 shadow-xl" : "text-white/40 hover:text-white/70"
                                                )}
                                            >
                                                {t('home.real_estate', 'Недвижимость')}
                                            </button>
                                            <button 
                                                onClick={() => setSearchTab('auto')}
                                                className={cn(
                                                    "px-6 py-2 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest transition-all",
                                                    searchTab === 'auto' ? "bg-white text-slate-900 shadow-xl" : "text-white/40 hover:text-white/70"
                                                )}
                                            >
                                                {t('home.auto', 'Авто')}
                                            </button>
                                        </div>

                                        <div className="flex-1 flex items-center min-w-0">
                                            <Search className="ml-3 text-slate-500 shrink-0" size={18} />
                                            <input 
                                                type="text"
                                                placeholder={searchTab === 'realestate' ? "Район, улица или ЖК..." : "Марка, модель или запчасть..."}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full bg-transparent border-none outline-none text-white text-[12px] md:text-sm font-medium px-3 placeholder:text-slate-600"
                                            />
                                        </div>

                                        <div className="hidden lg:flex items-center px-4 border-l border-white/5 gap-2 group/region cursor-pointer">
                                            <Building2 size={16} className="text-slate-500 group-hover/region:text-white transition-colors" />
                                            <select 
                                                value={searchRegion}
                                                onChange={(e) => setSearchRegion(e.target.value)}
                                                className="bg-transparent border-none outline-none text-white text-[10px] md:text-xs font-bold uppercase tracking-widest cursor-pointer"
                                            >
                                                <option value="Все">Весь Узбекистан</option>
                                                <option value="Tashkent">Ташкент</option>
                                                <option value="Samarkand">Самарканд</option>
                                                <option value="Bukhara">Бухара</option>
                                            </select>
                                        </div>

                                        <button 
                                            onClick={handleSearchSubmit}
                                            className="ml-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                                        >
                                            {t('common.find', 'Найти')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Featured Categories (ServiceGrid) */}
                            <ServiceGrid />

                            {/* Quick Price Filter */}
                            <div className="w-full max-w-lg mb-8 bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex items-center gap-2 group/price transition-all focus-within:border-purple-500/50">
                                <div className="pl-4 text-slate-500">
                                    <Zap size={14} className="text-purple-500" />
                                </div>
                                <input
                                    type="number"
                                    placeholder="От (сум)"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="w-full bg-transparent border-none outline-none text-white text-[10px] font-black uppercase tracking-widest placeholder:text-slate-600"
                                />
                                <div className="h-4 w-[1px] bg-white/10" />
                                <input
                                    type="number"
                                    placeholder="До (сум)"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="w-full bg-transparent border-none outline-none text-white text-[10px] font-black uppercase tracking-widest placeholder:text-slate-600"
                                />
                                {(minPrice || maxPrice) && (
                                    <button 
                                        onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                                        className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Semantic Category Chips (Tabs) */}
                            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                                {SEMANTIC_CATEGORIES.map((cat) => {
                                    const Icon = cat.icon;
                                    const isActive = activeTab === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveTab(cat.id)}
                                            className={`flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full font-bold text-[11px] md:text-xs border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg backdrop-blur-md ${isActive ? 'ring-2 ring-white/50 opacity-100 scale-105' : 'opacity-70 hover:opacity-100'} ${cat.color}`}
                                        >
                                            <Icon className="w-3.5 h-3.5 md:w-4 h-4" />
                                            {cat.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Banner Slider - Moved below search */}
                <section className="container py-8 md:py-12">
                     <div className="relative w-full h-[40vh] min-h-[300px] md:h-[50vh] md:max-h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-slate-900 group">
                        <BannerSlider />
                    </div>
                </section>

                <BrandCarousel />
                <RecentlyViewed />

                {/* Recommendations Section */}
                {isAuthenticated && recommendations.length > 0 && (
                    <section className="container py-8 md:py-12">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                {t('home.recommendations_title', 'Персональные рекомендации для вас')}
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {recommendations.slice(0, 4).map((item) => (
                                <MarketplaceCard key={`rec-${item.id}`} marketplace={item} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Featured Section */}
                <section className="container py-8 md:py-12">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            {SEMANTIC_CATEGORIES.find(c => c.id === activeTab)?.label || t('home.popular', 'Популярные предложения')}
                        </h2>
                    </div>
                    {loading ? (
                        <div className="flex overflow-x-auto gap-4 md:grid sm:grid-cols-2 lg:grid-cols-3 md:gap-6 animate-pulse -mx-4 px-4 md:mx-0 md:px-0">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="aspect-[4/3] rounded-xl bg-muted/50 w-[280px] md:w-auto shrink-0"></div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20 mx-4 md:mx-0">
                            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                            <button onClick={() => window.location.reload()} className="mt-4 text-sm text-primary hover:underline">
                                {t('home.try_again', 'Попробовать снова')}
                            </button>
                        </div>
                    ) : featured.length === 0 ? (
                        <EmptyState 
                            title={minPrice || maxPrice ? "В этом диапазоне пусто" : "Ничего не найдено"}
                            description="Попробуйте изменить ценовой фильтр или выбрать другую категорию"
                            onReset={() => { setMinPrice(''); setMaxPrice(''); setActiveTab('popular'); }}
                        />
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 md:gap-6 gap-4">
                            {featured.map((item) => (
                                <MarketplaceCard key={item.id} marketplace={item} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

export default HomePage;
