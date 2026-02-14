import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { MapPin, Plus, Trash2, Loader2, Store, Navigation, Search, X, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AddressMap from '../../components/ui/AddressMap';

export default function AdminCenters() {
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: '',
        address: '',
        lat: '',
        lng: ''
    });

    useEffect(() => {
        loadCenters();
    }, []);

    const loadCenters = async () => {
        try {
            const data = await api.getCenters();
            setCenters(data);
        } catch (error) {
            console.error("Failed to load centers", error);
            toast.error("Не удалось загрузить список");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (center) => {
        setForm({
            name: center.name,
            address: center.address,
            lat: center.lat,
            lng: center.lng
        });
        setEditingId(center.id);
        setIsCreating(true);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setIsCreating(false);
        setEditingId(null);
        setForm({ name: '', address: '', lat: '', lng: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = {
                ...form,
                lat: parseFloat(form.lat),
                lng: parseFloat(form.lng)
            };

            if (editingId) {
                await api.updateCenter(editingId, data);
                toast.success("Точка обновлена");
            } else {
                await api.createCenter(data);
                toast.success("Новая точка добавлена");
            }

            handleCancel();
            loadCenters();
        } catch (error) {
            toast.error(error.message || "Ошибка сохранения");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Вы уверены, что хотите удалить точку "${name}"?`)) return;
        try {
            await api.deleteCenter(id);
            toast.success("Точка удалена");
            if (editingId === id) handleCancel();
            setCenters(centers.filter(c => c.id !== id));
        } catch (error) {
            toast.error("Ошибка удаления");
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Логистика</h1>
                    <p className="text-slate-700">Управление пунктами выдачи, складами и магазинами.</p>
                </div>
                <button
                    onClick={() => isCreating ? handleCancel() : setIsCreating(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${isCreating
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                        }`}
                >
                    {isCreating ? <X size={20} /> : <Plus size={20} />}
                    {isCreating ? 'Отменить' : 'Добавить точку'}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Store size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-slate-500 font-medium">Всего точек</div>
                            <div className="text-2xl font-bold text-slate-900">{centers.length}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Navigation size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-slate-500 font-medium">Активные</div>
                            <div className="text-2xl font-bold text-slate-900">{centers.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            {isCreating && (
                <div className="bg-blue-50/50 border-2 border-blue-100 rounded-2xl p-6 md:p-8 animate-in slide-in-from-top-4">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-blue-900">
                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                        {editingId ? 'Редактирование точки' : 'Новая точка'}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Название</label>
                            <input
                                required
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                                placeholder="Например: Центральный Склад"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Адрес</label>
                            <input
                                required
                                value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })}
                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                                placeholder="Улица, дом, ориентир"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Расположение на карте</label>
                            <AddressMap
                                onLocationSelect={async (pos) => {
                                    setForm(prev => ({ ...prev, lat: pos.lat, lng: pos.lng }));
                                    // Reverse geocoding
                                    try {
                                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`);
                                        const data = await res.json();
                                        if (data && data.display_name) {
                                            setForm(prev => ({
                                                ...prev,
                                                lat: pos.lat,
                                                lng: pos.lng,
                                                address: data.display_name
                                            }));
                                        }
                                    } catch (e) {
                                        console.error("Geocoding failed", e);
                                    }
                                }}
                                initialPosition={form.lat && form.lng ? { lat: parseFloat(form.lat), lng: parseFloat(form.lng) } : null}
                            />
                            <p className="text-xs text-slate-500">Нажмите на карту, чтобы автоматически заполнить координаты и адрес.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Широта (Latitude)</label>
                            <input
                                required
                                type="number"
                                step="any"
                                value={form.lat}
                                onChange={e => setForm({ ...form, lat: e.target.value })}
                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 font-mono"
                                placeholder="41.2995"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Долгота (Longitude)</label>
                            <input
                                required
                                type="number"
                                step="any"
                                value={form.lng}
                                onChange={e => setForm({ ...form, lng: e.target.value })}
                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 font-mono"
                                placeholder="69.2401"
                            />
                        </div>
                        <div className="md:col-span-2 pt-2 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all"
                            >
                                {submitting ? "Сохранение..." : editingId ? "Сохранить изменения" : "Создать точку"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                </div>
            ) : centers.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                        <MapPin className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Нет точек</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2">
                        Вы пока не добавили ни одного склада или магазина. Нажмите "Добавить точку", чтобы начать.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {centers.map(center => (
                        <div key={center.id} className="group relative bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:border-blue-200">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button
                                    onClick={() => handleEdit(center)}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Редактировать"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(center.id, center.name)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Удалить"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
                                    <MapPin size={24} />
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{center.name}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2 mt-1 min-h-[40px]">{center.address}</p>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-mono">
                                    <Navigation size={12} />
                                    {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
                                </span>
                                <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Активен
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
