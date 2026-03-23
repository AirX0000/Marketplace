import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../lib/api';
import { useShop } from '../context/ShopContext';
import {
    Heart, Share2, Lock, Unlock, Search, Loader2,
    LayoutDashboard, ShoppingBag, MessageSquare, Settings,
    Car, Building2, Star, Check, Zap, ExternalLink, Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getImageUrl } from '../lib/utils';

const SIDEBAR_LINKS = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/profile' },
    { icon: Car, label: 'Marketplace', path: '/marketplaces' },
    { icon: Heart, label: 'My Favorites', path: '/favorites', active: true },
    { icon: MessageSquare, label: 'Messages', path: '/chat' },
    { icon: ShoppingBag, label: 'Orders', path: '/orders' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

function FavoriteCard({ item, onRemove }) {
    const imageUrl = getImageUrl(item.images || item.image) || '/images/car_mock.png';
    const isAuto = ['С пробегом', 'Автосалон', 'Новый без пробега', 'Transport', 'Cars'].includes(item.category);
    const isEstate = ['Вторичные', 'Новостройки', 'Нежилое помещение', 'Аренда', 'Участки', 'Недвижимость'].includes(item.category);

    let attrs = {};
    try {
        attrs = typeof item.attributes === 'string' ? JSON.parse(item.attributes) : (item.attributes || {});
        attrs = attrs.specs || attrs;
    } catch (_) {}

    const price = Math.round((item.price || 0) * (1 - (item.discount || 0) / 100));

    return (
        <div className="group bg-[#13111C] border border-white/5 hover:border-purple-500/30 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/20 flex flex-col">
            {/* Image */}
            <div className="relative h-48 overflow-hidden bg-[#0F0D1A]">
                <img
                    src={imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = '/images/car_mock.png'; }}
                />
                {/* Remove btn */}
                <button
                    onClick={() => onRemove(item.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-rose-600/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Heart size={14} fill="white" />
                </button>
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {item.isVerified && (
                        <span className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg flex items-center gap-1">
                            <Check size={10} /> Verified
                        </span>
                    )}
                    {item.isFeatured && (
                        <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg flex items-center gap-1">
                            <Star size={10} /> Official Dealer
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <Link to={`/marketplaces/${item.slug || item.id}`} className="hover:text-purple-400 transition-colors">
                        <h3 className="font-black text-white text-base leading-tight line-clamp-2">{item.name}</h3>
                    </Link>
                    <span className="text-base font-black text-white whitespace-nowrap">${(price / 1000).toFixed(0)}K</span>
                </div>

                <p className="text-xs text-slate-500 mb-3 line-clamp-1">
                    {item.category || 'Marketplace'}
                </p>

                {/* Specs badges */}
                {isAuto && (
                    <div className="flex gap-2 mb-4 flex-wrap">
                        {attrs.year && <div className="bg-white/5 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-wider">YEAR<br /><span className="text-white text-sm">{attrs.year}</span></div>}
                        {attrs.mileage !== undefined && <div className="bg-white/5 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-wider">KM<br /><span className="text-white text-sm">{Number(attrs.mileage).toLocaleString()}</span></div>}
                        {attrs.transmission && <div className="bg-white/5 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-wider">TRANS<br /><span className="text-white text-sm truncate">{attrs.transmission}</span></div>}
                    </div>
                )}
                {isEstate && (
                    <div className="flex gap-2 mb-4 flex-wrap">
                        {attrs.rooms && <div className="bg-white/5 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-wider">ROOMS<br /><span className="text-white text-sm">{attrs.rooms}</span></div>}
                        {attrs.area && <div className="bg-white/5 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-wider">AREA<br /><span className="text-white text-sm">{attrs.area}m²</span></div>}
                    </div>
                )}

                {/* Action buttons */}
                <div className="mt-auto flex gap-2">
                    {isEstate ? (
                        <Link
                            to={`/marketplaces/${item.slug || item.id}`}
                            className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            <ExternalLink size={14} /> Contact Agent
                        </Link>
                    ) : (
                        <Link
                            to={`/marketplaces/${item.slug || item.id}`}
                            className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            <ShoppingBag size={14} /> Add to Cart
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

export function FavoritesPage() {
    const [favoritesList, setFavoritesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const { favorites, toggleFavorite } = useShop();

    useEffect(() => {
        async function load() {
            try {
                const [favData, userData] = await Promise.all([
                    api.getFavorites(),
                    api.getProfile()
                ]);
                setFavoritesList(favData || []);
                setUserProfile(userData);
            } catch (error) {
                console.error('Failed to load data', error);
                setFavoritesList([]);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [favorites]);

    const togglePrivacy = async () => {
        try {
            const updated = await api.toggleWishlistPrivacy();
            setUserProfile(prev => ({ ...prev, isWishlistPublic: updated.isWishlistPublic }));
            toast.success(updated.isWishlistPublic ? 'Список желаний теперь публичный' : 'Список желаний скрыт');
        } catch {
            toast.error('Ошибка обновления настроек');
        }
    };

    const copyShareLink = () => {
        const url = `${window.location.origin}/wishlist/${userProfile?.id}`;
        navigator.clipboard.writeText(url);
        toast.success('Ссылка скопирована!');
    };

    const handleRemove = async (id) => {
        try {
            await api.removeFavorite(id);
            setFavoritesList(prev => prev.filter(f => f.id !== id));
            toast.success('Удалено из избранного');
        } catch {
            toast.error('Ошибка удаления');
        }
    };

    const AUTO_CATS = ['С пробегом', 'Автосалон', 'Новый без пробега', 'Transport', 'Cars', 'Мотоциклы', 'Спецтехника'];
    const ESTATE_CATS = ['Вторичные', 'Новостройки', 'Нежилое помещение', 'Аренда', 'Участки', 'Недвижимость'];

    const filtered = useMemo(() => {
        let list = favoritesList;
        if (activeFilter === 'cars') list = list.filter(f => AUTO_CATS.includes(f.category));
        if (activeFilter === 'estate') list = list.filter(f => ESTATE_CATS.includes(f.category));
        if (searchQuery) list = list.filter(f => f.name?.toLowerCase().includes(searchQuery.toLowerCase()));
        return list;
    }, [favoritesList, activeFilter, searchQuery]);

    return (
        <div className="min-h-screen bg-[#0F0D1A] text-slate-200 font-sans flex">
            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-[#13111C] border-r border-white/5 p-6 shrink-0 sticky top-0 h-screen">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                        <Car size={18} className="text-white" />
                    </div>
                    <div>
                        <div className="font-black text-white text-sm tracking-wide">Autohouse</div>
                        <div className="text-[10px] text-blue-400 font-bold">Premium Marketplace</div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-1">
                    {SIDEBAR_LINKS.map(({ icon: Icon, label, path, active }) => (
                        <Link
                            key={label}
                            to={path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon size={18} />
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* Upgrade CTA */}
                <div className="mt-auto p-4 bg-blue-600 rounded-2xl text-white">
                    <Zap size={18} className="mb-2" />
                    <p className="text-sm font-black mb-1">Upgrade to VIP</p>
                    <p className="text-[11px] text-blue-200 mb-3">Get exclusive early access to luxury listings.</p>
                    <button className="w-full py-2 bg-white text-blue-600 rounded-xl text-xs font-black hover:bg-blue-50 transition-colors">
                        Upgrade Now
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-y-auto">
                {/* Top Bar */}
                <header className="sticky top-0 z-10 bg-[#0F0D1A]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center gap-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search saved listings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {userProfile && (
                        <div className="flex items-center gap-2 ml-auto">
                            {/* Privacy toggle */}
                            <button
                                onClick={togglePrivacy}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${userProfile.isWishlistPublic
                                    ? 'bg-blue-600/20 text-blue-400 border-blue-600/30'
                                    : 'bg-white/5 text-slate-400 border-white/10'
                                    }`}
                            >
                                {userProfile.isWishlistPublic ? <Unlock size={14} /> : <Lock size={14} />}
                                {userProfile.isWishlistPublic ? 'Public' : 'Private'}
                            </button>

                            {userProfile.isWishlistPublic && (
                                <button
                                    onClick={copyShareLink}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
                                >
                                    <Share2 size={14} /> Share Wishlist
                                </button>
                            )}
                        </div>
                    )}
                </header>

                <div className="p-6">
                    {/* Page Title */}
                    <div className="mb-8 flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-white flex items-center gap-2">
                                My Favorites
                                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></span>
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">Manage your saved luxury vehicles and curated real estate portfolio.</p>
                        </div>

                        {/* Filter tabs */}
                        <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
                            {[['all', 'All Items'], ['cars', 'Cars'], ['estate', 'Real Estate']].map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveFilter(key)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeFilter === key
                                        ? 'bg-white text-slate-900 shadow-md'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <Loader2 size={32} className="animate-spin text-blue-500" />
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filtered.map(item => (
                                <FavoriteCard key={item.id} item={item} onRemove={handleRemove} />
                            ))}
                            {/* Add empty slot */}
                            <div className="border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center h-48 hover:border-blue-500/30 transition-colors cursor-pointer group">
                                <div className="text-center">
                                    <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-blue-600/20 flex items-center justify-center mx-auto mb-2 transition-colors">
                                        <span className="text-2xl text-slate-500 group-hover:text-blue-400 transition-colors">+</span>
                                    </div>
                                    <p className="text-xs text-slate-500 group-hover:text-blue-400 transition-colors font-medium">Browse more</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-24">
                            <Heart size={48} className="text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold text-lg">
                                {searchQuery ? 'Нет результатов' : 'Ваш список избранного пуст'}
                            </p>
                            <p className="text-slate-600 text-sm mt-2 mb-6">
                                {searchQuery ? 'Попробуйте другой запрос' : 'Добавляйте объявления в избранное, нажимая на ♡'}
                            </p>
                            <Link to="/marketplaces" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors">
                                <Car size={16} /> Перейти в каталог
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
