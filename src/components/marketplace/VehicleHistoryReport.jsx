import React, { useState } from 'react';
import { ShieldCheck, Check, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function VehicleHistoryReport({ marketplace }) {
    const [purchased, setPurchased] = useState(false);
    const [buying, setBuying] = useState(false);

    if (!["Cars", "Transport"].includes(marketplace?.category)) return null;

    // Handle both numeric and string (UUID) IDs safely
    const getIdNum = (id) => {
        if (typeof id === 'number') return id;
        if (typeof id === 'string') return id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return 0;
    };

    const isClean = getIdNum(marketplace.id) % 2 === 0;

    const handleBuyReport = () => {
        if (buying) return;
        setBuying(true);
        const loadingToast = toast.loading("Обработка платежа...");

        // Simulate API call
        setTimeout(() => {
            setBuying(false);
            setPurchased(true);
            toast.dismiss(loadingToast);
            toast.success("Отчет успешно куплен!");
        }, 1500);
    };

    return (
        <div className={`rounded-3xl p-8 border ${isClean ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'} shadow-sm`}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className={`h-8 w-8 ${isClean ? 'text-emerald-600' : 'text-amber-500'}`} />
                    Отчет об автомобиле
                </h2>
                <span className={`px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${isClean ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {isClean ? 'Отличная история' : 'Есть замечания'}
                </span>
            </div>

            <div className={`grid md:grid-cols-2 gap-6 mb-6 transition-all ${purchased ? 'opacity-100' : 'opacity-80 blur-[0.5px]'}`}>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isClean ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>
                            <Check className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800">Юридическая чистота</div>
                            <div className="text-sm text-slate-500">Ограничений и залогов не найдено</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isClean ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>
                            <Check className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800">История ДТП</div>
                            <div className="text-sm text-slate-500">{isClean ? 'Аварий не зарегистрировано' : 'Найден 1 расчет ремонтных работ'}</div>
                        </div>
                    </div>
                    {purchased && (
                        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-700`}>
                                <Check className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-bold text-slate-800">Реальный пробег</div>
                                <div className="text-sm text-slate-500">Подтвержден историей обслуживания</div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="bg-white/50 rounded-xl p-4 border border-black/5">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">VIN Код</div>
                    <div className="font-mono text-2xl font-bold text-slate-800 tracking-widest break-all">
                        {purchased ? 'WBA7C51090G594321' : 'WBA**************'}
                    </div>
                    <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> {purchased ? 'Проверен и подтвержден' : 'Проверен по базе ГИБДД'}
                    </div>
                </div>
            </div>

            {purchased ? (
                <button className="w-full py-3 bg-emerald-600 border border-transparent rounded-xl font-bold text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 text-sm flex items-center justify-center gap-2">
                    <Download className="h-5 w-5" /> Скачать Полный Отчет (PDF)
                </button>
            ) : (
                <button
                    onClick={handleBuyReport}
                    disabled={buying}
                    className="w-full py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
                >
                    {buying ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" /> Обработка...
                        </>
                    ) : (
                        'Купить полный отчет (9900 UZS)'
                    )}
                </button>
            )}
        </div>
    );
}
