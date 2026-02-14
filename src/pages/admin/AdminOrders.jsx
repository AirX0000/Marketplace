import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useShop } from '../../context/ShopContext';
import { OrderStatusBadge, OrderStatusSelector } from '../../components/OrderStatusBadge';
import { Package, Search, Filter, Truck, CreditCard } from 'lucide-react';

export function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

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
                            className="pl-9 h-10 w-[250px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="border rounded-md bg-card overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">Загрузка заказов...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 text-slate-700 border-b">
                                <tr>
                                    <th className="p-4 font-medium">ID</th>
                                    <th className="p-4 font-medium">Клиент</th>
                                    <th className="p-4 font-medium">Товар</th>
                                    <th className="p-4 font-medium">Оплата</th>
                                    <th className="p-4 font-medium">Доставка</th>
                                    <th className="p-4 font-medium">Сумма</th>
                                    <th className="p-4 font-medium">Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length > 0 ? filteredOrders.map((item) => (
                                    <tr key={item.id} className="border-b ">
                                        <td className="p-4 font-mono text-xs">{item.order.id.slice(0, 8)}</td>
                                        <td className="p-4 font-medium">
                                            <div className="flex flex-col">
                                                <span>{item.order.contactName || item.order.user.name || 'Гость'}</span>
                                                <span className="text-xs text-slate-700">{item.order.contactPhone || item.order.contactEmail || item.order.user.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span>{item.marketplace.name}</span>
                                                <span className="text-xs text-slate-700">x {item.quantity || 1}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1 text-xs font-medium" title={item.order.paymentDetails?.cardLast4 ? `Карта: **** ${JSON.parse(item.order.paymentDetails).cardLast4}` : ''}>
                                                    <CreditCard className="h-3 w-3" />
                                                    {item.order.paymentMethod === 'INSTALLMENT' ? 'Рассрочка' : 'Карта'}
                                                </div>
                                                {item.order.paymentMethod === 'INSTALLMENT' && (
                                                    <span className="text-xs text-purple-600 bg-purple-50 px-1 rounded w-fit">
                                                        {item.order.installmentPlan?.replace('_MONTHS', ' мес')}
                                                    </span>
                                                )}
                                                {item.order.paymentDetails && item.order.paymentMethod === 'INSTALLMENT' && (
                                                    <div className="text-[10px] text-slate-700">
                                                        {JSON.parse(item.order.paymentDetails).schedule?.length} платежей
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {(item.order.shippingMethod || item.order.shippingAddress) ? (
                                                <div className="flex flex-col text-xs">
                                                    <div className="flex items-center gap-1 font-medium">
                                                        <Truck className="h-3 w-3" />
                                                        {item.order.shippingMethod === 'COURIER' ? 'Курьер' : 'Самовывоз'}
                                                    </div>
                                                    {item.order.shippingAddress && (
                                                        <span className="text-slate-700 truncate max-w-[150px]" title={item.order.shippingAddress}>
                                                            {item.order.shippingCity}, {item.order.shippingAddress}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : <span className="text-xs text-slate-700">-</span>}
                                        </td>
                                        <td className="p-4 font-bold">
                                            {(item.price * (item.quantity || 1)).toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${item.status === 'COMPLETED' || item.status === 'DELIVERED' ? 'bg-blue-100 text-green-800' :
                                                item.status === 'CREATED' ? 'bg-slate-100 text-slate-800' :
                                                    item.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>

                                                <select
                                                    value={item.status}
                                                    onChange={async (e) => {
                                                        const newStatus = e.target.value;
                                                        try {
                                                            await api.updateOrderItemStatus(item.id, newStatus);
                                                            // Optimistic update
                                                            setOrders(orders.map(o => o.id === item.id ? { ...o, status: newStatus } : o));
                                                        } catch (err) {
                                                            alert("Failed to update status");
                                                        }
                                                    }}
                                                    className="bg-transparent border-none focus:ring-0 text-xs font-semibold cursor-pointer p-0"
                                                >
                                                    <option value="CREATED">Создан</option>
                                                    <option value="PROCESSING">В обработке</option>
                                                    <option value="SHIPPED">Отправлен</option>
                                                    <option value="DELIVERED">Доставлен</option>
                                                    <option value="CANCELLED">Отменен</option>
                                                </select>
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-700">
                                            Заказов пока нет.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
