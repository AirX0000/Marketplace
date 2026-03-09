import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, Instagram, Youtube, CheckCircle2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const CONTACTS = [
    {
        icon: <Phone className="w-6 h-6" />,
        label: 'Телефон',
        value: '+998 (71) 200-00-00',
        href: 'tel:+998712000000',
        color: 'from-blue-500 to-indigo-600',
    },
    {
        icon: <Mail className="w-6 h-6" />,
        label: 'Email поддержки',
        value: 'support@autohouse.uz',
        href: 'mailto:support@autohouse.uz',
        color: 'from-violet-500 to-purple-600',
    },
    {
        icon: <MessageSquare className="w-6 h-6" />,
        label: 'Telegram',
        value: '@autohouse_uz',
        href: 'https://t.me/autohouse_uz',
        color: 'from-sky-400 to-cyan-500',
    },
    {
        icon: <MapPin className="w-6 h-6" />,
        label: 'Офис',
        value: 'Ташкент, Мирабадский р-н',
        color: 'from-emerald-500 to-teal-600',
    },
];

export function ContactsPage() {
    const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' });
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            toast.error('Заполните обязательные поля');
            return;
        }
        setLoading(true);
        await new Promise(r => setTimeout(r, 800)); // Simulate API
        setSent(true);
        setLoading(false);
        toast.success('Сообщение отправлено! Ответим в течение 24 часов.');
    };

    return (
        <div className="min-h-screen bg-background">
            <Helmet>
                <title>Контакты — Autohouse Marketplace</title>
                <meta name="description" content="Свяжитесь с командой Autohouse. Поддержка, партнёрство, обратная связь." />
            </Helmet>

            {/* Hero */}
            <div className="relative bg-gradient-to-br from-slate-900 via-[#0f0c1d] to-slate-900 overflow-hidden py-24 px-4">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="container mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-bold text-violet-300 uppercase tracking-widest mb-6">
                        ✉️ Связаться с нами
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                        Мы всегда на связи
                    </h1>
                    <p className="text-slate-400 max-w-xl mx-auto text-lg">
                        Вопросы о покупке, партнёрстве или технической поддержке — напишите нам в любое время.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 space-y-16">

                {/* Contact Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {CONTACTS.map((c, i) => (
                        <a
                            key={i}
                            href={c.href || '#'}
                            target={c.href?.startsWith('http') ? '_blank' : undefined}
                            rel="noreferrer"
                            className="group block bg-card border border-border rounded-3xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                {c.icon}
                            </div>
                            <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1">{c.label}</p>
                            <p className="font-bold text-foreground text-sm">{c.value}</p>
                        </a>
                    ))}
                </div>

                {/* Form + Hours */}
                <div className="grid md:grid-cols-[3fr_2fr] gap-8">

                    {/* Form */}
                    <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                        {sent ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-black text-foreground mb-2">Сообщение отправлено!</h3>
                                <p className="text-muted-foreground text-sm">Мы ответим на ваш email в течение 24 часов.</p>
                                <button
                                    onClick={() => { setForm({ name: '', email: '', topic: '', message: '' }); setSent(false); }}
                                    className="mt-8 text-primary font-bold hover:underline text-sm"
                                >
                                    Отправить ещё одно
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-black text-foreground mb-1">Обратная связь</h2>
                                <p className="text-sm text-muted-foreground mb-8">Заполните форму, и мы свяжемся с вами</p>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-foreground uppercase tracking-wider">Имя *</label>
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                                placeholder="Алишер"
                                                className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-foreground uppercase tracking-wider">Email *</label>
                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                                placeholder="email@example.com"
                                                className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-foreground uppercase tracking-wider">Тема</label>
                                        <select
                                            value={form.topic}
                                            onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                                            className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                                        >
                                            <option value="">Выберите тему</option>
                                            <option value="support">Техническая поддержка</option>
                                            <option value="partnership">Партнёрство / Реклама</option>
                                            <option value="listing">Вопрос по объявлению</option>
                                            <option value="payment">Вопрос по оплате</option>
                                            <option value="other">Другое</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-foreground uppercase tracking-wider">Сообщение *</label>
                                        <textarea
                                            value={form.message}
                                            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                            placeholder="Опишите ваш вопрос..."
                                            className="w-full h-32 px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm resize-none"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl hover:from-violet-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-violet-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                                        ) : (
                                            <><Send size={16} /> Отправить</>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>

                    {/* Hours + Social */}
                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-3xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-amber-500" />
                                </div>
                                <h3 className="font-black text-foreground">Режим работы</h3>
                            </div>
                            <div className="space-y-2 text-sm">
                                {[
                                    ['Пн — Пт', '09:00 — 18:00', true],
                                    ['Суббота', '10:00 — 15:00', false],
                                    ['Воскресенье', 'Выходной', false],
                                ].map(([day, time, active]) => (
                                    <div key={day} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                                        <span className="text-muted-foreground font-medium">{day}</span>
                                        <span className={`font-bold ${active ? 'text-emerald-500' : 'text-foreground'}`}>{time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-3xl p-6">
                            <h3 className="font-black text-foreground mb-4">Мы в соцсетях</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Telegram', icon: '✈️', href: 'https://t.me/autohouse_uz', bg: 'bg-sky-500/10 text-sky-500' },
                                    { label: 'Instagram', icon: '📸', href: '#', bg: 'bg-pink-500/10 text-pink-500' },
                                    { label: 'YouTube', icon: '▶️', href: '#', bg: 'bg-red-500/10 text-red-500' },
                                    { label: 'Facebook', icon: '👥', href: '#', bg: 'bg-blue-500/10 text-blue-500' },
                                ].map(s => (
                                    <a
                                        key={s.label}
                                        href={s.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`flex items-center gap-2 p-3 rounded-2xl ${s.bg} font-bold text-sm hover:scale-105 transition-transform`}
                                    >
                                        <span>{s.icon}</span>{s.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div>
                    <h2 className="text-2xl font-black text-foreground mb-6 flex items-center gap-2">
                        <MapPin className="text-primary" /> Мы на карте
                    </h2>
                    <div className="h-[420px] rounded-3xl overflow-hidden border border-border shadow-sm relative z-0">
                        <MapContainer center={[41.311081, 69.240562]} zoom={14} scrollWheelZoom={false} className="h-full w-full">
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={[41.311081, 69.240562]}>
                                <Popup>
                                    <div className="font-bold text-sm">Главный офис Autohouse</div>
                                    <div className="text-xs text-gray-500 mt-0.5">г. Ташкент, Мирабадский район</div>
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
