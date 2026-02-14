import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';

export const MOCK_POSTS = [
    {
        id: 1,
        title: "Как выбрать автомобиль с рынка: Руководство 2024",
        excerpt: "Советы экспертов по проверке подержанных авто перед покупкой. На что смотреть, как проверить документы и избежать мошенников.",
        category: "Авто",
        author: "Александр Иванов",
        date: "12 Фев 2024",
        readTime: "5 мин",
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=2070",
        content: `
            <p className="mb-4">Покупка подержанного автомобиля — это всегда риск, но правильный подход может сэкономить вам тысячи долларов и нервы. В этой статье мы разберем основные шаги, которые помогут вам выбрать надежный автомобиль.</p>
            
            <h2 className="text-2xl font-bold mb-3 mt-6">1. Проверка документов</h2>
            <p className="mb-4">Первое, с чего стоит начать — это проверка юридической чистоты. Убедитесь, что продавец является собственником, а автомобиль не находится в залоге или угоне.</p>

            <h2 className="text-2xl font-bold mb-3 mt-6">2. Осмотр кузова</h2>
            <p className="mb-4">Внимательно осмотрите кузов на предмет разницы в оттенках краски, зазоров между деталями и следов ремонта. Используйте толщиномер.</p>

            <h2 className="text-2xl font-bold mb-3 mt-6">3. Техническое состояние</h2>
            <p className="mb-4">Не поленитесь загнать машину на СТО для диагностики двигателя и ходовой части. Компьютерная диагностика может выявить скрытые ошибки.</p>
        `
    },
    {
        id: 2,
        title: "Ипотека или аренда: что выгоднее в Ташкенте?",
        excerpt: "Сравниваем ежемесячные платежи, первоначальные взносы и долгосрочные перспективы владения недвижимостью.",
        category: "Недвижимость",
        author: "Мария Петрова",
        date: "10 Фев 2024",
        readTime: "8 мин",
        image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=2073",
        content: "Detailed content..."
    },
    {
        id: 3,
        title: "Топ-10 гаджетов для умного дома",
        excerpt: "Обзор лучших устройств, которые сделают вашу жизнь комфортнее и безопаснее. От умных ламп до роботов-пылесосов.",
        category: "Технологии",
        author: "Дмитрий Сидоров",
        date: "05 Фев 2024",
        readTime: "6 мин",
        image: "https://images.unsplash.com/photo-1558002038-1091a1661116?auto=format&fit=crop&q=80&w=2070",
        content: "Detailed content..."
    }
];

export function Blog() {
    return (
        <div className="container py-12 px-4 md:px-6 animate-in fade-in duration-500">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h1 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900">
                    Блог и Новости
                </h1>
                <p className="text-slate-500 text-lg leading-relaxed">
                    Узнайте больше о покупках, продажах и трендах рынка. Полезные статьи и советы от экспертов.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {MOCK_POSTS.map((post) => (
                    <Link key={post.id} to={`/blog/${post.id}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="relative h-56 overflow-hidden">
                            <span className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-900 z-10 shadow-sm uppercase tracking-wide">
                                {post.category}
                            </span>
                            <img
                                src={post.image}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center gap-4 text-xs font-medium text-slate-400 mb-4 uppercase tracking-wider">
                                <span className="flex items-center gap-1"><Calendar size={14} /> {post.date}</span>
                                <span className="flex items-center gap-1"><Clock size={14} /> {post.readTime}</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                {post.title}
                            </h3>
                            <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                                {post.excerpt}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                        <User size={16} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">{post.author}</span>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <ArrowRight size={16} />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
