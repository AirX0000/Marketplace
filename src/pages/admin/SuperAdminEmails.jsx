import React, { useState } from 'react';
import { api } from '../../lib/api';
import { Send, Users, UserCheck, Shield, Mail, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function SuperAdminEmails() {
    const [formData, setFormData] = useState({
        targetRole: 'ALL',
        subject: '',
        message: ''
    });
    const [stats, setStats] = useState({
        totalUsers: 0,
        activePartners: 0,
        subscribers: 0
    });
    const [history, setHistory] = useState([]);
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [statsData, historyData] = await Promise.all([
                api.getNewsletterStats(),
                api.getNewsletterHistory()
            ]);
            setStats(statsData);
            setHistory(historyData);
        } catch (error) {
            console.error("Failed to load newsletter data", error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.subject || !formData.message) return;

        setSending(true);
        try {
            await api.sendBroadcast(formData);
            toast.success(`Рассылка отправлена успешно!`);
            setFormData({ ...formData, subject: '', message: '' });
            // Refresh history
            const newHistory = await api.getNewsletterHistory();
            setHistory(newHistory);
        } catch (error) {
            toast.error("Ошибка отправки рассылки");
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    const roles = [
        { id: 'ALL', label: 'Все пользователи', icon: Users, desc: 'Партнеры и покупатели' },
        { id: 'PARTNER', label: 'Только партнеры', icon: Shield, desc: 'Владельцы магазинов' },
        { id: 'USER', label: 'Только покупатели', icon: UserCheck, desc: 'Обычные пользователи' }
    ];

    const getRoleLabel = (role) => {
        if (role === 'ALL') return 'Все';
        if (role === 'PARTNER') return 'Партнеры';
        if (role === 'USER') return 'Покупатели';
        return role;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-20">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Email Рассылки</h1>
                <p className="text-slate-700">Отправка массовых уведомлений пользователям платформы.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Form Section */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Target Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">Получатели</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {roles.map(role => {
                                        const Icon = role.icon;
                                        const isSelected = formData.targetRole === role.id;
                                        return (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, targetRole: role.id })}
                                                className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${isSelected
                                                    ? 'border-blue-600 bg-blue-50'
                                                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                                                    }`}
                                            >
                                                <Icon className={`h-6 w-6 mb-2 transition-colors ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                                                <span className={`text-sm font-bold transition-colors ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{role.label}</span>
                                                <span className={`text-[10px] transition-colors ${isSelected ? 'text-blue-600/80' : 'text-slate-500'}`}>{role.desc}</span>
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 text-blue-600">
                                                        <CheckCircle className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Тема письма</label>
                                <input
                                    required
                                    value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="Важное обновление..."
                                />
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Сообщение</label>
                                <textarea
                                    required
                                    rows={8}
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                                    placeholder="Текст сообщения..."
                                />
                                <p className="text-xs text-slate-700 text-right">{formData.message.length} символов</p>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={sending || !formData.subject || !formData.message}
                                    className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 h-11 px-8 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                                >
                                    {sending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Отправка...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Отправить Рассылку
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar / History */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-blue-600" />
                            История рассылок
                        </h3>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {history.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">История пуста</p>
                            ) : (
                                history.map((item) => (
                                    <div key={item.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm transition-colors hover:bg-slate-100">
                                        <div className="text-slate-500 text-xs mb-1">
                                            {new Date(item.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="font-bold text-slate-800 mb-1 line-clamp-1">{item.subject}</div>
                                        <div className="text-slate-600 text-xs flex items-center justify-between gap-1">
                                            <span className="flex items-center gap-1">
                                                <span className={`w-1.5 h-1.5 rounded-full ${item.targetRole === 'ALL' ? 'bg-slate-400' : 'bg-blue-500'}`}></span>
                                                Кому: {getRoleLabel(item.targetRole)}
                                            </span>
                                            <span className="text-slate-400">{item.recipientCount} чел.</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-600/20">
                        <h4 className="font-bold mb-4 flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-200" />
                            Охват аудитории
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex justify-between items-center pb-2 border-b border-blue-500/30">
                                <span className="text-blue-100">Всего пользователей:</span>
                                <span className="font-bold text-lg">{stats.totalUsers.toLocaleString()}</span>
                            </li>
                            <li className="flex justify-between items-center pb-2 border-b border-blue-500/30">
                                <span className="text-blue-100">Активных партнеров:</span>
                                <span className="font-bold text-lg">{stats.activePartners.toLocaleString()}</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="text-blue-100">Email подписчиков:</span>
                                <span className="font-bold text-lg">{stats.subscribers.toLocaleString()}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
