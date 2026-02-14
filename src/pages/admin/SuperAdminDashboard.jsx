import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Users, ShoppingBag, DollarSign, TrendingUp, Shield } from 'lucide-react';

export function SuperAdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getAdminStats()
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8">Загрузка статистики...</div>;

    const cards = [
        { title: "Общий Доход", value: `${(stats?.totalRevenue || 0).toLocaleString()} So'm`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-100" },
        { title: "Прибыль Платформы (10%)", value: `${(stats?.totalCommission || 0).toLocaleString()} So'm`, icon: TrendingUp, color: "text-blue-600 600", bg: "bg-blue-600/100" },
        { title: "Всего Пользователей", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
        { title: "Активные Партнеры", value: stats?.totalPartners || 0, icon: Shield, color: "text-purple-600", bg: "bg-purple-100" },
        { title: "Всего Заказов", value: stats?.totalOrders || 0, icon: ShoppingBag, color: "text-orange-600", bg: "bg-orange-100" },
    ];

    return (
        <div className="space-y-8 p-8">
            <h1 className="text-3xl font-bold tracking-tight">Панель Суперадминистратора</h1>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((card, index) => (
                    <div key={index} className="rounded-xl border bg-card p-6 shadow-sm flex items-center gap-4">
                        <div className={`p-4 rounded-full ${card.bg} ${card.color}`}>
                            <card.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700">{card.title}</p>
                            <h3 className="text-2xl font-bold">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
