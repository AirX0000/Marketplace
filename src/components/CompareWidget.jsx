import React from 'react';
import { Link } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { useCompare } from '../context/CompareContext';

export function CompareWidget() {
    const { compareItems } = useCompare();

    if (compareItems.length === 0) return null;

    return (
        <Link
            to="/compare"
            className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-slate-900 text-white px-5 py-3 rounded-full shadow-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 group"
        >
            <div className="relative">
                <Scale className="h-5 w-5" />
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-slate-900">
                    {compareItems.length}
                </span>
            </div>
            <span className="font-medium text-sm">Сравнить</span>

            {/* Preview Popup (Hover) */}
            <div className="absolute bottom-full right-0 mb-3 hidden group-hover:block w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transform origin-bottom-right transition-all">
                <div className="p-2 border-b border-slate-100 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Выбрано для сравнения:
                </div>
                <ul className="max-h-48 overflow-y-auto">
                    {compareItems.map(item => (
                        <li key={item.id} className="px-3 py-2 text-xs border-b border-slate-50 dark:border-slate-700/50 last:border-0 truncate text-slate-700 dark:text-slate-300">
                            {item.name}
                        </li>
                    ))}
                </ul>
            </div>
        </Link>
    );
}
