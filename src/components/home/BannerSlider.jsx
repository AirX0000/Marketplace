import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BannerSkeleton } from './BannerSkeleton';

export function BannerSlider() {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);

    const banners = [
        {
            id: 1,
            url: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2000',
            alt: t('home.banners.premium_cars', 'Premium Cars'),
            link: '/marketplaces?category=Transport'
        },
        {
            id: 2,
            url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2000',
            alt: t('home.banners.luxury_villas', 'Luxury Villas'),
            link: '/marketplaces?category=Недвижимость'
        },
        {
            id: 3,
            url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2000',
            alt: t('home.banners.business_class', 'Business Class'),
            link: '/marketplaces?category=Transport'
        },
        {
            id: 4,
            url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000',
            alt: t('home.banners.modern_living', 'Modern Living'),
            link: '/marketplaces?category=Недвижимость'
        },
        {
            id: 5,
            url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2000',
            alt: t('home.banners.sport_cars', 'Sport Cars'),
            link: '/marketplaces?category=Transport'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000); // Change banner every 5 seconds

        return () => clearInterval(timer);
    }, []);

    const [isLoading, setIsLoading] = useState(true);

    const handleImageLoad = () => {
        setIsLoading(false);
    };

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);

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
                        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent z-10 pointer-events-none" />
                        <img
                            src={banners[currentIndex].url}
                            alt={banners[currentIndex].alt}
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
