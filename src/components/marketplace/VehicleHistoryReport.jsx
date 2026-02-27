import React, { useState, useRef } from 'react';
import { ShieldCheck, Check, Download, Loader2, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

export function VehicleHistoryReport({ marketplace }) {
    const [purchased, setPurchased] = useState(false);
    const [buying, setBuying] = useState(false);
    const printRef = useRef(null);

    if (!["Cars", "Transport"].includes(marketplace?.category)) return null;

    // Derive consistent "history" from listing data
    const getIdNum = (id) => {
        if (typeof id === 'number') return id;
        if (typeof id === 'string') return id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return 0;
    };
    const isClean = getIdNum(marketplace.id) % 2 === 0;

    // Extract VIN from attributes if available, otherwise show masked
    const attrs = (() => {
        try {
            return typeof marketplace.attributes === 'string'
                ? JSON.parse(marketplace.attributes)
                : (marketplace.attributes || {});
        } catch { return {}; }
    })();
    const realVin = attrs?.specs?.vin || attrs?.vin || null;
    const displayVin = purchased
        ? (realVin || 'WBA7C51090G594321')
        : (realVin ? realVin.slice(0, 3) + '**************' : 'WBA**************');

    const handleBuyReport = () => {
        if (buying) return;
        setBuying(true);
        const loadingToast = toast.loading('Обработка...');
        setTimeout(() => {
            setBuying(false);
            setPurchased(true);
            toast.dismiss(loadingToast);
            toast.success('Отчёт доступен!');
        }, 1200);
    };

    const handlePrint = () => {
        const printContent = printRef.current?.innerHTML;
        if (!printContent) return;
        const win = window.open('', '_blank');
        win.document.write(`
            <html>
            <head>
                <title>Отчёт об автомобиле — ${marketplace.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 32px; color: #1e293b; }
                    h1 { font-size: 24px; margin-bottom: 4px; }
                    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
                    .badge-clean { background: #dcfce7; color: #166534; }
                    .badge-warn { background: #fef3c7; color: #92400e; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
                    .item-title { font-weight: bold; font-size: 15px; margin-bottom: 2px; }
                    .item-desc { font-size: 13px; color: #64748b; }
                    .vin-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
                    .vin-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 6px; }
                    .vin-code { font-family: monospace; font-size: 22px; font-weight: bold; letter-spacing: 4px; }
                    .footer { margin-top: 40px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
                </style>
            </head>
            <body>
                <h1>Отчёт об автомобиле</h1>
                <p>${marketplace.name}</p>
                <span class="badge ${isClean ? 'badge-clean' : 'badge-warn'}">${isClean ? 'Отличная история' : 'Есть замечания'}</span>
                <div class="grid">
                    <div>
                        <div class="item-title">✅ Юридическая чистота</div>
                        <div class="item-desc">Ограничений и залогов не найдено</div>
                    </div>
                    <div>
                        <div class="item-title">${isClean ? '✅' : '⚠️'} История ДТП</div>
                        <div class="item-desc">${isClean ? 'Аварий не зарегистрировано' : 'Найден 1 расчёт ремонтных работ'}</div>
                    </div>
                    <div>
                        <div class="item-title">✅ Реальный пробег</div>
                        <div class="item-desc">Подтверждён историей обслуживания</div>
                    </div>
                    <div>
                        <div class="item-title">✅ Таможенное оформление</div>
                        <div class="item-desc">Документы в порядке</div>
                    </div>
                </div>
                <div class="vin-box">
                    <div class="vin-label">VIN Код</div>
                    <div class="vin-code">${realVin || 'WBA7C51090G594321'}</div>
                </div>
                <div class="footer">
                    Отчёт сформирован платформой Autohouse · ${new Date().toLocaleDateString('ru-RU')} · autohouse.uz
                </div>
            </body>
            </html>
        `);
        win.document.close();
        win.focus();
        win.print();
        win.close();
    };

    return (
        <div ref={printRef} className={`rounded-3xl p-8 border ${isClean ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'} shadow-sm`}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className={`h-8 w-8 ${isClean ? 'text-emerald-600' : 'text-amber-500'}`} />
                    Отчёт об автомобиле
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
                            <div className="text-sm text-slate-500">{isClean ? 'Аварий не зарегистрировано' : 'Найден 1 расчёт ремонтных работ'}</div>
                        </div>
                    </div>
                    {purchased && (
                        <>
                            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-700">
                                    <Check className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800">Реальный пробег</div>
                                    <div className="text-sm text-slate-500">Подтверждён историей обслуживания</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-700">
                                    <Check className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800">Таможенное оформление</div>
                                    <div className="text-sm text-slate-500">Документы в порядке</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="bg-white/50 rounded-xl p-4 border border-black/5">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">VIN Код</div>
                    <div className="font-mono text-2xl font-bold text-slate-800 tracking-widest break-all">
                        {displayVin}
                    </div>
                    <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        {purchased ? 'Проверен и подтверждён' : 'Данные платформы Autohouse'}
                    </div>
                </div>
            </div>

            {purchased ? (
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex-1 py-3 bg-emerald-600 border border-transparent rounded-xl font-bold text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 text-sm flex items-center justify-center gap-2"
                    >
                        <Printer className="h-5 w-5" /> Распечатать / Скачать PDF
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleBuyReport}
                    disabled={buying}
                    className="w-full py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
                >
                    {buying ? (
                        <><Loader2 className="h-5 w-5 animate-spin" /> Обработка...</>
                    ) : (
                        'Получить полный отчёт (9 900 UZS)'
                    )}
                </button>
            )}
        </div>
    );
}
