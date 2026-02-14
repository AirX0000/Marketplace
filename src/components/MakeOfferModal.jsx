import React, { useState } from 'react';
import { X, Check, HandCoins } from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

export function MakeOfferModal({ marketplace, onClose }) {
    const [amount, setAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Default suggestion: 10% less than price
    const suggestedPrice = marketplace.price * 0.9;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.createOffer({
                marketplaceId: marketplace.id,
                amount: Number(amount)
            });
            toast.success("Предложение отправлено!");
            onClose();
        } catch (error) {
            toast.error("Ошибка при отправке предложения");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center mb-6">
                    <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3 text-emerald-600">
                        <HandCoins size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Предложить свою цену</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-[80%]">
                        Предложите {marketplace.owner?.name || 'продавцу'} сумму, за которую готовы купить этот товар.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Текущая цена</label>
                        <div className="text-lg font-bold text-slate-800 border-b border-dashed pb-2">
                            {marketplace.price?.toLocaleString()} UZS
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ваше предложение (UZS)</label>
                        <input
                            type="number"
                            required
                            autoFocus
                            placeholder={`Например: ${suggestedPrice}`}
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full text-center text-2xl font-bold py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!amount || submitting}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {submitting ? 'Отправка...' : (
                            <>
                                <Check size={18} /> Отправить предложение
                            </>
                        )}
                    </button>

                    <p className="text-xs text-center text-slate-400">
                        Продавец получит уведомление и сможет принять или отклонить ваше предложение.
                    </p>
                </form>
            </div>
        </div>
    );
}
