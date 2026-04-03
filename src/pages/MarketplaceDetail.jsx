import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useShop } from '../context/ShopContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
    MapPin, Check, AlertCircle, Share2, Star, ArrowLeft, ExternalLink, Phone, Compass
} from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ReviewSection } from '../components/ReviewSection';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { cn } from '../lib/utils';
import { Skeleton, DetailSkeleton } from '../components/ui/Skeleton';
import { MakeOfferModal } from '../components/MakeOfferModal';
import { MarketplaceCard } from '../components/MarketplaceCard';
import { Lightbox } from '../components/Lightbox';

// Refactored Sub-components
import { ProductGallery } from '../components/marketplace/ProductGallery';
import { ProductInfo } from '../components/marketplace/ProductInfo';
import { ProductActions } from '../components/marketplace/ProductActions';
import { ProductStats } from '../components/marketplace/ProductStats';
import { PriceChart } from '../components/marketplace/PriceChart';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const bankOffers = [
    { id: '1', bank: 'TBC Bank', logo: '🏦', rate: '23.9%', downPayment: 20, maxTerm: 60, product: 'Автокредит Онлайн' },
    { id: '2', bank: 'Kapitalbank', logo: '🏛', rate: '24.5%', downPayment: 15, maxTerm: 48, product: 'Легкий Старт' },
    { id: '3', bank: 'Ipak Yuli', logo: '💳', rate: '24%', downPayment: 25, maxTerm: 60, product: 'Авто Премиум' },
    { id: '4', bank: 'InfinBank', logo: '🏢', rate: '25%', downPayment: 10, maxTerm: 36, product: 'Быстрое Авто' },
];

export function MarketplaceDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isUz = i18n.language === 'uz';
    const { user, isAuthenticated, addToCart } = useShop();
    
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const [marketplace, setMarketplace] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState('');
    const [isFav, setIsFav] = useState(false);
    const [offerModalOpen, setOfferModalOpen] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState(null);
    const handleColorSelect = (color) => {
        setSelectedColor(color);
        if (color.image) setActiveImage(color.image);
    };
    const [selectedMod, setSelectedMod] = useState(null);
    const [isWatchingPrice, setIsWatchingPrice] = useState(false);
    const [priceHistory, setPriceHistory] = useState([]);

    const displayName = useMemo(() => {
        if (!marketplace) return "";
        return (isUz && marketplace.name_uz) ? marketplace.name_uz : marketplace.name;
    }, [marketplace, isUz]);

    const displayDescription = useMemo(() => {
        if (!marketplace) return "";
        return (isUz && marketplace.description_uz) ? marketplace.description_uz : marketplace.description;
    }, [marketplace, isUz]);

    const displayPrice = useMemo(() => selectedMod?.price || marketplace?.price || 0, [selectedMod, marketplace]);

    const allImages = useMemo(() => {
        if (!marketplace) return ['/placeholder.jpg'];
        let imagesArray = [];
        try {
            if (Array.isArray(marketplace.images)) imagesArray = marketplace.images;
            else if (typeof marketplace.images === 'string') {
                imagesArray = marketplace.images.startsWith('[') ? JSON.parse(marketplace.images) : [marketplace.images];
            }
        } catch (e) { console.error(e); }
        return imagesArray.length > 0 ? imagesArray : [marketplace.imageUrl || marketplace.image || '/placeholder.jpg'];
    }, [marketplace]);

    const breadcrumbs = useMemo(() => [
        { label: 'Главная', path: '/' },
        { label: 'Каталог', path: '/marketplaces' },
        { label: marketplace?.categoryName || marketplace?.category, path: `/marketplaces?category=${marketplace?.category}` },
        { label: displayName }
    ], [marketplace, displayName]);

    useEffect(() => {
        window.scrollTo(0, 0);
        async function fetchDetail() {
            setLoading(true);
            try {
                const res = await api.getMarketplace(slug);
                setMarketplace(res);
                setActiveImage(res.imageUrl || res.image || (Array.isArray(res.images) ? res.images[0] : ''));
                if (res.attributes?.colors?.length > 0) setSelectedColor(res.attributes.colors[0]);
                if (res.attributes?.modifications?.length > 0) setSelectedMod(res.attributes.modifications[0]);
                
                const savedFavs = JSON.parse(localStorage.getItem('favs') || '[]');
                setIsFav(savedFavs.some(f => f.id === res.id));

                const relatedRes = await api.getMarketplaces({ category: res.category });
                const relatedList = Array.isArray(relatedRes) ? relatedRes : relatedRes.listings || [];
                setRelatedProducts(relatedList.filter(p => p.id !== res.id).slice(0, 4));

                if (res.id) setPriceHistory(await api.getPriceHistory(res.id));
            } catch (error) {
                toast.error("Ошибка загрузки");
            } finally {
                setLoading(false);
            }
        }
        fetchDetail();
    }, [slug]);

    const toggleFavorite = (product) => {
        let savedFavs = JSON.parse(localStorage.getItem('favs') || '[]');
        const exists = savedFavs.some(f => f.id === product.id);
        if (exists) savedFavs = savedFavs.filter(f => f.id !== product.id);
        else savedFavs.push(product);
        localStorage.setItem('favs', JSON.stringify(savedFavs));
        setIsFav(!exists);
        toast.success(exists ? "Удалено" : "Добавлено");
    };

    if (loading) return <DetailSkeleton />;

    if (!marketplace) return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 text-center">
            <div className="bg-card p-12 rounded-[3rem] border border-border shadow-2xl max-w-md w-full">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-6" />
                <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Объявление не найдено</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-8">Возможно, оно было удалено или ссылка недействительна.</p>
                <Link to="/marketplaces" className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-colors">В каталог</Link>
            </div>
        </div>
    );

    const isAuto = marketplace.category === 'AUTO' || marketplace.category === 'Transport';
    const attrs = marketplace.attributes || {};

    return (
        <div className="min-h-screen bg-background relative overflow-x-hidden">
            <Helmet>
                <title>{`${isUz ? (isAuto ? 'Avtomobil sotib olish' : 'Ko\'chmas mulk sotuvi') : (isAuto ? 'Купить автомобиль' : 'Продажа недвижимости')} ${displayName} | Autohouse`}</title>
                <meta name="description" content={`${isUz ? (isAuto ? 'Avtomobil sotuvi' : 'Ko\'chmas mulk sotuvi') : (isAuto ? 'Продажа авто' : 'Продажа недвижимости')} ${displayName}. ${displayPrice > 0 ? `${isUz ? 'Narxi' : 'Цена'}: ${displayPrice.toLocaleString()} UZS.` : ''} ${displayDescription?.substring(0, 150)}...`} />
                <meta name="keywords" content={`${displayName}, ${isUz ? 'avto sotib olish, uy sotib olish' : 'купить авто, купить квартиру'}, ${isUz ? 'mashina sotish' : 'продажа машин'}, O'zbekiston, Toshkent, Autohouse`} />
                <link rel="canonical" href={`https://autohouse.uz/marketplaces/${slug}`} />
                
                {/* Structured Data (JSON-LD) */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": isAuto ? "Car" : "RealEstateListing",
                        "name": displayName,
                        "description": displayDescription,
                        "image": allImages[0]?.startsWith('http') ? allImages[0] : `https://autohouse.uz${allImages[0]}`,
                        "offers": {
                            "@type": "Offer",
                            "price": displayPrice,
                            "priceCurrency": "UZS",
                            "availability": "https://schema.org/InStock",
                            "url": window.location.href
                        },
                        ...(isAuto ? {
                            "brand": marketplace?.brand || attrs?.specs?.brand,
                            "productionDate": attrs?.specs?.year,
                            "fuelType": attrs?.specs?.fuelType,
                            "mileageFromOdometer": {
                                "@type": "QuantitativeValue",
                                "value": attrs?.specs?.mileage,
                                "unitCode": "KMT"
                            }
                        } : {
                            "address": {
                                "@type": "PostalAddress",
                                "addressLocality": marketplace?.region,
                                "addressCountry": "UZ"
                            },
                            "numberOfRooms": attrs?.specs?.rooms,
                            "floorSize": {
                                "@type": "QuantitativeValue",
                                "value": attrs?.specs?.area,
                                "unitCode": "MTK"
                            }
                        })
                    })}
                </script>
            </Helmet>

            <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 z-[100]" style={{ scaleX }} />

            <div className="absolute top-8 left-0 right-0 z-30 pointer-events-none">
                <div className="container mx-auto flex justify-between items-center pointer-events-auto px-4">
                    <Link to="/marketplaces" className="h-12 w-12 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-2xl backdrop-blur-xl border border-white/10 transition-all active:scale-90"><ArrowLeft size={20} /></Link>
                    <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="h-12 w-12 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-2xl backdrop-blur-xl border border-white/10 transition-all"><Share2 size={20} /></button>
                </div>
            </div>

            <main className="container mx-auto py-8 px-4 pb-28">
                <Breadcrumbs items={breadcrumbs} />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                    <div className="lg:col-span-8 space-y-8">
                        <ProductGallery 
                            allImages={allImages} 
                            activeImage={activeImage} 
                            setActiveImage={setActiveImage}
                            displayName={displayName}
                            isAuto={isAuto}
                            marketplace={marketplace}
                            setLightboxIndex={setLightboxIndex}
                            setLightboxOpen={setLightboxOpen}
                            selectedMod={selectedMod}
                            attrs={attrs}
                        />
                        
                        <ProductStats marketplace={marketplace} />

                        <ProductInfo 
                            isAuto={isAuto}
                            attrs={attrs}
                            selectedColor={selectedColor}
                            setSelectedColor={handleColorSelect}
                            displayDescription={displayDescription}
                            marketplace={marketplace}
                        />

                        {priceHistory.length > 0 && (
                            <section className="bg-[#191624] rounded-[32px] p-8 md:p-12 shadow-2xl border border-white/5">
                                <h2 className="text-2xl font-black text-white uppercase italic mb-8">История цены</h2>
                                <PriceChart data={priceHistory} />
                            </section>
                        )}

                        <ReviewSection marketplaceId={marketplace.id} isAuthenticated={isAuthenticated} currentUser={user} />
                    </div>

                    <aside className="lg:col-span-4">
                        <ProductActions 
                            marketplace={marketplace}
                            displayPrice={displayPrice}
                            isFav={isFav}
                            toggleFavorite={toggleFavorite}
                            addToCart={addToCart}
                            isWatchingPrice={isWatchingPrice}
                            setIsWatchingPrice={setIsWatchingPrice}
                            setOfferModalOpen={setOfferModalOpen}
                            selectedMod={selectedMod}
                            isAuthenticated={isAuthenticated}
                        />
                    </aside>
                </div>
            </main>

            {offerModalOpen && <MakeOfferModal marketplace={marketplace} onClose={() => setOfferModalOpen(false)} />}
            {lightboxOpen && <Lightbox images={allImages} startIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />}
        </div>
    );
}

function SpecIconItem({ icon, label, value }) {
    if (!value) return null;
    return (
        <div className="flex flex-col items-center p-8 bg-[#191624] rounded-[32px] border border-white/5 hover:border-purple-600/30 hover:bg-white/[0.02] transition-all group">
            <div className="mb-4 transform group-hover:scale-110 transition-transform">{icon}</div>
            <div className="text-[9px] text-slate-500 uppercase font-black tracking-[0.3em] mb-2 italic">{label}</div>
            <div className="text-white font-black text-lg italic tracking-tighter">{value}</div>
        </div>
    );
}
