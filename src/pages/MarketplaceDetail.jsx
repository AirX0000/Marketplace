import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../lib/api';
import { useShop } from '../context/ShopContext';
import toast from 'react-hot-toast';
import {
    MapPin, Check, AlertCircle, Phone, MessageSquare, ChevronRight, Share2,
    ShieldCheck, Zap, Heart, Search, Image as ImageIcon, Video, Flag,
    FileText, Calendar, Compass, Shield, Printer, Info, Truck, Wrench, Info as InfoIcon,
    Calculator, ExternalLink, ShoppingCart, Bell, ArrowLeft
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
import { Lightbox } from '../components/Lightbox';

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
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, addToCart } = useShop();

    const [marketplace, setMarketplace] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState('');
    const [isFav, setIsFav] = useState(false);
    const [offerModalOpen, setOfferModalOpen] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Dynamic attributes based on category
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedMod, setSelectedMod] = useState(null);

    // Calculator State
    const [downPayment, setDownPayment] = useState(25);
    const [term, setTerm] = useState(3);
    const [selectedBank, setSelectedBank] = useState(bankOffers[0]);

    // Price Watch State
    const [isWatchingPrice, setIsWatchingPrice] = useState(false);

    const displayPrice = useMemo(() => {
        return selectedMod?.price || marketplace?.price || 0;
    }, [selectedMod, marketplace]);

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

    // Images and attributes memoized for safety
    const allImages = useMemo(() => {
        if (!marketplace) return ['/placeholder.jpg'];
        let imagesArray = [];
        try {
            if (Array.isArray(marketplace.images)) {
                imagesArray = marketplace.images;
            } else if (typeof marketplace.images === 'string') {
                if (marketplace.images.startsWith('[')) {
                    imagesArray = JSON.parse(marketplace.images);
                } else {
                    imagesArray = [marketplace.images];
                }
            }
        } catch (e) {
            console.error("Failed to parse images", e);
        }
        return imagesArray.length > 0 ? imagesArray : [marketplace.imageUrl || marketplace.image || '/placeholder.jpg'];
    }, [marketplace]);

    const breadcrumbs = useMemo(() => {
        if (!marketplace) return [];
        return [
            { label: 'Главная', path: '/' },
            { label: 'Каталог', path: '/catalog' },
            { label: marketplace.categoryName || marketplace.category, path: `/catalog?category=${marketplace.category}` },
            { label: marketplace.name }
        ];
    }, [marketplace]);

    const schemaMarkup = useMemo(() => {
        if (!marketplace) return null;

        const availability = "https://schema.org/InStock";
        const condition = marketplace.isOfficial ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition";

        return {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": marketplace.name,
            "image": activeImage || (allImages && allImages[0]) || "https://autohouse.uz/logo.png",
            "description": marketplace.description || `Купить ${marketplace.name} на Autohouse.uz`,
            "brand": {
                "@type": "Brand",
                "name": typeof marketplace.attributes === 'object' ? marketplace.attributes?.brand : "Autohouse"
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
    }, [marketplace, activeImage, displayPrice, allImages]);

    useEffect(() => {
        window.scrollTo(0, 0);
        async function fetchDetail() {
            setLoading(true);
            try {
                const res = await api.getMarketplace(slug);
                setMarketplace(res);

                // Safe image array extraction for initial state
                let initialImages = [];
                if (Array.isArray(res.images)) {
                    initialImages = res.images;
                } else if (typeof res.images === 'string' && res.images.startsWith('[')) {
                    try { initialImages = JSON.parse(res.images); } catch (e) { }
                }

                setActiveImage(res.imageUrl || res.image || initialImages[0] || '');

                if (res.attributes?.colors?.length > 0) {
                    setSelectedColor(res.attributes.colors[0]);
                }
                if (res.attributes?.modifications?.length > 0) {
                    setSelectedMod(res.attributes.modifications[0]);
                }

                // Check favorites
                const savedFavs = JSON.parse(localStorage.getItem('favs') || '[]');
                setIsFav(savedFavs.some(f => f.id === res.id));

                // Fetch related - FIX: use getMarketplaces with category filter
                const relatedRes = await api.getMarketplaces({ category: res.category });
                const relatedList = Array.isArray(relatedRes) ? relatedRes : relatedRes.listings || [];
                setRelatedProducts(relatedList.filter(p => p.id !== res.id).slice(0, 4));

                // If authenticated, check if watching price
                if (isAuthenticated && api.checkWatchStatus && res.id) {
                    const status = await api.checkWatchStatus(res.id);
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
    }, [slug, isAuthenticated]);

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
            if (isAuthenticated && api.addFavorite) api.addFavorite(product.id).catch(console.error);
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

    const attrs = marketplace?.attributes || {};
    const modifications = attrs.modifications || [];
    const colors = attrs.colors || [];
    const isAuto = marketplace?.category === 'AUTO';
    const isRealEstate = marketplace?.category === 'REAL_ESTATE';

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

    return (
        <div className="min-h-screen bg-[#13111C]">
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

            {/* Top Navigation */}
            <div className="absolute top-8 left-0 right-0 z-30 pointer-events-none">
                <div className="container mx-auto px-4 flex justify-between items-center pointer-events-auto">
                    <Link to="/marketplaces" className="h-12 w-12 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-2xl backdrop-blur-xl border border-white/10 transition-all active:scale-90 group">
                        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <button onClick={shareListing} className="h-12 w-12 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-2xl backdrop-blur-xl border border-white/10 transition-all active:scale-90">
                        <Share2 className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* FLOATING TOP BAR (Visible on Scroll) */}
            <div className="sticky top-0 z-50 bg-[#13111C]/80 backdrop-blur-2xl border-b border-white/5 hidden md:block">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-16 bg-[#191624] rounded-lg overflow-hidden shrink-0 border border-white/5">
                            <img src={activeImage} alt={marketplace.name || 'Товар'} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="font-black text-white leading-tight truncate max-w-[300px] lg:max-w-[500px] uppercase tracking-tighter italic">{marketplace.name}</div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{marketplace.region}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right hidden lg:block">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{selectedMod?.name || 'Цена'}</div>
                            <div className="text-xl font-black text-purple-400 italic">
                                {displayPrice.toLocaleString()} Sum
                            </div>
                        </div>
                        <button
                            onClick={() => document.getElementById('contact-sidebar')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-purple-600 text-white px-8 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20 active:scale-95 italic"
                        >
                            Связаться
                        </button>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 pb-28 md:pb-8">
                <Breadcrumbs items={breadcrumbs} />
                <article className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Gallery, Details, Map */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* GALLERY & INTRO */}
                        <div className="bg-[#191624] rounded-[32px] overflow-hidden shadow-2xl border border-white/5 relative group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 via-transparent to-blue-600/10 pointer-events-none" />
                                {/* Mobile Carousel / Desktop Main Image */}
                                <div className="relative h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px] bg-[#13111C]/50">
                                    <div className="md:hidden flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
                                         onScroll={(e) => {
                                             const index = Math.round(e.target.scrollLeft / e.target.offsetWidth);
                                             if (allImages[index]) setActiveImage(allImages[index]);
                                         }}
                                    >
                                        {allImages.map((img, idx) => (
                                            <div key={idx} className="h-full w-full shrink-0 snap-center">
                                                <img
                                                    src={img}
                                                    alt={`${marketplace.name} - ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                    onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Desktop Static Image */}
                                    <img
                                        src={activeImage}
                                        alt={marketplace.name}
                                        className="hidden md:block w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 cursor-zoom-in"
                                        onClick={() => { setLightboxIndex(allImages.indexOf(activeImage)); setLightboxOpen(true); }}
                                    />

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

                                    {/* Premium Bottom Gradient Overlay for Auto */}
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
                                                    {marketplace.name}
                                                </h2>
                                            </div>
                                        </div>
                                    )}

                                    {isAuto && attrs.brandLogo && (
                                        <div className="absolute top-6 left-6 w-12 h-12 md:w-16 md:h-16 bg-white/5 backdrop-blur-2xl rounded-2xl p-2 md:p-3 shadow-2xl border border-white/10 group-hover:scale-110 transition-transform hidden sm:block">
                                            <img src={attrs.brandLogo} alt="Brand" className="w-full h-full object-contain brightness-0 invert opacity-80" />
                                        </div>
                                    )}

                                    <div className="absolute top-6 right-6 flex flex-col gap-2">
                                        <span className="bg-white/5 backdrop-blur-2xl text-slate-300 px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 italic">
                                            {marketplace.category}
                                        </span>
                                    </div>
                                </div>
                            {Array.isArray(allImages) && allImages.length > 1 && (
                                <div className="p-4 md:p-8 flex gap-3 md:gap-6 overflow-x-auto no-scrollbar relative z-10 bg-[#191624]/50 backdrop-blur-xl">
                                    {allImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { setActiveImage(img); setLightboxIndex(idx); }}
                                            onDoubleClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                                            className={cn(
                                                "relative flex-shrink-0 w-32 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-500",
                                                activeImage === img ? "border-purple-600 ring-8 ring-purple-600/10 scale-95" : "border-white/5 opacity-40 hover:opacity-100 hover:scale-105"
                                            )}
                                        >
                                            <img src={img} alt={`Вид ${idx}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                            {activeImage === img && <div className="absolute inset-0 bg-purple-600/20" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* SELECTORS (AUTO ONLY) */}
                        {isAuto && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Trim Selector */}
                                <div className="bg-[#191624] rounded-[32px] p-8 shadow-2xl border border-white/5 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent pointer-events-none" />
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8 italic">Модификации</h3>
                                    <div className="space-y-4">
                                        {modifications.map((mod, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedMod(mod)}
                                                className={cn(
                                                    "w-full text-left p-6 rounded-2xl border transition-all flex items-center justify-between group/mod relative overflow-hidden",
                                                    selectedMod?.name === mod.name
                                                        ? "border-purple-600/50 bg-purple-600/10 shadow-[0_0_20px_rgba(147,51,234,0.1)]"
                                                        : "border-white/5 bg-white/5 hover:border-white/10"
                                                )}
                                            >
                                                <div className="relative z-10">
                                                    <div className="font-black text-white group-hover/mod:text-purple-400 transition-colors uppercase tracking-tighter italic">{mod.name}</div>
                                                    <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-2 italic">
                                                        {mod.features?.join(' • ') || 'Standard options'}
                                                    </div>
                                                </div>
                                                <div className="text-right relative z-10">
                                                    <div className="font-black text-purple-400 italic">{(mod.price || (marketplace?.price || 0)).toLocaleString()}</div>
                                                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">SUM</div>
                                                </div>
                                                {selectedMod?.name === mod.name && (
                                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-transparent pointer-events-none" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Color Picker */}
                                <div className="bg-[#191624] rounded-[32px] p-8 shadow-2xl border border-white/5 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8 italic">Цвет кузова</h3>
                                    <div className="flex flex-wrap gap-6">
                                        {colors.map((color, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedColor(color)}
                                                className="flex flex-col items-center gap-4 group/color"
                                            >
                                                <div
                                                    className={cn(
                                                        "w-14 h-14 rounded-full border-4 shadow-2xl transition-all transform duration-500 relative",
                                                        selectedColor?.name === color.name
                                                            ? "border-purple-600 scale-110 shadow-purple-600/40"
                                                            : "border-white/10 hover:scale-110 hover:border-white/20"
                                                    )}
                                                    style={{ backgroundColor: color.hex }}
                                                >
                                                    {selectedColor?.name === color.name && (
                                                        <div className="absolute inset-0 rounded-full animate-ping bg-purple-600/20" />
                                                    )}
                                                </div>
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest transition-colors italic",
                                                    selectedColor?.name === color.name ? "text-purple-400" : "text-slate-500 group-hover/color:text-slate-300"
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
                            <section className="bg-[#191624] rounded-[32px] p-8 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 via-transparent to-transparent pointer-events-none" />
                                <div className="flex items-center justify-between mb-12 relative z-10">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Технические характеристики</h2>
                                    <div className="text-[9px] font-black text-purple-400 bg-purple-400/10 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] italic border border-purple-400/20">
                                        {attrs.specs?.transmission || 'АКПП'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                                    <SpecIconItem icon={<div className="p-4 rounded-2xl bg-white/5 text-2xl group-hover:scale-110 transition-transform shadow-lg">⚡</div>} label="Мощность" value={attrs.specs?.power || '245 л.с.'} />
                                    <SpecIconItem icon={<div className="p-4 rounded-2xl bg-white/5 text-2xl group-hover:scale-110 transition-transform shadow-lg">⏱️</div>} label="0-100 км/ч" value={attrs.specs?.acceleration || '6.5 сек'} />
                                    <SpecIconItem icon={<div className="p-4 rounded-2xl bg-white/5 text-2xl group-hover:scale-110 transition-transform shadow-lg">🔋</div>} label="Запас хода" value={attrs.specs?.range || '550 км'} />
                                    <SpecIconItem icon={<div className="p-4 rounded-2xl bg-white/5 text-2xl group-hover:scale-110 transition-transform shadow-lg">🛣️</div>} label="Расход" value={attrs.specs?.fuelConsumption || '9.4 л'} />
                                </div>

                                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2 relative z-10">
                                    <DetailRow label="Двигатель" value={attrs.specs?.engine || 'Электро'} />
                                    <DetailRow label="Коробка" value={attrs.specs?.transmission || 'Автомат'} />
                                    <DetailRow label="Привод" value={attrs.specs?.drive || 'Полный'} />
                                    <DetailRow label="Цвет" value={selectedColor?.name || attrs.specs?.color || 'Белый'} />
                                    <DetailRow label="Пробег" value={`${attrs.specs?.mileage || 0} км`} />
                                    <DetailRow label="Год выпуска" value={attrs.specs?.year} />
                                </div>

                                <div className="mt-12 pt-12 border-t border-white/5 relative z-10">
                                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8 italic">Принимаем к оплате</h3>
                                    <div className="flex flex-wrap items-center gap-10 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                                        <img src="https://logobank.uz:8005/static/logos_png/uzcard-logo-uz-600.png" loading="lazy" decoding="async" alt="Uzcard" className="h-6 object-contain brightness-0 invert" />
                                        <img src="https://logobank.uz:8005/static/logos_png/visa-0-logo-uz-600.png" loading="lazy" decoding="async" alt="Visa" className="h-4 object-contain brightness-0 invert" />
                                        <img src="https://logobank.uz:8005/static/logos_png/mastercard-0-logo-uz-600.png" loading="lazy" decoding="async" alt="Mastercard" className="h-6 object-contain brightness-0 invert" />
                                        <div className="h-6 w-px bg-white/10" />
                                        <span className="font-black text-slate-500 text-[10px] uppercase tracking-widest italic">Direct Bank Transfer</span>
                                    </div>
                                </div>
                            </section>
                        ) : attrs.specs && (
                            <section className="bg-[#191624] rounded-[32px] p-8 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/5 via-transparent to-transparent pointer-events-none" />
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-12 relative z-10">Характеристики</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2 relative z-10">
                                    {Object.entries(attrs.specs).filter(([, v]) => typeof v !== 'object').map(([key, val]) => (
                                        <DetailRow key={key} label={key} value={val} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* DESCRIPTION */}
                        <section className="bg-[#191624] rounded-[32px] p-8 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent pointer-events-none" />
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-8 relative z-10">Описание</h2>
                            <div className="prose prose-invert max-w-none text-slate-400 text-lg leading-relaxed pt-8 border-t border-white/5 relative z-10">
                                <p className="leading-relaxed whitespace-pre-line">{marketplace.description}</p>
                            </div>
                        </section>

                        {/* VIDEO */}
                        {marketplace.videoUrl && (
                            <section className="bg-[#191624] rounded-[32px] p-8 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden group">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-8 relative z-10">Видеообзор</h2>
                                <div className="aspect-video rounded-3xl overflow-hidden bg-[#13111C] relative z-0 border border-white/5 shadow-2xl group-hover:scale-[1.02] transition-transform duration-700">
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
                        <section className="bg-[#191624] rounded-[32px] p-8 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden group">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-8 relative z-10 flex items-center gap-4">
                                <MapPin className="text-purple-600 h-6 w-6" /> Расположение
                            </h2>
                            <div className="aspect-[21/9] rounded-3xl overflow-hidden bg-[#13111C] relative z-0 border border-white/5 shadow-2xl grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
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
                            <section className="bg-[#191624] rounded-[32px] p-8 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 via-transparent to-transparent pointer-events-none" />
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 relative z-10">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic flex items-center gap-4">
                                        <Calculator className="text-purple-600 h-7 w-7" />
                                        {isAuto ? "Автокредит / Калькулятор" : "Ипотечный калькулятор"}
                                    </h2>
                                    {isAuto && (
                                        <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white/5 px-5 py-2.5 rounded-full border border-white/5 italic">
                                            <Info className="h-4 w-4 text-purple-600" />
                                            Актуально: {new Date().toLocaleDateString()}
                                        </div>
                                    )}
                                </div>

                                {isAuto && (
                                    <div className="mb-12 relative z-10">
                                        <label className="block text-[10px] font-black text-slate-500 mb-6 uppercase tracking-[0.2em] italic">Выберите банк</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {bankOffers.map((offer) => (
                                                <button
                                                    key={offer.id}
                                                    onClick={() => setSelectedBank(offer)}
                                                    className={cn(
                                                        "p-5 rounded-[24px] text-left transition-all border relative overflow-hidden group/bank",
                                                        selectedBank?.id === offer.id
                                                            ? "border-purple-600/50 bg-purple-600/10 shadow-[0_0_30px_rgba(147,51,234,0.1)]"
                                                            : "border-white/5 bg-white/5 hover:border-white/10"
                                                    )}
                                                >
                                                    <div className="font-black text-white text-sm mb-1 uppercase tracking-tighter italic">{offer.bank}</div>
                                                    <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest truncate italic">{offer.product}</div>
                                                    <div className="mt-4 flex items-center justify-between">
                                                        <span className="text-purple-400 font-black text-xs italic">{offer.rate}</span>
                                                        <span className="text-slate-500 font-black text-[9px] uppercase tracking-widest">от {offer.downPayment}%</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                                    <div className="space-y-10">
                                        <div>
                                            <div className="flex justify-between text-[10px] font-black mb-4 text-slate-400 uppercase tracking-[0.2em] italic">
                                                <span>Первоначальный взнос ({downPayment}%)</span>
                                                <span className="text-white">{(displayPrice * downPayment / 100).toLocaleString()} Sum</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={isAuto ? (selectedBank?.downPayment || 0) : 15}
                                                max="90"
                                                step="1"
                                                value={downPayment}
                                                onChange={(e) => setDownPayment(parseInt(e.target.value))}
                                                className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[10px] font-black mb-4 text-slate-400 uppercase tracking-[0.2em] italic">
                                                <span>Срок (лет)</span>
                                                <span className="text-white">{term}</span>
                                            </div>
                                            <input type="range" min="1" max={isAuto ? 5 : 20} step="1" value={term} onChange={(e) => setTerm(parseInt(e.target.value))} className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-purple-600" />
                                        </div>
                                    </div>
                                    <div className="bg-[#13111C]/50 backdrop-blur-3xl rounded-[32px] p-10 text-center border border-white/5 shadow-2xl relative overflow-hidden group/total">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent pointer-events-none" />
                                        <div className="text-purple-400 font-black text-[9px] uppercase tracking-[0.3em] mb-4 italic relative z-10">Ежемесячный платёж</div>
                                        <div className="text-4xl font-black text-white mb-2 italic tracking-tighter relative z-10">
                                            {Math.round(monthlyPayment).toLocaleString()}
                                            <span className="text-lg font-medium text-slate-500 ml-2 italic">Sum</span>
                                        </div>
                                        <div className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em] mt-4 italic relative z-10">Ставка: {selectedBank?.rate || '24%'}</div>
                                        <button onClick={() => submitLoanApplication(isAuto ? 'AUTO_LOAN' : 'MORTGAGE')} className="mt-8 w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-purple-600/20 text-[10px] uppercase tracking-[0.2em] italic relative z-10 active:scale-95">
                                            Оставить заявку
                                        </button>
                                    </div>
                                </div>

                                {isAuto && (
                                    <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                                        <div className="text-[10px] font-black text-slate-500 flex items-center gap-3 uppercase tracking-widest italic group-hover:text-slate-400 transition-colors">
                                            <ExternalLink className="h-4 w-4 text-purple-600" />
                                            Больше предложений на <a href="https://depozit.uz/credits/avtokredit" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">Depozit.uz</a>
                                        </div>
                                        {selectedBank?.phone && (
                                            <a href={`tel:${selectedBank.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-white font-black text-[10px] hover:text-purple-400 transition-all uppercase tracking-widest italic bg-white/5 px-6 py-2.5 rounded-xl border border-white/5">
                                                <Phone className="h-4 w-4 text-purple-600" /> {selectedBank.phone}
                                            </a>
                                        )}
                                    </div>
                                )}
                            </section>
                        )}

                        <ReviewSection marketplaceId={marketplace?.id || slug} isAuthenticated={isAuthenticated} currentUser={user} />
                    </div>

                    {/* RIGHT COLUMN: Sidebar */}
                    <aside className="lg:col-span-4 relative">
                        <div className="sticky top-28 space-y-8 h-fit" id="contact-sidebar">

                            {/* MAIN ACTIONS / PRICE CARD */}
                            <div className="bg-[#191624] rounded-[32px] p-8 shadow-2xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="mb-10 pt-2 pb-6 border-b border-white/5">
                                        <h1 className="text-3xl font-black text-white leading-tight mb-4 uppercase tracking-tighter italic">
                                            {marketplace.name}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-500 mb-8 uppercase tracking-widest italic">
                                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                                <MapPin className="h-3.5 w-3.5 text-purple-600" /> {marketplace.region}
                                            </div>
                                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                                {marketplace.stock > 0 || marketplace.isAvailable ? (
                                                    <span className="flex items-center gap-1.5 text-emerald-500"><Check className="h-3.5 w-3.5" /> В наличии</span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-amber-500"><AlertCircle className="h-3.5 w-3.5" /> Нет в наличии</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-3">
                                            <div className="text-5xl font-black text-white tracking-tighter italic">
                                                {displayPrice.toLocaleString()}
                                            </div>
                                            <div className="text-xl font-black text-purple-400 italic">Sum</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <button
                                            onClick={() => {
                                                if (marketplace.owner?.phone) window.location.href = `tel:${marketplace.owner.phone}`;
                                                else toast.error("Телефон не указан");
                                            }}
                                            className="w-full h-16 flex items-center justify-center rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-purple-600/20 active:scale-95 italic group/btn"
                                        >
                                            <Phone className="h-4 w-4 mr-3 group-hover:rotate-12 transition-transform" />
                                            {marketplace.owner?.phone || "Связаться"}
                                        </button>

                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => {
                                                    addToCart(marketplace);
                                                    toast.success("Добавлено в корзину");
                                                }}
                                                className="w-full h-16 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[9px] uppercase tracking-widest transition-all border border-white/5 active:scale-95 italic"
                                            >
                                                <ShoppingCart className="h-4 w-4 mr-2 text-purple-600" /> В корзину
                                            </button>

                                            <button
                                                onClick={() => {
                                                    addToCart(marketplace);
                                                    navigate('/checkout');
                                                }}
                                                className="w-full h-16 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[9px] uppercase tracking-widest transition-all border border-white/5 active:scale-95 italic group/zap"
                                            >
                                                <Zap className="h-4 w-4 mr-2 text-purple-600 group-hover:scale-125 transition-transform" fill="currentColor" /> 1 Клик
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
                                            className="w-full h-16 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all italic"
                                        >
                                            <MessageSquare className="h-4 w-4 mr-3 text-purple-600" /> Написать
                                        </button>

                                        {(isRealEstate || isAuto) && (
                                            <button onClick={() => setOfferModalOpen(true)} className="w-full h-14 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 text-purple-400 font-black text-[10px] uppercase tracking-widest italic border border-purple-600/20">
                                                Предложить цену
                                            </button>
                                        )}

                                        <button
                                            onClick={async () => {
                                                if (!isAuthenticated) {
                                                    toast.error("Авторизуйтесь для подписки");
                                                    return;
                                                }
                                                try {
                                                    const res = await api.watchPrice(marketplace.id);
                                                    setIsWatchingPrice(res.isWatching);
                                                    toast.success(res.isWatching ? "Вы следите за ценой!" : "Подписка отменена");
                                                } catch (err) { toast.error("Ошибка подписки"); }
                                            }}
                                            className={cn(
                                                "w-full h-16 flex items-center justify-center rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all border italic shadow-2xl",
                                                isWatchingPrice
                                                    ? "bg-purple-600/20 text-purple-400 border-purple-600/50"
                                                    : "bg-white/5 text-slate-400 border-white/5 hover:border-white/10"
                                            )}
                                        >
                                            <Bell className={cn("h-4 w-4 mr-2", isWatchingPrice ? "fill-current" : "text-purple-600")} />
                                            {isWatchingPrice ? "В списке наблюдения" : "Следить за ценой"}
                                        </button>
                                    </div>

                                    <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                                        <button onClick={() => toggleFavorite(marketplace)} className={cn("flex items-center gap-3 text-[10px] font-black transition-all uppercase tracking-widest italic", isFav ? "text-red-500 scale-110" : "text-slate-500 hover:text-red-500 active:scale-90")}>
                                            <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
                                            {isFav ? "В избранном" : "Сохранить"}
                                        </button>
                                        <button className="text-[10px] font-black text-slate-500 hover:text-slate-300 flex items-center gap-3 uppercase tracking-widest italic"><Flag className="h-4 w-4" />Жалоба</button>
                                    </div>
                                </div>
                            </div>

                            {/* SELLER */}
                            <div className="bg-[#191624] rounded-[32px] p-8 shadow-2xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent pointer-events-none" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8 italic relative z-10">Продавец</h3>
                                <div className="flex items-center gap-5 mb-8 relative z-10">
                                    <div className="h-16 w-16 rounded-[24px] bg-gradient-to-br from-purple-600 to-blue-700 text-white flex items-center justify-center font-black text-2xl shadow-2xl border border-white/10 group-hover:scale-110 transition-transform">
                                        {marketplace.owner?.name?.[0] || "M"}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="font-black text-xl text-white uppercase tracking-tighter italic">{marketplace.owner?.name || "Дилер"}</div>
                                            {marketplace.isOfficial && (
                                                <span className="bg-purple-600 text-white text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full animate-pulse shadow-lg shadow-purple-600/20">Official</span>
                                            )}
                                        </div>
                                        <div className="text-[10px] font-black text-emerald-500 flex items-center gap-2 mt-1.5 uppercase tracking-widest italic">
                                            <Check className="w-3.5 h-3.5" />
                                            {marketplace.isVerified ? "Верифицирован" : "Дилер"}
                                        </div>
                                    </div>
                                </div>
                                <Link to={`/store/${marketplace.owner?.id}`} className="block text-center text-purple-400 font-black text-[10px] uppercase tracking-widest italic hover:text-purple-300 transition-colors relative z-10 pt-6 border-t border-white/5">
                                    Смотреть профиль →
                                </Link>
                            </div>

                            {/* TRUST BADGES */}
                            <div className="bg-[#191624] rounded-[32px] p-8 shadow-2xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8 italic relative z-10">Преимущества</h3>
                                <div className="space-y-4 relative z-10">
                                    {marketplace.isVerified && (
                                        <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                            <div className="h-10 w-10 rounded-xl bg-emerald-600/10 flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-inner">
                                                <ShieldCheck className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-black text-white uppercase tracking-widest italic">Проверен</div>
                                                <div className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Документы подтверждены</div>
                                            </div>
                                        </div>
                                    )}
                                    {marketplace.isOfficial && (
                                        <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                            <div className="h-10 w-10 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-600 flex-shrink-0 shadow-inner">
                                                <Check className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-black text-white uppercase tracking-widest italic">Официальный дилер</div>
                                                <div className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Авторизованный представитель</div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="h-10 w-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 flex-shrink-0 shadow-inner">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-black text-white uppercase tracking-widest italic">Безопасная сделка</div>
                                            <div className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Защита покупателя</div>
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
                    <section className="container mx-auto px-6 pb-24 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-white/5" />
                        <div className="flex flex-col md:flex-row md:items-end justify-between pt-16 mb-12 gap-6">
                            <div>
                                <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-4">Похожие предложения</h2>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] italic">Рекомендовано специально для вас</p>
                            </div>
                            <Link to={`/catalog?category=${marketplace.category}`} className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-purple-400 font-black text-[10px] uppercase tracking-widest italic border border-white/5 transition-all">
                                Весь каталог <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedProducts.map(product => (
                                <div key={product.id} className="hover:-translate-y-2 transition-transform duration-500">
                                    <MarketplaceCard marketplace={product} viewMode="grid" />
                                </div>
                            ))}
                        </div>
                    </section>
                )
            }

            {offerModalOpen && <MakeOfferModal marketplace={marketplace} onClose={() => setOfferModalOpen(false)} />}
            {
                lightboxOpen && (
                    <Lightbox
                        images={allImages}
                        startIndex={lightboxIndex >= 0 ? lightboxIndex : 0}
                        onClose={() => setLightboxOpen(false)}
                    />
                )
            }
            
            {/* Mobile Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#191624]/95 backdrop-blur-xl border-t border-white/10 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            if (marketplace.owner?.phone) window.location.href = `tel:${marketplace.owner.phone}`;
                            else toast.error("Телефон не указан");
                        }}
                        className="flex-1 h-14 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform italic shadow-lg shadow-purple-600/20"
                    >
                        <Phone size={18} /> Позвонить
                    </button>
                    <button
                        onClick={async () => {
                            if (!isAuthenticated) return toast.error("Войдите");
                            try {
                                await api.initiateChat(marketplace.owner.id);
                                window.location.href = '/profile/chat';
                            } catch (err) { toast.error("Ошибка чата"); }
                        }}
                        className="h-14 w-14 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center active:scale-95 transition-all"
                    >
                        <MessageSquare size={20} className="text-purple-600" />
                    </button>
                    <button
                        onClick={() => {
                            addToCart(marketplace);
                            toast.success("В корзине");
                        }}
                        className="h-14 w-14 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center active:scale-95 transition-all"
                    >
                        <ShoppingCart size={20} className="text-purple-600" />
                    </button>
                </div>
            </div>
        </div >
    );
}

function SpecIconItem({ icon, label, value }) {
    if (!value) return null;
    return (
        <div className="flex flex-col items-center p-8 bg-[#191624] rounded-[32px] border border-white/5 hover:border-purple-600/30 hover:bg-white/[0.02] hover:shadow-[0_0_40px_rgba(147,51,234,0.05)] transition-all duration-500 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 relative z-10">
                {icon}
            </div>
            <div className="text-[9px] text-slate-500 uppercase font-black tracking-[0.3em] mb-2 italic relative z-10">{label}</div>
            <div className="text-white font-black text-lg md:text-xl leading-tight text-center italic tracking-tighter relative z-10">{value}</div>
        </div>
    );
}

function DetailRow({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex items-center justify-between py-5 border-b border-white/5 last:border-0 group">
            <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest italic group-hover:text-slate-400 transition-colors">{label}</span>
            <span className="text-white font-black text-sm italic tracking-tight">{value}</span>
        </div>
    );
}

function SpecItem({ label, value }) {
    if (!value) return null;
    return (
        <div className="p-5 bg-white/5 rounded-[24px] border border-white/5 hover:border-white/10 transition-all group">
            <div className="text-[8px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2 italic group-hover:text-purple-400 transition-colors">{label}</div>
            <div className="text-white font-black text-sm leading-tight italic tracking-tight">{value}</div>
        </div>
    );
}
