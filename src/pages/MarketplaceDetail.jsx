
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { api } from '../lib/api';
import { Share2, MessageSquare, Printer, MapPin, Check, ShieldCheck, Heart, Flag, Calculator, ChevronRight, Info, ExternalLink, Phone, ArrowLeft } from 'lucide-react';
import { bankOffers } from '../data/bankOffers';
import { useShop } from '../context/ShopContext';
import { VehicleHistoryReport } from '../components/marketplace/VehicleHistoryReport';
import { ReviewSection } from '../components/ReviewSection';
import { MakeOfferModal } from '../components/MakeOfferModal';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

const safeParse = (str, fallback = []) => {
    if (!str) return fallback;
    try {
        const parsed = typeof str === 'string' ? JSON.parse(str) : str;
        return parsed || fallback;
    } catch (e) {
        return fallback;
    }
};

export function MarketplaceDetail() {
    const { id } = useParams();
    const [marketplace, setMarketplace] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToCart, toggleFavorite, isFavorite, isAuthenticated, user } = useShop();

    // Offer State
    const [offerModalOpen, setOfferModalOpen] = useState(false);

    // activeImage state
    const [activeImage, setActiveImage] = useState(null);
    const [selectedMod, setSelectedMod] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);

    // Calculator State
    const [downPayment, setDownPayment] = useState(25); // %
    const [term, setTerm] = useState(5); // years
    const [selectedBank, setSelectedBank] = useState(bankOffers[0]);

    useEffect(() => {
        if (selectedBank) {
            if (downPayment < selectedBank.downPayment) setDownPayment(selectedBank.downPayment);
        }
    }, [selectedBank, downPayment]);

    // Load Data
    useEffect(() => {
        async function load() {
            try {
                const marketData = await api.getMarketplace(id);
                
                // Task 7: Recently Viewed
                try {
                    const history = JSON.parse(localStorage.getItem('viewHistory') || '[]');
                    const updated = [marketData, ...history.filter(h => h.id !== marketData.id)].slice(0, 5);
                    localStorage.setItem('viewHistory', JSON.stringify(updated));
                } catch (e) {}
                setMarketplace(marketData);

                // Set initial active image
                const images = safeParse(marketData.images, []);
                const initialImage = marketData.image || (images.length > 0 ? images[0] : null);
                setActiveImage(initialImage);
            } catch (error) {
                console.error("Failed to load data", error);
                toast.error("Не удалось загрузить данные объявления");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    // Save to History
    useEffect(() => {
        if (marketplace) {
            try {
                const historyItem = {
                    id: marketplace.id,
                    name: marketplace.name,
                    price: marketplace.price,
                    image: marketplace.image,
                    category: marketplace.category,
                    viewedAt: new Date().toISOString()
                };
                const stored = localStorage.getItem('recentlyViewed');
                let history = stored ? JSON.parse(stored) : [];
                history = history.filter(h => h.id !== marketplace.id);
                history.unshift(historyItem);
                if (history.length > 20) history = history.slice(0, 20);
                localStorage.setItem('recentlyViewed', JSON.stringify(history));
            } catch (e) {
                console.error("Failed to save history", e);
            }
        }
    }, [marketplace]);

    const isRealEstate = useMemo(() => ["Apartments", "Houses", "Commercial", "Land", "New Building", "Private House", "Недвижимость", "Недвижимость"].includes(marketplace?.category), [marketplace]);
    const isAuto = useMemo(() => ["Cars", "Transport", "Dealer", "Private Auto", "Автомобили", "Седан", "Кроссовер", "Внедорожник", "Электромобиль"].includes(marketplace?.category), [marketplace]);

    const attrs = useMemo(() => safeParse(marketplace?.attributes, {}), [marketplace]);
    const modifications = useMemo(() => attrs?.modifications || [], [attrs]);
    const colors = useMemo(() => attrs?.colors || [], [attrs]);

    useEffect(() => {
        if (modifications.length > 0 && !selectedMod) {
            setSelectedMod(modifications[0]);
        }
        if (colors.length > 0 && !selectedColor) {
            setSelectedColor(colors[0]);
        }
    }, [modifications, colors, selectedMod, selectedColor]);

    const displayPrice = useMemo(() => {
        if (isAuto && selectedMod?.price) return selectedMod.price;
        return marketplace?.price || 0;
    }, [isAuto, selectedMod, marketplace]);

    const isFav = isFavorite(marketplace?.id);

    const monthlyPayment = useMemo(() => {
        const principal = displayPrice * (1 - downPayment / 100);
        const annualRate = selectedBank ? (selectedBank.minRate + selectedBank.maxRate) / 2 : 24;
        const monthlyRate = annualRate / 100 / 12;
        const numberOfPayments = term * 12;

        if (monthlyRate === 0) return principal / numberOfPayments;
        return (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }, [displayPrice, downPayment, term, selectedBank]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (!marketplace) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Объявление не найдено</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Возможно, оно было удалено или перемещено.</p>
            <Link to="/marketplaces" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                Вернуться в каталог
            </Link>
        </div>
    );

    const images = safeParse(marketplace.images, []);
    const allImages = marketplace.image ? [marketplace.image, ...images.filter(img => img !== marketplace.image)] : images;

    const shareListing = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Ссылка скопирована!");
    };

    const submitLoanApplication = async (type) => {
        if (!isAuthenticated) return toast.error("Войдите, чтобы подать заявку");
        try {
            await api.createLoanApplication({
                marketplaceId: marketplace.id,
                type,
                amount: displayPrice,
                downPayment: displayPrice * downPayment / 100,
                term,
                monthlyPayment
            });
            toast.success("Заявка отправлена! Статус в профиле.");
        } catch (e) {
            toast.error("Ошибка отправки заявки");
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-20 font-sans">
            {/* BREADCRUMBS & NAV */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30 transition-all">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/marketplaces" className="flex items-center text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Назад к списку
                    </Link>

                    {/* Sticky Price & Contact for Cars */}
                    {isAuto && (
                        <div className="hidden md:flex items-center gap-6">
                            <div className="flex flex-col items-end">
                                <div className="text-sm text-slate-400 font-medium tracking-tight">Стоимость {selectedMod ? `(${selectedMod.name})` : ''}</div>
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
                    )}

                    <div className="flex items-center gap-2">
                        <button onClick={shareListing} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-blue-600 transition-colors" title="Поделиться">
                            <Share2 className="h-5 w-5" />
                        </button>
                        <button onClick={() => window.print()} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-blue-600 transition-colors hidden sm:block" title="Распечатать">
                            <Printer className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

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
                                        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-2 drop-shadow-lg">
                                            {marketplace.name}
                                        </h1>
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
                                            <img src={img} alt={`View ${idx} `} className="w-full h-full object-cover" />
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
                                                    <div className="font-black text-blue-600">{(mod.price || price).toLocaleString()}</div>
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
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
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
                                        <img src="https://cdn.payme.uz/logo/payme_color.svg" alt="Payme" className="h-6 object-contain" />
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-4 object-contain" />
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="MC" className="h-6 object-contain" />
                                        <div className="h-6 w-px bg-slate-200" />
                                        <span className="font-bold text-slate-400 text-xs">Direct Bank Transfer</span>
                                    </div>
                                </div>
                            </div>
                        ) : attrs.specs && (
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Характеристики</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {Object.entries(attrs.specs).filter(([k, v]) => typeof v !== 'object').map(([key, val]) => (
                                        <SpecItem key={key} label={key} value={val} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* DESCRIPTION */}
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Описание</h2>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                                <p>{marketplace.description}</p>
                            </div>
                        </div>

                        {/* MAP */}
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
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
                        </div>

                        {/* CALCULATOR */}
                        {(isRealEstate || isAuto) && (
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
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
                            </div>
                        )}

                        <ReviewSection marketplaceId={id} isAuthenticated={isAuthenticated} currentUser={user} />
                    </div>

                    {/* RIGHT COLUMN: Sidebar */}
                    <div className="lg:col-span-4 relative">
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
                                        <Check className="h-4 w-4 text-emerald-500" /> В наличии
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
                                        className="w-full h-14 flex items-center justify-center rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg transition-all shadow-lg shadow-emerald-500/20"
                                    >
                                        <Phone className="h-5 w-5 mr-3" />
                                        {marketplace.owner?.phone || "Связаться"}
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (!isAuthenticated) return toast.error("Войдите");
                                            try {
                                                await api.initiateChat(marketplace.owner.id);
                                                window.location.href = '/profile/chat';
                                            } catch (e) { toast.error("Ошибка чата"); }
                                        }}
                                        className="w-full h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-600 text-slate-900 dark:text-white font-black text-lg transition-all"
                                    >
                                        Написать
                                    </button>

                                    {(isRealEstate || isAuto) && (
                                        <button onClick={() => setOfferModalOpen(true)} className="w-full h-14 flex items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-black">
                                            Предложить свою цену
                                        </button>
                                    )}
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
                                        <div className="font-black text-xl text-slate-900 dark:text-white">{marketplace.owner?.name || "Дилер"}</div>
                                        <div className="text-sm font-bold text-emerald-500 flex items-center gap-1 mt-0.5"><Check className="w-3.5 h-3.5" /> Проверен</div>
                                    </div>
                                </div>
                                <Link to={`/ store / ${marketplace.owner?.id} `} className="block text-center text-blue-600 font-black text-sm">Смотреть все объявления →</Link>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {offerModalOpen && <MakeOfferModal marketplace={marketplace} onClose={() => setOfferModalOpen(false)} />}
        </div>
    );
}

function SpecIconItem({ icon, label, value }) {
    if (!value) return null;
    return (
        <div className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-800 rounded-[28px] border border-slate-100 dark:border-slate-700/50 hover:bg-white hover:shadow-xl transition-all duration-300 group">
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
