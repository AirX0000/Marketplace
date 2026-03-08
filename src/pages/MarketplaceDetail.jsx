import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../lib/api';
import useAuthStore from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';
import {
    MapPin, Check, AlertCircle, Phone, MessageSquare, ChevronRight, Share2,
    ShieldCheck, Zap, Heart, Search, Image as ImageIcon, Video, Flag,
    FileText, Calendar, Compass, Shield, Printer, Info, Truck, Tool, Info as InfoIcon, Zap as ZapIcon, InfoCircle,
    Calculator, ExternalLink, ShoppingCart, Bell
} from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ReviewSection } from '../components/ReviewSection';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { cn } from '../lib/utils';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { MakeOfferModal } from '../components/MakeOfferModal';
import { MarketplaceCard } from '../components/MarketplaceCard';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Demo Data for Auto Calculator
const bankOffers = [
    { id: '1', bank: 'TBC Bank', logo: '🏦', rate: '23.9%', downPayment: 20, maxTerm: 60, product: 'Автокредит Онлайн' },
    { id: '2', bank: 'Kapitalbank', logo: '🏛', rate: '24.5%', downPayment: 15, maxTerm: 48, product: 'Легкий Старт' },
    { id: '3', bank: 'Ipak Yuli', logo: '💳', rate: '24%', downPayment: 25, maxTerm: 60, product: 'Авто Премиум' },
    { id: '4', bank: 'InfinBank', logo: '🏢', rate: '25%', downPayment: 10, maxTerm: 36, product: 'Быстрое Авто' },
    { id: '5', bank: 'Aloqabank', logo: '🏦', rate: '23%', downPayment: 30, maxTerm: 60, product: 'Эконом' },
];

export function MarketplaceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();
    const { addToCart } = useCartStore();

    const [marketplace, setMarketplace] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState('');
    const [isFav, setIsFav] = useState(false);
    const [offerModalOpen, setOfferModalOpen] = useState(false);

    // Dynamic attributes based on category
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedMod, setSelectedMod] = useState(null);

    // Calculator State
    const [downPayment, setDownPayment] = useState(25);
    const [term, setTerm] = useState(3);
    const [selectedBank, setSelectedBank] = useState(bankOffers[0]);

    // Price Watch State
    const [isWatchingPrice, setIsWatchingPrice] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        async function fetchDetail() {
            setLoading(true);
            try {
                const res = await api.getMarketplaceDetail(id);
                setMarketplace(res);
                setActiveImage(res.imageUrl || res.images?.[0] || '');

                if (res.attributes?.colors?.length > 0) {
                    setSelectedColor(res.attributes.colors[0]);
                }
                if (res.attributes?.modifications?.length > 0) {
                    setSelectedMod(res.attributes.modifications[0]);
                }

                // Check favorites
                const savedFavs = JSON.parse(localStorage.getItem('favs') || '[]');
                setIsFav(savedFavs.some(f => f.id === res.id));

                // Fetch related
                const catalog = await api.getMarketplace(res.category);
                setRelatedProducts(catalog.filter(p => p.id !== res.id).slice(0, 4));

                // If authenticated, check if watching price
                if (isAuthenticated) {
                    const status = await api.checkWatchStatus(id);
                    setIsWatchingPrice(status.isWatching);
                }

            } catch (error) {
                console.error("Failed to load details", error);
                toast.error("Не удалось загрузить данные");
            } finally {
                setLoading(false);
            }
        }
        fetchDetail();
    }, [id, isAuthenticated]);

    const displayPrice = selectedMod?.price || marketplace?.price || 0;
    const isAuto = marketplace?.category === 'AUTO';
    const isRealEstate = marketplace?.category === 'REAL_ESTATE';

    // Monthly Payment Calculation
    const monthlyPayment = useMemo(() => {
        if (!marketplace) return 0;
        const price = displayPrice;
        const downPaymentAmount = price * (downPayment / 100);
        const loanAmount = price - downPaymentAmount;

        const rate = selectedBank ? parseFloat(selectedBank.rate.replace('%', '')) : 24;
        const monthlyRate = rate / 100 / 12;
        const totalMonths = term * 12;

        if (monthlyRate === 0) return loanAmount / totalMonths;

        // Annuity formula
        return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }, [displayPrice, downPayment, term, selectedBank, marketplace]);

    const toggleFavorite = (product) => {
        let savedFavs = JSON.parse(localStorage.getItem('favs') || '[]');
        const exists = savedFavs.some(f => f.id === product.id);
        if (exists) {
            savedFavs = savedFavs.filter(f => f.id !== product.id);
            toast.success("Удалено из избранного");
        } else {
            savedFavs.push(product);
            toast.success("Добавлено в избранное");
            // Also notify backend if authenticated
            if (isAuthenticated) api.addToFavorites(product.id).catch(console.error);
        }
        localStorage.setItem('favs', JSON.stringify(savedFavs));
        setIsFav(!exists);
    };

    const shareListing = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: marketplace.name,
                    text: `Посмотри на это объявление: ${marketplace.name}`,
                    url: window.location.href,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Ссылка скопирована!");
        }
    };

    const submitLoanApplication = async (type) => {
        if (!isAuthenticated) return toast.error("Пожалуйста, войдите в систему, чтобы оставить заявку на банковский продукт.");
        try {
            await api.submitLoanApplication({
                marketplaceId: marketplace.id,
                bankId: selectedBank?.id || 'ANY',
                amount: displayPrice,
                downPayment: Math.round(displayPrice * downPayment / 100),
                termYears: term,
                type: type
            });
            toast.success(`Заявка на ${type === 'AUTO_LOAN' ? 'автокредит' : 'ипотеку'} отправлена в банки-партнеры! С вами свяжутся в течение нескольких минут.`);
        } catch (e) {
            toast.error("Ошибка при отправке заявки");
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse">
                <Skeleton height={40} width={200} className="mb-4" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-center text-slate-500">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton height={500} className="rounded-2xl" />
                        <div className="flex gap-2">
                            <Skeleton height={100} width={100} className="rounded-xl" />
                            <Skeleton height={100} width={100} className="rounded-xl" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Skeleton height={400} className="rounded-2xl" />
                        <Skeleton height={200} className="rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!marketplace) return <div className="text-center py-20 font-bold text-slate-500">Объявление не найдено</div>;

    const allImages = marketplace.images?.length > 0 ? marketplace.images : [marketplace.imageUrl || '/placeholder.jpg'];
    const attrs = marketplace.attributes || {};
    const modifications = attrs.modifications || [];
    const colors = attrs.colors || [];
    const breadcrumbs = [
        { label: 'Главная', path: '/' },
        { label: 'Каталог', path: '/catalog' },
        { label: marketplace.categoryName || marketplace.category, path: `/catalog?category=${marketplace.category}` },
        { label: marketplace.name }
    ];

    const schemaMarkup = useMemo(() => {
        if (!marketplace) return null;

        const availability = "https://schema.org/InStock";
        const condition = marketplace.isOfficial ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition";

        return {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": marketplace.name,
            "image": activeImage || "https://autohouse.uz/logo.png",
            "description": marketplace.description || `Купить ${marketplace.name} на Autohouse.uz`,
            "brand": {
                "@type": "Brand",
                "name": typeof attrs === 'object' ? attrs?.brand : "Autohouse"
            },
            "offers": {
                "@type": "Offer",
                "url": typeof window !== 'undefined' ? window.location.href : "",
                "priceCurrency": "UZS",
                "price": displayPrice,
                "itemCondition": condition,
                "availability": availability
            }
        };
    }, [marketplace, activeImage, displayPrice, attrs]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Helmet>
                <title>{`${marketplace.name} - Купить в Ташкенте и Узбекистане | Autohouse`}</title>
                <meta name="description" content={marketplace.description?.substring(0, 150) || `Купите ${marketplace.name} выгодно на Autohouse.uz`} />
                <meta property="og:image" content={activeImage} />
                {schemaMarkup && (
                    <script type="application/ld+json">
                        {JSON.stringify(schemaMarkup)}
                    </script>
                )}
            </Helmet>

            {/* FLOATING TOP BAR (Visible on Scroll) */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 hidden md:block supports-[backdrop-filter]:bg-white/60">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0">
                            <img src={activeImage} alt={marketplace.name || 'Товар'} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="font-black text-slate-900 dark:text-white leading-tight truncate max-w-[300px] lg:max-w-[500px]">{marketplace.name}</div>
                            <div className="text-xs font-bold text-slate-500">{marketplace.region}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right hidden lg:block">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedMod?.name || 'Цена'}</div>
                            <div className="text-xl font-black text-blue-600">
                                {displayPrice.toLocaleString()} Sum
                            </div>
                        </div>
                        <button
                            onClick={() => document.getElementById('contact-sidebar')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                            Купить авто
                        </button>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">
                <Breadcrumbs items={breadcrumbs} />
                <article className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Gallery, Details, Map */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* GALLERY & INTRO */}
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="relative h-[450px] md:h-[550px] lg:h-[600px] bg-slate-100 dark:bg-slate-800 group">
                                <img
                                    src={activeImage}
                                    alt={marketplace.name}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />

                                {/* UrbanDrive-style Bottom Gradient Overlay for Auto */}
                                {isAuto && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-10">
                                        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-2 drop-shadow-lg">
                                            {marketplace.name}
                                        </h2>
                                        <div className="flex items-center gap-4 text-white/90">
                                            <div className="flex items-center gap-2 bg-blue-600 px-3 py-1 rounded-lg text-sm font-bold">
                                                <ShieldCheck className="w-4 h-4" /> Official Dealer
                                            </div>
                                            <div className="text-lg font-medium">
                                                {selectedMod?.name || 'Standard'} • {selectedColor?.name || attrs.specs?.color || 'Original'}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isAuto && attrs.brandLogo && (
                                    <div className="absolute top-6 left-6 w-16 h-16 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/20">
                                        <img src={attrs.brandLogo} alt="Brand" className="w-full h-full object-contain" />
                                    </div>
                                )}

                                <div className="absolute top-6 right-6 flex flex-col gap-2">
                                    <span className="bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                                        {marketplace.category}
                                    </span>
                                </div>
                            </div>
                            {allImages.length > 1 && (
                                <div className="p-6 flex gap-4 overflow-x-auto no-scrollbar">
                                    {allImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(img)}
                                            className={cn(
                                                "relative flex-shrink-0 w-28 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300",
                                                activeImage === img ? "border-blue-600 ring-4 ring-blue-600/10 scale-95" : "border-transparent opacity-60 hover:opacity-100"
                                            )}
                                        >
                                            <img src={img} alt={`Вид ${idx}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* SELECTORS (AUTO ONLY) */}
                        {isAuto && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Trim Selector */}
                                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Модификации</h3>
                                    <div className="space-y-3">
                                        {modifications.map((mod, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedMod(mod)}
                                                className={cn(
                                                    "w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between group",
                                                    selectedMod?.name === mod.name
                                                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                                                        : "border-slate-50 dark:border-slate-800 hover:border-slate-200"
                                                )}
                                            >
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{mod.name}</div>
                                                    <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">
                                                        {mod.features?.join(' • ') || 'Standard options'}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-black text-blue-600">{(mod.price || (marketplace?.price || 0)).toLocaleString()}</div>
                                                    <div className="text-[10px] font-bold text-slate-400">SUM</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Color Picker */}
                                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Цвет кузова</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {colors.map((color, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedColor(color)}
                                                className="flex flex-col items-center gap-3 group"
                                            >
                                                <div
                                                    className={cn(
                                                        "w-12 h-12 rounded-full border-4 shadow-sm transition-all transform",
                                                        selectedColor?.name === color.name
                                                            ? "border-blue-600 scale-110 shadow-blue-600/20"
                                                            : "border-white dark:border-slate-800 hover:scale-105"
                                                    )}
                                                    style={{ backgroundColor: color.hex }}
                                                />
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-tight transition-colors",
                                                    selectedColor?.name === color.name ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                                                )}>
                                                    {color.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SPECIFICATIONS */}
                        {isAuto ? (
                            <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Технические характеристики</h2>
                                    <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
                                        {attrs.specs?.transmission || 'АКПП'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <SpecIconItem icon={<div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-2xl">⚡</div>} label="Мощность" value={attrs.specs?.power || '245 л.с.'} />
                                    <SpecIconItem icon={<div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-2xl">⏱️</div>} label="0-100 км/ч" value={attrs.specs?.acceleration || '6.5 сек'} />
                                    <SpecIconItem icon={<div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-2xl">🔋</div>} label="Запас хода" value={attrs.specs?.range || '550 км'} />
                                    <SpecIconItem icon={<div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-2xl">🛣️</div>} label="Расход" value={attrs.specs?.fuelConsumption || '9.4 л'} />
                                </div>

                                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                    <DetailRow label="Двигатель" value={attrs.specs?.engine || 'Электро'} />
                                    <DetailRow label="Коробка" value={attrs.specs?.transmission || 'Автомат'} />
                                    <DetailRow label="Привод" value={attrs.specs?.drive || 'Полный'} />
                                    <DetailRow label="Цвет" value={selectedColor?.name || attrs.specs?.color || 'Белый'} />
                                    <DetailRow label="Пробег" value={`${attrs.specs?.mileage || 0} км`} />
                                    <DetailRow label="Год выпуска" value={attrs.specs?.year} />
                                </div>

                                <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Способы оплаты</h3>
                                    <div className="flex flex-wrap items-center gap-6 opacity-60">
                                        <img src="https://logobank.uz:8005/static/logos_png/uzcard-logo-uz-600.png" loading="lazy" decoding="async" alt="Uzcard" className="h-6 object-contain" />
                                        <img src="https://logobank.uz:8005/static/logos_png/visa-0-logo-uz-600.png" loading="lazy" decoding="async" alt="Visa" className="h-4 object-contain opacity-80" />
                                        <img src="https://logobank.uz:8005/static/logos_png/mastercard-0-logo-uz-600.png" loading="lazy" decoding="async" alt="Mastercard" className="h-6 object-contain" />
                                        <div className="h-6 w-px bg-slate-200" />
                                        <span className="font-bold text-slate-400 text-xs">Direct Bank Transfer</span>
                                    </div>
                                </div>
                            </section>
                        ) : attrs.specs && (
                            <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Характеристики</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                    {Object.entries(attrs.specs).filter(([, v]) => typeof v !== 'object').map(([key, val]) => (
                                        <DetailRow key={key} label={key} value={val} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* DESCRIPTION */}
                        <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Описание</h2>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 text-lg leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
                                <p>{marketplace.description}</p>
                            </div>
                        </section>

                        {/* VIDEO */}
                        {marketplace.videoUrl && (
                            <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Видеообзор</h2>
                                <div className="aspect-video rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative z-0 border border-slate-100 dark:border-slate-700">
                                    {marketplace.videoUrl.includes('youtube.com') || marketplace.videoUrl.includes('youtu.be') ? (
                                        <iframe
                                            src={marketplace.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-full"
                                        ></iframe>
                                    ) : (
                                        <video controls className="w-full h-full object-cover">
                                            <source src={marketplace.videoUrl} type="video/mp4" />
                                            Ваш браузер не поддерживает видео.
                                        </video>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* MAP */}
                        <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <MapPin className="text-blue-600 h-6 w-6" /> Расположение
                            </h2>
                            <div className="aspect-[21/9] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative z-0 border border-slate-100 dark:border-slate-700">
                                <MapContainer
                                    center={[marketplace.lat || 41.2995, marketplace.lng || 69.2401]}
                                    zoom={14}
                                    scrollWheelZoom={false}
                                    className="h-full w-full"
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    {(marketplace.lat && marketplace.lng) && (
                                        <Marker position={[marketplace.lat, marketplace.lng]}>
                                            <Popup>
                                                <div className="font-bold">{marketplace.name}</div>
                                                <div className="text-xs">{marketplace.region}</div>
                                            </Popup>
                                        </Marker>
                                    )}
                                </MapContainer>
                            </div>
                        </section>

                        {/* CALCULATOR */}
                        {(isRealEstate || isAuto) && (
                            <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                        <Calculator className="text-blue-600 h-6 w-6" />
                                        {isAuto ? "Автокредит / Калькулятор банков" : "Ипотечный калькулятор"}
                                    </h2>
                                    {isAuto && (
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
                                            <Info className="h-4 w-4 text-blue-500" />
                                            Актуально на {new Date().toLocaleDateString()}
                                        </div>
                                    )}
                                </div>

                                {isAuto && (
                                    <div className="mb-10">
                                        <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">Выберите банк</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {bankOffers.map((offer) => (
                                                <button
                                                    key={offer.id}
                                                    onClick={() => setSelectedBank(offer)}
                                                    className={cn(
                                                        "p-4 rounded-[20px] text-left transition-all border-2",
                                                        selectedBank?.id === offer.id
                                                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                                                            : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                                                    )}
                                                >
                                                    <div className="font-black text-slate-900 dark:text-white text-sm mb-1">{offer.bank}</div>
                                                    <div className="text-[10px] text-slate-500 font-bold uppercase truncate">{offer.product}</div>
                                                    <div className="mt-2 flex items-center justify-between">
                                                        <span className="text-blue-600 font-black text-xs">{offer.rate}</span>
                                                        <span className="text-slate-400 text-[10px]">от {offer.downPayment}%</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-10 items-center">
                                    <div className="space-y-8">
                                        <div>
                                            <div className="flex justify-between text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">
                                                <span>Первоначальный взнос ({downPayment}%)</span>
                                                <span className="font-black">{(displayPrice * downPayment / 100).toLocaleString()} Sum</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={isAuto ? (selectedBank?.downPayment || 0) : 15}
                                                max="90"
                                                step="1"
                                                value={downPayment}
                                                onChange={(e) => setDownPayment(parseInt(e.target.value))}
                                                className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                            />
                                            {isAuto && selectedBank && (
                                                <div className="mt-2 text-[10px] text-slate-400 font-bold">
                                                    МИНИМУМ ДЛЯ {selectedBank.bank.toUpperCase()}: {selectedBank.downPayment}%
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">
                                                <span>Срок {isAuto ? "(лет)" : "(лет)"}</span>
                                                <span className="font-black">{term}</span>
                                            </div>
                                            <input type="range" min="1" max={isAuto ? 5 : 20} step="1" value={term} onChange={(e) => setTerm(parseInt(e.target.value))} className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-[24px] p-8 text-center border border-blue-100 dark:border-blue-900/30">
                                        <div className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest mb-3">Примерный платёж</div>
                                        <div className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                                            {Math.round(monthlyPayment).toLocaleString()}
                                            <span className="text-xl font-medium text-slate-500 ml-1.5">Sum</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-2">Ставка: {selectedBank?.rate || '24%'}</div>
                                        <button onClick={() => submitLoanApplication(isAuto ? 'AUTO_LOAN' : 'MORTGAGE')} className="mt-6 w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-600/20 text-sm">
                                            Оставить заявку в банке
                                        </button>
                                    </div>
                                </div>

                                {isAuto && (
                                    <div className="mt-10 pt-6 border-t border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            Больше предложений на <a href="https://depozit.uz/credits/avtokredit" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Depozit.uz</a> и <a href="https://bank.uz/credits/avto-kredity" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Bank.uz</a>
                                        </div>
                                        {selectedBank?.phone && (
                                            <a href={`tel:${selectedBank.phone.replace(/\s/g, '')} `} className="flex items-center gap-2 text-blue-600 font-black text-sm hover:scale-105 transition-transform">
                                                <Phone className="h-4 w-4" /> {selectedBank.phone}
                                            </a>
                                        )}
                                    </div>
                                )}
                            </section>
                        )}

                        <ReviewSection marketplaceId={id} isAuthenticated={isAuthenticated} currentUser={user} />
                    </div>

                    {/* RIGHT COLUMN: Sidebar */}
                    <aside className="lg:col-span-4 relative">
                        <div className="sticky top-24 space-y-6" id="contact-sidebar">

                            {/* MAIN ACTIONS */}
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
                                <div className="mb-8">
                                    <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-3">
                                        {marketplace.name}
                                    </h1>
                                    <div className="flex items-center gap-3 text-sm font-bold text-slate-500 mb-6">
                                        <MapPin className="h-4 w-4 text-blue-600" /> {marketplace.region}
                                        <span className="text-slate-300">•</span>
                                        {marketplace.stock > 0 || marketplace.isAvailable ? (
                                            <span className="flex items-center gap-1 text-emerald-500"><Check className="h-4 w-4" /> В наличии</span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-amber-500"><AlertCircle className="h-4 w-4" /> Нет в наличии</span>
                                        )}
                                    </div>
                                    <div className="text-4xl font-black text-blue-600 tracking-tight">
                                        {displayPrice.toLocaleString()} <span className="text-xl text-slate-400 font-bold ml-1">Sum</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => {
                                            if (marketplace.owner?.phone) window.location.href = `tel:${marketplace.owner.phone} `;
                                            else toast.error("Телефон не указан");
                                        }}
                                        className="w-full h-14 flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black text-lg transition-all"
                                    >
                                        <Phone className="h-5 w-5 mr-3" />
                                        {marketplace.owner?.phone || "Связаться с продавцом"}
                                    </button>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => {
                                                addToCart(marketplace);
                                                toast.success("Добавлено в корзину");
                                            }}
                                            className="w-full h-14 flex items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm md:text-base transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                                        >
                                            <ShoppingCart className="h-5 w-5 mr-2 hidden sm:block" /> В корзину
                                        </button>

                                        <button
                                            onClick={() => {
                                                addToCart(marketplace);
                                                navigate('/checkout');
                                            }}
                                            className="w-full h-14 flex items-center justify-center rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm md:text-base transition-all shadow-lg shadow-emerald-500/20 active:scale-95 outline outline-2 outline-offset-2 outline-transparent hover:outline-emerald-500/30"
                                        >
                                            <Zap className="h-5 w-5 mr-2" fill="currentColor" /> 1 Клик
                                        </button>
                                    </div>

                                    <button
                                        onClick={async () => {
                                            if (!isAuthenticated) return toast.error("Войдите");
                                            try {
                                                await api.initiateChat(marketplace.owner.id);
                                                window.location.href = '/profile/chat';
                                            } catch (err) { toast.error("Ошибка чата"); }
                                        }}
                                        className="w-full h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-600 text-slate-900 dark:text-white font-black text-lg transition-all"
                                    >
                                        <MessageSquare className="h-5 w-5 mr-2" /> Написать
                                    </button>

                                    {/* WhatsApp */}
                                    {marketplace.owner?.phone && (
                                        <a
                                            href={`https://wa.me/${marketplace.owner.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Здравствуйте! Интересует ваше объявление "${marketplace.name}" на Autohouse.uz`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full h-12 flex items-center justify-center rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black text-sm transition-all shadow-lg shadow-green-500/20 active:scale-95"
                                        >
                                            <svg className="h-5 w-5 mr-2 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                            WhatsApp
                                        </a>
                                    )}

                                    {(isRealEstate || isAuto) && (
                                        <button onClick={() => setOfferModalOpen(true)} className="w-full h-14 flex items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-black">
                                            Предложить свою цену
                                        </button>
                                    )}

                                    <button
                                        onClick={async () => {
                                            if (!isAuthenticated) {
                                                toast.error("Авторизуйтесь для подписки на снижение цены");
                                                return;
                                            }
                                            try {
                                                // Toggle on backend
                                                const res = await api.watchPrice(marketplace.id);
                                                setIsWatchingPrice(res.isWatching);
                                                toast.success(res.isWatching ? "Вы подписаны на уведомления о снижении цены!" : "Подписка на снижение цены отменена");

                                                // Ask for push if subscribing
                                                if (res.isWatching && 'Notification' in window && 'serviceWorker' in navigator) {
                                                    const perm = await Notification.requestPermission();
                                                    if (perm === 'granted') {
                                                        const reg = await navigator.serviceWorker.ready;
                                                        // Convert VAPID public key if available, or just mock subscription logic
                                                        let sub = await reg.pushManager.getSubscription();
                                                        if (!sub) {
                                                            // For MVP we just save an empty endpoint to signify they enabled it locally
                                                            // A real VAPID key would be passed to .subscribe({ applicationServerKey: ... })
                                                            await api.subscribePush({ endpoint: "mock-endpoint-" + Date.now(), keys: {} });
                                                        }
                                                    } else {
                                                        toast.error("Разрешите уведомления в браузере для работы подписки");
                                                    }
                                                }
                                            } catch (err) {
                                                toast.error("Ошибка подписки");
                                            }
                                        }}
                                        className={`w-full h-14 flex items-center justify-center rounded-2xl font-black text-sm transition-all shadow-sm border-2 ${isWatchingPrice ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200 dark:border-amber-800" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"}`}
                                    >
                                        <Bell className={`h-5 w-5 mr-2 ${isWatchingPrice ? "fill-current" : ""}`} />
                                        {isWatchingPrice ? "Вы следите за ценой" : "Следить за снижением цены"}
                                    </button>
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <button onClick={() => toggleFavorite(marketplace)} className={cn("flex items-center gap-2 text-sm font-bold transition-colors", isFav ? "text-red-500" : "text-slate-500 hover:text-red-500")}>
                                        <Heart className={cn("h-5 w-5", isFav && "fill-current")} />
                                        {isFav ? "Удалить" : "В избранное"}
                                    </button>
                                    <button className="text-sm font-bold text-slate-500 flex items-center gap-2"><Flag className="h-4 w-4" />Жалоба</button>
                                </div>
                            </div>

                            {/* SELLER */}
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Продавец</h3>
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-2xl shadow-xl">
                                        {marketplace.owner?.name?.[0] || "M"}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="font-black text-xl text-slate-900 dark:text-white">{marketplace.owner?.name || "Дилер"}</div>
                                            {marketplace.isOfficial && (
                                                <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Official</span>
                                            )}
                                        </div>
                                        <div className="text-sm font-bold text-emerald-500 flex items-center gap-1 mt-0.5">
                                            <Check className="w-3.5 h-3.5" />
                                            {marketplace.isVerified ? "Проверенный продавец" : "Продавец"}
                                        </div>
                                    </div>
                                </div>
                                <Link to={`/store/${marketplace.owner?.id}`} className="block text-center text-blue-600 font-black text-sm">Смотреть все объявления →</Link>
                            </div>

                            {/* TRUST BADGES */}
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Гарантии</h3>
                                <div className="space-y-3">
                                    {marketplace.isVerified && (
                                        <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                                            <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                                <ShieldCheck className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900 dark:text-white">Проверенный продавец</div>
                                                <div className="text-xs text-slate-400">Личность и документы подтверждены</div>
                                            </div>
                                        </div>
                                    )}
                                    {marketplace.isOfficial && (
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                                            <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 flex-shrink-0">
                                                <Check className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900 dark:text-white">Официальный дилер</div>
                                                <div className="text-xs text-slate-400">Авторизованный представитель бренда</div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                        <div className="h-9 w-9 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-500 flex-shrink-0 shadow-sm">
                                            <span className="text-base">🔒</span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-slate-900 dark:text-white">Безопасная сделка</div>
                                            <div className="text-xs text-slate-400">Платёж защищён платформой</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                        <div className="h-9 w-9 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <span className="text-base">↩️</span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-slate-900 dark:text-white">Возврат 14 дней</div>
                                            <div className="text-xs text-slate-400">Полный возврат при несоответствии</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                </article>
            </main>

            {/* RELATED PRODUCTS */}
            {
                relatedProducts.length > 0 && (
                    <section className="container mx-auto px-4 pb-16">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Похожие предложения</h2>
                            <Link to={`/catalog?category=${marketplace.category}`} className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1">
                                Больше <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map(product => (
                                <MarketplaceCard key={product.id} marketplace={product} viewMode="grid" />
                            ))}
                        </div>
                    </section>
                )
            }

            {offerModalOpen && <MakeOfferModal marketplace={marketplace} onClose={() => setOfferModalOpen(false)} />}
        </div >
    );
}

function SpecIconItem({ icon, label, value }) {
    if (!value) return null;
    return (
        <div className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-800 rounded-[28px] border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xl transition-all duration-300 group">
            <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-[0.2em] mb-1">{label}</div>
            <div className="text-slate-900 dark:text-white font-black text-base md:text-lg leading-tight text-center">{value}</div>
        </div>
    );
}

function DetailRow({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
            <span className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-wider">{label}</span>
            <span className="text-slate-900 dark:text-white font-black text-base">{value}</span>
        </div>
    );
}

function SpecItem({ label, value }) {
    if (!value) return null;
    return (
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-[24px] border border-slate-100 dark:border-slate-700/50">
            <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mb-1">{label}</div>
            <div className="text-slate-900 dark:text-white font-black text-base leading-tight">{value}</div>
        </div>
    );
}
