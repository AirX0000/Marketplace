import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Users, ArrowUpRight, ArrowDownLeft, Search, CheckCircle, AlertOctagon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../lib/api';

export function AdminAutohousePay() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, escrow, transactions
    
    // Mocked data for AutohousePay ecosystem metrics
    const [metrics, setMetrics] = useState({
        totalLiquidity: 1450000000,
        activeWallets: 1240,
        transactionsToday: 245,
        escrowLocked: 320000000
    });

    const [escrowOrders, setEscrowOrders] = useState([
        { id: 'ORD-12345', date: '2026-03-23T10:00:00Z', buyerId: 'AH-88331', sellerId: 'AH-99212', amount: 150000000, status: 'ESCROW_HOLD', dispute: false },
        { id: 'ORD-11223', date: '2026-03-22T14:30:00Z', buyerId: 'AH-55211', sellerId: 'AH-77233', amount: 85000000, status: 'ESCROW_HOLD', dispute: true },
        { id: 'ORD-99881', date: '2026-03-21T09:15:00Z', buyerId: 'AH-11223', sellerId: 'AH-44332', amount: 45000000, status: 'ESCROW_HOLD', dispute: false }
    ]);

    const [transactions, setTransactions] = useState([
        { id: 'TX-998877', type: 'FUNDS_DEPOSIT', amount: 2000000, userId: 'AH-11223', date: '2026-03-23T16:45:00Z' },
        { id: 'TX-998876', type: 'ESCROW_LOCK', amount: -150000000, userId: 'AH-88331', date: '2026-03-23T10:05:00Z' },
        { id: 'TX-998875', type: 'WITHDRAWAL', amount: -500000, userId: 'AH-44332', date: '2026-03-23T09:30:00Z' },
        { id: 'TX-998874', type: 'P2P_TRANSFER', amount: 150000, userId: 'AH-55211', date: '2026-03-22T18:20:00Z' }
    ]);

    useEffect(() => {
        // Simulate loading data
        setTimeout(() => setLoading(false), 800);
    }, []);

    const handleResolveDispute = (orderId, resolution) => {
        if (!window.confirm(`Вы уверены, что хотите перевести средства в пользу ${resolution}?`)) return;
        
        setEscrowOrders(prev => prev.map(o => {
            if (o.id === orderId) {
                return { ...o, status: resolution === 'SELLER' ? 'COMPLETED' : 'REFUNDED', dispute: false };
            }
            return o;
        }));
        
        toast.success(`Спор по заказу ${orderId} решен в пользу ${resolution}`);
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Autohouse Pay Module</h1>
                <p className="text-slate-500 mt-1 font-medium">Мониторинг ликвидности, транзакций и "Безопасных сделок"</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                            <Activity size={20} />
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Ликвидность платформы</span>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900">{metrics.totalLiquidity.toLocaleString('ru-RU')}</div>
                        <div className="text-xs text-slate-500 font-bold mt-1">UZS на кошельках</div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Users size={20} />
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Активные кошельки</span>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900">{metrics.activeWallets.toLocaleString()}</div>
                        <div className="text-xs text-emerald-500 font-bold mt-1">+12 за неделю</div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <ShieldCheck size={20} />
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Средства в Escrow</span>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900">{metrics.escrowLocked.toLocaleString('ru-RU')}</div>
                        <div className="text-xs text-slate-500 font-bold mt-1">UZS заморожено</div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                            <ArrowUpRight size={20} />
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Транзакций сегодня</span>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900">{metrics.transactionsToday}</div>
                        <div className="text-xs text-slate-500 font-bold mt-1">Успешных операций</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit border border-slate-200">
                {['overview', 'escrow', 'transactions'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {tab === 'overview' ? 'Общее' : tab === 'escrow' ? 'Управление Escrow (Сделки)' : 'Менеджер транзакций'}
                    </button>
                ))}
            </div>

            {/* Escrow Management Content */}
            {activeTab === 'escrow' && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-bold text-slate-900">Безопасные Сделки (Escrow)</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Поиск по ID..." className="pl-9 pr-4 py-2 w-64 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-100 font-bold">
                                <tr>
                                    <th className="px-6 py-4">ID и Дата</th>
                                    <th className="px-6 py-4">Сумма (UZS)</th>
                                    <th className="px-6 py-4">Покупатель / Продавец</th>
                                    <th className="px-6 py-4">Статус</th>
                                    <th className="px-6 py-4 text-right">Действие</th>
                                </tr>
                            </thead>
                            <tbody>
                                {escrowOrders.map((order, i) => (
                                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{order.id}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{new Date(order.date).toLocaleString('ru-RU')}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-black text-emerald-600">{order.amount.toLocaleString()} UZS</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-mono text-slate-500">Покуп: {order.buyerId}</div>
                                            <div className="text-xs font-mono text-slate-500 mt-0.5">Прод: {order.sellerId}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.dispute ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-600">
                                                    <AlertOctagon size={14} /> Открыт Спор
                                                </span>
                                            ) : order.status === 'COMPLETED' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-600">
                                                    Завершена
                                                </span>
                                            ) : order.status === 'REFUNDED' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600">
                                                    Возврат
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-600">
                                                    Холдирование
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {order.dispute && (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleResolveDispute(order.id, 'BUYER')} className="text-[10px] px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors">
                                                        Возврат Покупателю
                                                    </button>
                                                    <button onClick={() => handleResolveDispute(order.id, 'SELLER')} className="text-[10px] px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold rounded-lg transition-colors">
                                                        Перевод Продавцу
                                                    </button>
                                                </div>
                                            )}
                                            {!order.dispute && order.status === 'ESCROW_HOLD' && (
                                                <span className="text-xs text-slate-400 font-medium italic">Ожидает подтверждения</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Transactions Content */}
            {(activeTab === 'transactions' || activeTab === 'overview') && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mt-6">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-bold text-slate-900">Недавние Транзакции платформы</h2>
                        <button className="text-emerald-600 hover:text-emerald-700 text-sm font-bold">Скачать CSV</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-100 font-bold">
                                <tr>
                                    <th className="px-6 py-4">Транзакция</th>
                                    <th className="px-6 py-4">Тип</th>
                                    <th className="px-6 py-4">Аккаунт</th>
                                    <th className="px-6 py-4 text-right">Сумма (UZS)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.map((tx, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{tx.id}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{new Date(tx.date).toLocaleString('ru-RU')}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs">{tx.userId}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-black ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} UZS
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
