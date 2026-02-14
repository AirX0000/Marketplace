import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Check } from 'lucide-react';

export function EscrowInfo({ total, userBalance }) {
    const navigate = useNavigate();

    return (
        <div className="p-6 border-2 border-emerald-600 bg-emerald-50 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                SAFE DEAL
            </div>
            <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="h-10 w-10 text-emerald-600" />
                <div>
                    <div className="font-bold text-emerald-900 text-lg">Безопасная Сделка</div>
                    <div className="text-sm text-emerald-700">
                        Деньги будут заморожены (Escrow) и переведены продавцу только после того, как вы нажмете <b>"Подтвердить получение"</b>.
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-emerald-200 mb-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-600">Сумма к списанию:</span>
                    <span className="font-bold text-lg text-emerald-700">{total.toLocaleString()} сум</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">Ваш баланс:</span>
                    <span className={`font-bold ${userBalance < total ? 'text-red-500' : 'text-slate-900'}`}>
                        {(userBalance || 0).toLocaleString()} сум
                    </span>
                </div>
            </div>

            {(userBalance || 0) < total ? (
                <div className="text-center">
                    <p className="text-sm text-red-600 font-medium mb-3">Недостаточно средств. Пополните кошелек для безопасной сделки.</p>
                    <button onClick={() => navigate('/profile')} className="w-full h-10 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors">
                        Пополнить Aura Кошелек
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-emerald-800 bg-emerald-100/50 p-2 rounded">
                        <Check className="h-4 w-4" /> Средств достаточно
                    </div>
                    <p className="text-xs text-emerald-600 italic">
                        * Нажимая "Подтвердить", вы соглашаетесь с условиями Escrow.
                    </p>
                </div>
            )}
        </div>
    );
}
