import React from 'react';
import { useCompare } from '../context/CompareContext';
import { Link } from 'react-router-dom';
import { X, Check, Minus } from 'lucide-react';

export function ComparePage() {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();

    if (compareItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl">⚖️</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">Список сравнения пуст</h1>
                <p className="text-slate-500 mb-6 max-w-sm">Добавляйте товары в сравнение из каталога, чтобы увидеть их характеристики бок о бок.</p>
                <Link to="/marketplaces" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                    Перейти в каталог
                </Link>
            </div>
        );
    }

    // Helper to extract nested specs safely
    
    const isDifferent = (specKey) => {
        if (compareItems.length < 2) return false;
        const firstVal = getSpec(compareItems[0], specKey);
        return compareItems.some(item => getSpec(item, specKey) !== firstVal);
    };
    
    const getSpec = (item, key) => {
        try {
            const attrs = typeof item.attributes === 'string' ? JSON.parse(item.attributes) : item.attributes;
            return attrs?.specs?.[key] || <Minus size={16} className="text-slate-300 mx-auto" />;
        } catch {
            return <Minus size={16} className="text-slate-300 mx-auto" />;
        }
    };

    // Determine common keys based on the first item's category
    // Logic: If any item is Auto, show Auto specs. If RE, show RE specs.
    // If mixed, show generic.
    const isAuto = compareItems.some(i => ["Cars", "Transport", "Dealer", "Private Auto", "Автомобили"].includes(i.category));
    const isRealEstate = compareItems.some(i => ["Недвижимость", "Недвижимость", "Apartments", "Houses"].includes(i.category));

    const specsKeys = isAuto ? [
        { key: 'year', label: 'Год выпуска' },
        { key: 'mileage', label: 'Пробег' },
        { key: 'engine', label: 'Двигатель' },
        { key: 'transmission', label: 'Коробка' },
        { key: 'drive', label: 'Привод' },
        { key: 'bodyType', label: 'Кузов' },
        { key: 'color', label: 'Цвет' },
        { key: 'condition', label: 'Состояние' }
    ] : isRealEstate ? [
        { key: 'area', label: 'Площадь' },
        { key: 'rooms', label: 'Комнаты' },
        { key: 'floor', label: 'Этаж' },
        { key: 'yearBuilt', label: 'Год постройки' },
        { key: 'renovation', label: 'Ремонт' },
        { key: 'materials', label: 'Материал' },
        { key: 'parking', label: 'Парковка' }
    ] : [
        { key: 'brand', label: 'Бренд' },
        { key: 'condition', label: 'Состояние' },
        { key: 'warranty', label: 'Гарантия' }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Сравнение товаров</h1>
                <button onClick={clearCompare} className="text-sm font-medium text-red-500 hover:text-red-600 hover:underline">
                    Очистить список
                </button>
            </div>

            
            <div className="overflow-x-auto bg-white rounded-3xl shadow-xl border border-slate-100 mb-12">
                <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-20 bg-white shadow-sm">
                        <tr>
                            <th className="p-6 text-left border-b border-r bg-slate-50/80 backdrop-blur-md w-64 min-w-[256px]">
                                <div className="text-sm font-black text-slate-400 uppercase tracking-widest">Характеристики</div>
                            </th>
                            {compareItems.map(item => (
                                <th key={item.id} className="p-6 border-b min-w-[300px] relative transition-all duration-300">
                                    <button
                                        onClick={() => removeFromCompare(item.id)}
                                        className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-red-500 hover:text-white transition-all z-10"
                                    >
                                        <X size={16} />
                                    </button>
                                    <div className="flex flex-col items-center">
                                        <div className="w-32 h-24 bg-slate-50 rounded-2xl overflow-hidden mb-4 group">
                                            <img src={item.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                                        </div>
                                        <div className="font-black text-slate-900 line-clamp-2 h-10 text-sm mb-2">{item.name}</div>
                                        <div className="text-primary font-black text-lg">{item.price.toLocaleString()} So'm</div>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {/* Highlights row logic can be applied to each specsKeys.map */}

                        {specsKeys.map(spec => (
                            <tr key={spec.key} className={`transition-colors duration-200 ${isDifferent(spec.key) ? 'bg-amber-50/30' : 'hover:bg-slate-50/50'}`}>
                                <td className="p-6 border-r font-bold text-slate-600 flex items-center justify-between">
                                    {spec.label}
                                    {isDifferent(spec.key) && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Есть различия" />}
                                </td>
                                {compareItems.map(item => (
                                    <td key={item.id} className="p-6 text-center text-slate-900 font-medium">
                                        {getSpec(item, spec.key)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
