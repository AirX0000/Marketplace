import React, { useState, useEffect } from 'react';
import { X, Home, Car, Laptop, Briefcase, Building2, Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';

const categoryIcons = {
    'Недвижимость': Building2,
    'Транспорт': Car,
    'Услуги': Briefcase,
    'Электроника': Laptop,
};

const categoryColors = {
    'Недвижимость': 'from-emerald-500/10 to-green-500/10 border-emerald-500/20 hover:border-emerald-500/40',
    'Транспорт': 'from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40',
    'Услуги': 'from-cyan-500/10 to-teal-500/10 border-cyan-500/20 hover:border-cyan-500/40',
    'Электроника': 'from-purple-500/10 to-indigo-500/10 border-purple-500/20 hover:border-purple-500/40',
};

export function CategoryModal({ isOpen, onClose }) {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadCategories();
        }
    }, [isOpen]);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await api.getCategories();
            // Show all categories in the modal, even if empty, to allow browsing
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const translateCategory = (name) => {
        const keyMap = {
            'Транспорт': 'cat_transport',
            'Недвижимость': 'cat_real_estate',
            'Услуги': 'cat_services',
            'Электроника': 'cat_electronics'
        };
        const key = keyMap[name] || name.toLowerCase();
        return t(`ads.${key}`, name);
    };

    if (!isOpen) return null;

    const totalListings = categories.reduce((sum, c) => sum + c.count, 0);

    return (
        <div className="fixed inset-0 z-[500] flex items-end sm:items-start justify-center sm:pt-20 p-0 sm:px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-5xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-700/50 animate-in slide-in-from-bottom sm:slide-in-from-top-10 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary" />
                            {t('common.catalog', 'Каталог товаров')}
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            {totalListings.toLocaleString('ru-RU')} {t('common.listings_count', 'предложений')}
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
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            {t('home.no_products', 'Нет доступных категорий')}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {categories.map((category) => {
                                const Icon = categoryIcons[category.name] || Briefcase;
                                const colorClass = categoryColors[category.name] || 'from-slate-500/10 to-gray-500/10 border-slate-500/20 hover:border-slate-500/40';

                                return (
                                    <Link
                                        key={category.name}
                                        to={`/marketplaces?category=${encodeURIComponent(category.name)}`}
                                        onClick={onClose}
                                        className={`group relative p-6 rounded-xl border-2 bg-gradient-to-br ${colorClass} transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer`}
                                    >
                                        <div className="flex flex-col items-center text-center space-y-3">
                                            <div className="p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                                <Icon className="h-8 w-8 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white text-sm leading-tight">
                                                    {translateCategory(category.name)}
                                                </h3>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {category.count.toLocaleString('ru-RU')} {t('common.offer', 'предложение')}
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
                            to="/marketplaces"
                            onClick={onClose}
                            className="mt-6 flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-600 hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                            <span className="text-slate-300 group-hover:text-primary font-medium">
                                {t('common.view_all_products', 'Посмотреть все товары')}
                            </span>
                            <Sparkles className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
