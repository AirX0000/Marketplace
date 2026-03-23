import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Scan, ArrowLeft, Wallet, Check, AlertCircle, Loader2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

export function QRPayPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('my-qr'); // 'my-qr' | 'scan'
    const [accountId, setAccountId] = useState('');
    const [balance, setBalance] = useState(0);

    // Scan state
    const [scannedId, setScannedId] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Fetch wallet to get accountId
        api.getWallet().then(data => {
            setAccountId(data.accountId);
            setBalance(data.balance);
        }).catch(() => toast.error("Ошибка загрузки кошелька"));
    }, []);

    const handleTransfer = async () => {
        if (!scannedId) return toast.error("Введите ID получателя");
        if (!amount || Number(amount) <= 0) return toast.error("Введите сумму");
        if (Number(amount) > balance) return toast.error("Недостаточно средств");

        setLoading(true);
        try {
            await api.walletTransfer({
                recipientIdentifier: scannedId,
                amount: Number(amount),
                description: description || 'QR P2P Transfer'
            });
            setSuccess(true);
            toast.success("Перевод успешно отправлен!");
            setTimeout(() => {
                navigate('/wallet');
            }, 2000);
        } catch (error) {
            toast.error(error.message || "Ошибка перевода");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#13111C] text-white flex flex-col items-center py-10 px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-purple-600/10 to-transparent pointer-events-none" />
            
            <div className="w-full max-w-md relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button 
                        onClick={() => navigate('/wallet')}
                        className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="font-bold text-lg tracking-wider">QR PAY</div>
                    <div className="w-10" /> {/* Balancer */}
                </div>

                {success ? (
                    <div className="flex-grow flex flex-col items-center justify-center animate-in slide-in-from-bottom-8">
                        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                                <Check className="w-8 h-8 text-white" strokeWidth={3} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black mb-2">Перевод Отправлен</h2>
                        <p className="text-slate-400 text-center mb-8">
                            Средства успешно переведены на аккаунт <br/>
                            <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">{scannedId}</span>
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Tabs */}
                        <div className="flex p-1 bg-[#1A1726] rounded-2xl mb-8 border border-white/5">
                            <button 
                                onClick={() => setActiveTab('my-qr')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'my-qr' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                <QrCode size={16} /> Мой QR
                            </button>
                            <button 
                                onClick={() => setActiveTab('scan')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'scan' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Scan size={16} /> Сканировать
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-grow flex flex-col">
                            {activeTab === 'my-qr' ? (
                                <div className="flex flex-col items-center justify-center flex-grow bg-[#191624] rounded-[2rem] border border-white/5 p-8 shadow-2xl relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent rounded-[2rem] pointer-events-none" />
                                    
                                    <div className="text-center mb-8">
                                        <div className="text-sm text-slate-400 font-medium mb-1">Ваш Autohouse ID:</div>
                                        <div className="text-2xl font-mono font-bold text-white tracking-widest bg-white/5 px-4 py-2 rounded-xl inline-block border border-white/5">
                                            {accountId || 'ЗAГРYЗКА...'}
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-3xl shadow-[0_0_50px_rgba(147,51,234,0.3)] mb-8 transition-transform hover:scale-105 duration-300">
                                        {accountId ? (
                                            <QRCode 
                                                value={accountId} 
                                                size={220}
                                                level="H"
                                                className="rounded-xl"
                                                fgColor="#13111C"
                                            />
                                        ) : (
                                            <div className="w-[220px] h-[220px] flex items-center justify-center bg-slate-100 rounded-xl">
                                                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-slate-400 text-sm text-center max-w-xs">
                                        Покажите этот код для получения перевода на ваш кошелёк Autohouse Pay
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col flex-grow bg-[#191624] rounded-[2rem] border border-white/5 p-6 shadow-2xl space-y-6">
                                    <div className="bg-purple-600/10 border border-purple-600/20 text-purple-200 p-4 rounded-2xl flex gap-3 text-sm">
                                        <AlertCircle className="shrink-0 w-5 h-5 text-purple-400 mt-0.5" />
                                        <p>Для ручного перевода введите ID аккаунта получателя ниже.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block pl-1">ID Получателя</label>
                                            <div className="relative">
                                                <Scan className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                                <input 
                                                    value={scannedId}
                                                    onChange={e => setScannedId(e.target.value)}
                                                    className="w-full h-14 bg-[#13111C] border border-white/10 rounded-2xl pl-12 pr-4 text-white font-mono tracking-wider focus:outline-none focus:border-purple-500 transition-colors"
                                                    placeholder="AH-XXXXXXXX"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block pl-1">Сумма (UZS)</label>
                                            <div className="relative">
                                                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                                <input 
                                                    type="number"
                                                    value={amount}
                                                    onChange={e => setAmount(e.target.value)}
                                                    className="w-full h-14 bg-[#13111C] border border-white/10 rounded-2xl pl-12 pr-4 text-white font-bold text-lg focus:outline-none focus:border-purple-500 transition-colors"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="mt-2 text-xs flex justify-between px-1">
                                                <span className="text-slate-500">Доступно:</span>
                                                <span className={balance < Number(amount) ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                                                    {balance.toLocaleString()} UZS
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block pl-1">Сообщение (необязательно)</label>
                                            <input 
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                                className="w-full h-14 bg-[#13111C] border border-white/10 rounded-2xl px-4 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                                                placeholder="Например: За ужин"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6">
                                        <button 
                                            onClick={handleTransfer}
                                            disabled={loading || !scannedId || !amount || Number(amount) <= 0 || balance < Number(amount)}
                                            className="w-full h-14 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-2xl font-black tracking-widest uppercase text-xs transition-colors shadow-[0_10px_20px_rgba(147,51,234,0.2)] disabled:shadow-none flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Перевести'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
