import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { FileText, Calendar, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CreditApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await api.getMyLoanApplications();
                setApplications(data);
            } catch (error) {
                console.error("Failed to load applications", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="container py-8 px-4 md:px-6 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold mb-2 text-slate-900">Мои заявки на рассрочку</h1>
            <p className="text-slate-500 mb-8">История ваших заявок на автокредит и ипотеку.</p>

            {applications.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <FileText className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">Заявок нет</h3>
                    <p className="text-slate-500 mb-6">Вы еще не подавали заявок на кредит.</p>
                    <Link to="/marketplaces" className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
                        Перейти в каталог
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => (
                        <div key={app.id} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                <div className="flex gap-4 items-center">
                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                                            app.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                                                'bg-amber-100 text-amber-600'
                                        }`}>
                                        {app.status === 'APPROVED' ? <CheckCircle className="h-6 w-6" /> :
                                            app.status === 'REJECTED' ? <XCircle className="h-6 w-6" /> :
                                                <Clock className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-lg text-slate-900">
                                                {app.type === 'MORTGAGE' ? 'Ипотека' : 'Автокредит'}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-sm text-slate-500">{new Date(app.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-sm font-medium text-slate-600">
                                            Сумма кредита: <span className="text-slate-900 font-bold">{app.amount.toLocaleString()} сум</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 w-full md:w-auto md:text-right">
                                    {app.marketplace && (
                                        <Link to={`/marketplaces/${app.marketplace.id}`} className="group flex items-center gap-3 md:justify-end bg-slate-50 p-3 rounded-xl hover:bg-slate-100 transition-colors">
                                            <div className="h-10 w-10 bg-slate-200 rounded-lg overflow-hidden">
                                                {app.marketplace.image && <img src={app.marketplace.image} className="h-full w-full object-cover" />}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xs text-slate-500">Объект</div>
                                                <div className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">
                                                    {app.marketplace.name}
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors ml-auto" />
                                        </Link>
                                    )}
                                </div>

                                <div className="w-full md:w-auto">
                                    <div className={`px-4 py-2 rounded-xl font-bold text-sm text-center ${app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                            app.status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                'bg-amber-50 text-amber-700 border border-amber-100'
                                        }`}>
                                        {app.status === 'APPROVED' ? 'Одобрено' :
                                            app.status === 'REJECTED' ? 'Отклонено' :
                                                'На рассмотрении'}
                                    </div>
                                </div>
                            </div>

                            {/* Details Row */}
                            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <div className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Первоначальный взнос</div>
                                    <div className="font-bold text-slate-900">{app.downPayment.toLocaleString()} сум</div>
                                </div>
                                <div>
                                    <div className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Срок</div>
                                    <div className="font-bold text-slate-900">{app.term} лет</div>
                                </div>
                                <div>
                                    <div className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Ежемес. платёж</div>
                                    <div className="font-bold text-slate-900">~{app.monthlyPayment?.toLocaleString()} сум</div>
                                </div>
                                <div>
                                    <div className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">ID Заявки</div>
                                    <div className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded w-fit">{app.id.slice(0, 8)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
