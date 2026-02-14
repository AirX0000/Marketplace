import React from 'react';

export function SellerTabs({ activeTab, onTabChange }) {
    const tabs = [
        { id: 'products', label: 'Товары' },
        { id: 'about', label: 'О магазине' },
        { id: 'reviews', label: 'Отзывы' }
    ];

    return (
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-[72px] z-30">
            <div className="container mx-auto px-4">
                <div className="flex space-x-8 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                                py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                                ${activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
