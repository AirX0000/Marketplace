import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Focus } from 'lucide-react';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customMarkerIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #FFD600; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; items-center; justify-center; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
            <div style="width: 8px; height: 8px; background-color: #000; border-radius: 50%; transform: rotate(45deg);"></div>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
});

function LocationMarker({ position, setPosition }) {
    const map = useMap();

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={customMarkerIcon} />
    );
}

function PanToLocation({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.panTo(position);
        }
    }, [position, map]);
    return null;
}

export function LocationPicker({ value, onChange }) {
    const defaultCenter = [41.311081, 69.240562]; // Tashkent
    const [position, setPosition] = useState(value?.lat ? { lat: value.lat, lng: value.lng } : null);

    const handleSetPosition = (pos) => {
        setPosition(pos);
        onChange({ lat: pos.lat, lng: pos.lng });
    };

    const handleCurrentLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                handleSetPosition(newPos);
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                    <MapPin size={18} className="text-blue-600" />
                    <span className="text-sm font-bold uppercase tracking-wider">Joylashuvni tanlang</span>
                </div>
                <button
                    type="button"
                    onClick={handleCurrentLocation}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-200/50"
                >
                    <Navigation size={14} />
                    Mening joylashuvim
                </button>
            </div>

            <div className="relative h-[350px] rounded-3xl overflow-hidden border-2 border-slate-100 shadow-inner group">
                <MapContainer
                    center={position || defaultCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    className="z-10"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={handleSetPosition} />
                    <PanToLocation position={position} />
                </MapContainer>

                {!position && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-20 flex items-center justify-center p-8 text-center pointer-events-none group-hover:opacity-0 transition-opacity">
                        <div className="bg-white p-4 rounded-2xl shadow-2xl scale-in-center">
                            <Focus className="mx-auto mb-2 text-blue-600 h-8 w-8" />
                            <p className="text-xs font-black uppercase text-slate-900 leading-relaxed">
                                Xaritada nuqtani bosing <br /> <span className="text-slate-500">joylashuvni belgilash uchun</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {position && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Manzil tanlandi</p>
                        <p className="text-xs font-bold text-emerald-900 truncate tabular-nums">
                            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
