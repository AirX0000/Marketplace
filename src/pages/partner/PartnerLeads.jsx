import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { 
    CalendarDays, User, Phone, MessageSquare, 
    Clock, CheckCircle, XCircle, Search, 
    Filter, MoreHorizontal, ExternalLink, Sparkles, AlertTriangle, ArrowRight, MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { cn, getImageUrl } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ResponsiveContainer, AreaChart, Area, 
    XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { MarketplaceCardSkeleton } from '../../components/ui/Skeleton';

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

// Helper for AI Lead Scoring
const calculateLeadScore = (lead) => {
    let score = 50; // Base score
    if (lead.message && lead.message.length > 50) score += 20;
    if (lead.preferredDate) score += 15;
    if (lead.status === 'CONTACTED') score += 10;
    if (lead.marketplace?.price > 100000000) score += 5; // High value item
    return Math.min(score, 100);
};

const getSmartTags = (lead) => {
    const tags = [];
    if (lead.preferredDate) tags.push({ label: 'Срочно', color: 'text-red-400 bg-red-400/10' });
    if (lead.message && lead.message.toLowerCase().includes('торг')) tags.push({ label: 'Торгуется', color: 'text-amber-400 bg-amber-400/10' });
    if (lead.message && lead.message.length > 100) tags.push({ label: 'Детальный запрос', color: 'text-blue-400 bg-blue-400/10' });
    if (calculateLeadScore(lead) > 80) tags.push({ label: 'Горячий лид', color: 'text-emerald-400 bg-emerald-400/10' });
    return tags;
};

const MagneticButton = ({ children, className, onClick, ...props }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    
    const handleMouseMove = (e) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = (clientX - (left + width / 2)) * 0.2;
        const y = (clientY - (top + height / 2)) * 0.2;
        setPosition({ x, y });
    };

    const handleMouseLeave = () => setPosition({ x: 0, y: 0 });

    return (
        <motion.button
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: 'spring', stiffness: 150, damping: 15 }}
            className={className}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export function PartnerLeads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const [performanceData] = useState([
        { date: '01.03', views: 120, leads: 5, rate: 4.1 },
        { date: '03.03', views: 450, leads: 12, rate: 2.6 },
        { date: '05.03', views: 380, leads: 8, rate: 2.1 },
        { date: '07.03', views: 890, leads: 25, rate: 2.8 },
        { date: '09.03', views: 1200, leads: 32, rate: 2.6 },
        { date: '11.03', views: 1100, leads: 28, rate: 2.5 },
        { date: '13.03', views: 1540, leads: 45, rate: 2.9 },
    ]);

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

    const handleAISuggestReply = (lead) => {
        const suggestion = `Здравствуйте, ${lead.name}! Спасибо за ваш интерес к "${lead.marketplace?.name}". Я готов ответить на все ваши вопросы. Когда вам будет удобно созвониться?`;
        navigator.clipboard.writeText(suggestion);
        toast.success('Ответ скопирован! Вставьте его в чат.');
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
            <div className="space-y-8">
                <div className="h-48 bg-[#191624] rounded-[2.5rem] border border-white/5 animate-pulse" />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => <MarketplaceCardSkeleton key={i} />)}
                </div>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#191624] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Конверсия</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Соотношение просмотров к заявкам</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Просмотры</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Конверсия %</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-[250px] w-full min-h-[250px] min-w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#64748b" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={{ fontWeight: 900, fill: '#475569' }}
                                />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#13111C', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="views" 
                                    stroke="#3b82f6" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorViews)" 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="rate" 
                                    stroke="#10b981" 
                                    strokeWidth={2}
                                    fillOpacity={0} 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Smart Insights Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:scale-110 transition-transform">
                            <Sparkles size={48} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles size={16} className="text-indigo-200" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100">Smart Insights</span>
                            </div>
                            <h4 className="text-lg font-black leading-tight mb-2 uppercase italic tracking-tighter">Повысьте продажи!</h4>
                            <p className="text-xs text-indigo-100 font-medium mb-4 leading-relaxed">
                                Ваши объявления в категории "Авто" получают на 25% больше просмотров по утрам.
                            </p>
                            <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                Применить советы <ArrowRight size={12} />
                            </button>
                        </div>
                    </div>

                    {[
                        { label: 'Всего заявок', value: leads.length, icon: CalendarDays, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                        { label: 'Новые', value: leads.filter(l => l.status === 'NEW').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                        { label: 'В работе', value: leads.filter(l => l.status === 'CONTACTED').length, icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                        { label: 'Успешно', value: leads.filter(l => l.status === 'COMPLETED').length, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#191624] border border-white/5 rounded-3xl p-6 flex items-center justify-between group hover:border-white/10 transition-all">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-2xl font-black text-white">{stat.value}</p>
                            </div>
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                                <stat.icon size={20} className={stat.color} />
                            </div>
                        </div>
                    ))}
                </div>
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
                                                    <div className="flex items-center gap-1 bg-white/5 px-2 rounded-full text-[8px] font-black text-purple-400 border border-purple-500/20 italic">
                                                        AI Score: {calculateLeadScore(lead)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                                                {new Date(lead.createdAt).toLocaleDateString('ru-RU')}
                                            </span>
                                            <div className="flex gap-1.5 flex-wrap justify-end">
                                                {getSmartTags(lead).map((tag, idx) => (
                                                    <span key={idx} className={cn("px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-tighter italic", tag.color)}>
                                                        {tag.label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2 self-end sm:self-start mb-6">
                                        <MagneticButton
                                            onClick={() => handleAISuggestReply(lead)}
                                            className="p-3 rounded-xl bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white transition-all active:scale-95 border border-purple-600/30 flex items-center gap-2"
                                            title="AI Ответ"
                                        >
                                            <Sparkles size={16} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">AI Reply</span>
                                        </MagneticButton>
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

                                    {/* Marketplace Item Reference */}
                                    {lead.marketplace && (
                                        <Link to={`/marketplaces/${lead.marketplace.id}`} target="_blank" className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 mb-6 hover:bg-white/10 transition-all cursor-pointer group/link">
                                            <div className="w-12 h-12 rounded-xl bg-black/20 overflow-hidden ring-1 ring-white/10 shrink-0">
                                                {getImageUrl(lead.marketplace.image) ? (
                                                <img 
                                                    src={getImageUrl(lead.marketplace.image)} 
                                                    className="w-full h-full object-cover group-hover/link:scale-110 transition-transform duration-500" 
                                                    alt={lead.marketplace.name}
                                                    onError={(e) => {
                                                        e.target.src = "https://images.unsplash.com/photo-1472851294608-4151050801cd?auto=format&fit=crop&q=80&w=1000";
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-slate-50">?</div>
                                            )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-0.5">По объявлению</div>
                                                <div className="text-sm font-black text-white uppercase truncate group-hover/link:text-blue-400 transition-colors">{lead.marketplace.name}</div>
                                            </div>
                                            <ExternalLink size={14} className="text-slate-600 group-hover/link:text-blue-400 transition-colors" />
                                        </Link>
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

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-auto">
                                        <MagneticButton 
                                            onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                                            className="h-12 flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/5 group/btn active:scale-95"
                                        >
                                            <Phone size={14} className="group-hover/btn:scale-110 transition-transform" />
                                            Позвонить
                                        </MagneticButton>
                                        <MagneticButton 
                                            onClick={() => window.open(`https://t.me/${lead.phone.replace(/\D/g, '')}`, '_blank')}
                                            className="h-12 flex items-center justify-center gap-2 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all shadow-lg shadow-sky-500/5 group/btn active:scale-95"
                                        >
                                            <MessageCircle size={14} className="group-hover/btn:scale-110 transition-transform" />
                                            Telegram
                                        </MagneticButton>
                                        <MagneticButton 
                                            onClick={() => handleInitiateChat(lead.userId)}
                                            className="h-12 flex items-center justify-center gap-2 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-600/5 group/btn active:scale-95"
                                        >
                                            <MessageSquare size={14} className="group-hover/btn:scale-110 transition-transform" />
                                            Чат
                                        </MagneticButton>
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
