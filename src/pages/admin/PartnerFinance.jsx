import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { BadgeDollarSign, TrendingUp, Wallet, ArrowDownLeft, FileText } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { SuperAdminFinance } from './SuperAdminFinance';

export function PartnerFinance() {
    const { user } = useShop();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role === 'ADMIN') return; // Skip API call for admin here, SuperAdminFinance component handles it

        api.getPartnerFinance()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    // Redirect or show Admin View
    if (user?.role === 'ADMIN') {
        return <SuperAdminFinance />;
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS' }).format(price);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Финансы Магазина</h1>
                <p className="text-slate-700">Отслеживайте свои доходы, выплаты и комиссии платформы.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card
                    title="Общая Выручка"
                    value={formatPrice(data?.totalRevenue || 0)}
                    icon={<TrendingUp className="h-4 w-4 text-blue-600 500" />}
                    sub="Валовый объем продаж"
                />
                <Card
                    title="Ожидает Выплаты"
                    value={formatPrice(data?.pendingPayout || 0)}
                    icon={<Wallet className="h-4 w-4 text-blue-500" />}
                    sub="Доступно для вывода (90%)"
                />
                <Card
                    title="Комиссия Платформы"
                    value={formatPrice(data?.platformFee || 0)}
                    icon={<BadgeDollarSign className="h-4 w-4 text-orange-500" />}
                    sub="10% Комиссия"
                />
            </div>

            {/* Transactions Table */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="font-semibold leading-none tracking-tight">Недавние Транзакции</h3>
                    <button className="text-sm text-primary hover:underline flex items-center gap-1">
                        <FileText size={14} /> Скачать отчет
                    </button>
                </div>
                <div className="p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-700">
                            <tr>
                                <th className="p-4 font-medium">Тип</th>
                                <th className="p-4 font-medium">Описание</th>
                                <th className="p-4 font-medium">Дата</th>
                                <th className="p-4 font-medium">Статус</th>
                                <th className="p-4 font-medium text-right">Сумма</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.transactions?.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-700">Транзакций не найдено</td></tr>
                            ) : (
                                data?.transactions?.map((tx) => (
                                    <tr key={tx.id} className="border-t  transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1 rounded ${tx.type === 'REFUND' ? 'bg-red-100 text-red-700' : 'bg-blue-600/100 text-blue-600 700'}`}>
                                                    <ArrowDownLeft className="h-3 w-3" />
                                                </div>
                                                <span className="font-medium">
                                                    {tx.type === 'SALE' ? 'Продажа' :
                                                        tx.type === 'PAYOUT' ? 'Выплата' :
                                                            tx.type === 'REFUND' ? 'Возврат' : tx.type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-700">{tx.description}</td>
                                        <td className="p-4 text-slate-700">{new Date(tx.date).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tx.status === 'COMPLETED' ? 'bg-blue-600/100 text-blue-600 800' :
                                                    tx.status === 'PENDING' ? 'bg-slate-100 text-slate-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {tx.status === 'COMPLETED' ? 'Выполнено' :
                                                    tx.status === 'PENDING' ? 'Ожидается' : tx.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-medium">
                                            {formatPrice(tx.amount)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function Card({ title, value, icon, sub }) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium text-slate-700">{title}</h3>
                {icon}
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-slate-700 mt-1">{sub}</p>
        </div>
    );
}
