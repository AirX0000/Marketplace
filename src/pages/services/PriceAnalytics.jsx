import React, { useState } from 'react';
import { TrendingUp, Car, Search, BarChart3, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PriceAnalytics() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: '',
        mileage: ''
    });

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate AI Analysis
        setTimeout(() => {
            setLoading(false);
            setResult({
                minPrice: 10200,
                avgPrice: 11500,
                maxPrice: 12800,
                liquidity: "Высокая",
                daysToSell: 5,
                trend: "stable",
                history: [11200, 11350, 11400, 11500, 11480, 11500]
            });
            setStep(2);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Header */}
            <div className="bg-slate-900 text-white py-16 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="container mx-auto relative z-10 text-center">
                    <h1 className="text-3xl md:text-5xl font-black mb-4">
                        Оценка стоимости авто с <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">AI</span>
                    </h1>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                        Узнайте реальную рыночную цену вашего автомобиля за 5 секунд, используя наши алгоритмы искусственного интеллекта.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 relative z-20">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 md:p-10 border border-slate-100 dark:border-slate-800 max-w-4xl mx-auto">

                    {step === 1 && (
                        <form onSubmit={handleSearch} className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Марка</label>
                                    <select
                                        className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-medium"
                                        required
                                        value={formData.brand}
                                        onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                    >
                                        <option value="">Выберите марку</option>
                                        <option value="Chevrolet">Chevrolet</option>
                                        <option value="Kia">Kia</option>
                                        <option value="Hyundai">Hyundai</option>
                                        <option value="BYD">BYD</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Модель</label>
                                    <select
                                        className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-medium"
                                        required
                                        disabled={!formData.brand}
                                        value={formData.model}
                                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                                    >
                                        <option value="">Выберите модель</option>
                                        {formData.brand === 'Chevrolet' && (
                                            <>
                                                <option value="Cobalt">Cobalt</option>
                                                <option value="Gentra">Gentra</option>
                                                <option value="Malibu">Malibu</option>
                                            </>
                                        )}
                                        {formData.brand === 'BYD' && (
                                            <>
                                                <option value="Song Plus">Song Plus</option>
                                                <option value="Chazor">Chazor</option>
                                                <option value="Han">Han</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Год выпуска</label>
                                    <input
                                        type="number"
                                        placeholder="2023"
                                        className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-medium"
                                        required
                                        value={formData.year}
                                        onChange={e => setFormData({ ...formData, year: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Пробег (км)</label>
                                    <input
                                        type="number"
                                        placeholder="50000"
                                        className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-medium"
                                        required
                                        value={formData.mileage}
                                        onChange={e => setFormData({ ...formData, mileage: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="button" // Change to submit
                                onClick={handleSearch}
                                disabled={loading}
                                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Анализируем рынок...
                                    </>
                                ) : (
                                    <>
                                        <Car size={20} />
                                        Оценить автомобиль
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {step === 2 && result && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium mb-4">
                                    <CheckCircle2 size={16} className="text-green-500" />
                                    Анализ завершен
                                </div>
                                <h2 className="text-2xl font-bold mb-1">{formData.brand} {formData.model} {formData.year}</h2>
                                <p className="text-slate-500">Пробег {Number(formData.mileage).toLocaleString()} км</p>
                            </div>

                            {/* Price Card */}
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white text-center shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-fullblur-3xl" />
                                <p className="text-slate-400 font-medium mb-2 uppercase tracking-widest text-xs">Среднерыночная цена</p>
                                <div className="text-5xl font-black mb-4 tracking-tight">
                                    ${result.avgPrice.toLocaleString()}
                                </div>
                                <div className="flex justify-center gap-8 text-sm">
                                    <div>
                                        <span className="text-slate-400 block mb-1">Мин. цена</span>
                                        <span className="font-bold text-lg">${result.minPrice.toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block mb-1">Макс. цена</span>
                                        <span className="font-bold text-lg">${result.maxPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Liquidity Grid */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <div className="text-sm text-slate-500 mb-1">Ликвидность</div>
                                            <div className="text-xl font-bold text-green-600">{result.liquidity}</div>
                                        </div>
                                        <TrendingUp className="text-green-500" />
                                    </div>
                                    <p className="text-xs text-slate-400">Спрос на эту модель выше среднего на 15%</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <div className="text-sm text-slate-500 mb-1">Срок продажи</div>
                                            <div className="text-xl font-bold text-blue-600">~{result.daysToSell} дней</div>
                                        </div>
                                        <BarChart3 className="text-blue-500" />
                                    </div>
                                    <p className="text-xs text-slate-400">Среднее время нахождения объявления на сайте</p>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button onClick={() => setStep(1)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    Проверить другую
                                </button>
                                <Link to="/marketplaces?category=Transport" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                                    <Search size={18} />
                                    Найти похожие
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Disclaimer */}
            <div className="container mx-auto px-4 mt-12 text-center">
                <div className="inline-flex items-center gap-2 text-slate-400 text-sm bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800">
                    <AlertCircle size={14} />
                    <span>Расчет является приблизительным и основан на анализе 15,000+ объявлений</span>
                </div>
            </div>
        </div>
    );
}
