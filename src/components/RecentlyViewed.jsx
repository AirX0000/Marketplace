import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export function RecentlyViewed({ className }) {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('recentlyViewed');
            if (stored) {
                // Get last 6 items
                setHistory(JSON.parse(stored).slice(0, 6));
            }
        } catch (e) {
            console.error("Failed to load history", e);
        }
    }, []);

    if (history.length === 0) return null;

    return (
        <section className={cn("py-12 border-t border-white/5 bg-black/20", className)}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                            <Clock className="h-6 w-6 text-purple-500" /> Вы недавно смотрели
                        </h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Продолжайте с того места, где остановились</p>
                    </div>
                    <Link to="/profile/browsing" className="text-[10px] font-black text-purple-400 uppercase tracking-widest hover:text-purple-300 transition-colors flex items-center gap-2 group">
                        Вся история <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                    {history.map((item, idx) => (
                        <motion.div
                            key={`${item.id}-${idx}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Link
                                to={`/marketplaces/${item.id}`}
                                className="group block bg-[#191624] border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all"
                            >
                                <div className="aspect-square relative overflow-hidden">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-slate-800 text-slate-600">
                                            No Image
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-3">
                                    <h3 className="text-[10px] font-black text-white uppercase truncate mb-1 group-hover:text-purple-400 transition-colors">
                                        {item.name}
                                    </h3>
                                    <p className="text-[11px] font-black text-purple-400 italic">
                                        {item.price?.toLocaleString()} <span className="text-[8px] opacity-70">Sum</span>
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
