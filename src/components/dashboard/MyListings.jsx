import { Megaphone, Eye, Users, MoreVertical, Plus, TrendingUp, Search, Trash2, Edit2, ExternalLink, Heart, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ListingModal } from './ListingModal';
import { useShop } from '../../context/ShopContext';

export function MyListings() {
    const navigate = useNavigate();
    const { user } = useShop();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All Ads');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingListing, setEditingListing] = useState(null);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const data = await api.getMyListings();
            // Data mapping to match our visual item structure
            setListings(data.map(item => ({
                id: item.id,
                title: item.name,
                category: item.category?.name || 'General',
                postedDate: `Posted ${new Date(item.createdAt).toLocaleDateString()}`,
                price: item.price,
                status: item.status === 'APPROVED' ? 'Active' :
                    item.status === 'PENDING' ? 'Pending' :
                        item.status === 'EXPIRED' ? 'Expired' : 'Rejected',
                views: item.viewsCount || 0,
                favorites: item.favoriteCount || 0,
                image: item.images ? JSON.parse(item.images)[0] : (item.image || 'https://images.unsplash.com/photo-1503376712351-409fc2208ebd?q=80&w=200&auto=format&fit=crop'),
                originalData: item
            })));
        } catch (error) {
            console.error('Failed to fetch listings:', error);
            toast.error('Не удалось загрузить объявления');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Вы уверены, что хотите удалить это объявление?')) return;
        try {
            await api.deleteListing(id);
            setListings(prev => prev.filter(l => l.id !== id));
            toast.success('Объявление удалено');
        } catch (error) {
            toast.error('Ошибка при удалении');
        }
    };

    const handleRelist = async (listing) => {
        try {
            await api.updateListing(listing.id, { status: 'PENDING' });
            toast.success('Отправлено на перепроверку');
            fetchListings();
        } catch (error) {
            toast.error('Ошибка обновления');
        }
    };

    const filteredListings = listings.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const statusMap = {
            'Active (8)': 'Active',
            'Pending (2)': 'Pending',
            'Sold (2)': 'Sold' // Our dummy status
        };
        const tabStatus = activeTab.split(' ')[0];
        const matchesTab = tabStatus === 'All' || item.status.includes(tabStatus);
        return matchesSearch && matchesTab;
    });

    const stats = {
        active: listings.filter(l => l.status === 'Active').length,
        views: listings.reduce((acc, l) => acc + (parseInt(l.views) || 0), 0),
        favorites: listings.reduce((acc, l) => acc + (parseInt(l.favorites) || 0), 0)
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
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                    value={stats.active}
                    trend="+1"
                    color="purple"
                />
                <StatCard
                    icon={<Eye size={24} className="text-blue-400" />}
                    title="Просмотры"
                    value={stats.views}
                    trend="+5%"
                    color="blue"
                />
                <StatCard
                    icon={<Users size={24} className="text-emerald-400" />}
                    title="Избранное"
                    value={stats.favorites}
                    trend="+2"
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
                    {['All Ads', 'Active', 'Pending', 'Sold'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-5 text-sm font-black transition-all relative uppercase tracking-widest ${activeTab === tab || (tab === 'All Ads' && activeTab === 'All') ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {tab}
                            {(activeTab === tab || (tab === 'All Ads' && activeTab === 'All')) && (
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
                <div className="divide-y divide-white/5 min-h-[400px]">
                    <AnimatePresence mode='popLayout'>
                        {filteredListings.length > 0 ? filteredListings.map((item, index) => (
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
                                    <div className="min-w-[64px] w-[64px] h-[64px] lg:min-w-[80px] lg:w-[80px] lg:h-[80px] rounded-[1.2rem] lg:rounded-[1.8rem] overflow-hidden bg-[#13111C] p-1 border border-white/5 group-hover:border-purple-500/50 transition-all shadow-2xl relative">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-[1rem] lg:rounded-[1.5rem] opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-black text-white truncate text-base lg:text-lg group-hover:text-purple-400 transition-colors uppercase tracking-tight leading-tight">{item.title}</h4>
                                        <div className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-[0.15em] flex items-center flex-wrap gap-2">
                                            <span className="text-purple-500/80">{item.category}</span>
                                            <span className="w-1 h-1 bg-slate-800 rounded-full" />
                                            <span className="opacity-60">{item.postedDate}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="col-span-6 lg:col-span-2 flex flex-col justify-center">
                                    <div className="text-[9px] lg:hidden font-black text-slate-600 uppercase tracking-widest mb-1">Цена</div>
                                    <div className="text-xl lg:text-2xl font-black text-white tracking-tighter bg-clip-text">
                                        ${item.price.toLocaleString()}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="col-span-6 lg:col-span-2 flex flex-col justify-center">
                                    <div className="text-[9px] lg:hidden font-black text-slate-600 uppercase tracking-widest mb-1">Статус</div>
                                    <div>
                                        <StatusBadge status={item.status} />
                                    </div>
                                </div>

                                {/* Performance */}
                                <div className="col-span-12 lg:col-span-2 flex items-center lg:justify-start gap-8 text-[11px] text-slate-400 font-black uppercase tracking-widest py-5 lg:py-0 border-y lg:border-none border-white/5 lg:border-transparent mt-4 lg:mt-0">
                                    <div className="flex items-center gap-3 group/stat cursor-help" title="Views">
                                        <div className="w-8 h-8 rounded-xl bg-blue-500/5 flex items-center justify-center group-hover/stat:bg-blue-500/10 transition-colors">
                                            <Eye size={16} className="text-slate-600 group-hover/stat:text-blue-400 transition-colors" />
                                        </div>
                                        <span className="group-hover/stat:text-blue-100 transition-colors">{item.views}</span>
                                    </div>
                                    <div className="flex items-center gap-3 group/stat cursor-help" title="Favorites">
                                        <div className="w-8 h-8 rounded-xl bg-pink-500/5 flex items-center justify-center group-hover/stat:bg-pink-500/10 transition-colors">
                                            <Heart size={16} className="text-slate-600 group-hover/stat:text-pink-400 transition-colors" />
                                        </div>
                                        <span className="group-hover/stat:text-pink-100 transition-colors">{item.favorites}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="col-span-12 lg:col-span-2 flex items-center justify-end gap-3 mt-6 lg:mt-0">
                                    {item.status === 'Sold' ? (
                                        <button
                                            onClick={() => navigate(`/marketplace/${item.id}`)}
                                            className="flex-1 lg:flex-none px-8 py-4 rounded-2xl border border-white/5 bg-white/5 text-[10px] font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest active:scale-95">
                                            Детали
                                        </button>
                                    ) : item.status === 'Expired' ? (
                                        <div className="flex gap-3 w-full lg:w-auto">
                                            <button
                                                onClick={() => handleRelist(item)}
                                                className="flex-1 lg:flex-none px-6 py-4 rounded-2xl bg-purple-600 text-white text-[10px] font-black hover:bg-purple-500 transition-all uppercase tracking-widest shadow-xl shadow-purple-600/20 active:scale-95">
                                                Переподать
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-xl shadow-red-500/10">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3 w-full lg:w-auto">
                                            <button
                                                onClick={() => setEditingListing(item.originalData)}
                                                className="flex-1 lg:flex-none px-6 py-4 rounded-2xl border border-white/10 bg-white/5 text-[10px] font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest active:scale-95">
                                                Изменить
                                            </button>
                                            <button
                                                onClick={() => navigate(`/marketplace/${item.id}`)}
                                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-emerald-500/10 active:scale-90">
                                                <ExternalLink size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                <Package className="w-12 h-12 mb-4 opacity-20" />
                                <p className="font-bold uppercase tracking-widest text-xs opacity-50">Объявления не найдены</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Edit Modal */}
                {editingListing && (
                    <ListingModal
                        listing={editingListing}
                        onClose={() => setEditingListing(null)}
                        onSave={() => {
                            setEditingListing(null);
                            fetchListings();
                        }}
                    />
                )}

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
