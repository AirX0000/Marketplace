import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

export function CatalogMenu({ isOpen, onClose }) {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadCategories();
        }
    }, [isOpen]);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await api.getCategories();
            // Filter categories with at least 1 product
            const activeCats = data.filter(c => c.count > 0);
            setCategories(activeCats);
            if (activeCats.length > 0) {
                setActiveCategory(activeCats[0]);
            }
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

    const translateSubcategory = (name) => {
        // Many subcategories are already in translations under ads.sub_...
        // We can try to map them or use them as is
        const subKeyMap = {
            'Бозор (Авто с пробегом)': 'sub_used_cars',
            'Автосалон (Новые авто)': 'sub_new_cars',
            'Мотоциклы': 'sub_moto',
            'Спецтехника': 'sub_special',
            'Вторичное жильё': 'sub_resale',
            'Новостройки': 'sub_new_build',
            'Аренда': 'sub_rent',
            'Участки': 'sub_land',
            'Коммерческая недвижимость': 'sub_commercial'
        };
        const key = subKeyMap[name];
        return key ? t(`ads.${key}`, name) : name;
    };

    if (!isOpen) return null;

    return (
        <div className="absolute top-[64px] left-0 w-full bg-background border-b shadow-lg z-40 animate-in slide-in-from-top-2 duration-200" onMouseLeave={onClose}>
            <div className="container py-8 px-4 md:px-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        {t('home.no_products', 'Нет доступных категорий')}
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-8">
                        {/* Left Column: Categories */}
                        <div className="col-span-1 border-r pr-4">
                            <ul className="space-y-1">
                                {categories.map((cat) => (
                                    <li key={cat.id}>
                                        <button
                                            onMouseEnter={() => setActiveCategory(cat)}
                                            className={cn(
                                                "flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-all text-left",
                                                activeCategory?.id === cat.id
                                                    ? "bg-background border-2 border-emerald-500 text-foreground shadow-sm"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            {translateCategory(cat.name)}
                                            {activeCategory?.id === cat.id && <ChevronRight className="h-4 w-4 text-emerald-500" />}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right Column: Subcategories */}
                        <div className="col-span-3 pl-8">
                            <h3 className="font-bold text-2xl mb-6 tracking-tight">
                                {activeCategory ? translateCategory(activeCategory.name) : ""}
                            </h3>
                            <div className="grid grid-cols-3 gap-y-4 gap-x-8">
                                {activeCategory?.sub?.map((sub) => (
                                    <Link
                                        key={sub}
                                        to={`/marketplaces?category=${encodeURIComponent(activeCategory.name)}&subcategory=${encodeURIComponent(sub)}`}
                                        className="text-base text-muted-foreground hover:text-emerald-600 hover:font-medium transition-colors"
                                        onClick={onClose}
                                    >
                                        {translateSubcategory(sub)}
                                    </Link>
                                ))}
                                {(!activeCategory?.sub || activeCategory.sub.length === 0) && (
                                    <Link
                                        to={`/marketplaces?category=${encodeURIComponent(activeCategory?.name)}`}
                                        className="text-base text-muted-foreground hover:text-emerald-600 hover:font-medium transition-colors"
                                        onClick={onClose}
                                    >
                                        {t('common.view_all', 'Посмотреть все')}
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper to conditional classes (assuming cn is not imported, if it is imported in file, ignore this comment. 
// Wait, previous file didn't import 'cn'. I need to make sure 'cn' is available or use template literals.)
// Checking imports in original file... it did NOT import `cn`. I must import it or use a utility.
// I see `cn` is used in Header.jsx but not CatalogMenu.jsx. I should import it.
