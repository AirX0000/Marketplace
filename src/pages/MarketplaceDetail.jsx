
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { api } from '../lib/api';
import { Star, ArrowLeft, Heart, Check, Building, FileText, Calculator, Box, Phone, MapPin, ShieldCheck, HandCoins, Share2, Printer, Flag } from 'lucide-react';
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

    // Mortgage Calculator State
    const [downPayment, setDownPayment] = useState(20); // %
    const [term, setTerm] = useState(10); // years

    // activeImage state moved up to avoid conditional hook call
    const [activeImage, setActiveImage] = useState(null);

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

                // Remove duplicates (keep newest)
                history = history.filter(h => h.id !== marketplace.id);

                // Add to top
                history.unshift(historyItem);

                // Limit to 20 items
                if (history.length > 20) history = history.slice(0, 20);

                localStorage.setItem('recentlyViewed', JSON.stringify(history));
            } catch (e) {
                console.error("Failed to save history", e);
            }
        }
    }, [marketplace]);

    useEffect(() => {
        if (marketplace) {
            const images = safeParse(marketplace.images, []);
            // Ensure the main image is also in the gallery if not already
            const initialImage = marketplace.activeImage || marketplace.image || (images.length > 0 ? images[0] : null);
            if (!activeImage) setActiveImage(initialImage);
        }
    }, [marketplace, activeImage]);

    useEffect(() => {
        async function load() {
            try {
                const marketData = await api.getMarketplace(id);
                setMarketplace(marketData);
            } catch (error) {
                console.error("Failed to load data", error);
                toast.error("Не удалось загрузить данные объявления");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

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

    // Parse rich attributes safely
    const attrs = safeParse(marketplace.attributes, {});
    const images = safeParse(marketplace.images, []);
    // Ensure the main image is also in the gallery if not already
    const allImages = marketplace.activeImage ? [marketplace.activeImage] : (marketplace.image ? [marketplace.image] : []);
    images.forEach(img => {
        if (!allImages.includes(img)) allImages.push(img);
    });

    // Determine category type
    const isRealEstate = ["Apartments", "Houses", "Commercial", "Land", "New Building", "Private House", "Real Estate", "Недвижимость"].includes(marketplace.category);
    const isAuto = ["Cars", "Transport", "Dealer", "Private Auto", "Автомобили"].includes(marketplace.category);

    const price = marketplace.price || 0;
    const isFav = isFavorite(marketplace.id);

    // Calculate Mortgage
    const loanAmount = price * (1 - downPayment / 100);
    const bankRate = attrs.mortgage?.[0]?.rate || 22; // Default 22% if not set
    const totalPayable = loanAmount * (1 + (bankRate / 100 * term));
    const monthlyPayment = Math.round(totalPayable / (term * 12));

    const shareListing = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Ссылка скопирована!");
    };

    const submitLoanApplication = async (type) => {
        if (!isAuthenticated) return toast.error("Войдите, чтобы подать заявку");
        if (confirm(`Отправить заявку на ${type === 'MORTGAGE' ? 'ипотеку' : 'автокредит'}?`)) {
            try {
                await api.createLoanApplication({
                    marketplaceId: marketplace.id,
                    type,
                    amount: loanAmount,
                    downPayment: price * downPayment / 100,
                    term,
                    monthlyPayment
                });
                toast.success("Заявка отправлена! Статус в профиле.");
            } catch (e) {
                console.error(e);
                toast.error("Ошибка отправки заявки");
            }
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-20 font-sans">
            {/* BREADCRUMBS & NAV */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30 transition-all">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    <Link to="/marketplaces" className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Назад к списку
                    </Link>
                    <div className="flex items-center gap-2">
                        <button onClick={shareListing} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors" title="Поделиться">
                            <Share2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => window.print()} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors hidden sm:block" title="Распечатать">
                            <Printer className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Gallery, Details, Map */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* GALLERY */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="relative h-[400px] md:h-[500px] lg:h-[600px] bg-slate-100 dark:bg-slate-800 group">
                                <img
                                    src={activeImage}
                                    alt={marketplace.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="bg-slate-900/80 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {marketplace.category}
                                    </span>
                                    {marketplace.status === 'APPROVED' && (
                                        <span className="bg-emerald-500/90 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" /> Проверено
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Thumbnails */}
                            {allImages.length > 1 && (
                                <div className="p-4 flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                    {allImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(img)}
                                            className={cn(
                                                "relative flex-shrink-0 w-24 h-20 rounded-xl overflow-hidden border-2 transition-all",
                                                activeImage === img ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-70 hover:opacity-100"
                                            )}
                                        >
                                            <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* MOBILE TITLE (Only visible on small screens to match typical flow) */}
                        <div className="lg:hidden space-y-4">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                                {marketplace.name}
                            </h1>
                            <div className="text-3xl font-black text-primary">
                                {price.toLocaleString()} UZS
                            </div>
                        </div>

                        {/* SPECIFICATIONS */}
                        {attrs.specs && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    {isRealEstate ? <Building className="text-primary h-5 w-5" /> : (isAuto ? <div className="text-primary text-lg">🚗</div> : <Star className="text-primary h-5 w-5" />)}
                                    Характеристики
                                </h2>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {isRealEstate ? (
                                        <>
                                            <SpecItem label="Площадь" value={`${attrs.specs?.area || '-'} м²`} />
                                            <SpecItem label="Комнаты" value={attrs.specs?.rooms} />
                                            <SpecItem label="Этаж" value={`${attrs.specs?.floor || '-'} / ${attrs.specs?.totalFloors || '-'}`} />
                                            <SpecItem label="Год постройки" value={attrs.specs?.yearBuilt} />
                                            <SpecItem label="Материал" value={Array.isArray(attrs.specs?.materials) ? attrs.specs.materials.join(', ') : attrs.specs?.materials} />
                                            <SpecItem label="Ремонт" value={attrs.specs?.renovation || "Евроремонт"} />
                                        </>
                                    ) : isAuto ? (
                                        <>
                                            <SpecItem label="Пробег" value={`${attrs.specs?.mileage || '-'} км`} />
                                            <SpecItem label="Год выпуска" value={attrs.specs?.year || attrs.specs?.yearBuilt} />
                                            <SpecItem label="Двигатель" value={attrs.specs?.engine} />
                                            <SpecItem label="Коробка" value={attrs.specs?.transmission} />
                                            <SpecItem label="Привод" value={attrs.specs?.drive || "Передний"} />
                                            <SpecItem label="Кузов" value={attrs.specs?.bodyType} />
                                        </>
                                    ) : (
                                        Object.entries(attrs.specs || {}).map(([key, val]) => (
                                            <SpecItem key={key} label={key} value={val} />
                                        ))
                                    )}
                                </div>

                                {attrs.specs?.features && (
                                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Особенности</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {attrs.specs.features.map((f, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium">
                                                    {f}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* DESCRIPTION */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Описание</h2>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-lg leading-relaxed">
                                <p>{marketplace.description}</p>
                            </div>
                        </div>

                        {/* 3D TOUR & DOCUMENTS */}
                        {(attrs.virtualTour || (attrs.documents && attrs.documents.length > 0)) && (
                            <div className="grid md:grid-cols-2 gap-6">
                                {attrs.virtualTour && (
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Box className="text-primary h-6 w-6" />
                                            <h3 className="font-bold text-lg">3D Тур</h3>
                                        </div>
                                        <div className="flex-1 aspect-video rounded-2xl overflow-hidden bg-slate-100 relative group cursor-pointer">
                                            <iframe
                                                title="3D View"
                                                src={`${attrs.virtualTour}?autostart=0`}
                                                className="w-full h-full"
                                                frameBorder="0"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    </div>
                                )}
                                {attrs.documents && attrs.documents.length > 0 && (
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full">
                                        <div className="flex items-center gap-2 mb-4">
                                            <FileText className="text-primary h-6 w-6" />
                                            <h3 className="font-bold text-lg">Документы</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {attrs.documents.map((doc, idx) => (
                                                <a
                                                    key={idx}
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-100 dark:border-slate-700 group"
                                                >
                                                    <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 font-bold text-xs uppercase">
                                                        {doc.url.split('.').pop() || 'File'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-slate-900 dark:text-white truncate">{doc.title || "Документ"}</div>
                                                        <div className="text-xs text-slate-500">Нажмите чтобы открыть</div>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* MAP */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <MapPin className="text-primary h-5 w-5" /> Расположение
                            </h2>
                            <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative z-0">
                                <MapContainer
                                    center={[marketplace.lat || 41.2995, marketplace.lng || 69.2401]}
                                    zoom={14}
                                    scrollWheelZoom={false}
                                    className="h-full w-full"
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    {(marketplace.lat && marketplace.lng) && (
                                        <Marker position={[marketplace.lat, marketplace.lng]}>
                                            <Popup>
                                                <div className="font-bold">{marketplace.name}</div>
                                                <div className="text-xs">{marketplace.region}</div>
                                            </Popup>
                                        </Marker>
                                    )}
                                </MapContainer>
                                <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-sm border border-slate-200 text-xs">
                                    <p className="font-bold">{marketplace.region}</p>
                                    <p>{attrs.district ? `${attrs.district} район` : ''} {attrs.street && `, ${attrs.street}`}</p>
                                </div>
                            </div>
                        </div>

                        {/* MORTGAGE CALCULATOR */}
                        {isRealEstate && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Calculator className="text-primary h-5 w-5" /> Ипотечный калькулятор
                                </h2>

                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                                <span>Первоначальный взнос ({downPayment}%)</span>
                                                <span className="font-bold">{(price * downPayment / 100).toLocaleString()} UZS</span>
                                            </div>
                                            <input
                                                type="range" min="10" max="90" step="5"
                                                value={downPayment}
                                                onChange={(e) => setDownPayment(parseInt(e.target.value))}
                                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                                <span>Срок кредита</span>
                                                <span className="font-bold">{term} лет</span>
                                            </div>
                                            <input
                                                type="range" min="1" max="30" step="1"
                                                value={term}
                                                onChange={(e) => setTerm(parseInt(e.target.value))}
                                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 text-center border border-primary/10">
                                        <div className="text-primary font-medium text-sm uppercase tracking-wider mb-2">Ежемесячный платеж</div>
                                        <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                                            {monthlyPayment.toLocaleString()}
                                            <span className="text-xl font-normal text-slate-500 ml-1">UZS</span>
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            Примерная ставка {bankRate}% годовых
                                        </div>
                                        <button
                                            onClick={() => submitLoanApplication('MORTGAGE')}
                                            className="mt-4 w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl transition-colors text-sm"
                                        >
                                            Подать заявку
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* AUTO CREDIT CALCULATOR */}
                        {isAuto && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Calculator className="text-primary h-5 w-5" /> Автокредит / Лизинг
                                </h2>
                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                                <span>Первоначальный взнос ({downPayment}%)</span>
                                                <span className="font-bold">{(price * downPayment / 100).toLocaleString()} UZS</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="50"
                                                step="5"
                                                value={downPayment}
                                                onChange={(e) => setDownPayment(parseInt(e.target.value))}
                                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                                <span>Срок</span>
                                                <span className="font-bold">{term} лет</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="7"
                                                step="1"
                                                value={term}
                                                onChange={(e) => setTerm(parseInt(e.target.value))}
                                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-sky-50 dark:bg-sky-900/20 rounded-2xl p-6 text-center border border-sky-100 dark:border-sky-800">
                                        <div className="text-sky-600 dark:text-sky-300 font-medium text-sm uppercase tracking-wider mb-2">
                                            Примерный платёж по автокредиту
                                        </div>
                                        <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                                            {monthlyPayment.toLocaleString()}
                                            <span className="text-xl font-normal text-slate-500 ml-1">UZS</span>
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            Фактические условия зависят от банка‑партнёра и вашей кредитной истории.
                                        </div>
                                        <button
                                            onClick={() => submitLoanApplication('AUTO_LOAN')}
                                            className="mt-4 w-full py-2 bg-sky-100 dark:bg-sky-900/40 hover:bg-sky-200 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-bold rounded-xl transition-colors text-sm"
                                        >
                                            Оформить автокредит
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VEHICLE HISTORY */}
                        <VehicleHistoryReport marketplace={marketplace} />

                        {/* REVIEWS */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                            <ReviewSection
                                marketplaceId={id}
                                isAuthenticated={isAuthenticated}
                                currentUser={user}
                            />
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Sticky Sidebar */}
                    <div className="lg:col-span-4 relative">
                        <div className="sticky top-24 space-y-6">

                            {/* MAIN ACTIONS CARD */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-lg border border-slate-100 dark:border-slate-800">
                                <div className="hidden lg:block mb-6">
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
                                        {marketplace.name}
                                    </h1>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                                        <MapPin className="h-4 w-4" /> {marketplace.region}
                                        <span className="text-slate-300">•</span>
                                        <span>{marketplace.createdAt ? new Date(marketplace.createdAt).toLocaleDateString() : 'Недавно'}</span>
                                    </div>
                                    <div className="text-3xl font-black text-primary">
                                        {price.toLocaleString()} <span className="text-xl text-slate-400 font-medium">UZS</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            if (marketplace.owner?.phone) {
                                                window.location.href = `tel:${marketplace.owner.phone}`;
                                            } else {
                                                toast.error("Телефон не указан");
                                            }
                                        }}
                                        className="w-full h-12 flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                                    >
                                        <Phone className="h-5 w-5 mr-2" />
                                        {marketplace.owner?.phone || "Показать номер"}
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (!isAuthenticated) return toast.error("Войдите, чтобы написать продавцу");
                                            try {
                                                await api.initiateChat(marketplace.owner.id);
                                                window.location.href = '/profile/chat';
                                            } catch (e) {
                                                toast.error("Ошибка при создании чата");
                                            }
                                        }}
                                        className="w-full h-12 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-lg transition-all active:scale-95"
                                    >
                                        Написать сообщение
                                    </button>

                                    {(isRealEstate || isAuto) && (
                                        <button
                                            onClick={() => setOfferModalOpen(true)}
                                            className="w-full h-12 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 font-bold transition-all"
                                        >
                                            <HandCoins className="h-5 w-5 mr-2" /> Предложить свою цену
                                        </button>
                                    )}

                                    {!isRealEstate && !isAuto && (
                                        <button
                                            onClick={() => addToCart(marketplace)}
                                            disabled={!marketplace.isAvailable || marketplace.stock === 0}
                                            className="w-full h-12 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all"
                                        >
                                            В корзину
                                        </button>
                                    )}
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <button onClick={() => toggleFavorite(marketplace)} className={cn("flex items-center gap-2 text-sm font-medium transition-colors", isFav ? "text-red-500" : "text-slate-500 hover:text-red-500")}>
                                        <Heart className={cn("h-5 w-5", isFav && "fill-current")} />
                                        {isFav ? "В избранном" : "В избранное"}
                                    </button>
                                    <button className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                        <Flag className="h-4 w-4" /> Пожаловаться
                                    </button>
                                </div>
                            </div>

                            {/* SELLER CARD */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Продавец</h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                                        {marketplace.owner?.name?.[0] || "M"}
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg text-slate-900 dark:text-white">{marketplace.owner?.name || "Магазин"}</div>
                                        <div className="text-sm text-slate-500">На сайте с 2024 г.</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                                        <div className="font-bold text-slate-900 dark:text-white">4.9 ⭐</div>
                                        <div className="text-slate-500 text-xs">Рейтинг</div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                                        <div className="font-bold text-slate-900 dark:text-white">100+</div>
                                        <div className="text-slate-500 text-xs">Продаж</div>
                                    </div>
                                </div>
                                <Link to={`/store/${marketplace.owner?.id}`} className="mt-4 block text-center text-primary font-bold text-sm hover:underline">
                                    Все объявления продавца
                                </Link>
                            </div>

                        </div>
                    </div>

                </div>
            </main>

            {/* MODALS */}
            {offerModalOpen && (
                <MakeOfferModal
                    marketplace={marketplace}
                    onClose={() => setOfferModalOpen(false)}
                />
            )}
        </div>
    );
}

function SpecItem({ label, value }) {
    if (!value) return null;
    return (
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">{label}</div>
            <div className="text-slate-900 dark:text-white font-bold text-lg leading-tight">{value}</div>
        </div>
    );
}
