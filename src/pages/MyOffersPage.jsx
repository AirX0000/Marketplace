import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Tag, Clock, CheckCircle, XCircle, ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export function MyOffersPage() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOffers();
    }, []);

    const loadOffers = async () => {
        try {
            const data = await api.getMyOffers();
            setOffers(data);
        } catch (error) {
            console.error("Failed to load offers", error);
            toast.error("Не удалось загрузить предложения");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="container py-8 px-4 md:px-6 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold mb-2 text-slate-900">Мои предложения</h1>
            <p className="text-slate-500 mb-8">История ваших ценовых предложений продавцам.</p>

            {offers.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <Tag className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">Предложений нет</h3>
                    <p className="text-slate-500 mb-6">Вы еще не делали предложений продавцам.</p>
                    <Link to="/marketplaces" className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
                        Найти товары
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {offers.map((offer) => (
                        <div key={offer.id} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                <Link to={`/marketplaces/${offer.marketplace.id}`} className="flex gap-4 items-center group">
                                    <div className="h-16 w-16 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                                        {offer.marketplace.image && <img src={offer.marketplace.image} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors mb-1">
                                            {offer.marketplace.name}
                                        </div>
                                        <div className="text-sm text-slate-500">
                                            Цена продавца: {offer.marketplace.price.toLocaleString()} сум
                                        </div>
                                    </div>
                                </Link>

                                <div className="flex-1 w-full md:w-auto md:px-8">
                                    <div className="flex items-center justify-between md:justify-center gap-8">
                                        <div className="text-center">
                                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Ваше предложение</div>
                                            <div className="text-xl font-bold text-slate-900">{offer.amount.toLocaleString()} сум</div>
                                        </div>
                                        {offer.counterAmount && (
                                            <div className="text-center">
                                                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Встречное</div>
                                                <div className="text-xl font-bold text-primary">{offer.counterAmount.toLocaleString()} сум</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3">
                                    <div className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 ${offer.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                            offer.status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                offer.status === 'COUNTERED' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                                    'bg-amber-50 text-amber-700 border border-amber-100'
                                        }`}>
                                        {offer.status === 'ACCEPTED' ? <><CheckCircle size={16} /> Принято</> :
                                            offer.status === 'REJECTED' ? <><XCircle size={16} /> Отклонено</> :
                                                offer.status === 'COUNTERED' ? <><MessageCircle size={16} /> Торг</> :
                                                    <><Clock size={16} /> Ожидание</>}
                                    </div>

                                    {offer.status === 'ACCEPTED' && (
                                        <button className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors" title="Перейти к оформлению">
                                            <ArrowRight size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
