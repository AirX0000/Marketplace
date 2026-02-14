import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Users, Mail, DollarSign, Calendar } from 'lucide-react';

export function AdminCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await api.getPartnerCustomers();
                setCustomers(data);
            } catch (error) {
                console.error("Failed to load customers", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Клиенты</h1>
                <p className="text-slate-700">Список пользователей, совершивших покупки у вас.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div>Загрузка клиентов...</div>
                ) : customers.length > 0 ? (
                    customers.map((customer) => (
                        <div key={customer.id} className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between h-full">
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg text-primary">
                                        {customer.name?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{customer.name || 'Неизвестный'}</h3>
                                        <div className="flex items-center text-sm text-slate-700">
                                            <Mail className="h-3 w-3 mr-1" /> {customer.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm border-b pb-2">
                                        <span className="text-slate-700">Всего Потрачено</span>
                                        <span className="font-bold flex items-center"><DollarSign className="h-3 w-3 mr-1" /> {customer.totalSpent.toLocaleString()} So'm</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-b pb-2">
                                        <span className="text-slate-700">Всего Заказов</span>
                                        <span className="font-medium">{customer.ordersCount}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs text-slate-700 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" /> Последний заказ: {new Date(customer.lastOrderDate).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full p-10 text-center text-slate-700 border rounded-xl border-dashed">
                        Клиентов пока нет.
                    </div>
                )}
            </div>
        </div>
    );
}
