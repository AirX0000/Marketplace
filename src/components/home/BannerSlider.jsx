import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BannerSkeleton } from './BannerSkeleton';

export function BannerSlider() {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [banners, setBanners] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadBanners = async () => {
            try {
                const data = await api.getBanners();
                if (data && data.length > 0) {
                    setBanners(data);
                } else {
                    // Fallback to defaults if no banners in DB
                    setBanners([
                        {
                            id: 'default-1',
                            imageUrl: 'https://images.unsplash.com/photo-1620067335606-f138e65893b8?q=80&w=2000',
                            title: t('home.banners.premium_cars', 'Доступные автомобили'),
                            link: '/marketplaces?category=Transport'
                        },
                        {
                            id: 'default-2',
                            imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000',
                            title: t('home.banners.luxury_villas', 'Лучшая недвижимость'),
                            link: '/marketplaces?category=Недвижимость'
                        }
                    ]);
                }
            } catch (error) {
                console.error("Failed to load banners", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadBanners();
    }, []);

    useEffect(() => {
        if (banners.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [banners.length]);

    const handleImageLoad = () => {
        // We can keep track of per-image loading if needed, but for now just one global sweep is fine
        // setIsLoading(false);
    };

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);

    if (isLoading) return <BannerSkeleton className="w-full h-full" />;
    if (banners.length === 0) return null;

    return (
        <div className="relative w-full h-full overflow-hidden">
            {isLoading && <BannerSkeleton className="absolute inset-0 z-20" />}

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    <Link to={banners[currentIndex].link} className="block w-full h-full">
                        {/* Dark gradient overlay for text readability */}
                        <div className="absolute inset-x-0 bottom-0 top-1/4 bg-linear-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
                        
                        <div className="absolute bottom-16 left-12 z-20 max-w-xl animate-in fade-in slide-in-from-left-8 duration-700">
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-lg uppercase">
                                {banners[currentIndex].title}
                            </h2>
                            <div className="flex gap-4">
                                <span className="px-6 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-sm shadow-xl hover:scale-105 transition-transform">
                                    Подробнее
                                </span>
                            </div>
                        </div>

                        <img
                            src={banners[currentIndex].imageUrl}
                            alt={banners[currentIndex].title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onLoad={handleImageLoad}
                        />
                    </Link>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <div className="absolute inset-0 flex items-center justify-between p-4 z-10 pointer-events-none">
                <button
                    onClick={prevSlide}
                    className="p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/40 transition-all pointer-events-auto"
                    aria-label="Previous slide"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={nextSlide}
                    className="p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/40 transition-all pointer-events-auto"
                    aria-label="Next slide"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                            ? 'bg-white w-6'
                            : 'bg-white/50 hover:bg-white/80'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Glossy Overlay effect for extra premium feel */}
            <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-black/10 to-transparent pointer-none" />
        </div>
    );
}
