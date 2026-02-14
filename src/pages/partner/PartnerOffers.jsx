import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Check, X, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function PartnerOffers() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOffers();
    }, []);

    const loadOffers = async () => {
        try {
            const data = await api.getPartnerOffers();
            setOffers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.updateOfferStatus(id, status);
            toast.success(`Предложение ${status === 'ACCEPTED' ? 'принято' : 'отклонено'}`);
            loadOffers(); // Refresh list
        } catch (error) {
            toast.error("Ошибка обновления статуса");
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Загрузка предложений...</div>;

    return (
        <div className="container max-w-5xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-6">Входящие предложения</h1>

            {offers.length === 0 ? (
                <div className="bg-slate-50 rounded-xl p-10 text-center border border-dashed border-slate-300">
                    <p className="text-slate-500">Пока нет предложений от покупателей.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {offers.map(offer => (
                        <div key={offer.id} className="bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">

                            {/* Product Info */}
                            <div className="flex items-center gap-4 flex-1">
                                <div className="h-16 w-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={offer.marketplace.image} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{offer.marketplace.name}</h3>
                                    <div className="text-sm text-slate-500">Цена: {offer.marketplace.price?.toLocaleString()} UZS</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                            {offer.user?.name?.[0] || 'U'}
                                        </div>
                                        <span className="text-sm text-slate-600">{offer.user?.name} ({offer.user?.phone})</span>
                                    </div>
                                </div>
                            </div>

                            {/* Offer Amount */}
                            <div className="text-center">
                                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Предлагает</div>
                                <div className="text-2xl font-black text-emerald-600">{offer.amount.toLocaleString()} UZS</div>
                                <div className="text-xs text-rose-500 font-medium">
                                    -{Math.round((1 - offer.amount / offer.marketplace.price) * 100)}% от цены
                                </div>
                            </div>

                            {/* Actions / Status */}
                            <div className="flex flex-col gap-2 min-w-[150px]">
                                {offer.status === 'PENDING' ? (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(offer.id, 'ACCEPTED')}
                                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Check size={16} /> Принять
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(offer.id, 'REJECTED')}
                                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <X size={16} /> Отклонить
                                        </button>
                                    </>
                                ) : (
                                    <div className={`px-4 py-2 rounded-lg font-bold text-sm text-center flex items-center justify-center gap-2 ${offer.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-700'
                                        }`}>
                                        {offer.status === 'ACCEPTED' ? <Check size={16} /> : <X size={16} />}
                                        {offer.status === 'ACCEPTED' ? 'Принято' : 'Отклонено'}
                                    </div>
                                )}
                                <div className="text-xs text-center text-slate-400">
                                    {new Date(offer.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
