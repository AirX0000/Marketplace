import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

const CATEGORIES = [
    { id: 1, key: "Transport", name: "Transport", sub: ["Avtosalon", "Vtorichka", "Pervichka", "Cars", "Motorcycles", "Trucks"] },
    { id: 2, key: "Недвижимость", name: "Недвижимость", sub: ["Vtorichnye", "Novostroyki", "Nejiloe", "Arenda", "Apartments", "Houses", "Commercial", "Land"] },
    { id: 3, key: "Услуги", name: "Услуги", sub: ["Strahovanie", "Otsenka", "Notarius", "Rieltor", "Services"] },
    { id: 4, key: "Электроника", name: "Электроника", sub: ["Smartphones", "Laptops", "Tablets", "Accessories"] }
];

export function CatalogMenu({ isOpen, onClose }) {
    const [activeCategory, setActiveCategory] = React.useState(CATEGORIES[0]);

    if (!isOpen) return null;

    return (
        <div className="absolute top-[64px] left-0 w-full bg-background border-b shadow-lg z-40 animate-in slide-in-from-top-2 duration-200" onMouseLeave={onClose}>
            <div className="container py-8 px-4 md:px-6">
                <div className="grid grid-cols-4 gap-8">
                    {/* Left Column: Categories */}
                    <div className="col-span-1 border-r pr-4">
                        <ul className="space-y-1">
                            {CATEGORIES.map((cat) => (
                                <li key={cat.id}>
                                    <button
                                        onMouseEnter={() => setActiveCategory(cat)}
                                        className={cn(
                                            "flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-all text-left",
                                            activeCategory.id === cat.id
                                                ? "bg-background border-2 border-emerald-500 text-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        {cat.name}
                                        {activeCategory.id === cat.id && <ChevronRight className="h-4 w-4 text-emerald-500" />}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right Column: Subcategories */}
                    <div className="col-span-3 pl-8">
                        <h3 className="font-bold text-2xl mb-6 tracking-tight">{activeCategory.name}</h3>
                        <div className="grid grid-cols-3 gap-y-4 gap-x-8">
                            {activeCategory.sub.map((sub) => (
                                <Link
                                    key={sub}
                                    to={`/marketplaces?category=${encodeURIComponent(activeCategory.key)}`}
                                    className="text-base text-muted-foreground hover:text-emerald-600 hover:font-medium transition-colors"
                                    onClick={onClose}
                                >
                                    {sub}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper to conditional classes (assuming cn is not imported, if it is imported in file, ignore this comment. 
// Wait, previous file didn't import 'cn'. I need to make sure 'cn' is available or use template literals.)
// Checking imports in original file... it did NOT import `cn`. I must import it or use a utility.
// I see `cn` is used in Header.jsx but not CatalogMenu.jsx. I should import it.
