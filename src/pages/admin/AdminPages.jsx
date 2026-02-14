import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Shield, Book, Info, Briefcase, Layout } from 'lucide-react';

export function AdminPages() {
    const pages = [
        { title: 'Политика Конфиденциальности', slug: 'privacy', icon: <Shield className="text-emerald-500" /> },
        { title: 'Условия Использования', slug: 'terms', icon: <FileText className="text-blue-500" /> },
        { title: 'О нас', slug: 'about', icon: <Info className="text-purple-500" /> },
        { title: 'Документация', slug: 'documentation', icon: <Book className="text-orange-500" /> },
        { title: 'Гайды', slug: 'guides', icon: <Layout className="text-pink-500" /> },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Управление Контентом</h1>
            <p className="text-slate-500">Редактирование статических страниц сайта.</p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pages.map(page => (
                    <Link
                        key={page.slug}
                        to={`/admin/pages/${page.slug}`}
                        className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors">
                                {page.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{page.title}</h3>
                                <p className="text-xs text-slate-400 font-mono">/{page.slug}</p>
                            </div>
                        </div>
                        <ArrowRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </Link>
                ))}
            </div>

            <div className="border-t pt-8 mt-8">
                <h2 className="text-xl font-bold mb-4">Другие Разделы</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Link to="/admin/blog" className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <FileText className="text-indigo-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Блог</h3>
                                <p className="text-xs text-slate-400">Статьи и новости</p>
                            </div>
                        </div>
                        <ArrowRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </Link>

                    <Link to="/admin/careers" className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <Briefcase className="text-cyan-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Вакансии</h3>
                                <p className="text-xs text-slate-400">Управление карьерой</p>
                            </div>
                        </div>
                        <ArrowRight className="text-slate-300 group-hover:text-cyan-500 transition-colors" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
