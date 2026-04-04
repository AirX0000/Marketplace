import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useShop } from '../../context/ShopContext';
import { Package, Search, Truck, CreditCard, CheckCircle, Loader2, Phone, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [confirming, setConfirming] = useState(null); // orderId being confirmed

    useEffect(() => {
        async function load() {
            try {
                const data = await api.getPartnerOrders();
                setOrders(data);
            } catch (error) {
                console.error("Failed to load orders", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filteredOrders = orders.filter(item =>
        item.marketplace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.order.contactName || item.order.user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.order.id.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Управление Заказами</h1>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-700" />
                        <input
                            type="text"
                            placeholder="Поиск заказов..."
                            className="pl-9 h-10 w-[250px] rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-900 ring-offset-background placeholder:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Загрузка заказов...</div>
                ) : (
                    <div className="overflow-x-auto hidden md:block">
                        <table className="w-full text-sm text-left border-collapse min-w-[1000px]">
                            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">ID</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Клиент</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Товар</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Оплата</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Доставка</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Сумма</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Статус</th>
                                    <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Действие</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredOrders.length > 0 ? filteredOrders.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 font-mono text-[10px] text-slate-400">#{item.order.id.slice(0, 8)}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 dark:text-white">{item.order.contactName || item.order.user.name || 'Гость'}</span>
                                                <span className="text-[11px] text-slate-500">{item.order.contactPhone || item.order.user.phone}</span>
                                                {(item.order.contactPhone || item.order.user?.phone) && (
                                                    <div className="flex gap-1 mt-1">
                                                        <a href={`tel:${item.order.contactPhone || item.order.user?.phone}`} onClick={e => e.stopPropagation()} className="flex items-center justify-center gap-1 text-[10px] font-bold text-primary hover:text-white hover:bg-primary transition-colors bg-primary/5 w-fit px-2 py-0.5 rounded-full border border-primary/20">
                                                            <Phone size={10} />
                                                        </a>
                                                        <a href={`https://t.me/${(item.order.contactPhone || item.order.user?.phone).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center justify-center gap-1 text-[10px] font-bold text-sky-500 hover:text-white hover:bg-sky-500 transition-colors bg-sky-500/10 w-fit px-2 py-0.5 rounded-full border border-sky-500/20">
                                                            <MessageCircle size={10} />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-800 dark:text-slate-200">{item.marketplace.name}</span>
                                                <span className="text-[11px] text-slate-500">x{item.quantity || 1}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                    <CreditCard className="h-3.5 w-3.5" />
                                                    {item.order.paymentMethod === 'INSTALLMENT' ? 'Рассрочка' : 'Карта'}
                                                </div>
                                                {item.order.paymentMethod === 'INSTALLMENT' && (
                                                    <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800 w-fit">
                                                        {item.order.installmentPlan?.replace('_MONTHS', ' мес')}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs text-slate-600 dark:text-slate-400">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    <Truck className="h-3.5 w-3.5" />
                                                    {item.order.shippingMethod === 'COURIER' ? 'Курьер' : 'Самовывоз'}
                                                </div>
                                                <span className="truncate max-w-[150px] opacity-70" title={item.order.shippingAddress}>
                                                    {item.order.shippingCity || 'Ташкент'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-slate-900 dark:text-white">{(item.price * (item.quantity || 1)).toLocaleString()}</span>
                                            <span className="text-[10px] ml-1 text-slate-500 uppercase">UZS</span>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={item.status}
                                                onChange={async (e) => {
                                                    const newStatus = e.target.value;
                                                    try {
                                                        await api.updateOrderItemStatus(item.id, newStatus);
                                                        setOrders(orders.map(o => o.id === item.id ? { ...o, status: newStatus } : o));
                                                    } catch (err) {
                                                        toast.error('Не удалось обновить статус заказа');
                                                    }
                                                }}
                                                className="text-[11px] font-bold border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none"
                                            >
                                                <option value="CREATED">Создан</option>
                                                <option value="PROCESSING">В обработке</option>
                                                <option value="SHIPPED">Отправлен</option>
                                                <option value="DELIVERED">Доставлен</option>
                                                <option value="CANCELLED">Отменен</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            {item.order.status === 'PAID' || item.order.status === 'SHIPPED' ? (
                                                <button
                                                    disabled={confirming === item.order.id}
                                                    onClick={async () => {
                                                        if (!window.confirm('Подтвердить сделку? Деньги будут переведены на ваш баланс.')) return;
                                                        setConfirming(item.order.id);
                                                        try {
                                                            await api.sellerConfirmOrder(item.order.id);
                                                            setOrders(orders.map(o =>
                                                                o.order?.id === item.order.id
                                                                    ? { ...o, order: { ...o.order, status: 'COMPLETED' } }
                                                                    : o
                                                            ));
                                                            toast.success('✅ Сделка подтверждена! Средства переведены на ваш баланс.');
                                                        } catch (err) {
                                                            toast.error('Ошибка: ' + err.message);
                                                        } finally {
                                                            setConfirming(null);
                                                        }
                                                    }}
                                                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-2 rounded-lg transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
                                                >
                                                    {confirming === item.order.id ? (
                                                        <><Loader2 className="h-3 w-3 animate-spin" /> ...</>
                                                    ) : (
                                                        <><CheckCircle className="h-3 w-3" /> Оплатить</>
                                                    )}
                                                </button>
                                            ) : item.order.status === 'COMPLETED' ? (
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded w-fit">
                                                    <CheckCircle className="h-3 w-3" /> Выполнено
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-slate-400 font-medium">Ожидание</span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} className="p-12 text-center text-slate-400 font-medium">
                                            Заказов пока нет.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Mobile Cards List */}
            {!loading && (
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {filteredOrders.length > 0 ? filteredOrders.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter block mb-1">Заказ #{item.order.id.slice(0, 8)}</span>
                                    <h4 className="font-black text-slate-900 dark:text-white uppercase text-base leading-tight">{item.marketplace.name}</h4>
                                </div>
                                <select
                                    value={item.status}
                                    onChange={async (e) => {
                                        const newStatus = e.target.value;
                                        try {
                                            await api.updateOrderItemStatus(item.id, newStatus);
                                            setOrders(orders.map(o => o.id === item.id ? { ...o, status: newStatus } : o));
                                        } catch (err) {
                                            toast.error('Не удалось обновить статус заказа');
                                        }
                                    }}
                                    className="text-[10px] font-black border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white uppercase tracking-widest"
                                >
                                    <option value="CREATED">Создан</option>
                                    <option value="PROCESSING">В обработке</option>
                                    <option value="SHIPPED">Отправлен</option>
                                    <option value="DELIVERED">Доставлен</option>
                                    <option value="CANCELLED">Отменен</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Клиент</p>
                                    <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase truncate">{item.order.contactName || item.order.user.name || 'Гость'}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5 mb-1">{item.order.contactPhone || item.order.user.phone}</p>
                                    {(item.order.contactPhone || item.order.user?.phone) && (
                                        <div className="flex gap-1">
                                            <a href={`tel:${item.order.contactPhone || item.order.user?.phone}`} onClick={e => e.stopPropagation()} className="flex items-center justify-center gap-1 text-[10px] font-bold text-primary hover:text-white hover:bg-primary transition-colors bg-primary/5 w-fit px-2 py-0.5 rounded-full border border-primary/20">
                                                <Phone size={10} />
                                            </a>
                                            <a href={`https://t.me/${(item.order.contactPhone || item.order.user?.phone).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center justify-center gap-1 text-[10px] font-bold text-sky-500 hover:text-white hover:bg-sky-500 transition-colors bg-sky-500/10 w-fit px-2 py-0.5 rounded-full border border-sky-500/20">
                                                <MessageCircle size={10} />
                                            </a>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Сумма</p>
                                    <p className="text-[11px] font-black text-blue-600">{(item.price * (item.quantity || 1)).toLocaleString()} <span className="text-[8px]">UZS</span></p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 mb-6">
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                        <Truck size={14} />
                                    </div>
                                    <span>{item.order.shippingMethod === 'COURIER' ? 'Курьер' : 'Самовывоз'} • {item.order.shippingCity || 'Ташкент'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                        <CreditCard size={14} />
                                    </div>
                                    <span>{item.order.paymentMethod === 'INSTALLMENT' ? 'Рассрочка' : 'Карта'}</span>
                                </div>
                            </div>

                            {item.order.status === 'PAID' || item.order.status === 'SHIPPED' ? (
                                <button
                                    disabled={confirming === item.order.id}
                                    onClick={async () => {
                                        if (!confirm('Подтвердить сделку? Деньги будут переведены на ваш баланс.')) return;
                                        setConfirming(item.order.id);
                                        try {
                                            await api.sellerConfirmOrder(item.order.id);
                                            setOrders(orders.map(o =>
                                                o.order?.id === item.order.id
                                                    ? { ...o, order: { ...o.order, status: 'COMPLETED' } }
                                                    : o
                                            ));
                                            toast.success('✅ Сделка подтверждена!');
                                        } catch (err) {
                                            toast.error('Ошибка: ' + err.message);
                                        } finally {
                                            setConfirming(null);
                                        }
                                    }}
                                    className="w-full h-12 flex items-center justify-center gap-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {confirming === item.order.id ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle size={16} /> Подтвердить оплату</>}
                                </button>
                            ) : item.order.status === 'COMPLETED' ? (
                                <div className="w-full h-12 flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest rounded-2xl">
                                    <CheckCircle size={16} /> Выполнено
                                </div>
                            ) : (
                                <div className="w-full h-12 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                    Ожидание...
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-sm font-medium text-slate-500">Заказов пока нет</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
