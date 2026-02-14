import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

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

    if (loading) return <div className="p-8 text-center">Загрузка заказов...</div>;

    return (
        <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold">Управление Заказами</h2>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                    <p className="text-slate-500">У вас пока нет заказов на продажу.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white border rounded-xl p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4 border-b pb-4">
                                <div>
                                    <h3 className="font-bold text-lg">Заказ #{order.id.slice(0, 8)}</h3>
                                    <p className="text-sm text-slate-500">
                                        от {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="mt-2 text-sm">
                                        <span className="font-medium">Покупатель:</span> {order.user?.name} ({order.user?.email})
                                    </div>
                                    <div className="mt-1 text-sm">
                                        <span className="font-medium">Адрес:</span> {order.shippingAddress} ({(order.shippingMethod === 'COURIER' ? 'Курьер' : 'Самовывоз')})
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-xl text-primary">
                                        {(order.total / 100).toLocaleString()} UZS
                                    </div>
                                    <div className={`mt-2 inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase
                                        ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                            order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                                order.status === 'PAID' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-slate-100 text-slate-700'}`}>
                                        {order.status}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex gap-4 items-center bg-slate-50 p-3 rounded-lg">
                                        <div className="h-10 w-10 bg-white rounded border overflow-hidden">
                                            {item.marketplace?.image && <img src={item.marketplace.image} className="h-full w-full object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{item.marketplace?.name}</div>
                                            <div className="text-xs text-slate-500">{item.quantity} шт x {(item.price / 100).toLocaleString()}</div>
                                        </div>
                                        <div className="font-bold text-sm">
                                            {(item.total || (item.price * item.quantity)).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ACTIONS */}
                            <div className="flex justify-end gap-3">
                                {['PAID', 'PROCESSING'].includes(order.status) && (
                                    <>
                                        {order.status === 'PAID' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'PROCESSING')}
                                                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-bold hover:bg-yellow-200"
                                            >
                                                <Clock className="w-4 h-4 inline mr-2" />
                                                В обработку
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm shadow-blue-200"
                                        >
                                            <Truck className="w-4 h-4 inline mr-2" />
                                            Отправить заказ
                                        </button>
                                    </>
                                )}
                                {order.status === 'SHIPPED' && (
                                    <div className="flex items-center text-slate-500 text-sm gap-2">
                                        <Clock className="w-4 h-4" />
                                        Ожидает подтверждения покупателя
                                    </div>
                                )}
                                {order.status === 'COMPLETED' && (
                                    <div className="flex items-center text-green-600 text-sm gap-2 font-bold">
                                        <CheckCircle className="w-4 h-4" />
                                        Заказ выполнен
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
