import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { MarketplaceCard } from '../components/MarketplaceCard';
import { ServiceGrid } from '../components/home/ServiceGrid';
import { BannerSlider } from '../components/home/BannerSlider';
import { RecentlyViewed } from '../components/RecentlyViewed';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { useShop } from '../context/ShopContext';

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

    const [error, setError] = useState(null);
    const [searchTab, setSearchTab] = useState('realestate'); // 'realestate' | 'auto'
    const [searchQuery, setSearchQuery] = useState('');
    const [searchRegion, setSearchRegion] = useState('Все');

    const navigate = useNavigate();

    useEffect(() => {
        async function load() {
            try {
                const data = await api.getFeaturedMarketplaces();
                console.log("Featured data received:", data);
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
    }, []);

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

    return (
        <main className="min-h-screen bg-transparent">
            <Helmet>
                <title>Autohouse.uz - Автомобили и недвижимость в Узбекистане</title>
                <meta name="description" content="Лучший маркетплейс автомобилей и недвижимости в Узбекистане. Безопасные сделки, проверенные продавцы." />
                <meta property="og:title" content="Autohouse.uz" />
                <meta property="og:type" content="website" />
            </Helmet>
            <h1 className="sr-only">Autohouse.uz - Автомобили и недвижимость в Узбекистане</h1>
            <div className="flex flex-col min-h-screen">
                {/* HERO SECTION WITH BANNER AND ICONS */}
                {/* HERO SECTION WITH BANNER AND ICONS */}
                <section className="container py-4 md:py-6 relative">
                    <div className="flex flex-col gap-4 md:gap-6 relative">
                        {/* Main Banner Slider */}
                        <div className="relative w-full aspect-[4/5] sm:aspect-square md:aspect-video md:max-h-[550px] rounded-3xl overflow-hidden shadow-2xl bg-slate-900 group">
                            <BannerSlider />
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                            
                            {/* Floating Search Bar */}
                            <div className="absolute inset-x-4 bottom-8 md:bottom-12 z-20 flex flex-col items-center">
                                <div className="text-center mb-6 hidden md:block">
                                    <h2 className="text-white text-4xl md:text-5xl font-black italic uppercase tracking-tighter drop-shadow-2xl">
                                        Найди свой дом или авто
                                    </h2>
                                    <p className="text-white/70 text-sm font-black uppercase tracking-[0.3em] mt-2">
                                        Премиальный маркетплейс в Узбекистане
                                    </p>
                                </div>
                                
                                <form 
                                    onSubmit={handleSearchSubmit}
                                    className="w-full max-w-2xl bg-black/40 backdrop-blur-3xl rounded-2xl md:rounded-[2rem] p-2 border border-white/10 shadow-2xl hover:bg-black/50 transition-all group/form"
                                >
                                    <div className="flex flex-col md:flex-row gap-2">
                                        <div className="flex-1 relative group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50 group-hover:text-white transition-colors" />
                                            <input 
                                                type="text"
                                                placeholder="Поиск объявлений..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full h-12 md:h-14 pl-12 pr-4 bg-transparent text-white font-bold placeholder:text-white/50 border-none focus:ring-0 outline-none"
                                            />
                                        </div>
                                        <button 
                                            type="submit"
                                            className="h-12 md:h-14 px-8 bg-primary text-primary-foreground rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/25"
                                        >
                                            Найти
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        
                        <RecentlyViewed />

                        {/* Category Icons */}
                        <div className="max-w-4xl mx-auto w-full">
                            <ServiceGrid />
                        </div>
                    </div>
                </section>




                {/* Recommendations Section */}
                {isAuthenticated && recommendations.length > 0 && (
                    <section className="container py-8 md:py-12">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                Рекомендуем для вас
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
                            {t('home.popular', 'Популярное')}
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
                        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0 md:mx-0 md:px-0 no-scrollbar">
                            {MOCK_LISTINGS.map((item) => (
                                <div key={item.id} className="snap-center shrink-0 w-[280px] md:w-auto">
                                    <MarketplaceCard marketplace={item} />
                                </div>
                            ))}
                        </div>
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
