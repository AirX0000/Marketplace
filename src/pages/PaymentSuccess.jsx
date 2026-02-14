import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, Package, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

export function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const orderId = searchParams.get('orderId') || localStorage.getItem('pendingOrderId');

        if (orderId) {
            // Check order status
            api.getOrder(orderId)
                .then(data => {
                    setOrder(data);
                    localStorage.removeItem('pendingOrderId');
                })
                .catch(err => {
                    console.error('Failed to fetch order:', err);
                })
                .finally(() => setLoading(false));
        } else {
            navigate('/');
        }
    }, [searchParams, navigate]);

    if (loading) {
        return (
            <div className="container py-20 text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-slate-700">Проверка оплаты...</p>
            </div>
        );
    }

    return (
        <div className="container max-w-lg py-20 px-4">
            <div className="text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
                    <Check className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-slate-900">Оплата прошла успешно!</h2>
                <p className="text-slate-700 mb-2">
                    Заказ №{order?.id.slice(0, 8).toUpperCase()} оплачен
                </p>
                <p className="text-slate-600 mb-8 flex items-center justify-center gap-2">
                    <Package className="h-5 w-5" />
                    Ожидайте доставку товара
                </p>
                {order?.contactEmail && (
                    <p className="text-sm text-slate-500 mb-8">
                        Подтверждение отправлено на {order.contactEmail}
                    </p>
                )}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/orders')}
                        className="w-full h-12 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                    >
                        Мои заказы
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full h-12 rounded-lg border border-slate-300 text-slate-900 hover:bg-slate-50 font-medium transition-colors"
                    >
                        На главную
                    </button>
                </div>
            </div>
        </div>
    );
}
