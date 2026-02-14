import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { RefreshCw, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MyReturnsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const data = await api.getMyReturnRequests();
            setRequests(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Загрузка запросов...</div>;

    return (
        <div className="container py-8 px-4 md:px-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                <RefreshCw className="h-6 w-6 text-slate-500" />
                Мои возвраты
            </h1>

            {requests.length === 0 ? (
                <div className="text-center py-20 border rounded-xl bg-slate-50">
                    <Package className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">Нет запросов на возврат</h3>
                    <p className="text-slate-600 mb-6">Здесь будут отображаться ваши обращения по возвратам.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div key={request.id} className="border rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row gap-4 justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                                            ${request.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                request.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                    request.status === 'REFUNDED' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                                            {request.status}
                                        </span>
                                        <span className="text-xs text-slate-400 font-mono">#{request.id.slice(0, 8)}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-1">{request.orderItem.marketplace.name}</h3>
                                    <p className="text-sm text-slate-600 mb-2">Причина: <span className="font-medium text-slate-800">{request.reason}</span></p>
                                    {request.details && (
                                        <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded italic">"{request.details}"</p>
                                    )}
                                </div>

                                <div className="text-right flex flex-col justify-between">
                                    <div className="text-xs text-slate-500">
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </div>
                                    {request.adminComment && (
                                        <div className="text-xs text-purple-600 font-medium mt-2 max-w-[200px] ml-auto">
                                            Ответ: {request.adminComment}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
