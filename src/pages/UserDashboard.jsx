import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Package, Heart, Settings, User, MapPin,
    LogOut, Bell, Shield, Wallet, ChevronRight,
    CreditCard, LayoutDashboard, Plus, Trash2, Edit2, ShieldCheck, Car
} from 'lucide-react';
import CheckoutMap from '../components/CheckoutMap';
import { PartnerVerification } from '../components/PartnerVerification';
import { MyGarage } from '../components/dashboard/MyGarage';
import { PartnerOrders } from './partner/PartnerOrders';
import { useShop } from '../context/ShopContext';
import { api } from '../lib/api';
import { notify } from '../lib/notify';

export function UserDashboard() {
    const { user, logout } = useShop();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
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
                addresses: user.addresses ? JSON.parse(user.addresses) : []
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
                addresses: profileData.addresses
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

    const removeAddress = (id) => {
        if (confirm('Удалить этот адрес?')) {
            setProfileData(prev => ({
                ...prev,
                addresses: prev.addresses.filter(a => a.id !== id)
            }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="container py-8 px-4 md:px-6">
                <div className="grid md:grid-cols-[280px_1fr] gap-8">

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Profile Summary Card */}
                        <div className="bg-white rounded-2xl p-6 border shadow-sm text-center">
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg ring-4 ring-white">
                                {user?.name?.[0]?.toUpperCase() || <User size={40} />}
                            </div>
                            <h2 className="font-bold text-xl truncate">{user?.name}</h2>
                            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                            <div className="mt-4 inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                                {user?.role === 'PARTNER' ? 'Партнер' : 'Покупатель'}
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="bg-white rounded-2xl border shadow-sm overflow-hidden p-2">
                            {[
                                { id: 'overview', label: 'Обзор', icon: LayoutDashboard },
                                { id: 'orders', label: 'Мои Заказы', icon: Package },
                                { id: 'favorites', label: 'Избранное', icon: Heart },
                                { id: 'addresses', label: 'Адреса доставки', icon: MapPin },
                                { id: 'profile', label: 'Настройки профиля', icon: Settings },
                                { id: 'security', label: 'Безопасность', icon: Shield },
                                { id: 'garage', label: 'Мой Гараж', icon: Car },
                                ...(user?.role === 'PARTNER' ? [
                                    { id: 'partner_orders', label: 'Заказы Магазина', icon: Truck },
                                    { id: 'verification', label: 'Верификация (KYC)', icon: ShieldCheck }
                                ] : []),
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={18} />
                                        {item.label}
                                    </div>
                                    <ChevronRight size={16} className={`opacity-50 ${activeTab === item.id ? 'opacity-100' : ''}`} />
                                </button>
                            ))}

                            <div className="my-2 border-t border-gray-100 mx-2" />

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={18} />
                                Выйти
                            </button>
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="space-y-6">

                        {/* Header Mobile Only */}
                        <div className="md:hidden flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold">Личный Кабинет</h1>
                        </div>

                        {/* CONTENT: OVERVIEW */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <StatCard
                                        label="Всего заказов"
                                        value={orders.length}
                                        icon={<Package className="text-blue-600" />}
                                        bg="bg-blue-50"
                                    />
                                    <StatCard
                                        label="В ожидании"
                                        value={orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length}
                                        icon={<Bell className="text-orange-600" />}
                                        bg="bg-orange-50"
                                    />
                                    <StatCard
                                        label="Потрачено"
                                        value={`${orders.reduce((acc, o) => acc + o.total, 0).toLocaleString()} UZS`}
                                        icon={<Wallet className="text-emerald-600" />}
                                        bg="bg-emerald-50"
                                    />
                                </div>

                                <div className="bg-white rounded-2xl border shadow-sm p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-lg">Последние заказы</h3>
                                        <button onClick={() => setActiveTab('orders')} className="text-primary text-sm font-medium hover:underline">Все заказы</button>
                                    </div>
                                    {orders.slice(0, 3).map(order => (
                                        <div key={order.id} className="flex items-center justify-between py-4 border-b last:border-0 hover:bg-gray-50 -mx-6 px-6 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-medium">Заказ #{order.id.slice(0, 8)}</div>
                                                    <div className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()} • {order.items.length} товаров</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold">{order.total.toLocaleString()} UZS</div>
                                                <div className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {order.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {orders.length === 0 && <div className="text-center py-8 text-muted-foreground">У вас пока нет заказов</div>}
                                </div>
                            </div>
                        )}

                        {/* CONTENT: ORDERS */}
                        {activeTab === 'orders' && (
                            <div className="bg-white rounded-2xl border shadow-sm p-6 animate-in fade-in">
                                <h2 className="text-xl font-bold mb-6">История Заказов</h2>
                                <div className="space-y-4">
                                    {orders.map(order => (
                                        <div key={order.id} className="border rounded-xl p-4 hover:border-primary transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Заказ #{order.id.slice(0, 8)} от {new Date(order.createdAt).toLocaleDateString()}</div>
                                                    <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {order.status}
                                                    </div>
                                                </div>
                                                <div className="text-right font-bold text-lg">{order.total.toLocaleString()} UZS</div>
                                            </div>
                                            <div className="space-y-2">
                                                {order.items.map(item => (
                                                    <div key={item.id} className="flex justify-between text-sm">
                                                        <span className="text-gray-600">{item.product?.name || "Товар удален"} x {item.quantity}</span>
                                                        <span className="font-medium">{(item.price * item.quantity).toLocaleString()} UZS</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {order.shippingLocation && (
                                                <div className="mt-4 pt-4 border-t flex items-center gap-2 text-xs text-muted-foreground">
                                                    <MapPin size={14} /> Доставка: {order.shippingCity}, {order.shippingAddress} (Coords: {JSON.stringify(JSON.parse(order.shippingLocation))})
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {orders.length === 0 && <div className="text-center py-12 text-muted-foreground">Список заказов пуст</div>}
                                </div>
                            </div>
                        )}

                        {/* CONTENT: ADDRESSES */}
                        {activeTab === 'addresses' && (
                            <div className="space-y-6 animate-in fade-in">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold">Мои Адреса</h2>
                                    <button onClick={addAddress} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90">
                                        <Plus size={18} /> Добавить
                                    </button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {profileData.addresses.map(addr => (
                                        <div key={addr.id} className="bg-white border-2 border-transparent hover:border-primary rounded-xl p-6 shadow-sm relative group transition-all">
                                            <div className="absolute top-4 right-4 flex gap-2  transition-opacity">
                                                <button onClick={() => removeAddress(addr.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={16} /></button>
                                            </div>
                                            <div className="flex items-center gap-3 mb-4 text-primary">
                                                <MapPin size={24} />
                                                <input
                                                    value={addr.title} onChange={(e) => updateAddress(addr.id, 'title', e.target.value)}
                                                    className="font-bold bg-transparent focus:outline-none focus:border-b border-primary w-full"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <select
                                                        value={addr.city} onChange={(e) => updateAddress(addr.id, 'city', e.target.value)}
                                                        className="w-full text-sm border rounded p-2"
                                                    >
                                                        <option value="Tashkent">Ташкент</option>
                                                        <option value="Samarkand">Самарканд</option>
                                                    </select>
                                                    <input
                                                        value={addr.street} onChange={(e) => updateAddress(addr.id, 'street', e.target.value)}
                                                        placeholder="Улица, дом, квартира"
                                                        className="w-full text-sm border rounded p-2"
                                                    />
                                                </div>
                                                <div className="pt-2">
                                                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">Укажите на карте:</label>
                                                    <CheckoutMap
                                                        onLocationSelect={(val) => updateAddress(addr.id, 'location', val)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {profileData.addresses.length > 0 && (
                                    <div className="flex justify-end">
                                        <button onClick={handleSaveProfile} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                                            {loading ? 'Сохранение...' : 'Сохранить адреса'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CONTENT: PROFILE */}
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-2xl border shadow-sm p-8 animate-in fade-in">
                                <h2 className="text-xl font-bold mb-6">Личные данные</h2>
                                <div className="grid gap-6 max-w-xl">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Ваше Имя</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                            <input
                                                value={profileData.name}
                                                onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                                className="w-full pl-10 h-11 rounded-lg border bg-gray-50 focus:bg-white transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-3 h-5 w-5 text-muted-foreground">@</div>
                                            <input
                                                value={profileData.email}
                                                onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                                                className="w-full pl-10 h-11 rounded-lg border bg-gray-50 focus:bg-white transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={loading}
                                            className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
                                        >
                                            {loading ? 'Сохранение...' : 'Обновить профиль'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CONTENT: FAVORITES */}
                        {activeTab === 'favorites' && (
                            <div className="space-y-6 animate-in fade-in">
                                <h2 className="text-xl font-bold">Избранное</h2>
                                {favorites.length > 0 ? (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {favorites.map(fav => (
                                            <div key={fav.id} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative group">
                                                <button
                                                    onClick={() => removeFavorite(fav.marketplaceId)}
                                                    className="absolute top-2 right-2 p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    title="Удалить из избранного"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <img
                                                    src={fav.marketplace?.image || 'https://via.placeholder.com/300'}
                                                    alt={fav.marketplace?.name}
                                                    className="w-full h-40 object-cover rounded-lg mb-3"
                                                />
                                                <h3 className="font-bold text-lg mb-1">{fav.marketplace?.name}</h3>
                                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{fav.marketplace?.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg font-bold text-primary">
                                                        {fav.marketplace?.price?.toLocaleString()} сум
                                                    </span>
                                                    <Link
                                                        to={`/marketplace/${fav.marketplaceId}`}
                                                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
                                                    >
                                                        Смотреть
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl border shadow-sm p-12 text-center">
                                        <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                                        <h3 className="text-lg font-bold mb-2">Нет избранных товаров</h3>
                                        <p className="text-muted-foreground mb-4">Добавьте товары в избранное, чтобы быстро находить их позже</p>
                                        <Link to="/catalog" className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
                                            Перейти в каталог
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CONTENT: SECURITY */}
                        {activeTab === 'security' && (
                            <div className="bg-white rounded-2xl border shadow-sm p-8 animate-in fade-in">
                                <h2 className="text-xl font-bold mb-6">Безопасность</h2>
                                <div className="space-y-6 max-w-md">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Текущий пароль</label>
                                        <input
                                            type="password"
                                            value={passwordData.current}
                                            onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                                            className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                                            placeholder="Введите текущий пароль"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Новый пароль</label>
                                        <input
                                            type="password"
                                            value={passwordData.new}
                                            onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                                            className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                                            placeholder="Минимум 6 символов"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Подтвердите новый пароль</label>
                                        <input
                                            type="password"
                                            value={passwordData.confirm}
                                            onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                            className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                                            placeholder="Повторите новый пароль"
                                        />
                                    </div>
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={loading || !passwordData.current || !passwordData.new || !passwordData.confirm}
                                        className="w-full h-10 rounded-md bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Shield size={18} />
                                        {loading ? 'Изменение...' : 'Изменить пароль'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* CONTENT: MY GARAGE */}
                        {activeTab === 'garage' && (
                            <MyGarage />
                        )}

                        {/* CONTENT: PARTNER ORDERS */}
                        {activeTab === 'partner_orders' && user?.role === 'PARTNER' && (
                            <PartnerOrders />
                        )}

                        {/* CONTENT: PARTNER VERIFICATION */}
                        {activeTab === 'verification' && user?.role === 'PARTNER' && (
                            <div className="bg-white rounded-2xl border shadow-sm p-8 animate-in fade-in">
                                <PartnerVerification user={user} onRefreshProfile={() => window.location.reload()} />
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, bg }) {
    return (
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
                {icon}
            </div>
            <div>
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className="text-xl font-bold">{value}</div>
            </div>
        </div>
    );
}
