import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Trash2 } from 'lucide-react';

export function HistoryPage() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('recentlyViewed');
            if (stored) {
                setHistory(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to load history", e);
        }
    }, []);

    const clearHistory = () => {
        if (confirm('Очистить историю просмотров?')) {
            localStorage.removeItem('recentlyViewed');
            setHistory([]);
        }
    };

    return (
        <div className="container py-8 px-4 md:px-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Clock className="h-8 w-8 text-primary" /> История просмотров
                    </h1>
                    <p className="text-slate-500 mt-2">Товары, которые вы недавно смотрели</p>
                </div>
                {history.length > 0 && (
                    <button
                        onClick={clearHistory}
                        className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                    >
                        <Trash2 className="h-4 w-4" /> Очистить
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <Clock className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">История пуста</h3>
                    <p className="text-slate-500 mb-6">Вы еще не просматривали товары</p>
                    <Link to="/marketplaces" className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
                        Перейти в каталог
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {history.map((item) => (
                        <Link
                            key={item.id}
                            to={`/marketplaces/${item.id}`}
                            className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col"
                        >
                            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-300 bg-slate-50">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur text-white text-[10px] px-2 py-1 rounded-full font-bold">
                                    {new Date(item.viewedAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="p-4 flex flex-col flex-1">
                                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{item.category}</div>
                                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                    {item.name}
                                </h3>
                                <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                                    <span className="font-bold text-lg text-slate-900">
                                        {item.price?.toLocaleString()} <span className="text-sm font-normal text-slate-500">сум</span>
                                    </span>
                                    <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
