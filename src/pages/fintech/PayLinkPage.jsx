import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Wallet, ArrowLeft, Loader2, Check } from 'lucide-react';
import { api } from '../../lib/api';
import { PinModal } from '../../components/fintech/PinModal';

export function PayLinkPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const toId = searchParams.get('to');
    const amountStr = searchParams.get('amount');
    const amount = Number(amountStr);
    
    const [walletInfo, setWalletInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    
    // Pin Modal
    const [pinModal, setPinModal] = useState(false);

    useEffect(() => {
        if (!toId || !amount || amount <= 0) {
            toast.error("Некорректная ссылка на оплату");
            navigate('/');
            return;
        }

        api.getWallet()
            .then(data => {
                setWalletInfo(data);
                setLoading(false);
            })
            .catch(() => {
                toast.error("Войдите в систему для оплаты");
                navigate('/login');
            });
    }, [toId, amount, navigate]);

    const handlePayClick = () => {
        if (!walletInfo) return;
        if (walletInfo.balance < amount) {
            toast.error("Недостаточно средств на кошельке");
            return;
        }
        setPinModal(true);
    };

    const handleConfirmPayment = async (pin) => {
        setPinModal(false);
        setActionLoading(true);
        try {
            await api.walletTransfer({
                recipientIdentifier: toId,
                amount: amount,
                description: 'Оплата по ссылке (PayLink)',
                pin: pin // In a real backend, PIN is verified, here we simulate
            });
            setSuccess(true);
            toast.success("Перевод успешно выполнен!");
            setTimeout(() => {
                navigate('/wallet');
            }, 2500);
        } catch (error) {
            toast.error(error.message || "Ошибка перевода");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F0D1A] flex items-center justify-center">
                <Loader2 size={40} className="text-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F0D1A] flex flex-col items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(147,51,234,0.15),_transparent_50%)] pointer-events-none" />
            
            <div className="w-full max-w-md relative z-10">
                <button onClick={() => navigate('/')} className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold">
                    <ArrowLeft size={16} /> На главную
                </button>

                {success ? (
                    <div className="bg-[#13111C] p-8 rounded-3xl border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)] text-center animate-in zoom-in-95">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                                <Check size={24} className="text-white" strokeWidth={3} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Оплата прошла успешно!</h2>
                        <p className="text-sm text-slate-400 mb-6">Средства переведены на аккаунт <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">{toId}</span></p>
                        <button onClick={() => navigate('/wallet')} className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl text-white text-sm font-bold transition-colors">
                            Вернуться в кошелек
                        </button>
                    </div>
                ) : (
                    <div className="bg-[#13111C] p-8 rounded-3xl border border-white/5 shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                                <Wallet size={32} className="text-purple-400" />
                            </div>
                            <h1 className="text-xl font-black text-white">К оплате</h1>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-2">Запрос на перевод средств</p>
                        </div>

                        <div className="bg-[#0F0D1A] rounded-2xl p-5 mb-8 border border-white/5 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Получатель</span>
                                <span className="text-sm font-mono font-bold text-white bg-white/5 px-3 py-1 rounded-lg">{toId}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Сумма</span>
                                <span className="text-xl font-black text-emerald-400">{amount.toLocaleString('ru-RU')} <span className="text-xs text-slate-500">UZS</span></span>
                            </div>
                        </div>

                        <div className="mb-6 flex items-center justify-between px-2">
                            <span className="text-xs text-slate-400 font-bold">Ваш баланс:</span>
                            <span className={`text-sm font-bold ${walletInfo.balance >= amount ? 'text-white' : 'text-rose-400'}`}>
                                {walletInfo?.balance?.toLocaleString('ru-RU')} UZS
                            </span>
                        </div>

                        <button 
                            onClick={handlePayClick}
                            disabled={actionLoading || walletInfo.balance < amount}
                            className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:opacity-50 rounded-2xl text-white font-black uppercase tracking-widest text-sm transition-all flex justify-center items-center shadow-[0_5px_20px_rgba(147,51,234,0.3)] disabled:shadow-none gap-2"
                        >
                            {actionLoading ? <Loader2 size={18} className="animate-spin" /> : "Оплатить"}
                        </button>
                    </div>
                )}
            </div>

            <PinModal 
                isOpen={pinModal} 
                onClose={() => setPinModal(false)}
                onSuccess={handleConfirmPayment}
                action={`Подтвердите оплату ${amount.toLocaleString('ru-RU')} UZS`}
            />
        </div>
    );
}
