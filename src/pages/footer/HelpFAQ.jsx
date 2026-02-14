import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, MessageCircle, Mail, Phone } from 'lucide-react';

const FAQS = [
    {
        category: "Покупки",
        items: [
            { q: "Как оформить заказ?", a: "Выберите товар, добавьте его в корзину и нажмите 'Оформить заказ'. Следуйте инструкциям по выбору доставки и оплаты." },
            { q: "Какие способы оплаты доступны?", a: "Мы принимаем карты UzCard, Humo, Visa, Mastercard, а также оплату через AuraPay и наличными при получении." },
            { q: "Можно ли вернуть товар?", a: "Да, вы можете вернуть товар в течение 10 дней, если он не был использован и сохранил товарный вид." }
        ]
    },
    {
        category: "Продажи",
        items: [
            { q: "Как начать продавать?", a: "Зарегистрируйтесь как партнер, заполните данные магазина и добавьте свои товары через панель управления." },
            { q: "Какая комиссия платформы?", a: "Комиссия составляет 5% с каждой успешной продажи. Для новых продавцов первый месяц - 0%." }
        ]
    },
    {
        category: "Безопасность",
        items: [
            { q: "Как защищены мои данные?", a: "Мы используем шифрование SSL и надежные протоколы защиты данных. Ваши платежные данные не хранятся на наших серверах." },
            { q: "Что делать, если продавец не отправил товар?", a: "Средства удерживаются на эскроу-счете до подтверждения получения. Если товар не отправлен, деньги вернутся вам автоматически." }
        ]
    }
];

export function HelpFAQ() {
    const [openIndex, setOpenIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const toggle = (idx) => setOpenIndex(openIndex === idx ? null : idx);

    // Filter logic
    const filteredFaqs = FAQS.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.a.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-slate-900 py-20 px-4 text-center">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">Как мы можем помочь?</h1>
                <div className="max-w-xl mx-auto relative">
                    <input
                        type="text"
                        placeholder="Поиск по вопросам..."
                        className="w-full pl-12 pr-6 py-4 rounded-xl shadow-lg text-slate-900 focus:outline-none focus:ring-4 focus:ring-primary/30"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
            </div>

            <div className="container px-4 md:px-6 -mt-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-slate-100 hover:-translate-y-1 transition-transform">
                        <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><MessageCircle /></div>
                        <h3 className="font-bold text-slate-900">Чат поддержки</h3>
                        <p className="text-sm text-slate-500 mb-4">Отвечаем за 5 минут</p>
                        <button className="text-blue-600 font-bold text-sm hover:underline">Написать</button>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-slate-100 hover:-translate-y-1 transition-transform">
                        <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"><Phone /></div>
                        <h3 className="font-bold text-slate-900">Позвонить нам</h3>
                        <p className="text-sm text-slate-500 mb-4">+998 71 200-00-00</p>
                        <a href="tel:+998712000000" className="text-emerald-600 font-bold text-sm hover:underline">Позвонить</a>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-slate-100 hover:-translate-y-1 transition-transform">
                        <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"><Mail /></div>
                        <h3 className="font-bold text-slate-900">Написать письмо</h3>
                        <p className="text-sm text-slate-500 mb-4">support@marketplace.uz</p>
                        <a href="mailto:support@marketplace.uz" className="text-purple-600 font-bold text-sm hover:underline">Отправить</a>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto space-y-12">
                    {filteredFaqs.length === 0 && (
                        <div className="text-center py-10 text-slate-500">Ничего не найдено</div>
                    )}

                    {filteredFaqs.map((category, catIdx) => (
                        <div key={catIdx}>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">{category.category}</h2>
                            <div className="space-y-4">
                                {category.items.map((item, itemIdx) => {
                                    const idx = `${catIdx}-${itemIdx}`;
                                    const isOpen = openIndex === idx;
                                    return (
                                        <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                            <button
                                                onClick={() => toggle(idx)}
                                                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
                                            >
                                                <span className="font-bold text-slate-900">{item.q}</span>
                                                {isOpen ? <ChevronUp className="text-primary" /> : <ChevronDown className="text-slate-400" />}
                                            </button>
                                            {isOpen && (
                                                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                                                    {item.a}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
