import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const banners = [
    {
        id: 1,
        url: '/images/banners/banner2.png',
        alt: 'Продажа АВТО',
    },
    {
        id: 2,
        url: '/images/banners/banner3.png',
        alt: 'Продажа ДОМОВ',
    },
];

export function BannerSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000); // Change banner every 5 seconds

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-full overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    <img
                        src={banners[currentIndex].url}
                        alt={banners[currentIndex].alt}
                        className="w-full h-full object-cover"
                    />
                </motion.div>
            </AnimatePresence>

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
