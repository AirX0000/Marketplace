import React, { useState } from 'react';
import { Search, Book, Code, ShoppingBag, Truck, DollarSign, Settings, ChevronRight, ChevronDown, FileText } from 'lucide-react';
import { ContentPage } from '../../components/ContentPage';

export function Guides() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [expandedGuide, setExpandedGuide] = useState(null);

    const categories = [
        { id: "all", label: "Все", icon: Book },
        { id: "buyer", label: "Покупателям", icon: ShoppingBag },
        { id: "partner", label: "Партнерам", icon: DollarSign },
        { id: "dev", label: "Разработчикам", icon: Code },
    ];

    const guides = [
        {
            id: 1,
            title: "Как оформить первый заказ",
            category: "buyer",
            badge: "Покупателям",
            time: "3 мин",
            content: "Чтобы оформить заказ, выберите товар в каталоге, добавьте его в корзину и нажмите 'Оформить заказ'. Выберите удобный способ оплаты (карта или рассрочка) и укажите адрес доставки. После подтверждения вы получите уведомление с трек-номером."
        },
        {
            id: 2,
            title: "Условия возврата товара",
            category: "buyer",
            badge: "Покупателям",
            time: "5 мин",
            content: "Вы можете вернуть товар в течение 14 дней, если он не был в использовании и сохранена упаковка. Для возврата перейдите в 'Мои заказы', выберите товар и нажмите 'Оформить возврат'. Деньги вернутся на карту в течение 3-5 рабочих дней."
        },
        {
            id: 3,
            title: "Как стать партнером и начать продавать",
            category: "partner",
            badge: "Партнерам",
            time: "7 мин",
            content: "1. Зарегистрируйтесь как 'Партнер'.\n2. Заполните данные о компании.\n3. Добавьте свои товары через Админ-панель.\n4. Пройдите модерацию (обычно 2-4 часа).\nПосле этого ваши товары появятся в общем каталоге Marketplace."
        },
        {
            id: 4,
            title: "Комиссии и выплаты",
            category: "partner",
            badge: "Партнерам",
            time: "4 мин",
            content: "Наша комиссия составляет 5% с каждой продажи. Выплаты производятся автоматически каждый понедельник на указанный банковский счет. Вы можете отслеживать статус выплат в разделе 'Финансы'."
        },
        {
            id: 5,
            title: "Настройка вебхуков (Webhooks)",
            category: "dev",
            badge: "API",
            time: "10 мин",
            content: "Вебхуки позволяют получать уведомления о событиях (новый заказ, изменение статуса) в реальном времени. Перейдите в 'Настройки' -> 'API', укажите URL вашего endpoint и выберите события. Мы отправляем POST-запросы с JSON-пейлоадом."
        },
        {
            id: 6,
            title: "Авторизация и получение API Token",
            category: "dev",
            badge: "API",
            time: "5 мин",
            content: "Для работы с API вам нужен токен. Сгенерируйте его в личном кабинете партнера. Передавайте токен в заголовке каждого запроса: `Authorization: Bearer YOUR_TOKEN`."
        },
        {
            id: 7,
            title: "Интеграция службы доставки",
            category: "partner",
            badge: "Логистика",
            time: "8 мин",
            content: "Вы можете использовать нашу службу доставки или подключить свою. В настройках магазина выберите 'Доставка' и укажите зоны обслуживания. Стоимость рассчитывается автоматически."
        }
    ];

    const filteredGuides = guides.filter(guide => {
        const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guide.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === "all" || guide.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <ContentPage slug="guides" defaultTitle="Центр Поддержки">
            <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Центр Поддержки</h1>
                        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                            Находите ответы, изучайте руководства и получайте максимум от платформы autohouse.
                        </p>

                        <div className="relative max-w-xl mx-auto shadow-lg rounded-2xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Поиск по статьям (например: API, возврат, комиссия)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 rounded-2xl border-0 bg-white text-slate-900 text-lg focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap justify-center gap-3 mb-10">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center px-6 py-3 rounded-full text-sm font-bold transition-all transform hover:scale-105 ${activeCategory === cat.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                            >
                                <cat.icon className="mr-2 h-4 w-4" />
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Guides Grid */}
                    {filteredGuides.length > 0 ? (
                        <div className="grid gap-4">
                            {filteredGuides.map((guide) => (
                                <div
                                    key={guide.id}
                                    className={`bg-white border text-left border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 ${expandedGuide === guide.id ? 'shadow-lg ring-1 ring-blue-500/20' : 'hover:shadow-md hover:border-blue-200'
                                        }`}
                                >
                                    <button
                                        onClick={() => setExpandedGuide(expandedGuide === guide.id ? null : guide.id)}
                                        className="w-full flex items-center justify-between p-6 text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${guide.category === 'dev' ? 'bg-purple-100 text-purple-600' :
                                                guide.category === 'partner' ? 'bg-emerald-100 text-emerald-600' :
                                                    'bg-blue-100 text-blue-600'
                                                }`}>
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${guide.category === 'dev' ? 'bg-purple-50 text-purple-700' :
                                                        guide.category === 'partner' ? 'bg-emerald-50 text-emerald-700' :
                                                            'bg-blue-50 text-blue-700'
                                                        }`}>
                                                        {guide.badge}
                                                    </span>
                                                    <span className="text-xs text-slate-400">• {guide.time} чтения</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-800">{guide.title}</h3>
                                            </div>
                                        </div>
                                        {expandedGuide === guide.id ? (
                                            <ChevronDown className="h-5 w-5 text-slate-400" />
                                        ) : (
                                            <ChevronRight className="h-5 w-5 text-slate-400" />
                                        )}
                                    </button>

                                    {expandedGuide === guide.id && (
                                        <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-200">
                                            <div className="h-px w-full bg-slate-100 mb-4" />
                                            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                                                {guide.content}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="bg-slate-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Ничего не найдено</h3>
                            <p className="text-slate-500">Попробуйте изменить запрос или категорию.</p>
                        </div>
                    )}
                </div>
            </div>
        </ContentPage>
    );
}
