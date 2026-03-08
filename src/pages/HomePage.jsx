import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { MarketplaceCard } from '../components/MarketplaceCard';
import { ServiceGrid } from '../components/home/ServiceGrid';
import { BannerSlider } from '../components/home/BannerSlider';
import { RecentlyViewed } from '../components/home/RecentlyViewed';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { useShop } from '../context/ShopContext';

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
                // Handle both { listings: [...] } and [...] formats
                const listings = Array.isArray(data) ? data : (data?.listings || []);
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
                <section className="container py-4 md:py-6 px-4 md:px-6">
                    <div className="flex flex-col gap-4 md:gap-6">
                        {/* Main Banner Slider */}
                        <div className="relative w-full aspect-[16/10] md:aspect-video md:max-h-[500px] rounded-3xl overflow-hidden shadow-lg bg-slate-100 dark:bg-slate-800/50">
                            <BannerSlider />
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
                    <section className="container py-8 md:py-12 px-4 md:px-6">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                Рекомендуем для вас
                            </h2>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {recommendations.slice(0, 4).map((item) => (
                                <MarketplaceCard key={`rec-${item.id}`} marketplace={item} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Featured Section */}
                <section className="container py-8 md:py-12 px-4 md:px-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            {t('home.popular', 'Популярное')}
                        </h2>
                    </div>
                    {loading ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="aspect-[4/3] rounded-xl bg-muted/50"></div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                            <button onClick={() => window.location.reload()} className="mt-4 text-sm text-primary hover:underline">
                                {t('home.try_again', 'Попробовать снова')}
                            </button>
                        </div>
                    ) : featured.length === 0 ? (
                        <div className="text-center py-12 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                            <p className="text-muted-foreground">{t('home.no_products', 'Нет товаров')}</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
