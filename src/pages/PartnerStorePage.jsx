import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { MarketplaceCard } from '../components/MarketplaceCard';
import { SellerHeader } from '../components/SellerHeader';
import { SellerTabs } from '../components/SellerTabs';

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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    if (!partner) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Магазин не найден</h2>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Header with Banner & Stats */}
            <SellerHeader partner={partner} />

            {/* Navigation Tabs */}
            <SellerTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="container mx-auto px-4 py-8">
                {activeTab === 'products' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Все товары</h2>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                Найдено {partner.marketplaces?.length || 0}
                            </div>
                        </div>

                        {partner.marketplaces && partner.marketplaces.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {partner.marketplaces.map((item) => (
                                    <MarketplaceCard key={item.id} marketplace={{ ...item, owner: partner }} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100/50 dark:bg-slate-900/50">
                                В этом магазине пока нет товаров.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'about' && (
                    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">О магазине</h2>
                            <div className="prose dark:prose-invert">
                                <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                                    {partner.storeDescription || "Владелец магазина не добавил описание."}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">График работы</h3>
                                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                            <li className="flex justify-between"><span>Понедельник - Пятница</span> <span>09:00 - 20:00</span></li>
                                            <li className="flex justify-between"><span>Суббота</span> <span>10:00 - 18:00</span></li>
                                            <li className="flex justify-between"><span>Воскресенье</span> <span>Выходной</span></li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Контакты</h3>
                                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                            <li>Ташкент, ул. Амира Темура, 1</li>
                                            <li>+998 90 123 45 67</li>
                                            <li>info@auramarket.uz</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="text-6xl mb-4">⭐</div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Отзывы покупателей</h3>
                            <p className="text-slate-500 dark:text-slate-400">Функционал отзывов о магазине находится в разработке.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
