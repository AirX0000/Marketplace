import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon not showing in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

const AddressMap = ({ onLocationSelect, initialPosition }) => {
    // Default to Tashkent coordinates
    const defaultPosition = { lat: 41.2995, lng: 69.2401 };
    const [position, setPosition] = useState(initialPosition || defaultPosition);

    useEffect(() => {
        if (initialPosition) {
            setPosition(initialPosition);
        }
    }, [initialPosition?.lat, initialPosition?.lng]);

    // Handle internal map clicks
    const handleMapClick = (latlng) => {
        setPosition(latlng);
        if (onLocationSelect) {
            onLocationSelect(latlng);
        }
    };

    const [locating, setLocating] = useState(false);

    const handleLocateMe = () => {
        setLocating(true);
        if (!navigator.geolocation) {
            alert("Геолокация не поддерживается вашим браузером");
            setLocating(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const latlng = { lat: latitude, lng: longitude };
                setPosition(latlng);
                if (onLocationSelect) {
                    onLocationSelect(latlng);
                }
                setLocating(false);
            },
            (error) => {
                console.error("Geolocation error:", error);
                let msg = "Не удалось определить местоположение";
                if (error.code === 1) msg = "Доступ к геолокации запрещен. Разрешите доступ в настройках браузера.";
                else if (error.code === 2) msg = "Спутниковая связь недоступна";
                else if (error.code === 3) msg = "Время ожидания истекло";
                alert(msg);
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden border border-slate-200 z-0 relative shadow-sm">
            <button
                type="button"
                onClick={handleLocateMe}
                disabled={locating}
                className="absolute top-2 right-2 z-[1000] bg-white p-2 rounded-md shadow-md hover:bg-slate-100 text-slate-700 disabled:opacity-50 transition-all"
                title="Мое местоположение"
            >
                {locating ? (
                    <div className="animate-spin h-5 w-5 border-2 border-slate-400 border-t-blue-600 rounded-full" />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><crosshairs cx="12" cy="12" r="10" /><line x1="22" y1="12" x2="18" y2="12" /><line x1="6" y1="12" x2="2" y2="12" /><line x1="12" y1="6" x2="12" y2="2" /><line x1="12" y1="22" x2="12" y2="18" /></svg>
                )}
            </button>
            <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={handleMapClick} />
            </MapContainer>
        </div>
    );
};

export default AddressMap;
