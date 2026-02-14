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
    const isRealEstate = compareItems.some(i => ["Real Estate", "Недвижимость", "Apartments", "Houses"].includes(i.category));

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

            <div className="overflow-x-auto pb-4">
                <table className="w-full min-w-[800px] border-collapse">
                    <thead>
                        <tr>
                            <th className="p-4 w-48 bg-slate-50 border-b border-r text-left font-medium text-slate-500">Характеристики</th>
                            {compareItems.map(item => (
                                <th key={item.id} className="p-4 border-b min-w-[250px] relative align-top">
                                    <button
                                        onClick={() => removeFromCompare(item.id)}
                                        className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                    <Link to={`/marketplaces/${item.id}`} className="block group">
                                        <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-slate-100">
                                            <img src={item.image || item.activeImage} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        </div>
                                        <div className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">{item.name}</div>
                                        <div className="text-xl font-black text-blue-600">{item.price?.toLocaleString()} UZS</div>
                                    </Link>
                                </th>
                            ))}
                            {/* Empty Placeholders to fill up to 3 */}
                            {[...Array(3 - compareItems.length)].map((_, i) => (
                                <th key={i} className="p-4 border-b min-w-[250px] align-middle">
                                    <div className="border-2 border-dashed border-slate-200 rounded-2xl h-64 flex flex-col items-center justify-center text-slate-400">
                                        <span className="text-4xl mb-2">+</span>
                                        <span className="text-sm font-medium">Добавить</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="hover:bg-slate-50/50">
                            <td className="p-4 border-b border-r font-medium text-slate-600">Категория</td>
                            {compareItems.map(item => (
                                <td key={item.id} className="p-4 border-b text-center font-medium">
                                    <span className="px-3 py-1 bg-slate-100 rounded-full text-xs">
                                        {item.category}
                                    </span>
                                </td>
                            ))}
                            {[...Array(3 - compareItems.length)].map((_, i) => <td key={i} className="border-b"></td>)}
                        </tr>
                        {specsKeys.map(spec => (
                            <tr key={spec.key} className="hover:bg-slate-50/50">
                                <td className="p-4 border-b border-r font-medium text-slate-600">{spec.label}</td>
                                {compareItems.map(item => (
                                    <td key={item.id} className="p-4 border-b text-center text-slate-800">
                                        {getSpec(item, spec.key)}
                                    </td>
                                ))}
                                {[...Array(3 - compareItems.length)].map((_, i) => <td key={i} className="border-b"></td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
