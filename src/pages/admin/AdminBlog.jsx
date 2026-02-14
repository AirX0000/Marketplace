import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Plus, Edit2, Trash2, X, Eye } from 'lucide-react';

export function AdminBlog() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        author: 'AURA Team',
        isPublished: false,
        publishedAt: null
    });

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const data = await api.getAdminBlogPosts();
            setPosts(data);
        } catch (error) {
            console.error("Failed to load blog posts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPost) {
                await api.updateBlogPost(editingPost.id, formData);
            } else {
                await api.createBlogPost(formData);
            }
            await loadPosts();
            closeModal();
        } catch (error) {
            alert("Ошибка сохранения статьи");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Удалить эту статью?')) return;
        try {
            await api.deleteBlogPost(id);
            await loadPosts();
        } catch (error) {
            alert("Ошибка удаления");
        }
    };

    const openModal = (post = null) => {
        if (post) {
            setEditingPost(post);
            setFormData(post);
        } else {
            setEditingPost(null);
            setFormData({
                title: '',
                excerpt: '',
                content: '',
                author: 'AURA Team',
                isPublished: false,
                publishedAt: null
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPost(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ru-RU', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (loading) return <div className="p-8 text-center">Загрузка...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Управление Блогом</h2>
                    <p className="text-slate-700">Публикуйте новости и статьи для пользователей платформы</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:scale-[1.02]"
                >
                    <Plus size={18} /> Добавить статью
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                            <th className="text-left p-4 font-bold text-slate-700">Заголовок</th>
                            <th className="text-left p-4 font-bold text-slate-700">Автор</th>
                            <th className="text-left p-4 font-bold text-slate-700">Дата публикации</th>
                            <th className="text-left p-4 font-bold text-slate-700">Статус</th>
                            <th className="text-right p-4 font-bold text-slate-700">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {posts.map((post) => (
                            <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-bold text-slate-900 max-w-xs truncate">{post.title}</td>
                                <td className="p-4 text-slate-700">{post.author}</td>
                                <td className="p-4 text-slate-700">{formatDate(post.publishedAt)}</td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${post.isPublished
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-slate-100 text-slate-600'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${post.isPublished ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
                                        {post.isPublished ? 'Опубликовано' : 'Черновик'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => openModal(post)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(post.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {posts.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                            <Plus className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Нет статей</h3>
                        <p className="text-slate-500 mb-4">Начните вести блог компании прямо сейчас</p>
                        <button
                            onClick={() => openModal()}
                            className="text-blue-600 font-bold hover:underline"
                        >
                            Добавить первую статью
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                            <h3 className="text-xl font-bold">{editingPost ? 'Редактировать статью' : 'Новая статья'}</h3>
                            <button onClick={closeModal} className="p-2 hover:bg-muted rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Заголовок *</label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full h-10 rounded-lg border px-3"
                                    placeholder="Почему AURA — это будущее цифровой коммерции"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Краткое описание *</label>
                                <textarea
                                    required
                                    value={formData.excerpt}
                                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                    className="w-full min-h-[60px] rounded-lg border p-3"
                                    placeholder="Краткое описание статьи для превью..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Содержание *</label>
                                <textarea
                                    required
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full min-h-[300px] rounded-lg border p-3 font-mono text-sm"
                                    placeholder="Полный текст статьи..."
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Автор</label>
                                    <input
                                        value={formData.author}
                                        onChange={e => setFormData({ ...formData, author: e.target.value })}
                                        className="w-full h-10 rounded-lg border px-3"
                                        placeholder="AURA Team"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Дата публикации</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.publishedAt ? new Date(formData.publishedAt).toISOString().slice(0, 16) : ''}
                                        onChange={e => setFormData({ ...formData, publishedAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                        className="w-full h-10 rounded-lg border px-3"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isPublished}
                                    onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                                    className="h-4 w-4"
                                />
                                <label className="text-sm font-medium">Опубликовать статью</label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="flex-1 h-11 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                    Отмена
                                </button>
                                <button type="submit" className="flex-1 h-11 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                                    {editingPost ? 'Сохранить' : 'Создать'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
