import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';

export function AdminPageEditor() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Page Data
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const pageNames = {
        'privacy': 'Политика Конфиденциальности',
        'terms': 'Условия Использования',
        'about': 'О нас',
        'documentation': 'Документация',
        'guides': 'Гайды'
    };

    useEffect(() => {
        if (slug) loadPage();
    }, [slug]);

    async function loadPage() {
        setLoading(true);
        try {
            const data = await api.getPage(slug);
            setTitle(data.title || pageNames[slug] || slug);
            setContent(data.content || '');
        } catch (e) {
            console.error("Failed to load page", e);
            setTitle(pageNames[slug] || slug);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            await api.updatePage(slug, { title, content });
            alert("Сохранено!");
        } catch (e) {
            console.error(e);
            alert("Ошибка сохранения: " + e.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="animate-spin text-emerald-500 h-10 w-10" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/admin/pages')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Назад к списку
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                        Сохранить
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-8 space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Заголовок Страницы</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-bold text-xl"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Контент (HTML/Markdown)</label>
                    <div className="text-xs text-slate-400 mb-2">Поддерживается простой текст или HTML теги (&lt;p&gt;, &lt;h2&gt;, &lt;ul&gt; и т.д.)</div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-[500px] px-4 py-4 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono text-sm leading-relaxed"
                        placeholder="Введите содержимое страницы..."
                    />
                </div>
            </div>
        </div>
    );
}
