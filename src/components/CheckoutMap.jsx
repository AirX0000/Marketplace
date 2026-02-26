import React, { useState, useEffect, useRef } from 'react';
import { YMaps, Map, Placemark, ZoomControl, GeolocationControl } from '@pbe/react-yandex-maps';
import { Loader2, MapPin, Crosshair } from 'lucide-react';

export default function CheckoutMap({ onLocationSelect, onAddressFound }) {
    // Default to Tashkent coordinates
    const [center, setCenter] = useState([41.2995, 69.2401]);
    const [zoom, setZoom] = useState(13);
    const [address, setAddress] = useState('');
    const [loadingLocation, setLoadingLocation] = useState(false);

    // API Key (Start with empty string or demo key if available, Yandex often allows basic generic usage or warns)
    // For production, you should get a real key: https://developer.tech.yandex.ru/
    const API_KEY = '';

    const mapRef = useRef(null);
    const ymapsRef = useRef(null);

    const handleLoad = (ymaps) => {
        ymapsRef.current = ymaps;
    };

    const handleMapClick = async (e) => {
        if (!ymapsRef.current) return;

        const coords = e.get('coords');
        setCenter(coords);

        if (onLocationSelect) {
            onLocationSelect({ lat: coords[0], lng: coords[1] });
        }

        // Reverse Geocoding
        try {
            const result = await ymapsRef.current.geocode(coords);
            const firstGeoObject = result.geoObjects.get(0);

            if (firstGeoObject) {
                const foundAddress = firstGeoObject.getAddressLine();
                const city = firstGeoObject.getLocalities().length > 0
                    ? firstGeoObject.getLocalities()[0]
                    : firstGeoObject.getAdministrativeAreas().length > 0
                        ? firstGeoObject.getAdministrativeAreas()[0]
                        : '';

                setAddress(foundAddress);
                if (onAddressFound) {
                    onAddressFound(foundAddress, city);
                }
            }
        } catch (error) {
            console.warn("Yandex Geocoding failed (likely due to missing API key). Trying OSM fallback...", error);

            // Fallback to OSM Nominatim
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}&accept-language=ru`);
                const data = await response.json();
                if (data && data.display_name) {
                    const addr = data.address;
                    const street = addr.road || addr.pedestrian || addr.suburb || '';
                    const house = addr.house_number || '';
                    const city = addr.city || addr.town || addr.county || '';

                    let simpleAddress = '';
                    if (street) simpleAddress += street;
                    if (house) simpleAddress += `, ${house}`;
                    const finalAddress = simpleAddress || data.display_name.split(',')[0];

                    setAddress(finalAddress);
                    if (onAddressFound) {
                        onAddressFound(finalAddress, city);
                    }
                }
            } catch (err2) {
                console.error("All geocoding failed", err2);
            }
        }
    };

    const handleLocateMe = () => {
        if (!navigator.geolocation) return;

        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newCoords = [pos.coords.latitude, pos.coords.longitude];
                setCenter(newCoords);
                setZoom(15);
                setLoadingLocation(false);

                // Trigger click-like update
                if (mapRef.current && ymapsRef.current) {
                    // We manually do geocoding for the new position
                    handleMapClick({ get: () => newCoords });
                }
            },
            (err) => {
                console.error(err);
                setLoadingLocation(false);
            }
        );
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-[250px]">{address || "Выберите точку на карте"}</span>
                </div>
                <button
                    type="button"
                    onClick={handleLocateMe}
                    disabled={loadingLocation}
                    className="flex items-center gap-2 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium hover:bg-primary/20 transition-colors"
                >
                    {loadingLocation ? <Loader2 className="h-3 w-3 animate-spin" /> : <Crosshair className="h-3 w-3" />}
                    Моя локация
                </button>
            </div>

            <div className="h-[300px] w-full rounded-lg overflow-hidden border shadow-sm z-0 relative">
                <YMaps query={{ apikey: API_KEY, lang: 'ru_RU', load: 'package.full' }}>
                    <Map
                        defaultState={{ center: [41.2995, 69.2401], zoom: 13 }}
                        state={{ center, zoom }}
                        width="100%"
                        height="100%"
                        onLoad={handleLoad}
                        onClick={handleMapClick}
                        instanceRef={mapRef}
                    >
                        <Placemark
                            geometry={center}
                            options={{ preset: 'islands#blueDotIcon' }}
                        />
                        <ZoomControl options={{ position: { right: 10, top: 10 } }} />
                        <GeolocationControl options={{ float: 'left' }} />
                    </Map>
                </YMaps>
            </div>
        </div>
    );
}
