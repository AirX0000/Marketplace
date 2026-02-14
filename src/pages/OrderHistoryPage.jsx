import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Package, Calendar, ChevronRight, CreditCard, Truck, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { OrderTimeline } from '../components/OrderTimeline';
import { CreateReturnModal } from '../components/CreateReturnModal';

export function OrderHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [returnItem, setReturnItem] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function load() {
            try {
                const data = await api.getOrders();
                setOrders(data);
            } catch (error) {
                console.error("Failed to load orders", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <div className="p-10 text-center">Загрузка заказов...</div>;

    return (
        <div className="container py-8 px-4 md:px-6">
            <h1 className="text-2xl font-bold mb-6 text-slate-900">Мои заказы</h1>

            {orders.length === 0 ? (
                <div className="text-center py-20 border rounded-xl bg-slate-50">
                    <Package className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">История заказов пуста</h3>
                    <p className="text-slate-600 mb-6">Начните покупки в нашем каталоге.</p>
                    <Link to="/marketplaces" className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary/90">
                        Перейти в каталог
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="border rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-slate-50 p-4 flex flex-wrap gap-4 items-center justify-between text-sm border-b border-slate-100">
                                <div className="flex flex-wrap gap-6">
                                    <div>
                                        <span className="block text-slate-500 text-xs uppercase tracking-wider font-semibold">Дата заказа</span>
                                        <span className="font-bold text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <span className="block text-slate-500 text-xs uppercase tracking-wider font-semibold">Сумма</span>
                                        <span className="font-bold text-primary">{order.total.toLocaleString()} So'm</span>
                                    </div>
                                    <div>
                                        <span className="block text-slate-500 text-xs uppercase tracking-wider font-semibold">Заказ #</span>
                                        <span className="font-medium font-mono text-slate-700">{order.id.slice(0, 8)}</span>
                                    </div>
                                    {order.paymentMethod === 'INSTALLMENT' && (
                                        <div>
                                            <span className="block text-slate-500 text-xs uppercase tracking-wider font-semibold">Оплата</span>
                                            <span className="font-medium text-purple-600">Рассрочка ({order.installmentPlan?.replace('_MONTHS', ' мес')})</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`font-medium px-3 py-1 rounded-full text-xs ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                        order.status === 'CREATED' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                        {order.status === 'CREATED' ? 'Создан' : order.status === 'COMPLETED' ? 'Завершен' : order.status}
                                    </div>
                                </div>
                            </div>

                            {/* Order Timeline */}
                            <div className="px-6 pb-2 pt-4 border-b border-slate-50">
                                <OrderTimeline
                                    status={order.status}
                                    createdAt={order.createdAt}
                                    updatedAt={order.updatedAt}
                                />
                            </div>

                            <div className="p-4 space-y-4 bg-white">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="h-16 w-16 bg-slate-100 rounded-md overflow-hidden flex-none border border-slate-200">
                                            {item.marketplace?.image && <img src={item.marketplace.image} className="h-full w-full object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <Link to={`/marketplaces/${item.marketplaceId}`} className="font-bold hover:underline text-slate-900">
                                                {item.marketplace?.name || 'Товар'}
                                            </Link>
                                            <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                                <span>{item.quantity || 1} шт</span>
                                                <span>&bull;</span>
                                                <span>{item.price.toLocaleString()} So'm / шт</span>
                                            </div>
                                        </div>
                                        <div className="font-bold text-slate-900">
                                            {(item.total || (item.price * (item.quantity || 1))).toLocaleString()} So'm

                                            {/* Item Status Badge */}
                                            <div className={`mt-2 text-[10px] px-2 py-1 rounded-full text-center w-fit ml-auto ${item.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                item.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                                    item.status === 'PROCESSING' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}>
                                                {item.status === 'CREATED' ? 'Создан' :
                                                    item.status === 'PROCESSING' ? 'В обработке' :
                                                        item.status === 'SHIPPED' ? 'Отправлен' :
                                                            item.status === 'DELIVERED' ? 'Доставлен' : item.status}
                                            </div>
                                        </div>


                                        {/* Return Action */}
                                        {
                                            ['DELIVERED', 'COMPLETED'].includes(item.status) && (
                                                <button
                                                    onClick={() => setReturnItem(item)}
                                                    className="ml-4 text-xs font-medium text-red-600 hover:text-red-800 hover:underline"
                                                >
                                                    Вернуть товар
                                                </button>
                                            )
                                        }
                                    </div>

                                ))}
                            </div>
                            {(order.shippingAddress || order.shippingMethod) && (
                                <div className="bg-slate-50 p-3 text-xs flex gap-4 text-slate-600 border-t border-slate-100">
                                    <div className="flex items-center gap-1 font-medium">
                                        <Truck className="h-3 w-3" />
                                        {order.shippingMethod === 'COURIER' ? 'Курьерская доставка' : 'Самовывоз'}
                                    </div>
                                    {order.shippingAddress && (
                                        <div>{order.shippingCity}, {order.shippingAddress}</div>
                                    )}
                                </div>
                            )}

                            {/* NEW: Payment Details (Schedule) */}
                            {order.paymentDetails && (
                                <div className="bg-muted/10 p-4 border-t space-y-3">
                                    <h4 className="text-sm font-bold flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" /> Детали Оплаты
                                    </h4>

                                    {(() => {
                                        let details = {};
                                        try { details = typeof order.paymentDetails === 'string' ? JSON.parse(order.paymentDetails) : order.paymentDetails; } catch (e) { }

                                        return (
                                            <div className="space-y-4">
                                                {details.cardLast4 && (
                                                    <div className="text-sm">Карта для списаний: <span className="font-mono bg-muted px-1 rounded">**** {details.cardLast4}</span></div>
                                                )}

                                                {details.schedule && (
                                                    <div className="border rounded-md overflow-hidden bg-background">
                                                        <div className="flex justify-between bg-muted/50 px-3 py-2 text-xs font-medium text-slate-500">
                                                            <span>Дата списания</span>
                                                            <span>Сумма</span>
                                                            <span>Статус</span>
                                                        </div>
                                                        {details.schedule.map((row, idx) => (
                                                            <div key={idx} className="flex justify-between px-3 py-2 text-sm border-t first:border-t-0 hover:bg-muted/20">
                                                                <span className="font-mono">{new Date(row.date).toLocaleDateString()}</span>
                                                                <span className="font-bold">{row.amount.toLocaleString()} сум</span>
                                                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${row.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                    {row.status === 'PENDING' ? 'Ожидает' : 'Запланировано'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                            {/* ACTION BUTTONS */}
                            <div className="bg-gray-50 p-4 border-t flex justify-end gap-3">
                                <Link to={`/marketplaces`} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                                    Повторить заказ
                                </Link>

                                {['PAID', 'SHIPPED', 'ESCROW_HOLD'].includes(order.status) && (
                                    <button
                                        onClick={async () => {
                                            if (window.confirm('Вы подтверждаете, что получили товар и претензий не имеете? Средства будут отправлены продавцу.')) {
                                                try {
                                                    await api.confirmOrderReceipt(order.id);
                                                    alert('Спасибо! Сделка завершена.');
                                                    window.location.reload();
                                                } catch (e) {
                                                    alert('Ошибка: ' + e.message);
                                                }
                                            }
                                        }}
                                        className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm shadow-emerald-200 transition-all flex items-center gap-2"
                                    >
                                        <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                                        Подтвердить получение
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                    }
                </div >

            )}

            <CreateReturnModal
                isOpen={!!returnItem}
                onClose={() => setReturnItem(null)}
                orderItem={returnItem}
                onSuccess={() => navigate('/profile/returns')}
            />
        </div >
    );
}
