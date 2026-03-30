import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getImageUrl } from '../../lib/utils';
const BRANDS = [
    { name: 'BMW', url: '/brands/bmw.png' },
    { name: 'Mercedes-Benz', url: '/brands/mercedes.png' },
    { name: 'BYD', url: '/brands/byd.png' },
    { name: 'Zeekr', url: '/brands/zeekr.png' },
    { name: 'Tesla', url: '/brands/tesla.png' },
    { name: 'Chevrolet', url: '/brands/chevrolet.png' },
    { name: 'Hyundai', url: '/brands/hyundai.png' },
    { name: 'Kia', url: '/brands/kia.png' },
    { name: 'Toyota', url: '/brands/toyota.png' },
    { name: 'Lexus', url: '/brands/lexus.png' }
];

export function BrandCarousel() {
    const navigate = useNavigate();

    const handleBrandClick = (brand) => {
        const params = new URLSearchParams();
        params.set('category', 'Transport');
        params.set('search', brand);
        navigate(`/marketplaces?${params.toString()}`);
    };

    return (
        <section className="py-8 bg-transparent overflow-hidden">
            <div className="container mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    Популярные Бренды
                </h2>
            </div>
            {/* Infinite Horizontal Scroll wrapper */}
            <div className="relative flex overflow-x-hidden w-full group">
                {/* Scroll track 1 */}
                <div className="animate-marquee flex items-center whitespace-nowrap">
                    {[...BRANDS, ...BRANDS].map((brand, i) => (
                        <button
                            key={`${brand.name}-${i}`}
                            onClick={() => handleBrandClick(brand.name)}
                            className="mx-2 md:mx-4 shrink-0 flex items-center justify-center w-24 h-24 md:w-32 md:h-32 bg-card border border-border rounded-2xl md:rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group-btn p-4 hover:border-primary/50"
                        >
                            <img
                                src={getImageUrl(brand.url)}
                                alt={brand.name}
                                className="w-full h-full object-contain filter dark:brightness-200 dark:grayscale transition-all duration-300 drop-shadow-sm group-hover:scale-110"
                                loading="lazy"
                            />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Add CSS to index.css or tailwind.config for marquee
// .animate-marquee {
//   animation: marquee 35s linear infinite;
// }
// @keyframes marquee {
//   0% { transform: translateX(0%); }
//   100% { transform: translateX(-50%); }
// }
