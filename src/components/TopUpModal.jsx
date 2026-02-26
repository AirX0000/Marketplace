import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Loader2, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'react-hot-toast';

const PRESETS = [10000, 50000, 100000, 250000, 500000, 1000000];

export function TopUpModal({ onClose, onSuccess }) {
    const [amount, setAmount] = useState('');
    const [provider, setProvider] = useState('click');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const num = parseInt(amount);
        if (!num || num < 1000) {
            toast.error('Минимальная сумма 1,000 UZS');
            return;
        }

        setLoading(true);
        try {
            const { redirectUrl } = await api.createPayment({ amount: num, provider });
            // Open payment page in new tab
            window.open(redirectUrl, '_blank', 'noopener,noreferrer');
            toast.success('Страница оплаты открыта. После оплаты обновите страницу.');
            onClose();
        } catch (err) {
            toast.error('Ошибка создания платежа');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Пополнить баланс</h3>
                        <p className="text-sm text-slate-500 mt-0.5">Выберите сумму и способ оплаты</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Amount input */}
                    <div>
                        <label className="text-sm font-bold text-slate-700 mb-2 block">Сумма (UZS)</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="1000"
                                step="1000"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="0"
                                className="w-full h-12 rounded-xl border border-slate-200 px-4 pr-16 text-lg font-bold text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                required
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">UZS</span>
                        </div>
                        {/* Preset amounts */}
                        <div className="grid grid-cols-3 gap-2 mt-3">
                            {PRESETS.map(preset => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setAmount(String(preset))}
                                    className={`py-2 px-3 rounded-lg text-sm font-semibold border transition-all ${amount === String(preset)
                                            ? 'bg-primary text-white border-primary'
                                            : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                                        }`}
                                >
                                    {preset.toLocaleString()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Provider selection */}
                    <div>
                        <label className="text-sm font-bold text-slate-700 mb-2 block">Способ оплаты</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setProvider('click')}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${provider === 'click'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <CreditCard className="h-5 w-5 text-white" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-slate-900 text-sm">Click</div>
                                    <div className="text-xs text-slate-500">click.uz</div>
                                </div>
                                {provider === 'click' && (
                                    <CheckCircle className="h-4 w-4 text-blue-500 ml-auto" />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setProvider('payme')}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${provider === 'payme'
                                        ? 'border-teal-500 bg-teal-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <div className="h-10 w-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Smartphone className="h-5 w-5 text-white" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-slate-900 text-sm">Payme</div>
                                    <div className="text-xs text-slate-500">payme.uz</div>
                                </div>
                                {provider === 'payme' && (
                                    <CheckCircle className="h-4 w-4 text-teal-500 ml-auto" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Info note */}
                    <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500">
                        После нажатия на «Оплатить» откроется страница {provider === 'click' ? 'Click' : 'Payme'} для завершения оплаты. Баланс пополнится автоматически после подтверждения.
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !amount}
                            className="flex-1 py-3 font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Создание...</>
                            ) : (
                                `Оплатить ${amount ? Number(amount).toLocaleString() : ''} UZS`
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
