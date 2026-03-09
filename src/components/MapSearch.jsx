import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Navigation, LayoutGrid, Map as MapIcon, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 1. Refined Price Bubble Icon
const createPriceIcon = (price, isAuto) => {
    // Format price: 150 000 y.e. or 150 000 Sum
    const formattedPrice = price ? price.toLocaleString() : 'Цена';
    const unit = isAuto ? 'y.e.' : 'Sum';

    return L.divIcon({
        className: 'custom-price-marker',
        html: `
            <div class="relative group">
                <div class="bg-[#FFD600] text-black font-black px-3.5 py-1.5 rounded-xl text-[11px] whitespace-nowrap shadow-[0_8px_16px_rgba(0,0,0,0.15)] border border-black/5 transform transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                    ${formattedPrice} ${unit}
                </div>
                <!-- Triangle Pointer -->
                <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 
                            border-l-[6px] border-l-transparent 
                            border-r-[6px] border-r-transparent 
                            border-t-[6px] border-t-black/90"></div>
            </div>
        `,
        iconSize: [80, 40],
        iconAnchor: [40, 40],
    });
};

// 2. Refined Secondary Dot Icon
const createDotIcon = () => {
    return L.divIcon({
        className: 'custom-dot-marker',
        html: `
            <div class="w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-lg transform transition-transform duration-300 hover:scale-150"></div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    });
};

// Component to handle map movement
function MapEvents({ onBoundsChange }) {
    const map = useMapEvents({
        moveend: () => {
            const bounds = map.getBounds();
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();
            onBoundsChange(`${ne.lat},${ne.lng},${sw.lat},${sw.lng}`);
        },
    });
    return null;
}

export function MapSearch({ products, onBoundsChange, viewMode, setViewMode, activeCategory = 'Sotuv' }) {
    const [center, setCenter] = useState([41.2995, 69.2401]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(activeCategory);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const handleNearMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setCenter([position.coords.latitude, position.coords.longitude]);
            });
        }
    };

    return (
        <div className="h-full w-full relative z-0 bg-[#f8fafc] overflow-hidden">
            <AnimatePresence>
                {isLoaded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full w-full"
                    >
                        <MapContainer
                            center={center}
                            zoom={12}
                            zoomControl={false}
                            scrollWheelZoom={true}
                            className="h-full w-full grayscale-[0.2] contrast-[1.1]"
                        >
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            />

                            {products.map((product, idx) => {
                                if (!product.lat || !product.lng) return null;

                                // Show price bubble for first 10 items, dots for others to avoid clutter
                                const usePrice = idx < 15;
                                const isAuto = product.category === 'AUTO';

                                return (
                                    <Marker
                                        key={product.id}
                                        position={[product.lat, product.lng]}
                                        icon={usePrice ? createPriceIcon(product.price, isAuto) : createDotIcon()}
                                    >
                                        <Popup offset={usePrice ? [0, -25] : [0, -5]}>
                                            <div className="w-64 p-0">
                                                <div className="relative h-36 w-full overflow-hidden">
                                                    <img
                                                        src={product.image || product.imageUrl || '/placeholder.jpg'}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                                    />
                                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
                                                        {product.categoryName || 'Товар'}
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-white">
                                                    <h3 className="font-black text-slate-900 text-sm truncate mb-1 uppercase tracking-tight">{product.name}</h3>
                                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 italic">
                                                        {product.region} • {product.owner?.name || 'Дилер'}
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-purple-600 font-black text-lg italic tracking-tighter">
                                                            {product.price?.toLocaleString()} <span className="text-[10px] uppercase">{isAuto ? 'y.e.' : 'Sum'}</span>
                                                        </div>
                                                        <Link
                                                            to={`/marketplaces/${product.id}`}
                                                            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-[#13111C] text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-all active:scale-95"
                                                        >
                                                            Batafsil <ChevronRight size={12} />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}

                            <MapEvents onBoundsChange={onBoundsChange} />
                        </MapContainer>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FLOATING UI OVERLAYS - Exact Screen Match */}

            {/* 1. View Toggle Pill */}
            <motion.div
                initial={{ y: -50, x: '-50%', opacity: 0 }}
                animate={{ y: 0, x: '-50%', opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute top-8 left-1/2 z-[500] w-[90%] max-w-sm"
            >
                <div className="bg-white/90 backdrop-blur-2xl p-1.5 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center border border-white/40">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                            "flex-1 py-3 text-[11px] font-black uppercase tracking-[0.1em] rounded-[1.75rem] transition-all flex items-center justify-center gap-2.5",
                            viewMode !== 'map' ? "bg-slate-100 text-black shadow-inner" : "text-slate-500 hover:text-slate-800"
                        )}
                    >
                        <LayoutGrid size={16} /> Galereya
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={cn(
                            "flex-1 py-3 text-[11px] font-black uppercase tracking-[0.1em] rounded-[1.75rem] transition-all flex items-center justify-center gap-2.5",
                            viewMode === 'map' ? "bg-[#FFD600] text-black shadow-lg" : "text-slate-500 hover:text-slate-800"
                        )}
                    >
                        <MapIcon size={16} /> Xaritada
                    </button>
                </div>
            </motion.div>

            {/* 2. Category Tabs */}
            <motion.div
                initial={{ y: -50, x: '-50%', opacity: 0 }}
                animate={{ y: 0, x: '-50%', opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute top-28 left-1/2 z-[400] w-[90%] max-w-lg"
            >
                <div className="bg-white/90 backdrop-blur-2xl border border-white/40 p-1.5 rounded-[1.75rem] shadow-[0_15px_30px_rgba(0,0,0,0.05)] flex items-center">
                    {['Sotuv', 'Ijara', 'Kunlik', 'Xaridorlar'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all",
                                activeTab === tab ? "bg-white text-black shadow-sm scale-[1.02]" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* 3. Search Bar */}
            <motion.div
                initial={{ y: -50, x: '-50%', opacity: 0 }}
                animate={{ y: 0, x: '-50%', opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute top-44 left-1/2 z-[400] w-[90%] max-w-lg"
            >
                <div className="bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-white/20 flex items-center px-6 py-1.5 group focus-within:ring-4 ring-purple-500/10 transition-all duration-300">
                    <Search className="text-slate-400 mr-4" size={20} />
                    <input
                        type="text"
                        placeholder="Qidirish..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent py-3 text-sm outline-none text-slate-800 font-bold placeholder:text-slate-300"
                    />
                    <div className="h-6 w-[1px] bg-slate-100 mx-4" />
                    <button className="text-slate-400 hover:text-purple-600 transition-colors p-2 hover:bg-slate-50 rounded-xl">
                        <SlidersHorizontal size={20} />
                    </button>
                </div>
            </motion.div>

            {/* 4. Action Buttons (Near Me) */}
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="absolute bottom-12 right-8 z-[400]"
            >
                <button
                    onClick={handleNearMe}
                    className="bg-[#000000] text-white px-8 py-4 rounded-[2.5rem] flex items-center gap-3.5 shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:bg-slate-800 active:scale-95 transition-all group"
                >
                    <Navigation size={20} className="rotate-45 group-hover:scale-110 transition-transform" />
                    <span className="text-[12px] font-black uppercase tracking-[0.15em] italic">Menga yaqin</span>
                </button>
            </motion.div>

            {/* 5. Object Count Overlay */}
            <div className="absolute top-6 right-6 z-[400] hidden lg:block">
                <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border border-white/40 text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    {products.length} ob'ekt topildi
                </div>
            </div>
        </div>
    );
}
