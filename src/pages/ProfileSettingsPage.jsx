import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { User, Mail, Save, Camera, Settings, Check, AlertCircle, Building2, MapPin, Trash2, Plus } from 'lucide-react';

export function ProfileSettingsPage() {
    const [profile, setProfile] = useState({ name: '', email: '', avatar: '', role: 'USER' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const [profileData, addressesData] = await Promise.all([
                    api.getProfile(),
                    api.getAddresses()
                ]);

                setProfile({
                    name: profileData.name || '',
                    email: profileData.email || '',
                    avatar: profileData.avatar || '',
                    role: profileData.role || 'USER',
                    balance: profileData.balance || 0,
                    accountId: profileData.accountId || '',
                    // Partner Fields
                    companyName: profileData.companyName || '',
                    taxId: profileData.taxId || '',
                    phone: profileData.phone || '',
                    businessAddress: profileData.businessAddress || '',
                    businessDescription: profileData.businessDescription || '',
                    businessCategory: profileData.businessCategory || 'Retail'
                });
                setAddresses(addressesData);
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Address State
    const [addresses, setAddresses] = useState([]);
    const [addressModalOpen, setAddressModalOpen] = useState(false);
    const [newAddress, setNewAddress] = useState({
        name: '', fullName: '', phone: '', city: '', street: '', details: '', isDefault: false
    });

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            const added = await api.addAddress(newAddress);
            // If default, update local list correctly
            if (added.isDefault) {
                setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(added));
            } else {
                setAddresses([...addresses, added]);
            }
            setAddressModalOpen(false);
            setNewAddress({ name: '', fullName: '', phone: '', city: '', street: '', details: '', isDefault: false });
        } catch (error) {
            alert("Ошибка добавления адреса");
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!confirm("Удалить этот адрес?")) return;
        try {
            await api.deleteAddress(id);
            setAddresses(addresses.filter(a => a.id !== id));
        } catch (error) {
            alert("Ошибка удаления");
        }
    };

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

    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [recipientId, setRecipientId] = useState('');
    const [transferAmount, setTransferAmount] = useState('');

    const handleTransfer = async (e) => {
        e.preventDefault();
        try {
            const res = await api.transfer(recipientId, Number(transferAmount));
            setProfile(prev => ({ ...prev, balance: res.balance }));
            alert(`Успешно переведено ${transferAmount} сум пользователю ${recipientId}`);
            setTransferModalOpen(false);
            setRecipientId('');
            setTransferAmount('');
        } catch (error) {
            alert(error.message || "Ошибка перевода");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="container max-w-4xl py-10 px-4 md:px-6 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold mb-2">Настройки Профиля</h1>
            <p className="text-slate-600 mb-8">Управляйте личной информацией и финансами.</p>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Wallet */}
                <div className="md:col-span-1 space-y-6">
                    {/* ID Card */}
                    <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                        <div className="relative group mb-4">
                            <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-inner bg-slate-50">
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
                        <h3 className="font-bold text-lg mb-1">{profile.name || "Пользователь"}</h3>
                        <p className="text-sm text-slate-500 mb-4">{profile.email}</p>
                        <div className="bg-slate-100 rounded-lg px-3 py-1 text-xs font-mono font-bold text-slate-600">ID: {profile.accountId || "..."}</div>
                    </div>

                    {/* Wallet Card */}
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><User className="h-24 w-24" /></div>

                        <div className="relative z-10">
                            <div className="text-emerald-100 text-sm font-medium mb-1">Мой Баланс</div>
                            <div className="text-3xl font-bold mb-6 tracking-tight">
                                {(profile.balance || 0).toLocaleString()} <span className="text-base font-normal opacity-80">сум</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setTransferModalOpen(true)}
                                    className="flex flex-col items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl p-3 backdrop-blur-sm transition-all active:scale-95"
                                >
                                    <div className="bg-white/20 p-2 rounded-full mb-2"><Check className="h-4 w-4" /></div>
                                    <span className="text-xs font-bold">Перевести</span>
                                </button>
                                <button
                                    onClick={async () => {
                                        const amount = prompt("Введите сумму пополнения (сум):");
                                        if (!amount) return;
                                        try {
                                            const res = await api.topUp(Number(amount));
                                            setProfile(prev => ({ ...prev, balance: res.balance }));
                                            alert("Баланс пополнен!");
                                        } catch (e) {
                                            alert("Ошибка пополнения");
                                        }
                                    }}
                                    className="flex flex-col items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl p-3 backdrop-blur-sm transition-all active:scale-95"
                                >
                                    <div className="bg-white/20 p-2 rounded-full mb-2"><Settings className="h-4 w-4" /></div>
                                    <span className="text-xs font-bold">Пополнить</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* QR Code Card */}
                    <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            Ваш autohouse QR
                        </h4>
                        <div className="bg-white p-2 border-2 border-emerald-500 rounded-lg mb-4">
                            {/* Using API for QR to avoid dependency issues if npm failed silently, serves as fallback */}
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${profile.accountId}`}
                                alt="QR Code"
                                className="h-32 w-32"
                            />
                        </div>
                        <p className="text-xs text-slate-500">Покажите этот код для получения перевода</p>
                    </div>
                </div>

                {/* Right Column: Form */}
                <div className="md:col-span-2 space-y-8">
                    {/* Personal Info */}
                    <div className="bg-card border rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Settings className="h-5 w-5 text-primary" /> Основная Информация
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
                                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pl-10 text-sm focus:bg-white focus:border-primary transition-all outline-none"
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
                                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pl-10 text-sm focus:bg-white focus:border-primary transition-all outline-none"
                                        placeholder="example@mail.com"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
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

                    {/* Address Book */}
                    <div className="bg-card border rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" /> Мои Адреса
                            </h2>
                            <button
                                onClick={() => setAddressModalOpen(true)}
                                className="flex items-center gap-1 text-sm font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Plus className="h-4 w-4" /> Добавить
                            </button>
                        </div>

                        {addresses.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed text-sm">
                                У вас нет сохраненных адресов
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {addresses.map(addr => (
                                    <div key={addr.id} className="group relative border rounded-xl p-4 hover:border-primary/50 transition-all bg-white shadow-sm hover:shadow-md">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-slate-800">{addr.name}</span>
                                                    {addr.isDefault && (
                                                        <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                                            Основной
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-slate-600 font-medium">{addr.city}, {addr.street}</div>
                                                <div className="text-xs text-slate-500 mt-1">{addr.details}</div>
                                                <div className="text-xs text-slate-400 mt-2 flex gap-3">
                                                    <span>{addr.fullName}</span>
                                                    <span>•</span>
                                                    <span>{addr.phone}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteAddress(addr.id)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Company Info - Only for Partners */}
                    {profile.role === 'PARTNER' && (
                        <div className="bg-card border rounded-2xl p-6 shadow-sm border-emerald-100 bg-emerald-50/10">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-800">
                                <Building2 className="h-5 w-5" /> Данные Компании
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Название Компании</label>
                                        <input
                                            type="text"
                                            value={profile.companyName || ''}
                                            onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                                            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-emerald-500 transition-all outline-none shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Категория</label>
                                        <select
                                            value={profile.businessCategory || 'Retail'}
                                            onChange={(e) => setProfile({ ...profile, businessCategory: e.target.value })}
                                            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-emerald-500 transition-all outline-none shadow-sm"
                                        >
                                            <option value="Retail">Розничная торговля</option>
                                            <option value="Electronics">Электроника</option>
                                            <option value="Fashion">Одежда</option>
                                            <option value="Home">Дом</option>
                                            <option value="Auto">Авто</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">ИНН (Tax ID)</label>
                                        <input
                                            type="text"
                                            value={profile.taxId || ''}
                                            onChange={(e) => setProfile({ ...profile, taxId: e.target.value })}
                                            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-emerald-500 transition-all outline-none shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Телефон</label>
                                        <input
                                            type="tel"
                                            value={profile.phone || ''}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-emerald-500 transition-all outline-none shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Адрес Бизнеса</label>
                                    <input
                                        type="text"
                                        value={profile.businessAddress || ''}
                                        onChange={(e) => setProfile({ ...profile, businessAddress: e.target.value })}
                                        className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-emerald-500 transition-all outline-none shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Описание Бизнеса</label>
                                    <textarea
                                        rows="3"
                                        value={profile.businessDescription || ''}
                                        onChange={(e) => setProfile({ ...profile, businessDescription: e.target.value })}
                                        className="flex w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-emerald-500 transition-all outline-none shadow-sm resize-none"
                                    />
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {saving ? "Сохранение..." : "Обновить Данные Компании"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Address Book Modal */}
            {addressModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-4">Новый Адрес</h3>
                        <form onSubmit={handleAddressSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Название</label>
                                    <input
                                        required
                                        placeholder="Дом, Работа..."
                                        value={newAddress.name}
                                        onChange={e => setNewAddress({ ...newAddress, name: e.target.value })}
                                        className="w-full h-11 rounded-lg border border-slate-300 px-3 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">ФИО Получателя</label>
                                    <input
                                        required
                                        placeholder="Иван Иванов"
                                        value={newAddress.fullName}
                                        onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })}
                                        className="w-full h-11 rounded-lg border border-slate-300 px-3 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Телефон</label>
                                    <input
                                        required
                                        placeholder="+998..."
                                        value={newAddress.phone}
                                        onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                                        className="w-full h-11 rounded-lg border border-slate-300 px-3 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Город</label>
                                    <input
                                        required
                                        placeholder="Ташкент"
                                        value={newAddress.city}
                                        onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                        className="w-full h-11 rounded-lg border border-slate-300 px-3 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-1 block">Улица / Район</label>
                                <input
                                    required
                                    placeholder="ул. Амира Темура, Чиланзар..."
                                    value={newAddress.street}
                                    onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                                    className="w-full h-11 rounded-lg border border-slate-300 px-3 focus:border-primary outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-1 block">Дом, Квартира, Ориентир</label>
                                <textarea
                                    required
                                    rows={2}
                                    placeholder="Дом 5, кв 23 (ориентир: школа)"
                                    value={newAddress.details}
                                    onChange={e => setNewAddress({ ...newAddress, details: e.target.value })}
                                    className="w-full rounded-lg border border-slate-300 p-3 focus:border-primary outline-none resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    checked={newAddress.isDefault}
                                    onChange={e => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="isDefault" className="text-sm text-slate-700 select-none">Сделать основным адресом</label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setAddressModalOpen(false)}
                                    className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 font-bold text-white bg-primary hover:bg-primary/90 rounded-xl"
                                >
                                    Сохранить Адрес
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transfer Modal */}
            {transferModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-4">Перевод средств</h3>
                        <form onSubmit={handleTransfer} className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-1 block">ID Получателя (или Телефон)</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Например: 123456"
                                    value={recipientId}
                                    onChange={e => setRecipientId(e.target.value)}
                                    className="w-full h-11 rounded-lg border border-slate-300 px-3 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-1 block">Сумма (сум)</label>
                                <input
                                    type="number"
                                    required
                                    min="1000"
                                    placeholder="0"
                                    value={transferAmount}
                                    onChange={e => setTransferAmount(e.target.value)}
                                    className="w-full h-11 rounded-lg border border-slate-300 px-3 focus:border-primary outline-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setTransferModalOpen(false)}
                                    className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                                >
                                    Перевести
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
