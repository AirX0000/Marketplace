import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

export function MapSearch({ products, onBoundsChange }) {
    // Default center (Tashkent)
    const [center, setCenter] = useState([41.2995, 69.2401]);

    return (
        <div className="h-[calc(100vh-140px)] w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
            <MapContainer
                center={center}
                zoom={12}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {products.map(product => {
                    if (!product.lat || !product.lng) return null;
                    return (
                        <Marker
                            key={product.id}
                            position={[product.lat, product.lng]}
                        >
                            <Popup>
                                <div className="w-48">
                                    <div className="w-full h-24 bg-slate-100 rounded-lg mb-2 overflow-hidden">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="font-bold text-sm truncate">{product.name}</h3>
                                    <div className="text-blue-600 font-bold mt-1">
                                        {product.price?.toLocaleString()} sum
                                    </div>
                                    <Link
                                        to={`/marketplaces/${product.id}`}
                                        className="block mt-2 text-center text-xs bg-slate-900 text-white py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                                    >
                                        Подробнее
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                <MapEvents onBoundsChange={onBoundsChange} />
            </MapContainer>

            <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-xs font-medium">
                {products.length} объектов в области
            </div>

            <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-sm border border-slate-200 text-xs max-w-[200px]">
                <p className="font-semibold mb-1">Навигация</p>
                Перемещайте карту для поиска в других районах
            </div>
        </div>
    );
}
