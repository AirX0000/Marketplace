import React from 'react';
import { useCompare } from '../context/CompareContext';
import { Link } from 'react-router-dom';
import { X, Check, Minus, ShoppingCart, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { toast } from 'react-hot-toast';

export function ComparePage() {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();
    const { addToCart } = useShop();

    if (compareItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <span className="text-5xl">⚖️</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Список сравнения пуст</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
                    Добавляйте товары в сравнение из каталога нажав на иконку ⚖️ на карточке.
                </p>
                <Link to="/marketplaces" className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                    <ArrowLeft size={16} /> Перейти в каталог
                </Link>
            </div>
        );
    }

    const getSpec = (item, key) => {
        try {
            const attrs = typeof item.attributes === 'string' ? JSON.parse(item.attributes) : item.attributes;
            const val = attrs?.specs?.[key];
            return val != null ? val : null;
        } catch {
            return null;
        }
    };

    const isDifferent = (specKey) => {
        if (compareItems.length < 2) return false;
        const first = getSpec(compareItems[0], specKey);
        return compareItems.some(item => getSpec(item, specKey) !== first);
    };

    const isPriceDiff = compareItems.length >= 2 && compareItems.some(i => i.price !== compareItems[0].price);
    const minPrice = Math.min(...compareItems.map(i => i.price || 0));

    const isAuto = compareItems.some(i => ["Cars", "Transport", "Dealer", "Private Auto", "Автомобили"].includes(i.category));
    const isRealEstate = compareItems.some(i => ["Недвижимость", "Apartments", "Houses"].includes(i.category));

    const specsKeys = isAuto ? [
        { key: 'year', label: 'Год выпуска' },
        { key: 'mileage', label: 'Пробег' },
        { key: 'engine', label: 'Двигатель' },
        { key: 'transmission', label: 'Коробка' },
        { key: 'drive', label: 'Привод' },
        { key: 'bodyType', label: 'Кузов' },
        { key: 'color', label: 'Цвет' },
        { key: 'power', label: 'Мощность' },
    ] : isRealEstate ? [
        { key: 'area', label: 'Площадь' },
        { key: 'rooms', label: 'Комнаты' },
        { key: 'floor', label: 'Этаж' },
        { key: 'yearBuilt', label: 'Год постройки' },
        { key: 'renovation', label: 'Ремонт' },
        { key: 'materials', label: 'Материал' },
        { key: 'parking', label: 'Парковка' },
    ] : [
        { key: 'brand', label: 'Бренд' },
        { key: 'condition', label: 'Состояние' },
        { key: 'warranty', label: 'Гарантия' },
    ];

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-20">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/marketplaces" className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors shadow-sm">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Сравнение товаров</h1>
                            <p className="text-sm text-slate-400">{compareItems.length} товара · {compareItems[0]?.category}</p>
                        </div>
                    </div>
                    <button onClick={clearCompare} className="text-sm font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 px-4 py-2 rounded-xl transition-colors">
                        Очистить всё
                    </button>
                </div>

                <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-[28px] shadow-xl border border-slate-100 dark:border-slate-800">
                    <table className="w-full border-collapse">
                        {/* Product Headers */}
                        <thead className="sticky top-0 z-20 bg-white dark:bg-slate-900">
                            <tr>
                                <th className="p-6 border-b border-r border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-md w-52 min-w-[200px]">
                                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Характеристики</div>
                                </th>
                                {compareItems.map(item => (
                                    <th key={item.id} className="p-6 border-b border-slate-100 dark:border-slate-800 min-w-[260px] relative">
                                        <button
                                            onClick={() => removeFromCompare(item.id)}
                                            className="absolute top-3 right-3 p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-full hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <X size={14} />
                                        </button>
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-36 h-28 bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden">
                                                <img src={item.image || '/placeholder.png'} className="w-full h-full object-cover" alt={item.name} />
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 dark:text-white text-sm line-clamp-2 text-center mb-1">{item.name}</div>
                                                <div className={`text-lg font-black text-center ${item.price === minPrice && isPriceDiff ? 'text-emerald-600' : 'text-blue-600'}`}>
                                                    {(item.price || 0).toLocaleString()} So'm
                                                    {item.price === minPrice && isPriceDiff && (
                                                        <span className="ml-1 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-black uppercase">выгоднее</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 w-full mt-1">
                                                <button
                                                    onClick={() => { addToCart(item); toast.success('Добавлено в корзину'); }}
                                                    className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/20 active:scale-95"
                                                >
                                                    <ShoppingCart size={13} /> В корзину
                                                </button>
                                                <Link
                                                    to={`/marketplaces/${item.slug || item.id}`}
                                                    className="flex-1 h-9 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center hover:border-blue-500 hover:text-blue-600 transition-all"
                                                >
                                                    Подробнее
                                                </Link>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {/* Trust Row */}
                            <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                                <td className="p-5 border-r border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-500 flex items-center gap-2">
                                    <ShieldCheck size={15} className="text-blue-500" /> Доверие
                                </td>
                                {compareItems.map(item => (
                                    <td key={item.id} className="p-5 text-center">
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {item.isVerified && <span className="text-[10px] bg-emerald-100 text-emerald-700 font-black px-2 py-0.5 rounded-full uppercase">✓ Проверено</span>}
                                            {item.isOfficial && <span className="text-[10px] bg-blue-100 text-blue-700 font-black px-2 py-0.5 rounded-full uppercase">Official</span>}
                                            {!item.isVerified && !item.isOfficial && <span className="text-slate-300 dark:text-slate-600 text-sm">—</span>}
                                        </div>
                                    </td>
                                ))}
                            </tr>

                            {/* Region Row */}
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                <td className="p-5 border-r border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-500">📍 Регион</td>
                                {compareItems.map(item => (
                                    <td key={item.id} className="p-5 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {item.region || <Minus size={16} className="text-slate-300 mx-auto" />}
                                    </td>
                                ))}
                            </tr>

                            {/* Specs Rows */}
                            {specsKeys.map(spec => {
                                const hasDiff = isDifferent(spec.key);
                                const allNull = compareItems.every(i => getSpec(i, spec.key) == null);
                                if (allNull) return null;
                                return (
                                    <tr key={spec.key} className={`transition-colors ${hasDiff ? 'bg-amber-50/40 dark:bg-amber-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'}`}>
                                        <td className="p-5 border-r border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center justify-between">
                                                {spec.label}
                                                {hasDiff && <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" title="Есть различия" />}
                                            </div>
                                        </td>
                                        {compareItems.map(item => {
                                            const val = getSpec(item, spec.key);
                                            return (
                                                <td key={item.id} className="p-5 text-center text-sm font-bold text-slate-800 dark:text-slate-200">
                                                    {val != null ? val : <Minus size={16} className="text-slate-300 dark:text-slate-600 mx-auto" />}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}

                            {/* Bottom CTA row */}
                            <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                                <td className="p-5 border-r border-slate-100 dark:border-slate-800" />
                                {compareItems.map(item => (
                                    <td key={item.id} className="p-5 text-center">
                                        <button
                                            onClick={() => { addToCart(item); toast.success('Добавлено!'); }}
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <ShoppingCart size={15} /> Купить
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Legend */}
                <div className="mt-6 flex items-center gap-6 text-xs text-slate-400 font-medium">
                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Значения отличаются</div>
                    <div className="flex items-center gap-2"><span className="text-emerald-600 font-black">выгоднее</span> — самая низкая цена</div>
                </div>
            </div>
        </div>
    );
}
