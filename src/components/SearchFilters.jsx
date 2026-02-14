
import React from 'react';
import { X, Check } from 'lucide-react';

const ATTRIBUTE_FACETS = [
    {
        id: 'brand',
        label: 'Бренд',
        options: ['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Xiaomi']
    },
    {
        id: 'color',
        label: 'Цвет',
        options: ['Black', 'White', 'Silver', 'Gold', 'Blue', 'Red', 'Natural Titanium', 'Midnight']
    },
    {
        id: 'storage',
        label: 'Память',
        options: ['64GB', '128GB', '256GB', '512GB', '1TB']
    },
    {
        id: 'size',
        label: 'Размер (Одежда/Обувь)',
        options: ['S', 'M', 'L', 'XL', '40', '41', '42', '43', '44']
    }
];

export function SearchFilters({ filters, onChange, onClose }) {

    const handleAttributeChange = (key, value) => {
        // Toggle logic or Single Select logic? 
        // For simple MVP let's do Single Select per attribute for now to match backend 'equals' logic
        // If same value clicked, unset it
        const currentVal = filters[`attr_${key}`];
        if (currentVal === value) {
            onChange(`attr_${key}`, '');
        } else {
            onChange(`attr_${key}`, value);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between md:hidden">
                <h3 className="font-bold text-lg">Фильтры</h3>
                <button onClick={onClose}><X /></button>
            </div>

            {/* Standard Filters */}
            <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Основные</h4>

                <div>
                    <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">Категория</label>
                    <select
                        value={filters.category}
                        onChange={(e) => onChange('category', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm bg-background text-slate-900 dark:text-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                        <option value="">Все категории</option>
                        <option value="Electronics">Электроника</option>
                        <option value="Appliances">Бытовая техника</option>
                        <option value="Clothing">Одежда</option>
                        <option value="Home & Garden">Дом и Сад</option>
                        <option value="Beauty & Health">Красота и Здоровье</option>
                        <option value="Real Estate">Недвижимость</option>
                        <option value="Transport">Транспорт</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">Цена (сум)</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="От"
                            value={filters.minPrice || ''}
                            onChange={(e) => onChange('minPrice', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 dark:text-white bg-transparent dark:bg-slate-800 border-slate-200 dark:border-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                        <input
                            type="number"
                            placeholder="До"
                            value={filters.maxPrice || ''}
                            onChange={(e) => onChange('maxPrice', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 dark:text-white bg-transparent dark:bg-slate-800 border-slate-200 dark:border-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* AUTO SPECIFIC FILTERS */}
            {['Transport', 'Cars', 'Автомобили'].includes(filters.category) && (
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Авто параметры</h4>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">Год выпуска</label>
                        <div className="flex gap-2">
                            <input
                                type="number" placeholder="С"
                                value={filters.minYear || ''}
                                onChange={(e) => onChange('minYear', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                            <input
                                type="number" placeholder="По"
                                value={filters.maxYear || ''}
                                onChange={(e) => onChange('maxYear', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">Пробег (км)</label>
                        <div className="flex gap-2">
                            <input
                                type="number" placeholder="От"
                                value={filters.minMileage || ''}
                                onChange={(e) => onChange('minMileage', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                            <input
                                type="number" placeholder="До"
                                value={filters.maxMileage || ''}
                                onChange={(e) => onChange('maxMileage', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">Коробка</label>
                        <select
                            value={filters.transmission || ''}
                            onChange={(e) => onChange('transmission', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm bg-background dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                            <option value="">Любая</option>
                            <option value="Автомат">Автомат</option>
                            <option value="Механика">Механика</option>
                            <option value="Робот">Робот</option>
                            <option value="Вариатор">Вариатор</option>
                        </select>
                    </div>
                </div>
            )}

            {/* REAL ESTATE SPECIFIC FILTERS */}
            {['Real Estate', 'Apartments', 'Houses', 'Недвижимость'].includes(filters.category) && (
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Недвижимость</h4>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">Площадь (м²)</label>
                        <div className="flex gap-2">
                            <input
                                type="number" placeholder="От"
                                value={filters.minArea || ''}
                                onChange={(e) => onChange('minArea', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                            <input
                                type="number" placeholder="До"
                                value={filters.maxArea || ''}
                                onChange={(e) => onChange('maxArea', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">Комнаты</label>
                        <div className="flex flex-wrap gap-2">
                            {['1', '2', '3', '4', '5+'].map(r => (
                                <button
                                    key={r}
                                    onClick={() => onChange('rooms', filters.rooms === r ? '' : r)}
                                    className={`w-10 h-10 rounded-lg border text-sm font-medium transition-all ${filters.rooms === r
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">Этаж</label>
                        <div className="flex gap-2">
                            <input
                                type="number" placeholder="Этаж"
                                value={filters.floor || ''}
                                onChange={(e) => onChange('floor', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-transparent dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Dynamic Attribute Facets (Generic) */}
            <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Дополнительно</h4>

                {ATTRIBUTE_FACETS.map(facet => (
                    <div key={facet.id}>
                        <h5 className="font-medium text-sm mb-3">{facet.label}</h5>
                        <div className="flex flex-wrap gap-2">
                            {facet.options.map(opt => {
                                const isActive = filters[`attr_${facet.id}`] === opt;
                                return (
                                    <button
                                        key={opt}
                                        onClick={() => handleAttributeChange(facet.id, opt)}
                                        className={`px-3 py-1.5 text-xs rounded-full border transition-all ${isActive
                                            ? 'bg-primary text-white border-primary ring-2 ring-primary/20'
                                            : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => onChange('reset', null)}
                className="w-full py-2.5 text-sm font-medium text-red-600 border border-red-100 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
                Сбросить все
            </button>
        </div>
    );
}
