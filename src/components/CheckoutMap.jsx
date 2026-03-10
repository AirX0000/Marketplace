import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, MapPin, Crosshair } from 'lucide-react';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapEvents({ onClick }) {
    useMapEvents({
        click: (e) => {
            onClick(e.latlng);
        },
    });
    return null;
}

export default function CheckoutMap({ onLocationSelect, onAddressFound }) {
    const [center, setCenter] = useState([41.2995, 69.2401]);
    const [address, setAddress] = useState('');
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [map, setMap] = useState(null);

    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ru`);
            const data = await response.json();
            if (data && data.display_name) {
                const addr = data.address;
                const street = addr.road || addr.pedestrian || addr.suburb || '';
                const house = addr.house_number || '';
                const city = addr.city || addr.town || addr.village || addr.county || '';

                let simpleAddress = '';
                if (street) simpleAddress += street;
                if (house) simpleAddress += `, ${house}`;
                const finalAddress = simpleAddress || data.display_name.split(',')[0];

                setAddress(finalAddress);
                if (onAddressFound) {
                    onAddressFound(finalAddress, city);
                }
            }
        } catch (error) {
            console.error("Geocoding failed", error);
        }
    };

    const handleMapClick = (latlng) => {
        const coords = [latlng.lat, latlng.lng];
        setCenter(coords);
        if (onLocationSelect) {
            onLocationSelect({ lat: latlng.lat, lng: latlng.lng });
        }
        reverseGeocode(latlng.lat, latlng.lng);
    };

    const handleLocateMe = () => {
        if (!navigator.geolocation) return;
        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newCoords = [pos.coords.latitude, pos.coords.longitude];
                setCenter(newCoords);
                if (map) map.setView(newCoords, 16);
                setLoadingLocation(false);
                handleMapClick({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            () => {
                setLoadingLocation(false);
            }
        );
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-purple-500" />
                    <span className="truncate max-w-[200px]">{address || "Укажите точку"}</span>
                </div>
                <button
                    type="button"
                    onClick={handleLocateMe}
                    disabled={loadingLocation}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600/10 text-purple-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600/20 transition-all active:scale-95"
                >
                    {loadingLocation ? <Loader2 className="h-3 w-3 animate-spin" /> : <Crosshair className="h-3 w-3" />}
                    Моя локация
                </button>
            </div>

            <div className="h-[300px] w-full rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl z-0 relative">
                <MapContainer
                    center={center}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    ref={setMap}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; OpenStreetMap'
                    />
                    <Marker position={center} />
                    <MapEvents onClick={handleMapClick} />
                </MapContainer>
            </div>
        </div>
    );
}
