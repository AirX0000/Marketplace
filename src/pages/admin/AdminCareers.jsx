import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export function AdminCareers() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        type: 'Удаленно',
        location: '',
        description: '',
        requirements: '',
        isActive: true
    });

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            const data = await api.getAdminCareers();
            setJobs(data);
        } catch (error) {
            console.error("Failed to load careers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingJob) {
                await api.updateCareer(editingJob.id, formData);
            } else {
                await api.createCareer(formData);
            }
            await loadJobs();
            closeModal();
        } catch (error) {
            alert("Ошибка сохранения вакансии");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Удалить эту вакансию?')) return;
        try {
            await api.deleteCareer(id);
            await loadJobs();
        } catch (error) {
            alert("Ошибка удаления");
        }
    };

    const openModal = (job = null) => {
        if (job) {
            setEditingJob(job);
            setFormData(job);
        } else {
            setEditingJob(null);
            setFormData({
                title: '',
                department: '',
                type: 'Удаленно',
                location: '',
                description: '',
                requirements: '',
                isActive: true
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingJob(null);
    };

    if (loading) return <div className="p-8 text-center">Загрузка...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Управление Вакансиями</h2>
                    <p className="text-slate-700">Добавляйте и редактируйте вакансии компании</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:scale-[1.02]"
                >
                    <Plus size={18} /> Добавить вакансию
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                            <th className="text-left p-4 font-bold text-slate-700">Название</th>
                            <th className="text-left p-4 font-bold text-slate-700">Отдел</th>
                            <th className="text-left p-4 font-bold text-slate-700">Тип</th>
                            <th className="text-left p-4 font-bold text-slate-700">Локация</th>
                            <th className="text-left p-4 font-bold text-slate-700">Статус</th>
                            <th className="text-right p-4 font-bold text-slate-700">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {jobs.map((job) => (
                            <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-bold text-slate-900">{job.title}</td>
                                <td className="p-4 text-slate-700">{job.department}</td>
                                <td className="p-4 text-slate-700">{job.type}</td>
                                <td className="p-4 text-slate-700">{job.location}</td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${job.isActive
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-slate-100 text-slate-600'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${job.isActive ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
                                        {job.isActive ? 'Активна' : 'Неактивна'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => openModal(job)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(job.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {jobs.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                            <Plus className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Нет активных вакансий</h3>
                        <p className="text-slate-500 mb-4">Создайте первую вакансию, чтобы начать поиск сотрудников</p>
                        <button
                            onClick={() => openModal()}
                            className="text-blue-600 font-bold hover:underline"
                        >
                            Добавить вакансию
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                            <h3 className="text-xl font-bold">{editingJob ? 'Редактировать вакансию' : 'Новая вакансия'}</h3>
                            <button onClick={closeModal} className="p-2 hover:bg-muted rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Название *</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full h-10 rounded-lg border px-3"
                                        placeholder="Senior React Разработчик"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Отдел *</label>
                                    <input
                                        required
                                        value={formData.department}
                                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full h-10 rounded-lg border px-3"
                                        placeholder="Разработка"
                                    />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Тип *</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full h-10 rounded-lg border px-3"
                                    >
                                        <option>Удаленно</option>
                                        <option>Гибрид</option>
                                        <option>Офис</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Локация *</label>
                                    <input
                                        required
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full h-10 rounded-lg border px-3"
                                        placeholder="Глобально"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Описание *</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full min-h-[100px] rounded-lg border p-3"
                                    placeholder="Подробное описание вакансии..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Требования</label>
                                <textarea
                                    value={formData.requirements}
                                    onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                                    className="w-full min-h-[100px] rounded-lg border p-3"
                                    placeholder="Требования к кандидату..."
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="h-4 w-4"
                                />
                                <label className="text-sm font-medium">Активная вакансия</label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="flex-1 h-11 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                                    Отмена
                                </button>
                                <button type="submit" className="flex-1 h-11 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                                    {editingJob ? 'Сохранить' : 'Создать'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
