import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';
import { Megaphone, Eye, Users, MoreVertical, Plus, TrendingUp, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MyListings() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All Ads');

    useEffect(() => {
        // Simulated or real fetch
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            setLoading(true);
            // Replace with actual API call if available
            // const data = await api.getMyListings(); 
            // setListings(data);

            // Dummy data based on the mockup for visual completion
            setListings([
                {
                    id: '1',
                    title: '2023 Porsche 911 Turbo S',
                    category: 'Luxury Cars',
                    postedDate: 'Posted 2 days ago',
                    price: 216500,
                    status: 'Active',
                    views: '1.2K',
                    favorites: 84,
                    image: 'https://images.unsplash.com/photo-1503376712351-409fc2208ebd?q=80&w=200&auto=format&fit=crop'
                },
                {
                    id: '2',
                    title: 'Skyline Penthouse Apartment',
                    category: 'Real Estate',
                    postedDate: 'Posted 1 week ago',
                    price: 1250000,
                    status: 'Pending',
                    views: '3.4K',
                    favorites: 212,
                    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=200&auto=format&fit=crop'
                },
                {
                    id: '3',
                    title: '2022 Tesla Model 3 Long Range',
                    category: 'Electric Cars',
                    postedDate: 'Posted 3 weeks ago',
                    price: 42000,
                    status: 'Expired',
                    views: 850,
                    favorites: 32,
                    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=200&auto=format&fit=crop'
                },
                {
                    id: '4',
                    title: '2021 BMW M4 Coupe',
                    category: 'Luxury Cars',
                    postedDate: 'Sold last month',
                    price: 78900,
                    status: 'Sold',
                    views: '2.1K',
                    favorites: 145,
                    image: 'https://images.unsplash.com/photo-1618151313451-ea28a55ed2e4?q=80&w=200&auto=format&fit=crop'
                }
            ]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 text-white w-full">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 className="text-4xl font-black mb-3 tracking-tight">Мои Объявления</h2>
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-widest opacity-70">Управление и аналитика ваших лотов</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-4 items-center w-full lg:w-auto"
                >
                    <div className="relative w-full lg:w-72 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Поиск лотов..."
                            className="w-full bg-[#191624] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-purple-500/50 transition-all placeholder-slate-600 font-bold"
                        />
                    </div>
                    <Link to="/post-ad" className="whitespace-nowrap flex items-center gap-3 bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-2xl text-sm font-black transition-all shadow-[0_15px_30px_rgba(147,51,234,0.3)] active:scale-95 uppercase tracking-widest">
                        <Plus size={20} strokeWidth={3} /> Подать объявление
                    </Link>
                </motion.div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard
                    icon={<Megaphone size={24} className="text-purple-400" />}
                    title="Активные"
                    value="12"
                    trend="+5.2%"
                    color="purple"
                />
                <StatCard
                    icon={<Eye size={24} className="text-blue-400" />}
                    title="Просмотры"
                    value="4.8K"
                    trend="+12.4%"
                    color="blue"
                />
                <StatCard
                    icon={<Users size={24} className="text-emerald-400" />}
                    title="Лиды"
                    value="156"
                    trend="+8.1%"
                    color="emerald"
                />
            </div>

            {/* Main Listings Table/List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#191624] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative"
            >
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 blur-[100px] pointer-events-none" />

                {/* Tabs */}
                <div className="flex gap-10 px-10 pt-8 border-b border-white/5 overflow-x-auto no-scrollbar">
                    {['All Ads', 'Active (8)', 'Pending (2)', 'Sold (2)'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-5 text-sm font-black transition-all relative uppercase tracking-widest ${activeTab === tab ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTabListings"
                                    className="absolute bottom-0 left-0 w-full h-[3px] bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.6)] rounded-t-full"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Table Header */}
                <div className="hidden lg:grid grid-cols-12 gap-6 px-10 py-6 border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    <div className="col-span-4">Информация о лоте</div>
                    <div className="col-span-2">Цена</div>
                    <div className="col-span-2">Статус</div>
                    <div className="col-span-2">Аналитика</div>
                    <div className="col-span-2 text-right">Опции</div>
                </div>

                {/* Listings Rows */}
                <div className="divide-y divide-white/5">
                    <AnimatePresence mode='popLayout'>
                        {listings.map((item, index) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="grid grid-cols-12 gap-4 lg:gap-6 px-6 lg:px-10 py-8 items-center hover:bg-white/[0.02] transition-all group"
                            >
                                {/* Product Info */}
                                <div className="col-span-12 lg:col-span-4 flex items-center gap-4 lg:gap-6">
                                    <div className="min-w-[64px] w-[64px] h-[64px] lg:min-w-[70px] lg:w-[70px] lg:h-[70px] rounded-[1.2rem] lg:rounded-[1.5rem] overflow-hidden bg-[#13111C] p-1 border border-white/10 group-hover:border-purple-500/50 transition-all shadow-xl">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-[1rem] lg:rounded-[1.2rem] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black text-white truncate text-base lg:text-lg group-hover:text-purple-400 transition-colors uppercase tracking-tight">{item.title}</h4>
                                        <div className="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-widest flex items-center gap-2">
                                            <span className="text-purple-500">{item.category}</span>
                                            <span className="hidden sm:inline w-1 h-1 bg-slate-700 rounded-full" />
                                            <span className="truncate">{item.postedDate}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="col-span-6 lg:col-span-2 flex items-center">
                                    <div className="text-lg lg:text-xl font-black text-white tracking-tighter">
                                        ${item.price.toLocaleString()}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="col-span-6 lg:col-span-2 flex items-center">
                                    <StatusBadge status={item.status} />
                                </div>

                                {/* Performance */}
                                <div className="col-span-12 lg:col-span-2 flex items-center lg:justify-start gap-5 lg:gap-6 text-[10px] lg:text-xs text-slate-400 font-black uppercase tracking-widest py-4 lg:py-0 border-y lg:border-none border-white/5 lg:border-transparent mt-4 lg:mt-0">
                                    <div className="flex items-center gap-2 group/stat" title="Views">
                                        <Eye size={16} className="text-slate-600 group-hover/stat:text-blue-400 transition-colors" />
                                        <span>{item.views}</span>
                                    </div>
                                    <div className="flex items-center gap-2 group/stat" title="Favorites">
                                        <HeartIcon size={16} className="text-slate-600 group-hover/stat:text-pink-400 transition-colors" />
                                        <span>{item.favorites}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="col-span-12 lg:col-span-2 flex items-center justify-end gap-2 lg:gap-3 mt-6 lg:mt-0">
                                    {item.status === 'Sold' ? (
                                        <button className="flex-1 lg:flex-none px-6 py-3 rounded-xl border border-white/5 bg-white/5 text-[10px] font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest">
                                            Детали
                                        </button>
                                    ) : item.status === 'Expired' ? (
                                        <div className="flex gap-2 w-full lg:w-auto">
                                            <button className="flex-1 lg:flex-none px-5 py-3 rounded-xl bg-purple-600 text-white text-[10px] font-black hover:bg-purple-500 transition-all uppercase tracking-widest shadow-lg shadow-purple-600/20">
                                                Переподать
                                            </button>
                                            <button className="p-3 rounded-xl border border-white/5 bg-white/5 text-slate-400 hover:text-white transition-all">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 w-full lg:w-auto">
                                            <button className="flex-1 lg:flex-none px-5 py-3 rounded-xl border border-white/5 bg-white/5 text-[10px] font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest">
                                                Изменить
                                            </button>
                                            <button className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10">
                                                <TrendingUp size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Pagination Footer */}
                <div className="px-10 py-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Показано 4 из 12 лотов</div>
                    <div className="flex items-center gap-3">
                        <button className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-slate-400">&lt;</button>
                        <button className="w-12 h-12 rounded-2xl flex items-center justify-center bg-purple-600 text-white font-black shadow-[0_10px_20px_rgba(147,51,234,0.3)] border border-purple-500">1</button>
                        <button className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-slate-400 font-bold">2</button>
                        <button className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-slate-400 font-bold">3</button>
                        <button className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-slate-400">&gt;</button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// Mini Icon
function HeartIcon({ size, className }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    );
}

function StatCard({ icon, title, value, trend, color }) {
    const shadowColor = {
        purple: 'shadow-purple-500/10',
        blue: 'shadow-blue-500/10',
        emerald: 'shadow-emerald-500/10'
    }[color];

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`bg-[#191624] border border-white/5 rounded-[2rem] p-8 shadow-2xl ${shadowColor} flex flex-col justify-between group cursor-default`}
        >
            <div className="flex justify-between items-start mb-8">
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>
                <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-2 uppercase tracking-widest border border-emerald-500/10 group-hover:border-emerald-500/30 transition-all">
                    <TrendingUp size={12} strokeWidth={3} /> {trend}
                </div>
            </div>
            <div>
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60 group-hover:opacity-100 transition-opacity">{title}</div>
                <div className="text-4xl font-black text-white tracking-tighter group-hover:text-purple-400 transition-colors">{value}</div>
            </div>
        </motion.div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        Active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10',
        Pending: 'bg-orange-500/10 text-orange-400 border border-orange-500/10',
        Expired: 'bg-red-500/10 text-red-400 border border-red-500/10',
        Sold: 'bg-white/5 text-slate-400 border border-white/5'
    };

    return (
        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${styles[status] || styles.Expired}`}>
            {status === 'Active' ? 'Активен' :
                status === 'Pending' ? 'Ожидание' :
                    status === 'Expired' ? 'Истек' : 'Продано'}
        </span>
    );
}
