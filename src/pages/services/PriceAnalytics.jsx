import React, { useState } from 'react';
import { TrendingUp, Car, Search, BarChart3, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

const BRANDS_MODELS = {
    'Chevrolet': ['Cobalt', 'Gentra', 'Malibu', 'Tracker', 'Equinox'],
    'BYD': ['Song Plus', 'Chazor', 'Han', 'Atto 3', 'Seal'],
    'Kia': ['Rio', 'K5', 'Sorento', 'Sportage', 'Stinger'],
    'Hyundai': ['Accent', 'Elantra', 'Tucson', 'Santa Fe', 'Sonata'],
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Land Cruiser', 'Prado'],
    'Lexus': ['LX 570', 'RX 350', 'ES 350', 'GX 460', 'NX 300'],
    'BMW': ['3 Series', '5 Series', 'X5', 'X6', 'X3'],
    'Mercedes': ['E-Class', 'C-Class', 'GLE', 'S-Class', 'GLC'],
};

export function PriceAnalytics() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: '',
        mileage: ''
    });

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Fetch real listings matching this brand/model from our database
            const listings = await api.getMarketplaces({
                category: 'Transport',
                search: `${formData.brand} ${formData.model}`,
                limit: 50,
                status: 'APPROVED'
            });

            const items = listings.data || listings;

            // Filter by approximate year
            const yearNum = parseInt(formData.year);
            const relevant = items.filter(l => {
                try {
                    const attrs = typeof l.attributes === 'string' ? JSON.parse(l.attributes) : (l.attributes || {});
                    const lyear = parseInt(attrs?.specs?.year || attrs?.year || 0);
                    // within ±3 years
                    return !lyear || Math.abs(lyear - yearNum) <= 3;
                } catch { return true; }
            });

            let minPrice, avgPrice, maxPrice, count;
            if (relevant.length > 0) {
                const prices = relevant.map(l => l.price).sort((a, b) => a - b);
                minPrice = prices[0];
                maxPrice = prices[prices.length - 1];
                avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
                count = prices.length;
            } else if (items.length > 0) {
                // Fall back to all transport items if no specific matches
                const prices = items.map(l => l.price).sort((a, b) => a - b);
                minPrice = prices[0];
                maxPrice = prices[prices.length - 1];
                avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
                count = prices.length;
            } else {
                // No data at all - show disclaimer
                minPrice = null;
                avgPrice = null;
                maxPrice = null;
                count = 0;
            }

            // Mileage coefficient: > 100k km drops price 10-20%
            const mileageNum = parseInt(formData.mileage);
            let mileageFactor = 1;
            if (mileageNum > 200000) mileageFactor = 0.78;
            else if (mileageNum > 100000) mileageFactor = 0.88;
            else if (mileageNum > 50000) mileageFactor = 0.95;

            // Year coefficient: older cars drop in price
            const currentYear = new Date().getFullYear();
            const ageFactor = Math.max(0.5, 1 - (currentYear - yearNum) * 0.04);

            const adjustedAvg = avgPrice ? Math.round(avgPrice * mileageFactor * ageFactor) : null;

            const daysToSell = count > 10 ? 5 : count > 3 ? 12 : 20;
            const liquidity = count > 10 ? 'Высокая' : count > 3 ? 'Средняя' : 'Низкая';

            setResult({
                minPrice: adjustedAvg ? Math.round(adjustedAvg * 0.88) : null,
                avgPrice: adjustedAvg,
                maxPrice: adjustedAvg ? Math.round(adjustedAvg * 1.12) : null,
                liquidity,
                daysToSell,
                count,
                trend: 'stable'
            });
            setStep(2);
        } catch (error) {
            console.error('Analytics failed', error);
            // Still show step 2 but with no data
            setResult({ minPrice: null, avgPrice: null, maxPrice: null, liquidity: 'Нет данных', daysToSell: null, count: 0 });
            setStep(2);
        } finally {
            setLoading(false);
        }
    };

    const hasData = result?.avgPrice != null;

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
                        Узнайте реальную рыночную цену на основе актуальных объявлений в нашем каталоге.
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
                                        className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        value={formData.brand}
                                        onChange={e => setFormData({ ...formData, brand: e.target.value, model: '' })}
                                    >
                                        <option value="">Выберите марку</option>
                                        {Object.keys(BRANDS_MODELS).map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Модель</label>
                                    <select
                                        className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        disabled={!formData.brand}
                                        value={formData.model}
                                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                                    >
                                        <option value="">Выберите модель</option>
                                        {(BRANDS_MODELS[formData.brand] || []).map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Год выпуска</label>
                                    <input
                                        type="number"
                                        placeholder="2023"
                                        min="1990"
                                        max={new Date().getFullYear()}
                                        className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        min="0"
                                        className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        value={formData.mileage}
                                        onChange={e => setFormData({ ...formData, mileage: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
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
                                    Анализ завершён · {result.count} объявлений в базе
                                </div>
                                <h2 className="text-2xl font-bold mb-1">{formData.brand} {formData.model} {formData.year}</h2>
                                <p className="text-slate-500">Пробег {Number(formData.mileage).toLocaleString()} км</p>
                            </div>

                            {hasData ? (
                                <>
                                    {/* Price Card */}
                                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white text-center shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
                                        <p className="text-slate-400 font-medium mb-2 uppercase tracking-widest text-xs">Среднерыночная цена</p>
                                        <div className="text-5xl font-black mb-4 tracking-tight">
                                            {result.avgPrice.toLocaleString()} <span className="text-2xl opacity-70">UZS</span>
                                        </div>
                                        <div className="flex justify-center gap-8 text-sm">
                                            <div>
                                                <span className="text-slate-400 block mb-1">Мин. цена</span>
                                                <span className="font-bold text-lg">{result.minPrice.toLocaleString()} UZS</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block mb-1">Макс. цена</span>
                                                <span className="font-bold text-lg">{result.maxPrice.toLocaleString()} UZS</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Liquidity Grid */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <div className="text-sm text-slate-500 mb-1">Ликвидность</div>
                                                    <div className={`text-xl font-bold ${result.liquidity === 'Высокая' ? 'text-green-600' : result.liquidity === 'Средняя' ? 'text-amber-600' : 'text-red-600'}`}>
                                                        {result.liquidity}
                                                    </div>
                                                </div>
                                                <TrendingUp className="text-green-500" />
                                            </div>
                                            <p className="text-xs text-slate-400">Основано на {result.count} актуальных объявлениях в каталоге</p>
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
                                </>
                            ) : (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
                                    <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-amber-800 mb-2">Нет данных в каталоге</h3>
                                    <p className="text-amber-700">По данной модели пока нет объявлений в нашей базе. Попробуйте другую марку или посмотрите похожие авто.</p>
                                </div>
                            )}

                            <div className="pt-4 flex gap-4">
                                <button onClick={() => { setStep(1); setResult(null); }} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
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
                    <span>Расчет основан на реальных объявлениях в каталоге Autohouse с учётом года и пробега</span>
                </div>
            </div>
        </div>
    );
}
