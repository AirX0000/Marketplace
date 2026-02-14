import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Wallet, Send, Plus, History, QrCode, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function AuraPayDashboard() {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTransfer, setShowTransfer] = useState(false);
    const [transferData, setTransferData] = useState({ recipientIdentifier: '', amount: '' });
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadWallet();
    }, []);

    async function loadWallet() {
        try {
            const data = await api.getWallet();
            setWallet(data);
        } catch (error) {
            console.error("Wallet load failed", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDeposit() {
        // Simulation
        try {
            await api.walletDeposit(1000000); // 1M UZS
            toast.success("Баланс пополнен на 1,000,000 UZS");
            loadWallet();
        } catch (error) {
            toast.error("Ошибка пополнения");
        }
    }

    async function handleTransfer(e) {
        e.preventDefault();
        setProcessing(true);
        try {
            await api.walletTransfer({
                recipientIdentifier: transferData.recipientIdentifier,
                amount: parseFloat(transferData.amount)
            });
            toast.success("Перевод успешно отправлен!");
            setShowTransfer(false);
            setTransferData({ recipientIdentifier: '', amount: '' });
            loadWallet();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setProcessing(false);
        }
    }

    if (loading) return <div className="p-20 text-center font-medium text-slate-500">Загрузка Aura Pay...</div>;

    if (!wallet) {
        return (
            <div className="p-20 text-center">
                <div className="text-red-500 text-xl font-bold mb-4">Ошибка подключения 🔌</div>
                <p className="text-slate-600 mb-4">Не удалось загрузить данные кошелька.</p>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 inline-block text-left">
                    <p className="font-bold text-amber-800 mb-2">Возможные причины:</p>
                    <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                        <li>Сервер не был перезапущен после обновления.</li>
                        <li>Вы не авторизованы.</li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Wallet className="text-emerald-500 h-8 w-8" />
                Aura Pay
            </h1>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Left: Card & Actions */}
                <div className="space-y-6">
                    {/* Digital Card */}
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden h-64 flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <div className="opacity-80 text-sm font-medium tracking-wider">Ваш баланс</div>
                                <div className="text-4xl font-bold mt-2">
                                    {wallet.balance.toLocaleString()} <span className="text-2xl opacity-80">UZS</span>
                                </div>
                            </div>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-10 opacity-80" alt="Mastercard" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="opacity-60 text-xs uppercase tracking-widest mb-1">Account ID</div>
                                    <div className="font-mono text-xl tracking-wider">{wallet.accountId || '****'}</div>
                                </div>
                                <div className="text-right">
                                    <div className="opacity-60 text-xs">Статус</div>
                                    <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-xs font-bold">
                                        Active <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-4 gap-4">
                        <button onClick={() => setShowTransfer(!showTransfer)} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 border border-slate-100">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                <Send className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-700">Перевод</span>
                        </button>
                        <button onClick={handleDeposit} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 border border-slate-100">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <Plus className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-700">Пополнить</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 border border-slate-100">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                                <QrCode className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-700">QR Scan</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 border border-slate-100">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                <History className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-700">История</span>
                        </button>
                    </div>

                    {/* Transfer Form */}
                    {showTransfer && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-in slide-in-from-top-4">
                            <h3 className="font-bold text-lg mb-4">Перевод пользователю</h3>
                            <form onSubmit={handleTransfer} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Получатель (Телефон или Account ID)</label>
                                    <input
                                        type="text"
                                        required
                                        value={transferData.recipientIdentifier}
                                        onChange={e => setTransferData({ ...transferData, recipientIdentifier: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border rounded-xl"
                                        placeholder="+998901234567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Сумма (UZS)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1000"
                                        step="1000"
                                        value={transferData.amount}
                                        onChange={e => setTransferData({ ...transferData, amount: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border rounded-xl"
                                        placeholder="0.00"
                                    />
                                </div>
                                <button disabled={processing} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors">
                                    {processing ? 'Обработка...' : 'Отправить средства'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Right: History */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-[600px] overflow-y-auto">
                    <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <History className="text-slate-400" /> История операций
                    </h2>

                    <div className="space-y-4">
                        {wallet.transactions.length === 0 ? (
                            <div className="text-center text-slate-400 py-10">История пуста</div>
                        ) : (
                            wallet.transactions.map(tx => {
                                const isIncoming = tx.receiverId === wallet.accountId || (typeof tx.amount === 'number' && tx.receiverId !== null && true);
                                // Simplified Check: We need User ID to know for sure, but for now lets rely on amount sign or logic?
                                // Actually API returned User ID is needed here. But the backend sends transactions included sender/receiver objects.
                                // Let's check logic: if type is DEPOSIT -> Incoming.

                                const type = tx.type;
                                const isDeposit = type === 'DEPOSIT';
                                // Ideally needs current user ID to know direction of transfer.
                                // For MVP dashboard, we blindly show all.

                                return (
                                    <div key={tx.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDeposit ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-600'}`}>
                                                {isDeposit ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{isDeposit ? 'Пополнение' : 'Перевод'}</div>
                                                <div className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div className={`font-mono font-bold ${isDeposit ? 'text-green-600' : 'text-slate-900'}`}>
                                            {isDeposit ? '+' : ''}{tx.amount.toLocaleString()}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
