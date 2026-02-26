import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Trash2, Save, X, Settings, Globe, FolderTree, User, Mail, Camera, Check, AlertCircle, LogOut } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useNavigate } from 'react-router-dom';

export function AdminSettings() {
    const [activeTab, setActiveTab] = useState('regions'); // regions, categories, profile, payments

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Настройки Системы</h1>
                <p className="text-slate-700">Управление глобальной конфигурацией платформы.</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('regions')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'regions'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                >
                    <Globe className="h-4 w-4" /> Регионы
                </button>
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'categories'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                >
                    <FolderTree className="h-4 w-4" /> Категории
                </button>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'profile'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                >
                    <User className="h-4 w-4" /> Профиль
                </button>
                <button
                    onClick={() => setActiveTab('payments')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'payments'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
                >
                    <Settings className="h-4 w-4" /> Платежи
                </button>
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'regions' && <RegionManager />}
                {activeTab === 'categories' && <CategoryManager />}
                {activeTab === 'profile' && <ProfileSettings />}
                {activeTab === 'payments' && <PaymentManager />}
            </div>
        </div>
    );
}

function PaymentManager() {
    const [settings, setSettings] = useState({
        enable_installments: 'true',
        installment_months: '3,6,12',
        interest_rate: '0',
        enable_click: 'true',
        enable_payme: 'true',
        enable_uzum: 'true',
        click_service_id: '',
        click_merchant_id: '',
        payme_merchant_id: '',
        enable_discount: 'false',
        discount_percent: '0'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.getSettings().then(data => {
            // merge with defaults
            setSettings(prev => ({ ...prev, ...data }));
        }).catch(console.error);
    }, []);

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.updateSettings(settings);
            alert("Настройки сохранены!");
        } catch (error) {
            console.error(error);
            alert("Ошибка сохранения настроек");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl animate-in fade-in duration-500">
            {/* Installments Configuration */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 text-slate-900">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Настройка Рассрочки</h3>
                    <p className="text-sm text-slate-600">Управление оплатой частями для клиентов.</p>
                </div>

                {/* Enable Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <label className="text-sm font-bold text-slate-700">Включить Рассрочку</label>
                    <div
                        onClick={() => handleChange('enable_installments', settings.enable_installments === 'true' ? 'false' : 'true')}
                        className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${settings.enable_installments === 'true' ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${settings.enable_installments === 'true' ? 'translate-x-5' : ''}`} />
                    </div>
                </div>

                {settings.enable_installments === 'true' && (
                    <div className="space-y-6 animate-in slide-in-from-top-2">
                        {/* Plans */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Доступные Планы (Месяцы)</label>
                            <input
                                value={settings.installment_months}
                                onChange={(e) => handleChange('installment_months', e.target.value)}
                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
                                placeholder="3, 6, 12, 24"
                            />
                            <p className="text-xs text-slate-500">Список месяцев через запятую (например: 3, 6, 12).</p>
                        </div>

                        {/* Interest */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Процентная Ставка (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={settings.interest_rate}
                                    onChange={(e) => handleChange('interest_rate', e.target.value)}
                                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
                                    placeholder="0"
                                />
                                <div className="absolute right-3 top-3 text-slate-400 text-sm font-bold">%</div>
                            </div>
                            <p className="text-xs text-slate-500">Дополнительная комиссия к сумме заказа (0 для рассрочки без %).</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Discount Configuration */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 text-slate-900">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Акции и Скидки</h3>
                    <p className="text-sm text-slate-600">Управление глобальными скидками магазина.</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-0.5">
                        <label className="text-sm font-bold text-slate-700">Включить Глобальную Скидку</label>
                        <p className="text-xs text-slate-500">Применить скидку ко всем заказам.</p>
                    </div>
                    <div
                        onClick={() => handleChange('enable_discount', settings.enable_discount === 'true' ? 'false' : 'true')}
                        className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${settings.enable_discount === 'true' ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${settings.enable_discount === 'true' ? 'translate-x-5' : ''}`} />
                    </div>
                </div>

                {settings.enable_discount === 'true' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <label className="text-sm font-bold text-slate-700">Процент Скидки (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={settings.discount_percent}
                                onChange={(e) => handleChange('discount_percent', e.target.value)}
                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
                                placeholder="10"
                            />
                            <div className="absolute right-3 top-3 text-slate-400 text-sm font-bold">%</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Payment Gateways */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 text-slate-900">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Онлайн Платежные Системы</h3>
                    <p className="text-sm text-slate-600">Включение доступных провайдеров.</p>
                </div>

                <div className="space-y-4">
                    {/* Click */}
                    <div className="border border-slate-200 rounded-xl p-5 hover:border-blue-200 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-xs">CLICK</div>
                                <span className="font-bold text-slate-800">CLICK Evolution</span>
                            </div>
                            <div
                                onClick={() => handleChange('enable_click', settings.enable_click === 'true' ? 'false' : 'true')}
                                className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${settings.enable_click === 'true' ? 'bg-blue-600' : 'bg-slate-300'}`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${settings.enable_click === 'true' ? 'translate-x-5' : ''}`} />
                            </div>
                        </div>
                        {settings.enable_click === 'true' && (
                            <div className="grid gap-3 animate-in fade-in">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500">Service ID</label>
                                        <input
                                            placeholder="XXXX"
                                            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm focus:bg-white focus:border-blue-500 transition-all outline-none"
                                            value={settings.click_service_id || ''}
                                            onChange={e => handleChange('click_service_id', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500">Merchant ID</label>
                                        <input
                                            placeholder="XXXX"
                                            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm focus:bg-white focus:border-blue-500 transition-all outline-none"
                                            value={settings.click_merchant_id || ''}
                                            onChange={e => handleChange('click_merchant_id', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payme */}
                    <div className="border border-slate-200 rounded-xl p-5 hover:border-blue-200 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-xs">PAYME</div>
                                <span className="font-bold text-slate-800">Payme Business</span>
                            </div>
                            <div
                                onClick={() => handleChange('enable_payme', settings.enable_payme === 'true' ? 'false' : 'true')}
                                className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${settings.enable_payme === 'true' ? 'bg-blue-600' : 'bg-slate-300'}`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${settings.enable_payme === 'true' ? 'translate-x-5' : ''}`} />
                            </div>
                        </div>
                        {settings.enable_payme === 'true' && (
                            <div className="grid gap-3 animate-in fade-in">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500">Merchant ID</label>
                                    <input
                                        placeholder="XXXX"
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm focus:bg-white focus:border-blue-500 transition-all outline-none"
                                        value={settings.payme_merchant_id || ''}
                                        onChange={e => handleChange('payme_merchant_id', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Uzum */}
                    <div className="border border-slate-200 rounded-xl p-5 hover:border-blue-200 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xs">UZUM</div>
                                <span className="font-bold text-slate-800">Uzum Pay</span>
                            </div>
                            <div
                                onClick={() => handleChange('enable_uzum', settings.enable_uzum === 'true' ? 'false' : 'true')}
                                className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${settings.enable_uzum === 'true' ? 'bg-blue-600' : 'bg-slate-300'}`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${settings.enable_uzum === 'true' ? 'translate-x-5' : ''}`} />
                            </div>
                        </div>
                        {settings.enable_uzum === 'true' && (
                            <div className="grid gap-3 animate-in fade-in">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500">Service ID</label>
                                        <input
                                            placeholder="XXXX"
                                            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm focus:bg-white focus:border-blue-500 transition-all outline-none"
                                            value={settings.uzum_service_id || ''}
                                            onChange={e => handleChange('uzum_service_id', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500">Merchant ID</label>
                                        <input
                                            placeholder="XXXX"
                                            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm focus:bg-white focus:border-blue-500 transition-all outline-none"
                                            value={settings.uzum_merchant_id || ''}
                                            onChange={e => handleChange('uzum_merchant_id', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={loading}
                className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 hover:scale-[1.01] transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center"
            >
                {loading ? "Сохранение..." : <><Save className="mr-2 h-5 w-5" /> Сохранить Изменения</>}
            </button>
        </div>
    );
}


function RegionManager() {
    const [regions, setRegions] = useState([]);
    const [newRegion, setNewRegion] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(null); // ID of item to confirm delete

    useEffect(() => { load(); }, []);

    const load = () => api.getRegions().then(setRegions).catch(console.error);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newRegion.trim()) return;
        try {
            await api.createRegion({ name: newRegion });
            setNewRegion("");
            load();
        } catch (error) {
            alert("Ошибка добавления региона");
        }
    };

    const handleDelete = async (id) => {
        if (deleteConfirm !== id) {
            setDeleteConfirm(id);
            // Auto-clear confirm after 3 seconds
            setTimeout(() => setDeleteConfirm(null), 3000);
            return;
        }

        console.log(`Deleting region ${id}`);
        try {
            await api.deleteRegion(id);
            setDeleteConfirm(null);
            load();
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Ошибка удаления: " + error.message);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl text-slate-900">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Управление Регионами</h3>
                <div className="flex gap-4">
                    <input
                        value={newRegion}
                        onChange={(e) => setNewRegion(e.target.value)}
                        placeholder="Название Нового Региона (напр. Ташкент)"
                        className="flex-1 h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:bg-white focus:border-blue-500 transition-all outline-none"
                    />
                    <button
                        onClick={handleAdd}
                        className="bg-blue-600 text-white px-6 rounded-xl font-bold text-sm flex items-center hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Добавить
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm overflow-hidden">
                {regions.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                        <span className="font-bold text-slate-700">{r.name}</span>
                        <button
                            onClick={() => handleDelete(r.id)}
                            className={`transition-all duration-200 px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-2 ${deleteConfirm === r.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                        >
                            {deleteConfirm === r.id ? (
                                <>Подтвердить?</>
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                ))}
                {regions.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-sm">
                        Нет регионов. Добавьте первый.
                    </div>
                )}
            </div>
        </div>
    );
}

function CategoryManager() {
    const [categories, setCategories] = useState([]);
    const [newCatName, setNewCatName] = useState("");
    const [newCatSubs, setNewCatSubs] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(null); // ID of item to confirm delete

    useEffect(() => { load(); }, []);

    const load = () => api.getCategories().then(setCategories).catch(console.error);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCatName.trim()) return;
        try {
            const subList = newCatSubs.split(',').map(s => s.trim()).filter(Boolean);
            await api.createCategory({ name: newCatName, subcategories: subList });
            setNewCatName("");
            setNewCatSubs("");
            load();
        } catch (error) {
            alert("Ошибка добавления категории");
        }
    };

    const handleDelete = async (id) => {
        if (deleteConfirm !== id) {
            setDeleteConfirm(id);
            // Auto-clear confirm after 3 seconds
            setTimeout(() => setDeleteConfirm(null), 3000);
            return;
        }

        console.log(`Deleting category ${id}`);
        try {
            await api.deleteCategory(id);
            setDeleteConfirm(null);
            load();
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Ошибка удаления: " + error.message);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl text-slate-900">
            <div className="p-6 border border-slate-200 rounded-xl bg-white shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Добавить Категорию</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 ml-1">Название</label>
                        <input
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            placeholder="Напр. Электроника"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:bg-white focus:border-blue-500 transition-all outline-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 ml-1">Подкатегории</label>
                        <input
                            value={newCatSubs}
                            onChange={(e) => setNewCatSubs(e.target.value)}
                            placeholder="Смартфоны, Ноутбуки..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:bg-white focus:border-blue-500 transition-all outline-none"
                        />
                    </div>
                </div>
                <button onClick={handleAdd} className="w-full h-11 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                    <Plus className="mr-2 h-4 w-4" /> Добавить Категорию
                </button>
            </div>

            <div className="grid gap-4">
                {categories.map(c => (
                    <div key={c.id} className="border border-slate-200 rounded-xl p-5 bg-white hover:border-blue-200 transition-colors shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-lg text-slate-800">{c.name}</h4>
                            <button
                                onClick={() => handleDelete(c.id)}
                                className={`transition-all duration-200 px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-2 ${deleteConfirm === c.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                            >
                                {deleteConfirm === c.id ? (
                                    <>Подтвердить?</>
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {c.sub?.map(sub => (
                                <span key={sub} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                                    {sub}
                                </span>
                            ))}
                            {(!c.sub || c.sub.length === 0) && (
                                <span className="text-xs text-slate-400 italic">Нет подкатегорий</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProfileSettings() {
    const { logout } = useShop();
    const navigate = useNavigate();
    const [profile, setProfile] = useState({ name: '', email: '', avatar: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const data = await api.getProfile();
                setProfile({
                    name: data.name || '',
                    email: data.email || '',
                    avatar: data.avatar || ''
                });
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const data = await api.uploadImage(file);
            setProfile(prev => ({ ...prev, avatar: data.url }));
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка загрузки фото' });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await api.updateProfile(profile);
            setMessage({ type: 'success', text: 'Профиль успешно обновлен!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка обновления профиля.' });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        if (confirm("Вы действительно хотите выйти?")) {
            logout();
            navigate('/login');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="grid md:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {/* Left Column: Avatar */}
            <div className="md:col-span-1 space-y-4 text-slate-900">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                    <div className="relative group mb-4">
                        <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-50">
                            {profile.avatar ? (
                                <img src={profile.avatar} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-300">
                                    <User className="h-16 w-16" />
                                </div>
                            )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                            {uploading ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            ) : (
                                <Camera className="h-8 w-8" />
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                        </label>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{profile.name || "Администратор"}</h3>
                    <p className="text-sm text-slate-500 mb-4">{profile.email}</p>

                    <button
                        onClick={handleLogout}
                        className="w-full py-2 px-4 rounded-lg bg-red-50 text-red-600 font-medium text-sm flex items-center justify-center hover:bg-red-100 transition-colors"
                    >
                        <LogOut className="mr-2 h-4 w-4" /> Выйти из аккаунта
                    </button>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="md:col-span-2 text-slate-900">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                        <User className="h-5 w-5 text-blue-600" /> Основная Информация
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {message && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                {message.type === 'success' ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Ваше Имя</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pl-10 text-sm text-slate-900 focus:bg-white focus:border-blue-500 transition-all outline-none"
                                    placeholder="Введите ваше имя"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Email Адрес</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pl-10 text-sm text-slate-900 focus:bg-white focus:border-blue-500 transition-all outline-none"
                                    placeholder="example@mail.com"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {saving ? "Сохранение..." : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" /> Сохранить Изменения
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
