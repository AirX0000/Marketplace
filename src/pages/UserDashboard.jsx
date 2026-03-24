import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, Heart, Settings, User, MapPin,
    LogOut, Bell, Shield, Wallet, ChevronRight,
    CreditCard, LayoutDashboard, Plus, Trash2, Edit2, ShieldCheck, Car, Truck, Check
} from 'lucide-react';
import CheckoutMap from '../components/CheckoutMap';
import { PartnerVerification } from '../components/PartnerVerification';
import { MyGarage } from '../components/dashboard/MyGarage';
import { MyListings } from '../components/dashboard/MyListings';
import { PartnerOrders } from './partner/PartnerOrders';
import { useShop } from '../context/ShopContext';
import { api } from '../lib/api';
import { notify } from '../lib/notify';

export function UserDashboard() {
    const { user, logout, isAdmin } = useShop();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(() => {
        const params = new URLSearchParams(location.search);
        return params.get('tab') || 'overview';
    });
    const [loading, setLoading] = useState(false);

    // Data States
    const [orders, setOrders] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [profileData, setProfileData] = useState({ name: '', email: '', addresses: [] });
    const [isEditing, setIsEditing] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                addresses: (() => {
                    try {
                        const parsed = user.addresses ? JSON.parse(user.addresses) : [];
                        return Array.isArray(parsed) ? parsed : [];
                    } catch (e) { return []; }
                })()
            });
            fetchOrders();
            fetchFavorites();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const data = await api.getOrders();
            setOrders(data);
        } catch (e) { console.error(e); }
    };

    const fetchFavorites = async () => {
        try {
            const data = await api.getFavorites();
            setFavorites(data);
        } catch (e) { console.error(e); }
    };

    const removeFavorite = async (id) => {
        try {
            await api.removeFavorite(id);
            setFavorites(favorites.filter(f => f.id !== id));
            notify.success('Товар удален из избранного');
        } catch (e) {
            notify.error('Ошибка удаления из избранного');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const updated = await api.updateProfile({
                name: profileData.name,
                email: profileData.email,
                addresses: JSON.stringify(profileData.addresses)
            });
            // Update local user state
            localStorage.setItem('user', JSON.stringify({ ...user, name: profileData.name, email: profileData.email }));
            setIsEditing(false);
            notify.success('Профиль успешно обновлен!');
            setTimeout(() => window.location.reload(), 1000); // Reload to update context
        } catch (e) {
            notify.error("Ошибка сохранения: " + (e.message || 'Неизвестная ошибка'));
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.new !== passwordData.confirm) {
            notify.error('Новые пароли не совпадают');
            return;
        }
        if (passwordData.new.length < 6) {
            notify.error('Пароль должен быть минимум 6 символов');
            return;
        }
        setLoading(true);
        try {
            await api.updateProfile({ password: passwordData.new });
            setPasswordData({ current: '', new: '', confirm: '' });
            notify.success('Пароль успешно изменен!');
        } catch (e) {
            notify.error('Ошибка изменения пароля');
        } finally {
            setLoading(false);
        }
    };

    const addAddress = () => {
        const newAddr = {
            id: Date.now(),
            title: 'Новый адрес',
            city: 'Tashkent',
            street: '',
            location: { lat: 41.2995, lng: 69.2401 }
        };
        setProfileData(prev => ({ ...prev, addresses: [...prev.addresses, newAddr] }));
        setActiveTab('addresses');
    };

    const updateAddress = (id, field, value) => {
        setProfileData(prev => ({
            ...prev,
            addresses: prev.addresses.map(a => a.id === id ? { ...a, [field]: value } : a)
        }));
    };

    const confirmEscrowDelivery = async (orderId) => {
        if (!window.confirm('Вы уверены, что получили товар? Средства будут безвозвратно переведены продавцу.')) return;
        try {
            await api.confirmOrderReceipt(orderId);
            notify.success('Получение подтверждено! Сделка завершена.');
            api.getOrders().then(setOrders).catch(console.error);
        } catch (e) {
            notify.error('Ошибка при подтверждении: ' + (e.message || ''));
        }
    };

    const removeAddress = (id) => {
        if (confirm('Удалить этот адрес?')) {
            setProfileData(prev => ({
                ...prev,
                addresses: prev.addresses.filter(a => a.id !== id)
            }));
        }
    };

    return (
        <div className="min-h-screen bg-[#13111C] text-white font-sans">
            <div className="container py-4 md:py-8">
                <div className="grid md:grid-cols-[280px_1fr] gap-4 md:gap-8">

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Profile Summary Card */}
                        <div className="bg-[#191624] rounded-3xl p-6 border border-white/5 shadow-sm text-center">
                            <div className="w-16 h-16 md:w-24 md:h-24 mx-auto bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold mb-4 shadow-[0_0_20px_rgba(147,51,234,0.3)] ring-4 ring-[#13111C]">
                                {user?.name?.charAt(0)?.toUpperCase() || <User size={40} className="w-8 h-8 md:w-10 md:h-10" />}
                            </div>
                            <h2 className="font-bold text-lg md:text-xl truncate text-white">{user?.name}</h2>
                            <p className="text-xs md:text-sm text-slate-400 truncate">{user?.email}</p>
                            <div className="mt-4 inline-flex px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] md:text-xs font-bold">
                                {user?.role === 'PARTNER' ? 'Партнер' : 'Premium Member'}
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="bg-[#191624] md:rounded-3xl border-y md:border border-white/5 shadow-sm p-3 md:space-y-1 flex flex-row overflow-x-auto md:flex-col gap-2 md:gap-0 no-scrollbar -mx-4 md:mx-0 px-4 md:px-3">
                            {[
                                { id: 'overview', label: 'Обзор', icon: LayoutDashboard },
                                { id: 'favorites', label: 'Избранное', icon: Heart },
                                { id: 'garage', label: 'Мой Гараж', icon: Car },
                                { id: 'listings', label: 'My Listings', icon: Package },
                                { id: 'orders', label: 'Мои Покупки', icon: Package },
                                { id: 'addresses', label: 'Адреса доставки', icon: MapPin },
                                { id: 'wallet', label: 'Кошелёк', icon: Wallet, href: '/wallet' },
                                { id: 'profile', label: 'Настройки профиля', icon: Settings },
                                { id: 'security', label: 'Безопасность', icon: Shield },
                                ...(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? [
                                    { id: 'admin_panel', label: 'Панель Управления', icon: Settings, href: '/admin' }
                                ] : []),
                                ...(user?.role === 'PARTNER' ? [
                                    { id: 'partner_orders', label: 'Заказы Магазина', icon: Truck },
                                    { id: 'verification', label: 'Верификация (KYC)', icon: ShieldCheck }
                                ] : []),
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        if (item.href) {
                                            navigate(item.href);
                                        } else {
                                            setActiveTab(item.id);
                                            navigate(`/profile?tab=${item.id}`, { replace: true });
                                        }
                                    }}
                                    className={`flex-shrink-0 md:w-full flex items-center md:justify-between px-4 py-3 md:p-3 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id
                                        ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5 bg-white/[0.02] md:bg-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <item.icon size={18} />
                                        <span className="whitespace-nowrap">{item.label}</span>
                                    </div>
                                    <ChevronRight size={16} className={`hidden md:block opacity-50 ${activeTab === item.id ? 'opacity-100' : ''}`} />
                                </button>
                            ))}

                            <div className="hidden md:block my-2 border-t border-white/5 mx-2" />

                            <button
                                onClick={handleLogout}
                                className="flex-shrink-0 md:w-full flex items-center justify-center gap-2 px-4 py-3 md:p-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-colors bg-red-500/5 md:bg-transparent"
                            >
                                <LogOut size={18} />
                                <span className="whitespace-nowrap">Выйти</span>
                            </button>
                        </nav>

                        {/* Add Listing Button */}
                        <Link
                            to="/post-ad"
                            className="w-full mt-4 flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-3 rounded-2xl font-bold shadow-lg shadow-emerald-500/25 hover:-translate-y-1 hover:shadow-emerald-500/40 transition-all"
                        >
                            <Plus size={20} /> Разместить объявление
                        </Link>
                    </div>

                    {/* Main Content Area */}
                    <div className="space-y-6">
                        {/* Header Mobile Only */}
                        <div className="md:hidden flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold">Личный Кабинет</h1>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* CONTENT: OVERVIEW */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        <div className="flex overflow-x-auto gap-3 md:gap-4 no-scrollbar pb-2 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
                                            <div className="min-w-[280px] md:min-w-0 md:flex-1 snap-center">
                                                <StatCard
                                                    label="Всего заказов"
                                                    value={orders.length}
                                                    icon={<Package size={20} md:size={24} />}
                                                    color="blue"
                                                />
                                            </div>
                                            <div className="min-w-[280px] md:min-w-0 md:flex-1 snap-center">
                                                <StatCard
                                                    label="В ожидании"
                                                    value={orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length}
                                                    icon={<Bell size={20} md:size={24} />}
                                                    color="orange"
                                                />
                                            </div>
                                            <div className="min-w-[280px] md:min-w-0 md:flex-1 snap-center">
                                                <StatCard
                                                    label="Потрачено"
                                                    value={`${orders.reduce((acc, o) => acc + o.total, 0).toLocaleString()} UZS`}
                                                    icon={<Wallet size={20} md:size={24} />}
                                                    color="emerald"
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-[#191624] rounded-3xl border border-white/5 shadow-xl p-5 md:p-8">
                                            <div className="flex justify-between items-center mb-6 md:mb-8">
                                                <h3 className="font-bold text-xl">Последние заказы</h3>
                                                <button onClick={() => setActiveTab('orders')} className="text-purple-400 text-sm font-bold hover:text-purple-300 transition-colors">Все заказы</button>
                                            </div>
                                            <div className="space-y-4">
                                                {orders.slice(0, 3).map(order => (
                                                    <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/[0.08] transition-all group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                                                <Package size={22} />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white">Заказ #{order.id.slice(0, 8)}</div>
                                                                <div className="text-sm text-slate-400">{new Date(order.createdAt).toLocaleDateString()} • {order.items.length} товаров</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-black text-white">{order.total.toLocaleString()} UZS</div>
                                                            <div className={`text-[10px] font-black px-2.5 py-1 rounded-full inline-block mt-2 uppercase tracking-wider ${order.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                                order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                                }`}>
                                                                {order.status}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {orders.length === 0 && (
                                                    <div className="text-center py-12 flex flex-col items-center gap-4">
                                                        <Package size={48} className="text-white/10" />
                                                        <p className="text-slate-500 font-medium">У вас пока нет заказов</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CONTENT: ORDERS */}
                                {activeTab === 'orders' && (
                                    <div className="bg-[#191624] rounded-3xl border border-white/5 shadow-xl p-8">
                                        <h2 className="text-2xl font-black mb-8">История Заказов</h2>
                                        <div className="space-y-6">
                                            {orders.map(order => (
                                                <div key={order.id} className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:border-purple-500/30 transition-all">
                                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                                        <div>
                                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Заказ #{order.id.slice(0, 8)}</div>
                                                            <div className="text-sm text-slate-500">Оформлен {new Date(order.createdAt).toLocaleDateString()}</div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <div className="text-2xl font-black text-white">{order.total.toLocaleString()} UZS</div>
                                                            </div>
                                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                                order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                                order.status === 'ESCROW_HOLD' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                                }`}>
                                                                {order.status === 'ESCROW_HOLD' ? 'Безопасная сделка' : order.status}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3 bg-[#13111C] rounded-2xl p-4">
                                                        {order.items.map(item => (
                                                            <div key={item.id} className="flex justify-between items-center text-sm">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                                        <Package size={14} className="text-slate-400" />
                                                                    </div>
                                                                    <span className="text-slate-300 font-medium">{item.product?.name || "Товар удален"} <span className="text-slate-500 ml-1">x {item.quantity}</span></span>
                                                                </div>
                                                                <span className="font-bold text-white">{(item.price * item.quantity).toLocaleString()} UZS</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {order.shippingLocation && (
                                                        <div className="mt-6 flex items-start gap-3 text-xs text-slate-500 border-t border-white/5 pt-4">
                                                            <MapPin size={16} className="text-purple-500 shrink-0" />
                                                            <div>
                                                                <span className="font-bold text-slate-400">Адрес доставки:</span> {order.shippingCity}, {order.shippingAddress}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {order.status === 'ESCROW_HOLD' && (
                                                        <div className="mt-6 border-t border-white/5 pt-6 flex justify-between items-center bg-emerald-500/5 -mx-6 -mb-6 px-6 pb-6 rounded-b-3xl border-emerald-500/20">
                                                            <div>
                                                                <div className="text-sm font-bold text-emerald-400">Товар у вас?</div>
                                                                <div className="text-xs text-emerald-500/70 mt-1">Средства заморожены. Подтвердите получение, чтобы перевести их продавцу.</div>
                                                            </div>
                                                            <button 
                                                                onClick={() => confirmEscrowDelivery(order.id)}
                                                                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-[0_5px_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2"
                                                            >
                                                                <Check size={16} /> Подтвердить получение
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {orders.length === 0 && (
                                                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                                    <Package size={64} className="mx-auto text-white/5 mb-4" />
                                                    <h3 className="text-xl font-bold text-slate-400">Список заказов пуст</h3>
                                                    <p className="text-slate-600 mt-2">Вы еще не совершали покупок</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* CONTENT: ADDRESSES */}
                                {activeTab === 'addresses' && (
                                    <div className="space-y-8">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h2 className="text-3xl font-black text-white">Адреса доставки</h2>
                                                <p className="text-slate-400 text-sm mt-1">Управление точками получения ваших заказов</p>
                                            </div>
                                            <button onClick={addAddress} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-full font-bold transition-all shadow-lg active:scale-95">
                                                <Plus size={18} /> Добавить адрес
                                            </button>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {profileData.addresses.map(addr => (
                                                <div key={addr.id} className="bg-[#191624] border border-white/5 hover:border-purple-500/30 rounded-3xl p-8 shadow-xl relative group transition-all">
                                                    <div className="absolute top-6 right-6 flex gap-2">
                                                        <button onClick={() => removeAddress(addr.id)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                                            <MapPin size={24} />
                                                        </div>
                                                        <input
                                                            value={addr.title} onChange={(e) => updateAddress(addr.id, 'title', e.target.value)}
                                                            className="font-black text-xl bg-transparent focus:outline-none focus:ring-b border-b border-transparent focus:border-purple-500 w-full text-white placeholder-slate-600"
                                                            placeholder="Название (напр. Дом)"
                                                        />
                                                    </div>
                                                    <div className="space-y-6">
                                                        <div className="grid grid-cols-1 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Город</label>
                                                                <select
                                                                    value={addr.city} onChange={(e) => updateAddress(addr.id, 'city', e.target.value)}
                                                                    className="w-full bg-[#13111C] text-white border border-white/5 rounded-2xl p-4 font-bold focus:border-purple-500 transition-all outline-none"
                                                                >
                                                                    <option value="Tashkent">Ташкент</option>
                                                                    <option value="Samarkand">Самарканд</option>
                                                                    <option value="Bukhara">Бухара</option>
                                                                </select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Улица и дом</label>
                                                                <input
                                                                    value={addr.street} onChange={(e) => updateAddress(addr.id, 'street', e.target.value)}
                                                                    placeholder="Улица, дом, квартира"
                                                                    className="w-full bg-[#13111C] text-white border border-white/5 rounded-2xl p-4 font-bold focus:border-purple-500 transition-all outline-none placeholder-slate-700"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="rounded-3xl overflow-hidden border border-white/5 bg-[#13111C]">
                                                            <div className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 flex justify-between items-center">
                                                                Локация на карте
                                                                <span className="md:hidden text-[9px] lowercase opacity-50">(нажмите для выбора)</span>
                                                            </div>
                                                            <div className="h-64 md:h-48">
                                                                <CheckoutMap
                                                                    onLocationSelect={(val) => updateAddress(addr.id, 'location', val)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {profileData.addresses.length > 0 && (
                                            <div className="flex justify-end pt-4">
                                                <button onClick={handleSaveProfile} className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-full font-black shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:-translate-y-1 transition-all active:scale-95">
                                                    {loading ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ ВСЕ АДРЕСА'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* CONTENT: PROFILE */}
                                {activeTab === 'profile' && (
                                    <div className="bg-[#191624] rounded-3xl border border-white/5 shadow-xl p-10">
                                        <div className="mb-10">
                                            <h2 className="text-3xl font-black text-white">Личные данные</h2>
                                            <p className="text-slate-400 text-sm mt-1">Отредактируйте информацию вашего профиля</p>
                                        </div>
                                        <div className="grid gap-8 max-w-2xl">
                                            <div className="grid md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Ваше Имя</label>
                                                    <div className="relative group">
                                                        <User className="absolute left-4 top-4 h-5 w-5 text-slate-500 group-focus-within:text-purple-500 transition-colors" />
                                                        <input
                                                            value={profileData.name}
                                                            onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                                            className="w-full pl-12 p-4 bg-[#13111C] rounded-2xl border border-white/5 focus:border-purple-500 transition-all outline-none font-bold text-white"
                                                            placeholder="Dmitriy Smirnov"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email</label>
                                                    <div className="relative group">
                                                        <div className="absolute left-4 top-4 h-5 w-5 flex items-center justify-center text-slate-500 font-bold group-focus-within:text-purple-500 transition-colors">@</div>
                                                        <input
                                                            value={profileData.email}
                                                            onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                                                            className="w-full pl-12 p-4 bg-[#13111C] rounded-2xl border border-white/5 focus:border-purple-500 transition-all outline-none font-bold text-white disabled:opacity-50"
                                                            placeholder="example@mail.com"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-white/5">
                                                <button
                                                    onClick={handleSaveProfile}
                                                    disabled={loading}
                                                    className="w-full md:w-auto bg-purple-600 hover:bg-purple-500 text-white px-12 py-4 rounded-full font-black shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95"
                                                >
                                                    {loading ? 'ОБРАБОТКА...' : 'ОБНОВИТЬ ПРОФИЛЬ'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CONTENT: FAVORITES */}
                                {activeTab === 'favorites' && (
                                    <div className="space-y-8 animate-in fade-in">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h2 className="text-3xl font-black text-white flex items-center gap-2">
                                                    My Favorites <span className="w-2 h-2 rounded-full bg-purple-500 mb-1"></span>
                                                </h2>
                                                <p className="text-slate-400 text-sm mt-1">Manage your saved luxury vehicles and curated real estate portfolio.</p>
                                            </div>
                                            <div className="hidden lg:flex bg-[#191624] p-1 rounded-full border border-white/5 shadow-sm">
                                                {['All Items', 'Cars', 'Real Estate'].map((tab, i) => (
                                                    <button key={tab} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${i === 0 ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}>
                                                        {tab}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {favorites.length > 0 ? (
                                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                                {favorites.map(fav => (
                                                    <div key={fav.id} className="bg-[#191624] border border-white/5 rounded-3xl overflow-hidden shadow-xl hover:shadow-purple-900/20 hover:border-purple-500/30 transition-all relative group flex flex-col">

                                                        {/* Image Area */}
                                                        <div className="aspect-[4/3] bg-white relative">
                                                            <img
                                                                src={fav.marketplace?.image || 'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?q=80&w=1000'}
                                                                alt={fav.marketplace?.name}
                                                                className="w-full h-full object-cover"
                                                            />

                                                            {/* Badges Overlay */}
                                                            <div className="absolute bottom-4 left-4 flex gap-2">
                                                                <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                                                                    {fav.marketplace?.category?.name === 'Auto' ? 'OFFICIAL DEALER' : 'LUXURY LISTING'}
                                                                </span>
                                                                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                                                                    VERIFIED
                                                                </span>
                                                            </div>

                                                            {/* Heart Button */}
                                                            <button
                                                                onClick={() => removeFavorite(fav.marketplaceId)}
                                                                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-red-500 hover:scale-110 hover:bg-white text-xl transition-all shadow-sm"
                                                                title="Remove"
                                                            >
                                                                ♥
                                                            </button>
                                                        </div>

                                                        {/* Details Area */}
                                                        <div className="p-6 flex flex-col flex-grow">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h3 className="font-bold text-xl text-white leading-tight w-2/3">{fav.marketplace?.name || 'Luxury Asset'}</h3>
                                                                <span className="text-xl font-black text-white">
                                                                    ${fav.marketplace?.price?.toLocaleString() || '195,000'}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-400 mb-6 truncate">{fav.marketplace?.description || 'Exclusive premium edition'}</p>

                                                            {/* Specs Grid */}
                                                            <div className="flex justify-between mb-8 opacity-70">
                                                                {fav.marketplace?.category?.name === 'Real Estate' ? (
                                                                    <>
                                                                        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-white/5">
                                                                            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Beds</span>
                                                                            <span className="text-sm font-bold text-white">6</span>
                                                                        </div>
                                                                        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-white/5">
                                                                            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Area</span>
                                                                            <span className="text-sm font-bold text-white">8,500</span>
                                                                        </div>
                                                                        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-white/5">
                                                                            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Type</span>
                                                                            <span className="text-sm font-bold text-white">Villa</span>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-white/5">
                                                                            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">0-60</span>
                                                                            <span className="text-sm font-bold text-white">3.0s</span>
                                                                        </div>
                                                                        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-white/5">
                                                                            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Speed</span>
                                                                            <span className="text-sm font-bold text-white text-center leading-none">184<br /><span className="text-[8px] font-normal">mph</span></span>
                                                                        </div>
                                                                        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-white/5">
                                                                            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Year</span>
                                                                            <span className="text-sm font-bold text-white">2024</span>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>

                                                            <Link
                                                                to={`/marketplace/${fav.marketplaceId}`}
                                                                className="mt-auto w-full flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all"
                                                            >
                                                                {fav.marketplace?.category?.name === 'Real Estate' ? 'Contact Agent' : 'Add to Cart'}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Discover New Asset Placeholder */}
                                                <Link
                                                    to="/catalog"
                                                    className="bg-[#191624]/50 border-2 border-dashed border-slate-700/50 hover:border-purple-500/50 hover:bg-[#191624] rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px] transition-all group active:scale-[0.98]"
                                                >
                                                    <div className="w-16 h-16 rounded-full bg-[#252236] group-hover:bg-purple-600/20 text-purple-500 flex items-center justify-center mb-4 transition-colors">
                                                        <Plus size={24} strokeWidth={3} />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-white mb-2">Discover New List</h3>
                                                    <p className="text-slate-500 text-sm text-center">Find the best assets and save them here</p>
                                                </Link>

                                            </div>
                                        ) : (
                                            <div className="bg-[#191624] rounded-3xl border border-white/5 shadow-sm p-16 text-center">
                                                <Heart size={48} className="mx-auto text-purple-500/50 mb-6" />
                                                <h3 className="text-2xl font-bold text-white mb-2">Your wishlist is empty</h3>
                                                <p className="text-slate-400 mb-8 max-w-sm mx-auto">Discover extraordinary vehicles and premium real estate to add to your collection.</p>
                                                <Link to="/catalog" className="inline-block px-8 py-4 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all active:scale-95">
                                                    Explore Marketplace
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* CONTENT: SECURITY */}
                                {activeTab === 'security' && (
                                    <div className="bg-[#191624] rounded-3xl border border-white/5 shadow-xl p-10">
                                        <div className="mb-10">
                                            <h2 className="text-3xl font-black text-white">Безопасность</h2>
                                            <p className="text-slate-400 text-sm mt-1">Обеспечьте защиту вашей учетной записи</p>
                                        </div>
                                        <div className="space-y-8 max-w-md">
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Текущий пароль</label>
                                                <div className="relative group">
                                                    <Shield className="absolute left-4 top-4 h-5 w-5 text-slate-500 group-focus-within:text-purple-500 transition-colors" />
                                                    <input
                                                        type="password"
                                                        value={passwordData.current}
                                                        onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                                                        className="w-full pl-12 p-4 bg-[#13111C] rounded-2xl border border-white/5 focus:border-purple-500 transition-all outline-none font-bold text-white"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Новый пароль</label>
                                                    <input
                                                        type="password"
                                                        value={passwordData.new}
                                                        onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                                                        className="w-full p-4 bg-[#13111C] rounded-2xl border border-white/5 focus:border-purple-500 transition-all outline-none font-bold text-white"
                                                        placeholder="Минимум 6 символов"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Подтверждение</label>
                                                    <input
                                                        type="password"
                                                        value={passwordData.confirm}
                                                        onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                        className="w-full p-4 bg-[#13111C] rounded-2xl border border-white/5 focus:border-purple-500 transition-all outline-none font-bold text-white"
                                                        placeholder="Повторите новый пароль"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleChangePassword}
                                                disabled={loading || !passwordData.current || !passwordData.new || !passwordData.confirm}
                                                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-black shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
                                            >
                                                <Shield size={20} />
                                                {loading ? 'ОБРАБОТКА...' : 'ИЗМЕНИТЬ ПАРОЛЬ'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* CONTENT: MY GARAGE */}
                                {activeTab === 'garage' && (
                                    <MyGarage />
                                )}

                                {/* CONTENT: MY LISTINGS */}
                                {activeTab === 'listings' && (
                                    <MyListings />
                                )}

                                {/* CONTENT: PARTNER ORDERS */}
                                {activeTab === 'partner_orders' && user?.role === 'PARTNER' && (
                                    <PartnerOrders />
                                )}

                                {/* CONTENT: PARTNER VERIFICATION */}
                                {activeTab === 'verification' && user?.role === 'PARTNER' && (
                                    <div className="bg-[#191624] rounded-3xl border border-white/5 shadow-xl p-10">
                                        <PartnerVerification user={user} onRefreshProfile={() => window.location.reload()} />
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }) {
    const colors = {
        blue: {
            bg: 'bg-blue-500/10',
            icon: 'text-blue-400',
            border: 'border-blue-500/20'
        },
        orange: {
            bg: 'bg-orange-500/10',
            icon: 'text-orange-400',
            border: 'border-orange-500/20'
        },
        emerald: {
            bg: 'bg-emerald-500/10',
            icon: 'text-emerald-400',
            border: 'border-emerald-500/20'
        }
    };

    const theme = colors[color] || colors.blue;

    return (
        <div className={`bg-[#191624] p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border ${theme.border} shadow-xl flex items-center gap-4 md:gap-6 hover:border-purple-500/30 transition-all hover:-translate-y-1 group`}>
            <div className={`w-12 h-12 md:w-16 md:h-16 ${theme.bg} rounded-xl md:rounded-2xl flex items-center justify-center ${theme.icon} group-hover:scale-110 transition-transform flex-shrink-0`}>
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5 md:mb-1 truncate">{label}</div>
                <div className="text-lg md:text-2xl font-black text-white truncate">{value}</div>
            </div>
        </div>
    );
}
