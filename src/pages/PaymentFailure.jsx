import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export function PaymentFailure() {
    const navigate = useNavigate();

    return (
        <div className="container max-w-lg py-20 px-4">
            <div className="text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
                    <XCircle className="h-12 w-12 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-slate-900">Оплата не прошла</h2>
                <p className="text-slate-700 mb-8">
                    К сожалению, платеж не был завершен. Попробуйте еще раз.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/cart')}
                        className="w-full h-12 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                    >
                        Вернуться в корзину
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
