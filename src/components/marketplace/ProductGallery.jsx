import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SafeImage } from '../ui/SafeImage';

export const ProductGallery = ({ 
    allImages, 
    activeImage, 
    setActiveImage, 
    displayName, 
    isAuto, 
    marketplace, 
    setLightboxIndex, 
    setLightboxOpen,
    selectedMod,
    attrs
}) => {
    return (
        <div className="bg-[#191624] rounded-[32px] overflow-hidden shadow-2xl border border-white/5 relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 via-transparent to-blue-600/10 pointer-events-none" />
            
            {/* Main Image Viewport */}
            <div className="relative h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px] bg-[#13111C]/50">
                {/* Mobile Scrollable Gallery */}
                <div className="md:hidden flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
                     onScroll={(e) => {
                         const index = Math.round(e.target.scrollLeft / e.target.offsetWidth);
                         if (allImages[index]) setActiveImage(allImages[index]);
                     }}
                >
                    {allImages.map((img, idx) => (
                        <div key={idx} className="h-full w-full shrink-0 snap-center">
                            <SafeImage
                                src={img}
                                alt={`${displayName} - ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                            />
                        </div>
                    ))}
                </div>
                
                {/* Desktop Static Main Image */}
                <div className="hidden md:block w-full h-full overflow-hidden">
                    <SafeImage
                        src={activeImage}
                        alt={displayName}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 cursor-zoom-in"
                        onClick={() => { setLightboxIndex(allImages.indexOf(activeImage)); setLightboxOpen(true); }}
                    />
                </div>

                {/* Mobile Pagination Dots */}
                {allImages.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden z-30">
                        {allImages.map((_, idx) => (
                            <div 
                                key={idx}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-300",
                                    allImages.indexOf(activeImage) === idx ? "w-6 bg-purple-600" : "w-1.5 bg-white/30"
                                )}
                            />
                        ))}
                    </div>
                )}

                {/* Auto Overlays */}
                {isAuto && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[#13111C] via-transparent to-transparent flex flex-col justify-end p-6 md:p-10 pb-12 md:pb-12 pointer-events-none">
                        <div className="space-y-1 md:space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-600 text-white px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest italic">
                                    Official Dealer
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    {selectedMod?.name || 'Standard'}
                                </div>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight uppercase tracking-tighter italic drop-shadow-2xl">
                                {displayName}
                            </h2>
                        </div>
                    </div>
                )}

                {/* Panorama Trigger */}
                {marketplace.panoramaUrl && (
                    <button
                        onClick={() => document.getElementById('panorama-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="absolute bottom-6 right-6 z-30 bg-purple-600 text-white p-3 md:p-4 rounded-full shadow-2xl hover:bg-purple-500 transition-all group pointer-events-auto"
                        title="360° Тур"
                    >
                        <Compass className="h-5 w-5 md:h-6 md:w-6 group-hover:rotate-180 transition-transform duration-700" />
                    </button>
                )}

                {/* Brand Logo Overlay */}
                {isAuto && attrs.brandLogo && (
                    <div className="absolute top-6 left-6 w-12 h-12 md:w-16 md:h-16 bg-white/5 backdrop-blur-2xl rounded-2xl p-2 md:p-3 shadow-2xl border border-white/10 group-hover:scale-110 transition-transform hidden sm:block">
                        <img src={attrs.brandLogo} alt="Brand" className="w-full h-full object-contain brightness-0 invert opacity-80" />
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-6 right-6 flex flex-col gap-2">
                    <span className="bg-white/5 backdrop-blur-2xl text-slate-300 px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 italic">
                        {marketplace.category}
                    </span>
                </div>
            </div>

            {/* Thumbnail Navigation */}
            {Array.isArray(allImages) && allImages.length > 1 && (
                <div className="p-4 md:p-8 flex gap-3 md:gap-6 overflow-x-auto no-scrollbar relative z-10 bg-[#191624]/50 backdrop-blur-xl">
                    {allImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => { setActiveImage(img); setLightboxIndex(idx); }}
                            className={cn(
                                "relative flex-shrink-0 w-32 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-500",
                                activeImage === img ? "border-purple-600 ring-8 ring-purple-600/10 scale-95" : "border-white/5 opacity-40 hover:opacity-100 hover:scale-105"
                            )}
                        >
                            <SafeImage src={img} alt={`Вид ${idx}`} className="w-full h-full object-cover" />
                            {activeImage === img && <div className="absolute inset-0 bg-purple-600/20" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
