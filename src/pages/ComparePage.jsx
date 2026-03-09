import React from 'react';
import { useCompare } from '../context/CompareContext';
import { Link } from 'react-router-dom';
import { X, Check, Minus, ShoppingCart, ArrowLeft, ShieldCheck, Scale, Zap, Info } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';

export function ComparePage() {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();
    const { addToCart } = useShop();

    if (compareItems.length === 0) {
        return (
            <div className="min-h-screen bg-[#13111C] flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
                <div className="relative z-10 w-full max-w-lg">
                    <div className="bg-[#191624] p-12 rounded-[3rem] border border-white/5 shadow-2xl text-center space-y-8 backdrop-blur-xl">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-purple-600/20 transform -rotate-12">
                            <Scale size={48} className="text-white" />
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Сравнение Пусто</h1>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] leading-relaxed">
                                Добавляйте товары в сравнение из каталога, <br /> чтобы выбрать идеальный вариант
                            </p>
                        </div>
                        <Link
                            to="/marketplaces"
                            className="flex items-center justify-center gap-3 w-full h-16 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all shadow-xl shadow-purple-600/20 active:scale-95 italic"
                        >
                            <ArrowLeft size={16} /> Перейти в каталог
                        </Link>
                    </div>
                </div>
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

    // Improved Category Detection
    const categories = compareItems.map(i => i.category?.toUpperCase());
    const isAuto = categories.some(c => ['AUTO', 'CARS', 'TRANSPORT', 'АВТОМОБИЛИ'].includes(c));
    const isRealEstate = categories.some(c => ['REAL_ESTATE', 'APARTMENTS', 'HOUSES', 'НЕДВИЖИМОСТЬ'].includes(c));

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
        { key: 'yearBuilt', label: 'Построен' },
        { key: 'renovation', label: 'Ремонт' },
        { key: 'materials', label: 'Материалы' },
        { key: 'parking', label: 'Парковка' },
    ] : [
        { key: 'brand', label: 'Бренд' },
        { key: 'condition', label: 'Состояние' },
        { key: 'warranty', label: 'Гарантия' },
    ];

    return (
        <div className="bg-[#13111C] min-h-screen relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full" />

            <div className="container mx-auto px-4 py-12 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Link to="/marketplaces" className="h-12 w-12 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-2xl backdrop-blur-xl border border-white/10 transition-all active:scale-95 group">
                                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            </Link>
                            <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Сравнение <span className="text-slate-500">Моделей</span></h1>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest italic bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5">
                            <Scale size={14} className="text-purple-600" /> {compareItems.length} позиции к сравнению
                        </div>
                    </div>
                    <button
                        onClick={clearCompare}
                        className="h-12 px-8 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black uppercase tracking-widest text-[10px] transition-all border border-red-500/20 active:scale-95 italic"
                    >
                        Очистить список
                    </button>
                </div>

                {/* Table Container */}
                <div className="bg-[#191624]/50 backdrop-blur-2xl rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-8 border-b border-r border-white/5 bg-[#13111C]/50 text-left min-w-[240px]">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic mb-2">Технические</div>
                                        <div className="text-xl font-black text-white uppercase tracking-tighter italic">Характеристики</div>
                                    </th>
                                    {compareItems.map(item => (
                                        <th key={item.id} className="p-8 border-b border-white/5 min-w-[320px] relative group/col max-w-[400px]">
                                            <button
                                                onClick={() => removeFromCompare(item.id)}
                                                className="absolute top-6 right-6 h-10 w-10 bg-white/5 text-slate-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-white/5 opacity-0 group-hover/col:opacity-100 scale-90 group-hover/col:scale-100 z-10"
                                            >
                                                <X size={16} />
                                            </button>

                                            <div className="space-y-6">
                                                <div className="aspect-[4/3] rounded-[2rem] overflow-hidden bg-[#13111C] border border-white/5 relative group/img">
                                                    <img src={item.imageUrl || item.image || '/placeholder.png'} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt={item.name} />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#13111C] to-transparent opacity-60" />
                                                </div>

                                                <div className="text-left space-y-2">
                                                    <div className="text-[9px] font-black text-purple-400 uppercase tracking-widest italic">{item.category}</div>
                                                    <h3 className="text-lg font-black text-white uppercase tracking-tighter italic line-clamp-1">{item.name}</h3>
                                                    <div className="flex items-baseline gap-2">
                                                        <div className={cn(
                                                            "text-2xl font-black italic tracking-tighter",
                                                            item.price === minPrice && isPriceDiff ? "text-emerald-400" : "text-white"
                                                        )}>
                                                            {(item.price || 0).toLocaleString()}
                                                        </div>
                                                        <div className="text-xs font-black text-slate-500 uppercase italic">Sum</div>
                                                        {item.price === minPrice && isPriceDiff && (
                                                            <div className="ml-2 bg-emerald-400/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-emerald-400/20 italic">
                                                                Best Price
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => { addToCart(item); toast.success('Добавлено в корзину'); }}
                                                        className="flex-1 h-12 bg-purple-600 hover:bg-purple-500 text-white font-black text-[9px] uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/20 active:scale-95 italic"
                                                    >
                                                        <ShoppingCart size={14} /> Купить
                                                    </button>
                                                    <Link
                                                        to={`/marketplaces/${item.slug || item.id}`}
                                                        className="h-12 px-6 bg-white/5 hover:bg-white/10 text-white font-black text-[9px] uppercase tracking-widest rounded-xl flex items-center justify-center transition-all border border-white/5 active:scale-95 italic"
                                                    >
                                                        Детали
                                                    </Link>
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {/* Trust Signals */}
                                <tr className="bg-white/2">
                                    <td className="p-6 border-r border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-purple-600/10 flex items-center justify-center">
                                                <ShieldCheck size={18} className="text-purple-600" />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Доверие</span>
                                        </div>
                                    </td>
                                    {compareItems.map(item => (
                                        <td key={item.id} className="p-6 text-center">
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {item.isVerified && <span className="text-[8px] bg-emerald-400/10 text-emerald-400 font-black px-3 py-1.5 rounded-full uppercase tracking-widest italic border border-emerald-400/20">Verified</span>}
                                                {item.isOfficial && <span className="text-[8px] bg-purple-600/10 text-purple-400 font-black px-3 py-1.5 rounded-full uppercase tracking-widest italic border border-purple-600/20">Official Dealer</span>}
                                                {!item.isVerified && !item.isOfficial && <Minus size={16} className="text-slate-800 mx-auto" />}
                                            </div>
                                        </td>
                                    ))}
                                </tr>

                                {/* Main Specs Loop */}
                                {specsKeys.map((spec, sIdx) => {
                                    const hasDiff = isDifferent(spec.key);
                                    const allNull = compareItems.every(i => getSpec(i, spec.key) == null);
                                    if (allNull) return null;

                                    return (
                                        <tr key={spec.key} className={cn(
                                            "transition-colors",
                                            hasDiff ? "bg-purple-600/[0.03]" : "hover:bg-white/[0.02]"
                                        )}>
                                            <td className="p-6 border-r border-white/5 relative">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{spec.label}</span>
                                                    {hasDiff && (
                                                        <div className="h-2 w-2 rounded-full bg-purple-600 animate-pulse shadow-[0_0_10px_rgba(147,51,234,1)]" />
                                                    )}
                                                </div>
                                            </td>
                                            {compareItems.map(item => {
                                                const val = getSpec(item, spec.key);
                                                return (
                                                    <td key={item.id} className="p-6 text-center group/cell">
                                                        <span className={cn(
                                                            "text-[10px] font-black uppercase tracking-tight italic transition-colors",
                                                            val != null ? "text-white group-hover/cell:text-purple-400" : "text-slate-800"
                                                        )}>
                                                            {val != null ? val : <Minus size={16} className="mx-auto" />}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}

                                {/* Region & Location */}
                                <tr className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-6 border-r border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">📍 Регион</td>
                                    {compareItems.map(item => (
                                        <td key={item.id} className="p-6 text-center text-[10px] font-black text-white uppercase italic">
                                            {item.region || <Minus size={16} className="text-slate-800 mx-auto" />}
                                        </td>
                                    ))}
                                </tr>

                                {/* Bottom Purchase Row */}
                                <tr className="bg-[#13111C]/30">
                                    <td className="p-6 border-r border-white/5" />
                                    {compareItems.map(item => (
                                        <td key={item.id} className="p-8 text-center">
                                            <button
                                                onClick={() => { addToCart(item); toast.success('Добавлено!'); }}
                                                className="w-full h-14 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all shadow-xl shadow-purple-600/20 active:scale-95 italic group/cta"
                                            >
                                                <Zap size={14} className="inline-block mr-2 group-hover:scale-125 transition-transform" fill="currentColor" /> Купить Сейчас
                                            </button>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-12 flex flex-wrap items-center gap-8 px-8 py-6 bg-white/5 rounded-3xl border border-white/5 w-fit mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,1)] animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Значения отличаются</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Info size={14} className="text-purple-600" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Цены актуальны на момент сравнения</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
