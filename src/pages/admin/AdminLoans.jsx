import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, FileText, User, Car, Home, ChevronDown } from 'lucide-react';

const STATUS_CONFIG = {
    PENDING: { label: 'На рассмотрении', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
    APPROVED: { label: 'Одобрено', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    REJECTED: { label: 'Отклонено', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

export function AdminLoans() {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
    const [processing, setProcessing] = useState(null); // id of loan being processed
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => { loadLoans(); }, [filter]);

    async function loadLoans() {
        setLoading(true);
        try {
            const data = await api.getAllLoanApplications(filter === 'ALL' ? undefined : filter);
            setLoans(data);
        } catch (e) {
            toast.error('Ошибка загрузки заявок');
        } finally {
            setLoading(false);
        }
    }

    async function handleDecision(id, status) {
        setProcessing(id);
        try {
            await api.updateLoanApplicationStatus(id, status);
            toast.success(status === 'APPROVED' ? 'Заявка одобрена ✅' : 'Заявка отклонена ❌');
            loadLoans();
        } catch (e) {
            toast.error('Ошибка при обновлении статуса');
        } finally {
            setProcessing(null);
        }
    }

    const filtered = filter === 'ALL' ? loans : loans.filter(l => l.status === filter);
    const pending = loans.filter(l => l.status === 'PENDING').length;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Заявки на кредит / ипотеку</h1>
                    <p className="text-slate-500 text-sm mt-1">Управляйте заявками покупателей на рассрочку</p>
                </div>
                {pending > 0 && (
                    <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-xl font-bold text-sm border border-amber-200">
                        <Clock className="h-4 w-4" />
                        {pending} ожидают рассмотрения
                    </div>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 bg-slate-100 rounded-xl p-1 w-fit">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {f === 'ALL' ? 'Все' : f === 'PENDING' ? 'На рассмотрении' : f === 'APPROVED' ? 'Одобренные' : 'Отклонённые'}
                    </button>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">Заявок нет</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(loan => {
                        const cfg = STATUS_CONFIG[loan.status] || STATUS_CONFIG.PENDING;
                        const Icon = cfg.icon;
                        const isExpanded = expandedId === loan.id;

                        return (
                            <div key={loan.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                                {/* Main Row */}
                                <div
                                    className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                                    onClick={() => setExpandedId(isExpanded ? null : loan.id)}
                                >
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${cfg.color}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900">
                                                {loan.type === 'MORTGAGE' ? '🏠 Ипотека' : '🚗 Автокредит'}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${cfg.color}`}>
                                                {cfg.label}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-0.5">
                                            {loan.user?.name || 'Пользователь'} · {loan.user?.phone || loan.user?.email}
                                        </div>
                                    </div>

                                    <div className="text-right hidden md:block">
                                        <div className="font-bold text-slate-900">{loan.amount.toLocaleString()} UZS</div>
                                        <div className="text-xs text-slate-400">{new Date(loan.createdAt).toLocaleDateString()}</div>
                                    </div>

                                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="border-t border-slate-100 bg-slate-50 p-5 space-y-4">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <div className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Сумма кредита</div>
                                                <div className="font-bold text-slate-900">{loan.amount.toLocaleString()} UZS</div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Первый взнос</div>
                                                <div className="font-bold text-slate-900">{loan.downPayment.toLocaleString()} UZS</div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Срок</div>
                                                <div className="font-bold text-slate-900">{loan.term} лет</div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Ежемес. платёж</div>
                                                <div className="font-bold text-slate-900">~{loan.monthlyPayment?.toLocaleString()} UZS</div>
                                            </div>
                                        </div>

                                        {loan.marketplace && (
                                            <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100">
                                                {loan.marketplace.image && (
                                                    <img src={loan.marketplace.image} className="h-12 w-12 rounded-lg object-cover" alt="" />
                                                )}
                                                <div>
                                                    <div className="text-xs text-slate-400">Объект</div>
                                                    <div className="font-bold text-sm">{loan.marketplace.name}</div>
                                                    <div className="text-xs text-slate-500">{loan.marketplace.price?.toLocaleString()} UZS</div>
                                                </div>
                                            </div>
                                        )}

                                        {loan.status === 'PENDING' && (
                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    disabled={processing === loan.id}
                                                    onClick={() => handleDecision(loan.id, 'APPROVED')}
                                                    className="flex-1 bg-green-600 text-white font-bold py-2.5 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    Одобрить
                                                </button>
                                                <button
                                                    disabled={processing === loan.id}
                                                    onClick={() => handleDecision(loan.id, 'REJECTED')}
                                                    className="flex-1 bg-red-100 text-red-700 font-bold py-2.5 rounded-xl hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 border border-red-200"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    Отклонить
                                                </button>
                                            </div>
                                        )}

                                        {loan.status !== 'PENDING' && loan.adminNote && (
                                            <div className="text-sm text-slate-600 bg-white rounded-xl p-3 border border-slate-100">
                                                <span className="font-semibold">Примечание: </span>{loan.adminNote}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
