import React, { useState, useEffect } from 'react';
import { X, Home, Car, Laptop, Shirt, Sofa, Smartphone, Watch, Book, Dumbbell, Palette, Wrench, Briefcase, Building2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const categoryIcons = {
    'Недвижимость': Building2,
    'Авто': Car,
    'Электроника': Laptop,
    'Одежда': Shirt,
    'Дом и сад': Home,
    'Бытовая техника': Sofa,
    'Телефоны': Smartphone,
    'Часы и украшения': Watch,
    'Книги': Book,
    'Спорт и отдых': Dumbbell,
    'Хобби и творчество': Palette,
    'Ремонт и строительство': Wrench,
    'Для бизнеса': Briefcase,
};

const categoryColors = {
    'Недвижимость': 'from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:border-emerald-500/40',
    'Авто': 'from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40',
    'Электроника': 'from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/40',
    'Одежда': 'from-pink-500/10 to-rose-500/10 border-pink-500/20 hover:border-pink-500/40',
    'Дом и сад': 'from-green-500/10 to-lime-500/10 border-green-500/20 hover:border-green-500/40',
    'Бытовая техника': 'from-orange-500/10 to-amber-500/10 border-orange-500/20 hover:border-orange-500/40',
    'Телефоны': 'from-indigo-500/10 to-blue-500/10 border-indigo-500/20 hover:border-indigo-500/40',
    'Часы и украшения': 'from-yellow-500/10 to-amber-500/10 border-yellow-500/20 hover:border-yellow-500/40',
    'Книги': 'from-slate-500/10 to-gray-500/10 border-slate-500/20 hover:border-slate-500/40',
    'Спорт и отдых': 'from-red-500/10 to-orange-500/10 border-red-500/20 hover:border-red-500/40',
    'Хобби и творчество': 'from-fuchsia-500/10 to-purple-500/10 border-fuchsia-500/20 hover:border-fuchsia-500/40',
    'Ремонт и строительство': 'from-amber-500/10 to-yellow-500/10 border-amber-500/20 hover:border-amber-500/40',
    'Для бизнеса': 'from-cyan-500/10 to-teal-500/10 border-cyan-500/20 hover:border-cyan-500/40',
};

export function CategoryModal({ isOpen, onClose }) {
    const [categories, setCategories] = useState([]);
    const [totalListings, setTotalListings] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadCategories();
        }
    }, [isOpen]);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const response = await api.getMarketplaces({ limit: 1000 });

            // Count items per category
            const categoryCounts = {};
            let total = 0;

            if (response.listings) {
                response.listings.forEach(item => {
                    const category = item.category || 'Другое';
                    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                    total++;
                });
            }

            // Convert to array and sort by count
            const categoryArray = Object.entries(categoryCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count);

            setCategories(categoryArray);
            setTotalListings(total);
        } catch (error) {
            console.error('Failed to load categories:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-5xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 animate-in zoom-in-95 slide-in-from-top-10 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary" />
                            Каталог товаров
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            {totalListings.toLocaleString('ru-RU')} предложений
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-700/50 transition-colors group"
                    >
                        <X className="h-6 w-6 text-slate-400 group-hover:text-white" />
                    </button>
                </div>

                {/* Categories Grid */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="h-32 bg-slate-800/50 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {categories.map((category) => {
                                const Icon = categoryIcons[category.name] || Briefcase;
                                const colorClass = categoryColors[category.name] || 'from-slate-500/10 to-gray-500/10 border-slate-500/20 hover:border-slate-500/40';

                                return (
                                    <Link
                                        key={category.name}
                                        to={`/catalog?category=${encodeURIComponent(category.name)}`}
                                        onClick={onClose}
                                        className={`group relative p-6 rounded-xl border-2 bg-gradient-to-br ${colorClass} transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer`}
                                    >
                                        <div className="flex flex-col items-center text-center space-y-3">
                                            <div className="p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                                <Icon className="h-8 w-8 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white text-sm leading-tight">
                                                    {category.name}
                                                </h3>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {category.count.toLocaleString('ru-RU')} {category.count === 1 ? 'предложение' : category.count < 5 ? 'предложения' : 'предложений'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Hover effect */}
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-white/10 transition-all duration-300" />
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* View All Link */}
                    {!loading && categories.length > 0 && (
                        <Link
                            to="/catalog"
                            onClick={onClose}
                            className="mt-6 flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-600 hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                            <span className="text-slate-300 group-hover:text-primary font-medium">
                                Посмотреть все товары
                            </span>
                            <Sparkles className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
