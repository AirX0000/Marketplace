import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Calendar, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SuperAdminFinance() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        platformCommission: 0,
        pendingPayouts: 0,
        chartData: []
    });
    const [pendingDeposits, setPendingDeposits] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const [financeStats, deposits] = await Promise.all([
                api.getAdminFinanceStats(),
                api.getPendingDeposits()
            ]);

            // Fallback for stats if endpoint returns null/error in dev
            setStats(financeStats || {
                totalRevenue: 0,
                platformCommission: 0,
                pendingPayouts: 0,
                chartData: []
            });
            setPendingDeposits(deposits || []);
        } catch (error) {
            console.error("Failed to load finance data", error);
            toast.error("Ошибка загрузки данных");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleApprove = async (id) => {
        try {
            await api.approveDeposit(id);
            toast.success("Депозит подтвержден");
            loadData();
        } catch (e) {
            toast.error("Ошибка подтверждения");
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Отклонить этот депозит?")) return;
        try {
            await api.rejectDeposit(id);
            toast.success("Депозит отклонен");
            loadData();
        } catch (e) {
            toast.error("Ошибка отклонения");
        }
    };

    const handleExport = () => {
        // ... (Keep existing export logic or update later)
        toast.success('Экспорт пока не реализован для реальных данных');
    };

    if (loading) return <div className="p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

    return (
        <div className="space-y-6 animate-in fade-in pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Финансы Платформы</h1>
                    <p className="text-slate-700">Управление доходами и депозитами</p>
                </div>
                <button
                    onClick={loadData}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
                >
                    Обновить
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card title="Общий Оборот" value={stats.totalRevenue} icon={DollarSign} color="text-blue-600" bg="bg-blue-50" />
                <Card title="Доход Платформы (5%)" value={stats.platformCommission} icon={ArrowUpRight} color="text-emerald-600" bg="bg-emerald-50" />
                <Card title="Ожидают Выплаты" value={stats.pendingPayouts} icon={ArrowDownLeft} color="text-orange-600" bg="bg-orange-50" />
            </div>

            {/* Pending Deposits Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Запросы на Депозит ({pendingDeposits.length})</h3>
                </div>
                {pendingDeposits.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">Нет ожидающих депозитов</div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-4 font-bold text-slate-700">Пользователь</th>
                                <th className="p-4 font-bold text-slate-700">Сумма</th>
                                <th className="p-4 font-bold text-slate-700">Дата</th>
                                <th className="p-4 font-bold text-slate-700 text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pendingDeposits.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900">{tx.receiver?.name || 'Пользователь'}</div>
                                        <div className="text-xs text-slate-500">{tx.receiver?.email || tx.receiver?.phone}</div>
                                    </td>
                                    <td className="p-4 font-bold text-emerald-600">
                                        +{tx.amount.toLocaleString()} UZS
                                    </td>
                                    <td className="p-4 text-slate-600">{new Date(tx.createdAt).toLocaleString()}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleApprove(tx.id)}
                                            className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg font-bold hover:bg-emerald-200 transition-colors text-xs"
                                        >
                                            Подтвердить
                                        </button>
                                        <button
                                            onClick={() => handleReject(tx.id)}
                                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-colors text-xs"
                                        >
                                            Отклонить
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function Card({ title, value, icon: Icon, color, bg }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-slate-500">{title}</p>
                    <h2 className="text-2xl font-black mt-1 text-slate-900">{value.toLocaleString()} So'm</h2>
                </div>
                <div className={`p-3 rounded-xl ${bg} ${color}`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
}
