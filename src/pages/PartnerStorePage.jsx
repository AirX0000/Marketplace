import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { SellerHeader } from '../components/SellerHeader';
import { SellerTabs } from '../components/SellerTabs';
import { MarketplaceCard } from '../components/MarketplaceCard';

export function PartnerStorePage() {
    const { id } = useParams();
    const [partner, setPartner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products');

    useEffect(() => {
        async function load() {
            try {
                const data = await api.getPartnerStore(id);
                setPartner(data);
            } catch (error) {
                console.error("Failed to load partner", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-[#13111C] flex items-center justify-center">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-600/20 border-t-purple-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                </div>
            </div>
        </div>
    );

    if (!partner) return (
        <div className="min-h-screen bg-[#13111C] flex items-center justify-center p-4 text-center">
            <div className="bg-[#191624] p-12 rounded-[3rem] border border-white/5 shadow-2xl max-w-md w-full">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <X size={40} className="text-slate-700" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Магазин не найден</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Запрашиваемый ресурс временно недоступен или не существует.</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#13111C] text-white">
            {/* Decorative BG Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px]" />
            </div>

            <div className="relative z-10">
                {/* Header with Banner & Stats */}
                <SellerHeader partner={partner} />

                {/* Navigation Tabs */}
                <SellerTabs activeTab={activeTab} onTabChange={setActiveTab} />

                <div className="container mx-auto px-4 py-12">
                    <AnimatePresence mode="wait">
                        {activeTab === 'products' && (
                            <motion.div
                                key="products"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-10"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">Все товары</h2>
                                        <div className="h-1 w-12 bg-purple-600 rounded-full" />
                                    </div>
                                    <div className="px-6 py-2 bg-[#191624] rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Найдено <span className="text-white ml-1">{partner.marketplaces?.length || 0}</span>
                                    </div>
                                </div>

                                {partner.marketplaces && partner.marketplaces.length > 0 ? (
                                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {partner.marketplaces.map((item, idx) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                            >
                                                <MarketplaceCard marketplace={{ ...item, owner: partner }} />
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-32 bg-[#191624] rounded-[3rem] border border-white/5 border-dashed">
                                        <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                                            <div className="text-4xl">📦</div>
                                        </div>
                                        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-500">В этом магазине пока нет товаров.</h3>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'about' && (
                            <motion.div
                                key="about"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-4xl mx-auto"
                            >
                                <div className="bg-[#191624] rounded-[3rem] p-10 sm:p-14 shadow-2xl border border-white/5 relative overflow-hidden group">
                                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/5 blur-[80px] group-hover:bg-purple-600/10 transition-colors" />

                                    <h2 className="text-4xl font-black mb-10 text-white uppercase tracking-tighter italic">О магазине</h2>

                                    <div className="space-y-12 relative z-10">
                                        <p className="text-xl text-slate-400 font-bold leading-relaxed tracking-tight">
                                            {partner.storeDescription || "Владелец магазина не добавил описание."}
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-white/5">
                                            <div className="space-y-6">
                                                <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-purple-400">График работы</h3>
                                                <ul className="space-y-4">
                                                    {[
                                                        { days: "Пн — Пт", hours: "09:00 - 20:00" },
                                                        { days: "Суббота", hours: "10:00 - 18:00" },
                                                        { days: "Воскресенье", hours: "Закрыто", accent: true }
                                                    ].map((row, i) => (
                                                        <li key={i} className="flex justify-between items-center group">
                                                            <span className="text-sm font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">{row.days}</span>
                                                            <span className={cn(
                                                                "px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                                                row.accent ? "bg-red-500/10 text-red-400" : "bg-white/5 text-slate-300"
                                                            )}>{row.hours}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="space-y-6">
                                                <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-blue-400">Контакты</h3>
                                                <ul className="space-y-4 text-xs font-bold text-slate-400">
                                                    <li className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                                                        <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">📍</div>
                                                        <span className="uppercase tracking-widest">Ташкент, ул. Амира Темура, 1</span>
                                                    </li>
                                                    <li className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                                                        <div className="h-8 w-8 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">📞</div>
                                                        <span className="tracking-widest">+998 90 123 45 67</span>
                                                    </li>
                                                    <li className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                                                        <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">✉️</div>
                                                        <span className="tracking-widest italic">info@autohouse.uz</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'reviews' && (
                            <motion.div
                                key="reviews"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="max-w-3xl mx-auto"
                            >
                                <div className="text-center py-32 bg-[#191624] rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/5 blur-[100px]" />
                                    <div className="text-7xl mb-8 grayscale opacity-50 relative z-10">⭐</div>
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-4 relative z-10 italic">Отзывы покупателей</h3>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs relative z-10">Функционал системы репутации появится в ближайших обновлениях.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
