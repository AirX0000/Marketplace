import React, { useEffect, useState } from 'react';
import { ArrowRight, Search, Building2, Car } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { MarketplaceCard } from '../components/MarketplaceCard';
import { ServiceGrid } from '../components/home/ServiceGrid';
import { api } from '../lib/api';

export function HomePage() {
    const [featured, setFeatured] = useState([]);
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
            } catch (error) {
                console.error("Failed to load featured", error);
                setError("Не удалось загрузить данные. Возможно, проблема с подключением к серверу.");
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
            params.set('category', 'Автомобили');
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
            params.set('category', 'Автомобили');
            params.set('subcategory', 'Новые автомобили');
        } else if (type === 'used-cars') {
            params.set('category', 'Автомобили');
            params.set('subcategory', 'Авто с пробегом');
        }
        navigate(`/marketplaces?${params.toString()}`);
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* HERO SECTION WITH BANNER AND ICONS */}
            <section className="container py-6 md:py-8 px-4 md:px-6">
                <div className="flex flex-col gap-6">
                    {/* Main Banner */}
                    <div className="relative w-full h-[300px] md:h-[450px] rounded-3xl overflow-hidden shadow-xl">
                        <img
                            src="/images/banners/promo-combined.jpg"
                            alt="Marketplace Banner"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10" />
                    </div>

                    {/* Category Icons */}
                    <div className="grid grid-cols-2 gap-6">
                        <Link
                            to="/marketplaces?category=Автомобили"
                            className="group flex flex-col items-center justify-center p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg transition-all hover:scale-105 hover:shadow-2xl"
                        >
                            <div className="p-6 rounded-full bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                                <Car className="w-16 h-16 md:w-24 md:h-24 text-blue-600 dark:text-blue-400" />
                            </div>
                        </Link>

                        <Link
                            to="/marketplaces?category=Недвижимость"
                            className="group flex flex-col items-center justify-center p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg transition-all hover:scale-105 hover:shadow-2xl"
                        >
                            <div className="p-6 rounded-full bg-emerald-50 dark:bg-emerald-900/20 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors">
                                <Building2 className="w-16 h-16 md:w-24 md:h-24 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </Link>
                    </div>
                </div>
            </section>




            {/* Featured Section */}
            <section className="container py-8 md:py-12 px-4 md:px-6">
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
                            Попробовать снова
                        </button>
                    </div>
                ) : featured.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-muted-foreground">Нет товаров</p>
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
    );
}
