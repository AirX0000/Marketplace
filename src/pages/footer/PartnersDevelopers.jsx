import React from 'react';
import { Layers, Rocket, Code, Database, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PartnersDevelopers() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <header className="bg-slate-900 text-white pt-24 pb-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                <div className="container px-4 md:px-6 relative z-10 text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-primary-foreground font-bold text-sm mb-6 border border-white/10 backdrop-blur">
                        Для бизнеса и разработчиков
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
                        Стройте будущее электронной коммерции вместе с нами
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
                        Присоединяйтесь к экосистеме, которая объединяет тысячи продавцов и миллионы покупателей. Мощные инструменты для роста вашего бизнеса.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="h-12 px-8 rounded-xl bg-primary text-white font-bold flex items-center justify-center hover:bg-primary/90 transition-all">
                            Стать партнером
                        </Link>
                        <a href="#api" className="h-12 px-8 rounded-xl bg-white/10 border border-white/20 text-white font-bold flex items-center justify-center hover:bg-white/20 transition-all">
                            Документация API
                        </a>
                    </div>
                </div>
            </header>

            {/* Features Grid */}
            <section className="container px-4 md:px-6 -mt-20 relative z-10 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { icon: Rocket, title: "Быстрый старт", desc: "Запуск магазина за 15 минут с готовыми инструментами импорта товаров." },
                        { icon: Database, title: "Управление данными", desc: "Удобная PIM-система для управления тысячами SKU и сложными атрибутами." },
                        { icon: ShieldCheck, title: "Безопасные платежи", desc: "Встроенный эскроу-сервис и защита от фрода для каждой транзакции." },
                        { icon: Zap, title: "Высокая производительность", desc: "API со скоростью ответа <100мс, готовое выдержать высокие нагрузки." },
                        { icon: Globe, title: "Глобальный охват", desc: "Локализация, мультивалютность и логистика по всему Узбекистану." },
                        { icon: Layers, title: "Экосистема", desc: "Интеграция с CRM, ERP и логистическими операторами через единый шлюз." }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
                            <div className="h-14 w-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6">
                                <item.icon size={28} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                            <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* API Section */}
            <section id="api" className="py-20 bg-white border-y border-slate-200">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm mb-4">
                                <Code size={16} /> API First
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
                                Разработано для разработчиков
                            </h2>
                            <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                                Наш RESTful API предоставляет полный доступ к функционалу платформы. Создавайте кастомные интеграции, мобильные приложения или подключайте свои складские системы.
                            </p>
                            <div className="space-y-4 mb-8">
                                {[
                                    "Полная документация Swagger/OpenAPI",
                                    "Webhooks для событий в реальном времени",
                                    "Песочница (Sandbox) для тестирования",
                                    "SDK для JS, Python и PHP"
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                            <ArrowRight size={12} />
                                        </div>
                                        <span className="font-bold text-slate-700">{feature}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                                Читать документацию
                            </button>
                        </div>
                        <div className="flex-1 w-full relative">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-700">
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700 bg-slate-800/50">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                    <div className="text-xs text-slate-400 font-mono ml-4">api.marketplace.uz</div>
                                </div>
                                <div className="p-6 font-mono text-sm overflow-x-auto">
                                    <div className="text-purple-400">POST <span className="text-green-400">/v1/orders</span></div>
                                    <div className="text-slate-500 mt-2">Content-Type: application/json</div>
                                    <div className="text-slate-500">Authorization: Bearer sk_live_...</div>
                                    <div className="text-blue-300 mt-4">{`{`}</div>
                                    <div className="pl-4">
                                        <div className="text-blue-300">"items": <span className="text-yellow-300">[</span></div>
                                        <div className="pl-4">
                                            <div className="text-blue-300">{`{`}</div>
                                            <div className="pl-4">
                                                <div className="text-blue-300">"id": <span className="text-orange-300">"prod_123"</span>,</div>
                                                <div className="text-blue-300">"quantity": <span className="text-orange-300">2</span></div>
                                            </div>
                                            <div className="text-blue-300">{`}`}</div>
                                        </div>
                                        <div className="text-blue-300"><span className="text-yellow-300">]</span></div>
                                    </div>
                                    <div className="text-blue-300">{`}`}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
