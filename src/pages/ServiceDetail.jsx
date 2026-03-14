import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useShop } from '../context/ShopContext';
import { toast } from 'react-hot-toast';
import {
    Briefcase, CalendarDays, Share2, Heart, Flag, Check, FileText, X, Send
} from 'lucide-react';
import { cn } from '../lib/utils';

const SERVICE_ICONS = {
    'Риелтор': '🏡',
    'Нотариус': '📜',
    'Оценка': '📊',
    'Страхование': '🛡️',
};

const SERVICE_COLORS = {
    'Риелтор': 'from-emerald-500 to-teal-600',
    'Нотариус': 'from-violet-500 to-purple-700',
    'Оценка': 'from-blue-500 to-indigo-700',
    'Страхование': 'from-orange-400 to-amber-600',
};

export function ServiceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [isSubmittingLead, setIsSubmittingLead] = useState(false);
    const { toggleFavorite, isFavorite, isAuthenticated, user } = useShop();

    const [leadData, setLeadData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        message: '',
        preferredDate: ''
    });

    useEffect(() => {
        async function load() {
            try {
                const data = await api.getMarketplace(id);
                setService(data);
            } catch {
                toast.error('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
    );

    if (!service) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Объявление не найдено</h1>
            <Link to="/marketplaces" className="mt-4 px-6 py-2 bg-primary text-white rounded-lg">В каталог</Link>
        </div>
    );

    const isFav = isFavorite(service.id);
    const icon = SERVICE_ICONS[service.subcategory] || SERVICE_ICONS[service.category] || '💼';
    const gradient = SERVICE_COLORS[service.subcategory] || SERVICE_COLORS[service.category] || 'from-blue-500 to-indigo-700';
    const phone = service.owner?.phone || service.phone;

    const handleChat = async () => {
        if (!isAuthenticated) return toast.error('Войдите, чтобы написать');
        try {
            await api.initiateChat(service.owner.id);
            navigate('/profile/chat');
        } catch { toast.error('Ошибка чата'); }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Ссылка скопирована!');
    };

    const handleLeadSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingLead(true);
        try {
            await api.createLead({
                ...leadData,
                marketplaceId: service.id,
                partnerId: service.ownerId
            });
            toast.success('Заявка успешно отправлена! Специалист свяжется с вами в ближайшее время.');
            setShowLeadModal(false);
            setLeadData({ name: user?.name || '', phone: user?.phone || '', message: '', preferredDate: '' });
        } catch (error) {
            toast.error(error.message || 'Ошибка при отправке заявки');
        } finally {
            setIsSubmittingLead(false);
        }
    };

    const attributes = service.attributes
        ? (typeof service.attributes === 'string' ? JSON.parse(service.attributes) : service.attributes)
        : {};
    const specs = attributes.specs || {};

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-24">

            {/* Sticky Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    <Link to="/marketplaces" className="flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />Назад
                    </Link>
                    <div className="flex items-center gap-2">
                        <button onClick={handleShare} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-blue-600 transition-colors">
                            <Share2 size={18} />
                        </button>
                        <button
                            onClick={() => toggleFavorite(service)}
                            className={cn("p-2 rounded-xl bg-slate-50 dark:bg-slate-800 transition-colors", isFav ? "text-red-500" : "text-slate-500 hover:text-red-500")}
                        >
                            <Heart size={18} className={cn(isFav && "fill-current")} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">

                {/* Hero Card */}
                <div className={`bg-gradient-to-br ${gradient} rounded-3xl p-8 md:p-12 text-white mb-8 shadow-2xl relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10 rounded-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl shadow-lg border border-white/30">
                                    {icon}
                                </div>
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">
                                        {service.subcategory || service.category}
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-black leading-tight">{service.name}</h1>
                                    {service.region && (
                                        <div className="flex items-center gap-1.5 mt-2 text-white/80 text-sm">
                                            <MapPin size={14} />
                                            {service.region}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black">
                                    {service.price ? `${Number(service.price).toLocaleString()} сум` : 'По договорённости'}
                                </div>
                                {service.price && <div className="text-xs text-white/70 mt-1">за услугу</div>}
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mt-6">
                            {(service.subcategory === 'Риелтор' || service.subcategory === 'Нотариус' || service.owner?.isForcedVerified) && (
                                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm">
                                    <Shield size={12} />Проверенный специалист
                                </span>
                            )}
                            {(specs.license) && (
                                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm">
                                    <Check size={12} />Лицензировано
                                </span>
                            )}
                            {service.subcategory === 'Оценка' && (
                                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm">
                                    <FileText size={12} />Сертифицированные отчеты
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Left: Info */}
                    <div className="md:col-span-2 space-y-6">

                        {/* About */}
                        {service.description && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Об услуге</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{service.description}</p>
                            </div>
                        )}

                        {/* Gallery */}
                        {service.image && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                                <img src={service.image} alt={service.name} className="w-full h-64 object-cover" />
                            </div>
                        )}

                        {/* Certificates / Portfolio */}
                        {service.certificates && Array.isArray(service.certificates) && service.certificates.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Портфолио и сертификаты</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {service.certificates.map((cert, idx) => (
                                        <a 
                                            key={idx} 
                                            href={cert} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="aspect-square rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:ring-2 hover:ring-blue-500 transition-all group"
                                        >
                                            <img src={cert} alt={`Certificate ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Info Grid */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Детали</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: <Briefcase size={16} />, label: 'Категория', val: service.subcategory || service.category },
                                    { icon: <MapPin size={16} />, label: 'Регион', val: service.region || '—' },
                                    specs.experience ? { icon: <Star size={16} />, label: 'Опыт работы', val: `${specs.experience} лет` } : null,
                                    specs.deals ? { icon: <Check size={16} />, label: 'Сделок', val: specs.deals } : null,
                                    specs.license ? { icon: <Shield size={16} />, label: 'Лицензия', val: specs.license } : null,
                                    specs.policy_types ? { icon: <Shield size={16} />, label: 'Полисы', val: specs.policy_types } : null,
                                    { icon: <CalendarDays size={16} />, label: 'Дата публикации', val: new Date(service.createdAt).toLocaleDateString('ru-RU') },
                                ].filter(Boolean).map(({ icon, label, val }) => (
                                    <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                        <div className="mt-0.5 text-blue-500">{icon}</div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</div>
                                            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{val}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Contact Sidebar */}
                    <div className="space-y-4">

                        {/* Seller */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Специалист</div>
                            <div className="flex items-center gap-4 mb-5">
                                <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center font-black text-xl shadow-lg`}>
                                    {service.owner?.name?.[0] || 'S'}
                                </div>
                                <div>
                                    <div className="font-black text-slate-900 dark:text-white">{service.owner?.name || 'Специалист'}</div>
                                    <div className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-0.5">
                                        <Check size={12} />Верифицирован
                                    </div>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="space-y-3">
                                {phone && (
                                    <a
                                        href={`tel:${phone}`}
                                        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-lg shadow-emerald-500/20"
                                    >
                                        <Phone size={16} />
                                        Позвонить
                                    </a>
                                )}

                                <button
                                    onClick={handleChat}
                                    className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-600/20"
                                >
                                    <MessageSquare size={16} />
                                    Написать
                                </button>

                                <button
                                    onClick={() => setShowLeadModal(true)}
                                    className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-600 text-slate-900 dark:text-white font-bold transition-all"
                                >
                                    <CalendarDays size={16} />
                                    Записаться на консультацию
                                </button>
                            </div>
                        </div>

                        {/* Report */}
                        <button className="w-full text-center text-xs text-slate-400 hover:text-red-500 flex items-center justify-center gap-1.5 transition-colors py-2">
                            <Flag size={12} />
                            Пожаловаться на объявление
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE BOTTOM ACTION BAR */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 flex gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] safe-area-pb">
                {phone && (
                    <a href={`tel:${phone}`} className="h-12 w-12 shrink-0 flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 active:scale-95 transition-transform">
                        <Phone size={20} />
                    </a>
                )}
                <button onClick={handleChat} className="flex-1 h-12 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
                    <MessageSquare size={16} /> Написать
                </button>
            </div>
            {/* Consultation Lead Modal */}
            <AnimatePresence>
                {showLeadModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLeadModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6">
                                <button onClick={() => setShowLeadModal(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mb-6">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl text-white mb-4 shadow-lg`}>
                                    <CalendarDays />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Консультация</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Оставьте заявку, и {service.owner?.name || 'специалист'} свяжется с вами</p>
                            </div>

                            <form onSubmit={handleLeadSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ваше имя</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Александр"
                                        className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                                        value={leadData.name}
                                        onChange={e => setLeadData({ ...leadData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Телефон</label>
                                    <input
                                        required
                                        type="tel"
                                        placeholder="+998 90 123 45 67"
                                        className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                                        value={leadData.phone}
                                        onChange={e => setLeadData({ ...leadData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Желаемая дата и время</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                                        value={leadData.preferredDate}
                                        onChange={e => setLeadData({ ...leadData, preferredDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Комментарий (необязательно)</label>
                                    <textarea
                                        placeholder="Расскажите вкратце о вашем вопросе..."
                                        className="w-full h-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white resize-none"
                                        value={leadData.message}
                                        onChange={e => setLeadData({ ...leadData, message: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmittingLead}
                                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 disabled:opacity-50 transition-all mt-6"
                                >
                                    {isSubmittingLead ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> : <Send size={18} />}
                                    Отправить заявку
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
