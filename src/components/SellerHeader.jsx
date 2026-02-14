import React from 'react';
import { ArrowLeft, MapPin, Calendar, Star, CheckCircle, MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SellerHeader({ partner }) {
    const brandColor = partner.storeColor || "#10b981";
    const coverImage = partner.storeBanner
        ? `url(${partner.storeBanner})`
        : 'linear-gradient(to right, #1e293b, #0f172a)'; // Fallback dark gradient

    return (
        <div className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-100 dark:border-slate-800">
            {/* Cover Banner */}
            <div
                className="h-48 md:h-64 w-full relative bg-cover bg-center"
                style={{
                    backgroundImage: typeof coverImage === 'string' && coverImage.startsWith('url') ? coverImage : undefined,
                    background: typeof coverImage === 'string' && !coverImage.startsWith('url') ? coverImage : undefined,
                    backgroundColor: brandColor
                }}
            >
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>

                <div className="absolute top-6 left-6 z-10">
                    <Link to="/marketplaces" className="inline-flex items-center text-white/90 hover:text-white transition-colors bg-black/20 hover:bg-black/40 p-2.5 rounded-full backdrop-blur-md">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-6">
                <div className="relative -mt-16 mb-6 flex flex-col md:flex-row items-end md:items-end gap-6">
                    {/* Logo */}
                    <div className="h-32 w-32 rounded-2xl border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 shadow-xl overflow-hidden shrink-0 relative z-10">
                        {partner.storeLogo ? (
                            <img src={partner.storeLogo} alt={partner.storeName} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-4xl">
                                {partner.storeName?.[0] || 'S'}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left mb-2 md:mb-4 w-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                                    {partner.storeName || "Название Магазина"}
                                    {partner.isVerified && <CheckCircle className="h-6 w-6 text-blue-500 fill-current" />}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                                    {partner.region && (
                                        <div className="flex items-center">
                                            <MapPin className="h-4 w-4 mr-1 text-slate-400" />
                                            {partner.region}
                                        </div>
                                    )}
                                    <div className="flex items-center text-yellow-500">
                                        <Star className="h-4 w-4 mr-1 fill-current" />
                                        <span className="font-bold text-black dark:text-white mr-1">4.9</span>
                                        <span className="text-slate-400">(120 отзывов)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1 text-slate-400" />
                                        На Auramarket с 2024
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 shrink-0">
                                <button className="flex items-center px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Чат
                                </button>
                                <button className="flex items-center px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Контакты
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
