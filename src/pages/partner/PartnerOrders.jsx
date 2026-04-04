import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { getImageUrl } from '../../lib/utils';

export function PartnerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await api.getPartnerOrders();
            setOrders(data);
        } catch (error) {
            console.error("Failed to load partner orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await api.updateOrderStatus(orderId, newStatus);
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            alert("Не удалось обновить статус: " + error.message);
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse font-black uppercase tracking-widest text-sm">Загрузка заказов...</div>;

    return (
        <div className="space-y-10 animate-in fade-in text-white">
            <h2 className="text-3xl font-black uppercase tracking-tight">Управление Заказами</h2>

            {orders.length === 0 ? (
                <div className="text-center py-24 bg-[#191624] rounded-[2.5rem] border border-white/5 border-dashed">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package size={32} className="text-slate-600" />
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">У вас пока нет заказов на продажу.</p>
                </div>
            ) : (
                <div className="grid gap-8">
                    {orders.map(order => (
                        <div key={order.id} className="bg-[#191624] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                            {/* Decorative glow */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/5 blur-[80px] group-hover:bg-purple-600/10 transition-all duration-700" />

                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 pb-8 border-b border-white/5 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <h3 className="font-black text-2xl tracking-tighter uppercase">Заказ #{order.id.slice(0, 8)}</h3>
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                                            ${order.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' :
                                                order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/10' :
                                                    order.status === 'PAID' ? 'bg-purple-500/10 text-purple-400 border-purple-500/10' :
                                                        'bg-slate-500/10 text-slate-400 border-white/10'}`}>
                                            {order.status}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-slate-700" />
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Package size={14} className="text-slate-700" />
                                            {order.user?.name}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Truck size={14} className="text-slate-700" />
                                            {order.shippingMethod === 'COURIER' ? 'Курьер' : 'Самовывоз'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-lg lg:text-3xl font-black text-white px-8 py-4 bg-white/5 rounded-3xl border border-white/5 tracking-tighter">
                                    {(order.total / 100).toLocaleString()} <span className="text-sm text-slate-500 ml-1">UZS</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-10">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex gap-6 items-center bg-[#13111C] p-5 rounded-2xl border border-white/5 hover:border-purple-500/20 transition-all group/item">
                                        <div className="h-16 w-16 bg-[#191624] rounded-2xl border border-white/10 overflow-hidden shadow-xl group-hover/item:scale-105 transition-transform duration-500">
                                            {item.marketplace?.image && <img src={getImageUrl(item.marketplace.image)} className="h-full w-full object-cover opacity-80 group-hover/item:opacity-100 transition-opacity" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-black text-lg truncate uppercase tracking-tight group-hover/item:text-purple-400 transition-colors">{item.marketplace?.name}</div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                                                {item.quantity} шт × <span className="text-slate-300">{(item.price / 100).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="font-black text-lg tracking-tighter text-white">
                                            {(item.total || (item.price * item.quantity) / 100).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Address Info */}
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 mb-8">
                                <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">Адрес доставки</div>
                                <div className="text-sm font-bold text-slate-300 tracking-tight">{order.shippingAddress}</div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex flex-wrap justify-end gap-4">
                                {['PAID', 'PROCESSING'].includes(order.status) && (
                                    <>
                                        {order.status === 'PAID' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'PROCESSING')}
                                                className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black hover:bg-white/10 transition-all uppercase tracking-widest flex items-center gap-3"
                                            >
                                                <Clock className="w-4 h-4 text-purple-400" />
                                                В обработку
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}
                                            className="px-10 py-4 bg-purple-600 text-white rounded-2xl text-[10px] font-black hover:bg-purple-500 transition-all uppercase tracking-widest shadow-[0_15px_30px_rgba(147,51,234,0.3)] active:scale-95 flex items-center gap-3"
                                        >
                                            <Truck className="w-4 h-4" />
                                            Отправить заказ
                                        </button>
                                    </>
                                )}
                                {order.status === 'SHIPPED' && (
                                    <div className="flex items-center text-blue-400 text-[10px] font-black uppercase tracking-widest gap-3 bg-blue-500/5 px-6 py-4 rounded-2xl border border-blue-500/10">
                                        <Clock className="w-4 h-4 animate-pulse" />
                                        Ожидает подтверждения покупателя
                                    </div>
                                )}
                                {order.status === 'COMPLETED' && (
                                    <div className="flex items-center text-emerald-400 text-[10px] font-black uppercase tracking-widest gap-3 bg-emerald-500/5 px-6 py-4 rounded-2xl border border-emerald-500/10">
                                        <div className="bg-emerald-500/20 p-1.5 rounded-full">
                                            <CheckCircle className="w-4 h-4" />
                                        </div>
                                        Заказ успешно выполнен
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
