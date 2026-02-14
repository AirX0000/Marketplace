import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Mail, Key, Store, Search, X } from 'lucide-react';
import { api } from '../../lib/api';

export function AdminPartners() {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPartner, setEditingPartner] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        storeName: '',
        storeDescription: '',
        storeColor: '#3b82f6'
    });

    useEffect(() => {
        loadPartners();
    }, []);

    const loadPartners = async () => {
        try {
            const { partners } = await api.fetchAPI('/admin/partners');
            setPartners(partners);
        } catch (error) {
            console.error('Failed to load partners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPartner) {
                await api.fetchAPI(`/admin/partners/${editingPartner.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
            } else {
                await api.fetchAPI('/admin/partners', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
            }
            setShowModal(false);
            resetForm();
            loadPartners();
        } catch (error) {
            alert(error.message || 'Failed to save partner');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Вы уверены? Это удалит партнера и все его товары!')) return;

        try {
            await api.fetchAPI(`/admin/partners/${id}`, { method: 'DELETE' });
            loadPartners();
        } catch (error) {
            alert('Failed to delete partner');
        }
    };

    const openEditModal = (partner) => {
        setEditingPartner(partner);
        setFormData({
            email: partner.email,
            password: '', // Don't prefill password
            name: partner.name || '',
            storeName: partner.storeName || '',
            storeDescription: partner.storeDescription || '',
            storeColor: partner.storeColor || '#3b82f6'
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingPartner(null);
        setFormData({
            email: '',
            password: '',
            name: '',
            storeName: '',
            storeDescription: '',
            storeColor: '#3b82f6'
        });
    };

    const filteredPartners = partners.filter(p =>
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.storeName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="h-7 w-7 text-blue-600" />
                        Управление Партнерами
                    </h1>
                    <p className="text-gray-600 mt-1">Создавайте и управляйте учетными записями партнеров</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Добавить Партнера
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Поиск по email, имени или магазину..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Partners Table */}
            {loading ? (
                <div className="text-center py-12">Загрузка...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Партнер</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Магазин</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Товары</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPartners.map((partner) => (
                                <tr key={partner.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{partner.name || 'Без имени'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail className="h-4 w-4" />
                                            {partner.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {partner.storeColor && (
                                                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: partner.storeColor }} />
                                            )}
                                            <span className="text-sm text-gray-900">{partner.storeName || '—'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {partner._count?.marketplaces || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {new Date(partner.createdAt).toLocaleDateString('ru-RU')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => openEditModal(partner)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(partner.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredPartners.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            {searchTerm ? 'Партнеры не найдены' : 'Нет партнеров'}
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingPartner ? 'Редактировать Партнера' : 'Новый Партнер'}
                            </h2>
                            <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email (Логин) *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="partner@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Пароль {!editingPartner && '*'}
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required={!editingPartner}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder={editingPartner ? "Оставьте пустым чтобы не менять" : "Введите пароль"}
                                    />
                                </div>
                                {editingPartner && (
                                    <p className="text-xs text-gray-500 mt-1">Оставьте пустым, если не хотите менять пароль</p>
                                )}
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Иван Иванов"
                                />
                            </div>

                            {/* Store Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Название Магазина</label>
                                <div className="relative">
                                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.storeName}
                                        onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Tech Store"
                                    />
                                </div>
                            </div>

                            {/* Store Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Описание Магазина</label>
                                <textarea
                                    value={formData.storeDescription}
                                    onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Краткое описание магазина..."
                                />
                            </div>

                            {/* Store Color */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Цвет Магазина</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={formData.storeColor}
                                        onChange={(e) => setFormData({ ...formData, storeColor: e.target.value })}
                                        className="h-10 w-20 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.storeColor}
                                        onChange={(e) => setFormData({ ...formData, storeColor: e.target.value })}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="#3b82f6"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    {editingPartner ? 'Сохранить Изменения' : 'Создать Партнера'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
