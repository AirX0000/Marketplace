import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { 
    CalendarDays, User, Phone, MessageSquare, 
    Clock, CheckCircle, XCircle, Search, 
    Filter, MoreHorizontal, ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_COLORS = {
    'NEW': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'CONTACTED': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'COMPLETED': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'CANCELLED': 'bg-red-500/10 text-red-400 border-red-500/20',
};

const STATUS_LABELS = {
    'NEW': 'Новая',
    'CONTACTED': 'В работе',
    'COMPLETED': 'Завершена',
    'CANCELLED': 'Отменена',
};

export function PartnerLeads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadLeads();
    }, []);

    const loadLeads = async () => {
        try {
            setLoading(true);
            const data = await api.getPartnerLeads();
            setLeads(data);
        } catch (error) {
            toast.error('Не удалось загрузить заявки');
        } finally {
            setLoading(false);
        }
    };

    const handleInitiateChat = async (userId) => {
        if (!userId) return toast.error('Пользователь не зарегистрирован');
        try {
            await api.initiateChat(userId);
            window.location.href = '/profile/chat';
        } catch (error) {
            toast.error('Не удалось начать чат');
        }
    };

    const handleStatusUpdate = async (leadId, newStatus) => {
        try {
            await api.updateLeadStatus(leadId, newStatus);
            setLeads(leads.map(lead => lead.id === leadId ? { ...lead, status: newStatus } : lead));
            toast.success(`Статус обновлен: ${STATUS_LABELS[newStatus]}`);
        } catch (error) {
            toast.error('Не удалось обновить статус');
        }
    };

    const filteredLeads = leads
        .filter(lead => filterStatus === 'ALL' || lead.status === filterStatus)
        .filter(lead => 
            lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.phone.includes(searchQuery) ||
            lead.marketplace?.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <CalendarDays className="h-8 w-8 text-blue-500" />
                        Заявки на консультацию
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">
                        Управляйте вашими входящими лидами и запросами
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Поиск..."
                            className="h-11 pl-10 pr-4 bg-[#191624] border border-white/5 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all w-full md:w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Всего заявок', value: leads.length, icon: CalendarDays, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Новые', value: leads.filter(l => l.status === 'NEW').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'В работе', value: leads.filter(l => l.status === 'CONTACTED').length, icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                    { label: 'Успешно', value: leads.filter(l => l.status === 'COMPLETED').length, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[#191624] border border-white/5 rounded-3xl p-6 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-white">{stat.value}</p>
                        </div>
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg)}>
                            <stat.icon size={20} className={stat.color} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {['ALL', 'NEW', 'CONTACTED', 'COMPLETED', 'CANCELLED'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={cn(
                            "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                            filterStatus === status 
                                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20" 
                                : "bg-white/5 text-slate-400 border-white/5 hover:border-white/10"
                        )}
                    >
                        {status === 'ALL' ? 'Все' : STATUS_LABELS[status]}
                    </button>
                ))}
            </div>

            {filteredLeads.length === 0 ? (
                <div className="text-center py-24 bg-[#191624] rounded-[2.5rem] border border-white/5 border-dashed">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CalendarDays size={32} className="text-slate-600" />
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Заявок не найдено</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {filteredLeads.map(lead => (
                            <motion.div
                                layout
                                key={lead.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[#191624] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group"
                            >
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/5 blur-[80px] group-hover:bg-blue-600/10 transition-all duration-700" />
                                
                                <div className="relative z-10">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-black text-white shadow-lg shrink-0">
                                                {lead.name[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-black text-white uppercase text-lg leading-tight truncate">{lead.name}</h3>
                                                <div className="flex items-center flex-wrap gap-2 mt-1">
                                                    <span className={cn("px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0", STATUS_COLORS[lead.status])}>
                                                        {STATUS_LABELS[lead.status]}
                                                    </span>
                                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest shrink-0">
                                                        {new Date(lead.createdAt).toLocaleDateString('ru-RU')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2 self-end sm:self-start">
                                            <button 
                                                onClick={() => handleStatusUpdate(lead.id, 'CONTACTED')}
                                                className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all active:scale-95"
                                                title="В работу"
                                            >
                                                <Clock size={20} />
                                            </button>
                                            <button 
                                                onClick={() => handleStatusUpdate(lead.id, 'COMPLETED')}
                                                className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all active:scale-95"
                                                title="Завершить"
                                            >
                                                <CheckCircle size={20} />
                                            </button>
                                            <button 
                                                onClick={() => handleStatusUpdate(lead.id, 'CANCELLED')}
                                                className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-95"
                                                title="Отменить"
                                            >
                                                <XCircle size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Marketplace Item Reference */}
                                    {lead.marketplace && (
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 mb-6 hover:bg-white/10 transition-all cursor-pointer">
                                            <div className="w-12 h-12 rounded-xl bg-black/20 overflow-hidden ring-1 ring-white/10 shrink-0">
                                                {lead.marketplace.image && <img src={lead.marketplace.image} className="w-full h-full object-cover" alt="" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-0.5">По объявлению</div>
                                                <div className="text-sm font-black text-white uppercase truncate">{lead.marketplace.name}</div>
                                            </div>
                                            <ExternalLink size={14} className="text-slate-600" />
                                        </div>
                                    )}

                                    {/* Lead Message & Preferred Date */}
                                    <div className="space-y-4 mb-6">
                                        {lead.preferredDate && (
                                            <div className="flex items-center gap-2 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider">
                                                <CalendarDays size={14} />
                                                Желаемое время: {new Date(lead.preferredDate).toLocaleString('ru-RU', { 
                                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                        )}
                                        {lead.message && (
                                            <div className="p-4 bg-[#13111C] rounded-2xl border border-white/5 italic text-slate-400 text-sm leading-relaxed">
                                                "{lead.message}"
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
                                        <a 
                                            href={`tel:${lead.phone}`}
                                            className="h-12 flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/5 group/btn active:scale-95"
                                        >
                                            <Phone size={14} className="group-hover/btn:scale-110 transition-transform" />
                                            Позвонить
                                        </a>
                                        <button 
                                            onClick={() => handleInitiateChat(lead.userId)}
                                            className="h-12 flex items-center justify-center gap-2 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-600/5 group/btn active:scale-95"
                                        >
                                            <MessageSquare size={14} className="group-hover/btn:scale-110 transition-transform" />
                                            Написать
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
