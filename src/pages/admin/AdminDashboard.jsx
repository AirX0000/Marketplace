import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useShop } from '../../context/ShopContext';
import { BarChart3, Users, DollarSign, Activity, TrendingUp, ShoppingBag, Store, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { AdminSupport } from './AdminSupport';
import { AdminBlog } from './AdminBlog';
import { AdminCareers } from './AdminCareers';
import AdminCenters from './AdminCenters';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function AdminDashboard() {
    const { user } = useShop();
    const [stats, setStats] = useState({
        // Common
        revenueChart: [],
        salesByCategory: [],
        recentActivity: [],
        // Admin specific
        totalUsers: 0,
        totalPartners: 0,
        totalProducts: 0,
        totalOrders: 0,
        activeUsers: 0,
        totalRevenue: 0,
        recentRevenue: 0,
        topPartners: [],
        topProducts: [],
        // Partner specific
        listings: 0,
        orders: 0,
        revenue: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function load() {
            if (!user) return;

            try {
                let data;
                if (user.role === 'ADMIN') {
                    data = await api.getAdminStats();
                } else {
                    data = await api.getPartnerStats();
                }
                setStats(data);
                setError(null);
            } catch (e) {
                console.error("Failed to load stats:", e);
                setError(e.message || "Не удалось загрузить статистику");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-slate-700">Загрузка панели управления...</p>
                </div>
            </div>
        );
    }

    const isAdmin = user?.role === 'ADMIN';

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center max-w-md">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold mb-2">Ошибка загрузки</h2>
                    <p className="text-slate-700 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                    >
                        Обновить страницу
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isAdmin ? 'Панель Администратора autohouse' : 'Панель Управления Магазина'}
                    </h1>
                    <p className="text-slate-700">
                        {isAdmin ? 'Обзор показателей всей платформы.' : 'Обзор показателей вашего магазина за последние 30 дней.'}
                    </p>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isAdmin ? (
                    <>
                        <Card
                            title="Общая Выручка"
                            value={`${(stats.totalRevenue || 0).toLocaleString()} So'm`}
                            icon={<DollarSign />}
                            sub={`+${(stats.recentRevenue || 0).toLocaleString()} за 30 дней`}
                        />
                        <Link to="/admin/pages" className="block pt-1">
                            <Card
                                title="Управление Контентом"
                                value="CMS"
                                icon={<FileText className="text-purple-500" />}
                                sub="Редактор страниц"
                            />
                        </Link>
                        <Card
                            title="Всего Заказов"
                            value={stats.totalOrders}
                            icon={<ShoppingBag />}
                            sub="Успешные сделки"
                        />
                        <Card
                            title="Пользователи"
                            value={stats.totalUsers}
                            icon={<Users />}
                            sub={`${stats.activeUsers} активных за 30 дней`}
                        />
                        <Card
                            title="Партнеры"
                            value={stats.totalPartners}
                            icon={<Store />}
                            sub={`${stats.totalProducts} товаров в каталоге`}
                        />
                    </>
                ) : (
                    <>
                        <Card title="Всего Товаров" value={stats.listings} icon={<Activity />} sub="Активные объявления" />
                        <Card title="Выручка" value={`${(stats.revenue || 0).toLocaleString()} So'm`} icon={<DollarSign />} sub="Общий объем продаж" />
                        <Card title="Активные Клиенты" value={stats.activeUsers} icon={<Users />} sub="Уникальные покупатели" />
                        <Card title="Всего Заказов" value={stats.orders} icon={<BarChart3 />} sub="Успешные сделки" />
                    </>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Revenue Chart */}
                <div className="col-span-4 rounded-xl border bg-card shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Динамика Выручки (30 дней)</h3>
                        <TrendingUp className="h-4 w-4 text-blue-600 500" />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.revenueChart || []}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                    style={{ fontSize: 12 }}
                                />
                                <YAxis
                                    tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                                    style={{ fontSize: 12 }}
                                />
                                <Tooltip
                                    formatter={(value) => [`${value.toLocaleString()} So'm`, 'Выручка']}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Pie Chart */}
                <div className="col-span-3 rounded-xl border bg-card shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Распределение Товаров</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.salesByCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {(stats.salesByCategory || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Top Partners - Admin Only */}
                {isAdmin && (
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="p-6 pb-2">
                            <h3 className="text-lg font-semibold">Топ Партнеров по Выручке</h3>
                        </div>
                        <div className="p-6 pt-2">
                            {(stats.topPartners?.length || 0) === 0 ? (
                                <p className="text-slate-700 text-sm">Данных пока нет</p>
                            ) : (
                                <div className="space-y-4">
                                    {stats.topPartners?.map((partner, i) => (
                                        <div key={partner.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{partner.name}</p>
                                                    <p className="text-xs text-slate-700">{partner.orders} заказов</p>
                                                </div>
                                            </div>
                                            <div className="font-bold text-sm">
                                                {partner.revenue.toLocaleString()} So'm
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Top Products */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 pb-2">
                        <h3 className="text-lg font-semibold">Топ Товаров по Продажам</h3>
                    </div>
                    <div className="p-6 pt-2">
                        {(stats.topProducts?.length || 0) === 0 ? (
                            <p className="text-slate-700 text-sm">Данных пока нет</p>
                        ) : (
                            <div className="space-y-4">
                                {stats.topProducts?.map((product, i) => (
                                    <div key={product.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-10 h-10 rounded-lg object-cover bg-muted"
                                            />
                                            <div className="max-w-[150px] md:max-w-[200px]">
                                                <p className="font-medium text-sm truncate">{product.name}</p>
                                                <p className="text-xs text-slate-700">{product.totalSales} шт. продано</p>
                                            </div>
                                        </div>
                                        <div className="font-bold text-sm">
                                            {product.revenue?.toLocaleString()} So'm
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="p-6 flex flex-row items-center justify-between">
                    <h3 className="text-lg font-semibold">Недавние Заказы на Платформе</h3>
                </div>
                <div className="p-6 pt-0">
                    {(!stats.recentActivity || stats.recentActivity.length === 0) ? (
                        <p className="text-slate-700">Заказов пока нет.</p>
                    ) : (
                        <div className="space-y-4">
                            {stats.recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${activity.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                                                activity.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {activity.status}
                                            </span>
                                            <span className="text-xs text-slate-700">{new Date(activity.date).toLocaleDateString()} {new Date(activity.date).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-sm font-medium leading-none">{activity.productName}</p>
                                        <p className="text-xs text-slate-700">Клиент: {activity.buyerName} ({activity.buyerEmail})</p>
                                    </div>
                                    <div className="font-bold text-blue-600 600">
                                        +{activity.price.toLocaleString()} So'm
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Card({ title, value, icon, sub }) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium text-slate-600">{title}</h3>
                <div className="h-5 w-5 text-blue-600">{icon}</div>
            </div>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <p className="text-xs text-slate-500 mt-1">{sub}</p>
        </div>
    );
}
