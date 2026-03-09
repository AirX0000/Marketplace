import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Navigation, LayoutGrid, Map as MapIcon } from 'lucide-react';
import { cn } from '../lib/utils';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Price Bubble Icon Generator
const createPriceIcon = (price) => {
    const formattedPrice = price ? (price >= 1000000 ? `${(price / 1000000).toFixed(0)} млн` : price.toLocaleString()) : 'Цена';
    // Match the screenshot: Yellow bubble with a black pointer triangle
    return L.divIcon({
        className: 'custom-price-marker',
        html: `
            <div class="relative group">
                <div class="bg-[#FFD600] text-black font-black px-3 py-1.5 rounded-lg text-xs whitespace-nowrap shadow-lg border border-black/5 transform transition-transform group-hover:scale-110">
                    ${formattedPrice}
                </div>
                <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-black"></div>
            </div>
        `,
        iconSize: [60, 30],
        iconAnchor: [30, 30],
    });
};

// Component to handle map movement
function MapEvents({ onBoundsChange }) {
    const map = useMapEvents({
        moveend: () => {
            const bounds = map.getBounds();
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();
            // Pass bounds string: ne_lat,ne_lng,sw_lat,sw_lng
            onBoundsChange(`${ne.lat},${ne.lng},${sw.lat},${sw.lng}`);
        },
    });
    return null;
}

export function MapSearch({ products, onBoundsChange, viewMode, setViewMode, activeCategory = 'Sotuv' }) {
    const [center, setCenter] = useState([41.2995, 69.2401]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(activeCategory);

    const handleNearMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setCenter([position.coords.latitude, position.coords.longitude]);
            });
        }
    };

    return (
        <div className="h-full w-full relative z-0">
            {/* TOP PILL: Gallery/Map Toggle (Handled by parent but styled here if needed) */}

            <MapContainer
                center={center}
                zoom={12}
                zoomControl={false} // Clean map
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {products.map(product => {
                    if (!product.lat || !product.lng) return null;
                    return (
                        <Marker
                            key={product.id}
                            position={[product.lat, product.lng]}
                            icon={createPriceIcon(product.price)}
                        >
                            <Popup offset={[0, -20]}>
                                <div className="w-48 overflow-hidden rounded-xl">
                                    <div className="w-full h-28 bg-slate-100 mb-2 overflow-hidden">
                                        <img src={product.image || product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="font-bold text-sm truncate px-1">{product.name}</h3>
                                    <div className="text-purple-600 font-bold mt-1 px-1">
                                        {product.price?.toLocaleString()} sum
                                    </div>
                                    <Link
                                        to={`/marketplaces/${product.id}`}
                                        className="block mt-2 text-center text-[10px] font-black uppercase tracking-widest bg-[#13111C] text-white py-2 rounded-lg hover:bg-slate-800 transition-colors"
                                    >
                                        Batafsil
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                <MapEvents onBoundsChange={onBoundsChange} />
            </MapContainer>

            {/* FLOATING UI OVERLAYS */}

            {/* 0. Main View Toggle (Gallery / Map) */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[500] w-[90%] max-w-sm">
                <div className="bg-white/90 backdrop-blur-xl p-1 rounded-2xl shadow-2xl flex items-center border border-white/20">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                            "flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2",
                            viewMode !== 'map' ? "bg-white text-black shadow-sm" : "text-slate-500 hover:text-slate-800"
                        )}
                    >
                        <LayoutGrid size={16} /> Galereya
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={cn(
                            "flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2",
                            viewMode === 'map' ? "bg-[#FFD600] text-black shadow-sm" : "text-slate-500 hover:text-slate-800"
                        )}
                    >
                        <MapIcon size={16} /> Xaritada
                    </button>
                </div>
            </div>

            {/* 1. Top Filters Tabs (Sotuv, Ijara...) */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[400] w-[90%] max-w-md">
                <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-1 rounded-2xl shadow-2xl flex items-center">
                    {['Sotuv', 'Ijara', 'Kunlik', 'Xaridorlar'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 py-2 text-[11px] font-bold rounded-xl transition-all",
                                activeTab === tab ? "bg-white text-black shadow-sm" : "text-slate-500"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Floating Search Bar */}
            <div className="absolute top-40 left-1/2 -translate-x-1/2 z-[400] w-[90%] max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl border border-white/20 flex items-center px-4 py-2 group focus-within:ring-2 ring-purple-500/20 transition-all">
                    <Search className="text-slate-400 mr-3" size={18} />
                    <input
                        type="text"
                        placeholder="Qidirish..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent py-2 text-sm outline-none text-slate-800 font-medium"
                    />
                    <div className="h-6 w-[1px] bg-slate-200 mx-3" />
                    <button className="text-slate-400 hover:text-purple-600 transition-colors">
                        <SlidersHorizontal size={18} />
                    </button>
                </div>
            </div>

            {/* 3. Near Me Button */}
            <div className="absolute bottom-8 right-6 z-[400]">
                <button
                    onClick={handleNearMe}
                    className="bg-[#000000] text-white px-6 py-3.5 rounded-[2rem] flex items-center gap-3 shadow-2xl active:scale-95 transition-all group"
                >
                    <Navigation size={18} className="rotate-45 group-hover:animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Menga yaqin</span>
                </button>
            </div>

            {/* 4. Stats Pill */}
            <div className="absolute top-4 right-4 z-[400] hidden md:block">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/20 text-[10px] font-black uppercase tracking-widest text-slate-600">
                    {products.length} ob'ekt
                </div>
            </div>
        </div>
    );
}
