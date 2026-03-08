import React, { useState } from 'react';
import { Building2, Percent, Calendar, Wallet, CheckCircle2, ChevronRight, Send, Phone, User, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { toast } from 'react-hot-toast';

const BANKS_DATA = [
    { name: { uz: "Халқ банки", ru: "Народный банк" }, primary: { percent: "17%", term: { ru: "до 20 лет" }, initial: { ru: "от 15%" }, max: { ru: "до 420 млн сум" } }, secondary: { percent: "25%", term: { ru: "15 лет" }, initial: { ru: "25%" }, max: { ru: "до 800 млн сум" } } },
    { name: { uz: "Азия Альянс Банк", ru: "Азия Альянс Банк" }, primary: { percent: "18%", term: { ru: "до 20 лет" }, initial: { ru: "от 15%" }, max: { ru: "до 420 млн сум" } }, secondary: { percent: "26%", term: { ru: "15 лет" }, initial: { ru: "от 26%" }, max: { ru: "до 1 млрд 318 млн сум" } } },
    { name: { uz: "БРБ", ru: "БРБ (BRB)" }, primary: { percent: "17.5%–18%", term: { ru: "до 20 лет" }, initial: { ru: "15%–25%" }, max: { ru: "до 420 млн сум" } }, secondary: { percent: "24.5%–26%", term: { ru: "до 15 лет" }, initial: { ru: "от 20%" }, max: { ru: "до 2 млрд 60 млн сум" } } },
    { name: { uz: "Гарант банк", ru: "Гарант банк" }, primary: null, secondary: { percent: "26%–28%", term: { ru: "до 20 лет" }, initial: { ru: "25%–45%" }, max: { ru: "до 420 млн сум" } } },
    { name: { uz: "Тенге Банк", ru: "Тенге Банк" }, primary: { percent: "23.9%–24.9%", term: { ru: "до 15 лет" }, initial: { ru: "от 25%" }, max: { ru: "до 820 млн сум" } }, secondary: { percent: "24.6%", term: { ru: "до 10 лет" }, initial: { ru: "от 28%" }, max: { ru: "до 820 млн сум" } } },
    { name: { uz: "Ипак Йўли Банк", ru: "Ипак Йули Банк" }, primary: { percent: "16.5%–17.5%", term: { ru: "до 20 лет" }, initial: { ru: "5%–15%" }, max: { ru: "до 420 млн сум" } }, secondary: { percent: "23%–24.9%", term: { ru: "15 лет" }, initial: { ru: "25%–50%" }, max: { ru: "до 1.5 млрд сум" } } },
    { name: { uz: "МКБанк", ru: "МКБанк" }, primary: { percent: "18%", term: { ru: "до 20 лет" }, initial: { ru: "от 15%" }, max: { ru: "до 420 млн сум" } }, secondary: { percent: "24%–26%", term: { ru: "до 20 лет" }, initial: { ru: "от 25%" }, max: { ru: "до 1 млрд 648 млн сум" } } },
    { name: { uz: "Ўзмиллийбанк", ru: "Узнацбанк (NBU)" }, primary: { percent: "17%–17.5%", term: { ru: "до 20 лет" }, initial: { ru: "15%–40%" }, max: { ru: "до 420 млн сум" } }, secondary: { percent: "21.5%–22%", term: { ru: "до 20 лет" }, initial: { ru: "от 25%" }, max: { ru: "до 800 млн сум" } } },
    { name: { uz: "Туронбанк", ru: "Туронбанк" }, primary: { percent: "17%–18%", term: { ru: "до 20 лет" }, initial: { ru: "15%–70%" }, max: { ru: "до 420 млн сум" } }, secondary: { percent: "26%", term: { ru: "до 10 лет" }, initial: { ru: "20%–30%" }, max: { ru: "до 1 млрд 648 млн сум" } } },
    { name: { uz: "Асакабанк", ru: "Асакабанк" }, primary: { percent: "20%", term: { ru: "до 20 лет" }, initial: { ru: "от 25%" }, max: { ru: "до 800 млн сум" } }, secondary: { percent: "24.5%", term: { ru: "до 10 лет" }, initial: { ru: "25%" }, max: { ru: "до 800 млн сум" } } },
    { name: { uz: "ЎзСҚБ", ru: "Узпромстройбанк (SQB)" }, primary: { percent: "19%", term: { ru: "до 20 лет" }, initial: { ru: "от 25%" }, max: { ru: "до 800 млн сум" } }, secondary: { percent: "23.5%–24.5%", term: { ru: "до 15 лет" }, initial: { ru: "от 20%" }, max: { ru: "до 1.5 млрд сум" } } },
];

export function MortgageInfoPage() {
    const { i18n } = useTranslation();
    const isRu = i18n.language === 'ru';

    const [marketType, setMarketType] = useState('primary');
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', bank: '', amount: '', downPayment: '20', term: '20', propertyType: 'primary' });

    const t = (obj) => {
        if (!obj) return '';
        if (typeof obj === 'string') return obj;
        return isRu ? obj.ru : obj.uz;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.phone) return toast.error('Заполните обязательные поля');
        setFormLoading(true);
        try {
            await api.createLoanApplication({
                type: 'MORTGAGE',
                amount: Number(form.amount.replace(/\D/g, '')) || 0,
                downPayment: Number(form.downPayment),
                term: Number(form.term),
                monthlyPayment: 0,
                notes: `Банк: ${form.bank || 'любой'} | Тип: ${form.propertyType} | ${form.name} | ${form.phone}`
            });
        } catch {
            const saved = JSON.parse(localStorage.getItem('pendingMortgage') || '[]');
            saved.push({ ...form, at: new Date().toISOString() });
            localStorage.setItem('pendingMortgage', JSON.stringify(saved));
        } finally {
            setFormLoading(false);
            setFormSubmitted(true);
        }
    };

    const selectBank = (bankName, type) => {
        setForm(f => ({ ...f, bank: bankName, propertyType: type }));
        document.getElementById('mortgage-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* Hero */}
            <div className="bg-emerald-600 text-white py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-6">
                        <Building2 size={16} /> {isRu ? 'Недвижимость' : 'Кўчмас мулк'}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-4">{isRu ? 'Ипотечные Кредиты' : 'Ипотека Кредитлари'}</h1>
                    <p className="text-emerald-100 max-w-2xl text-lg mb-8">
                        {isRu ? 'Актуальные ставки по ипотеке. Нажмите «Выбрать» — форма заявки заполнится автоматически.' : 'Eng so\'ngi ipoteka stavkalari. «Tanlash» tugmasini bosing — ariza shakli avtomatik to\'ldiriladi.'}
                    </p>
                    <div className="inline-flex p-1 bg-black/20 backdrop-blur-md rounded-2xl">
                        {[['primary', isRu ? 'Первичный рынок' : 'Бирламчи'], ['secondary', isRu ? 'Вторичный рынок' : 'Иккиламчи']].map(([k, lbl]) => (
                            <button key={k} onClick={() => setMarketType(k)} className={`px-6 py-3 rounded-xl font-bold transition-all ${marketType === k ? 'bg-white text-emerald-600 shadow-lg' : 'text-white/80 hover:bg-white/10'}`}>{lbl}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bank Cards */}
            <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {BANKS_DATA.filter(b => b[marketType] !== null).map((bank, idx) => {
                        const data = bank[marketType];
                        return (
                            <div key={idx} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:-translate-y-1 transition-transform group">
                                <div className="flex justify-between items-start mb-5">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">{t(bank.name)}</h3>
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl">🏦</div>
                                </div>
                                <div className="space-y-3 mb-5">
                                    {[
                                        { Icon: Percent, color: 'emerald', label: isRu ? 'Процент' : 'Фоизи', value: data.percent },
                                        { Icon: Calendar, color: 'blue', label: isRu ? 'Срок' : 'Муддат', value: t(data.term) },
                                        { Icon: Wallet, color: 'purple', label: isRu ? 'Взнос' : 'Бошланғич', value: t(data.initial) },
                                        { Icon: CheckCircle2, color: 'orange', label: isRu ? 'Сумма' : 'Миқдори', value: t(data.max) },
                                    ].map(({ Icon, color, label, value }) => (
                                        <div key={label} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                                                <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                                                    <Icon size={13} className={`text-${color}-500`} />
                                                </div>
                                                <span className="text-sm">{label}</span>
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-white text-sm">{value}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => selectBank(t(bank.name), marketType)}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold hover:bg-emerald-100 transition-colors"
                                >
                                    {isRu ? 'Выбрать' : 'Tanlash'} <ChevronRight size={16} />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* ━━━━ APPLICATION FORM ━━━━ */}
                <div id="mortgage-form" className="mt-16 mb-8 scroll-mt-24">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold mb-4">
                            📋 {isRu ? 'Онлайн заявка' : 'Online ariza'}
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">{isRu ? 'Подайте заявку на ипотеку' : 'Ipotekaga ariza bering'}</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-sm">
                            {isRu ? 'Заполните форму — менеджер подберёт лучшие условия и свяжется в течение 30 минут.' : 'Shaklni to\'ldiring — menejer 30 daqiqa ichida siz bilan bog\'lanadi.'}
                        </p>
                    </div>

                    {formSubmitted ? (
                        <div className="max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-[32px] p-12 text-center shadow-xl border border-slate-100 dark:border-slate-700">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="text-emerald-600 h-12 w-12" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">{isRu ? 'Заявка принята!' : 'Ariza qabul qilindi!'}</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-8">
                                {isRu ? `Менеджер свяжется по номеру ${form.phone} в течение 30 минут (пн–пт, 9:00–18:00).` : `Menejer ${form.phone} raqamiga 30 daqiqa ichida murojaat qiladi.`}
                            </p>
                            <Link to="/marketplaces?category=Недвижимость" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
                                {isRu ? 'Смотреть объекты' : 'Ob\'ektlarni ko\'rish'} →
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-xl border border-slate-100 dark:border-slate-700 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"><User size={14} className="inline mr-1" />{isRu ? 'Ваше имя *' : 'Ismingiz *'}</label>
                                    <input required type="text" placeholder={isRu ? "Иван Иванов" : "Ismoil To'rayev"} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"><Phone size={14} className="inline mr-1" />{isRu ? 'Телефон *' : 'Telefon *'}</label>
                                    <input required type="tel" placeholder="+998 90 123 45 67" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">🏦 {isRu ? 'Банк' : 'Bank'}</label>
                                    <select value={form.bank} onChange={e => setForm(f => ({ ...f, bank: e.target.value }))} className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500">
                                        <option value="">{isRu ? 'Любой (подберём)' : 'Istalgan (tanlaymiz)'}</option>
                                        {BANKS_DATA.map((b, i) => <option key={i} value={b.name.ru}>{b.name.ru}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">💰 {isRu ? 'Стоимость (сум)' : 'Narxi (so\'m)'}</label>
                                    <input type="text" placeholder="500 000 000" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        {isRu ? 'Первоначальный взнос:' : 'Boshlang\'ich to\'lov:'} <span className="text-emerald-600">{form.downPayment}%</span>
                                    </label>
                                    <input type="range" min="15" max="80" step="5" value={form.downPayment} onChange={e => setForm(f => ({ ...f, downPayment: e.target.value }))} className="w-full accent-emerald-600 cursor-pointer" />
                                    <div className="flex justify-between text-xs text-slate-400 mt-1"><span>15%</span><span>80%</span></div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        {isRu ? 'Срок:' : 'Muddat:'} <span className="text-emerald-600">{form.term} {isRu ? 'лет' : 'yil'}</span>
                                    </label>
                                    <input type="range" min="3" max="25" step="1" value={form.term} onChange={e => setForm(f => ({ ...f, term: e.target.value }))} className="w-full accent-emerald-600 cursor-pointer" />
                                    <div className="flex justify-between text-xs text-slate-400 mt-1"><span>3</span><span>25</span></div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">{isRu ? 'Тип недвижимости' : 'Ko\'chmas mulk turi'}</label>
                                <div className="flex gap-3">
                                    {[['primary', '🏗 ' + (isRu ? 'Новостройка' : 'Yangi bino')], ['secondary', '🏠 ' + (isRu ? 'Вторичка' : 'Ikkilamchi')]].map(([val, lbl]) => (
                                        <button key={val} type="button" onClick={() => setForm(f => ({ ...f, propertyType: val }))} className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${form.propertyType === val ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-emerald-300'}`}>{lbl}</button>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" disabled={formLoading} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-600/25 active:scale-95">
                                {formLoading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><Send size={20} /> {isRu ? 'Отправить заявку' : 'Ariza yuborish'}</>}
                            </button>
                            <p className="text-xs text-center text-slate-400">{isRu ? 'Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.' : 'Tugmani bosish orqali shaxsiy ma\'lumotlarni qayta ishlashga rozilik bildirasiz.'}</p>
                        </form>
                    )}
                </div>

                <div className="mt-4 text-center pb-4">
                    <Link to="/marketplaces?category=Недвижимость" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25">
                        {isRu ? 'Смотреть объекты' : 'Ob\'ektlarni ko\'rish'} →
                    </Link>
                </div>
            </div>
        </div>
    );
}
