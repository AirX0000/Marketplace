import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ListingModal } from '../components/dashboard/ListingModal';
import { useShop } from '../context/ShopContext';
import { api } from '../lib/api';
import { toast } from 'react-hot-toast';
import { X, Phone, Lock, User, Loader2 } from 'lucide-react';

export function PostAdPage() {
    const { isAuthenticated, checkAuth } = useShop();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [pendingData, setPendingData] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Auth Modal State
    const [authMode, setAuthMode] = useState('register'); // 'register' or 'login'
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

    const handleSave = async (data) => {
        if (!isAuthenticated) {
            setPendingData(data);
            setShowAuthModal(true);
            return;
        }

        // Save immediately if authenticated
        const toastId = toast.loading('Публикация объявления...');
        try {
            await api.createListing(data);
            toast.success('Объявление опубликовано!', { id: toastId });
            navigate('/admin/listings');
        } catch (error) {
            toast.error('Ошибка публикации', { id: toastId });
        }
    };

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingAuth(true);
        try {
            let res;
            if (authMode === 'register') {
                res = await api.register({ phone, password, name: name || 'User', role: 'USER' });
            } else {
                res = await api.login({ identifier: phone, password });
            }

            // Login success
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            await checkAuth();

            setShowAuthModal(false);

            // Now submit the pending ad
            if (pendingData) {
                const toastId = toast.loading('Публикация объявления...');
                await api.createListing(pendingData);
                toast.success('Объявление опубликовано!', { id: toastId });
                navigate('/admin/listings');
            }
        } catch (error) {
            toast.error(error.message || 'Ошибка авторизации');
        } finally {
            setIsSubmittingAuth(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-10 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-2 sm:p-6 overflow-hidden">
                    <ListingModal
                        asPage={true}
                        initialCategory="Бозор (Авто с пробегом)"
                        onSave={handleSave}
                        onClose={() => navigate(-1)}
                    />
                </div>
            </div>

            {/* Auth Modal for Guests */}
            {showAuthModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">
                                {authMode === 'register' ? 'Финал: Регистрация' : 'Вход в аккаунт'}
                            </h2>
                            <button onClick={() => setShowAuthModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                            {authMode === 'register'
                                ? 'Ваше объявление готово! Завершите регистрацию по номеру телефона, чтобы мы могли опубликовать его от вашего имени.'
                                : 'Ваше объявление готово! Войдите в свой аккаунт для его публикации.'}
                        </p>

                        <form onSubmit={handleAuthSubmit} className="space-y-4">
                            {authMode === 'register' && (
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 text-slate-700">Ваше Имя</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                                        <input
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 font-medium"
                                            placeholder="Иван Иванов"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold mb-1.5 text-slate-700">Номер телефона</label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                                    <input
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-900 font-medium"
                                        placeholder="+998 90 123 45 67"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1.5 text-slate-700">Пароль (мин. 6 символов)</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                                    <input
                                        required
                                        type="password"
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmittingAuth}
                                className="w-full bg-emerald-600 text-white rounded-xl h-12 font-bold hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all flex justify-center items-center shadow-lg shadow-emerald-500/25 mt-6"
                            >
                                {isSubmittingAuth ? <Loader2 className="animate-spin h-5 w-5" /> : (authMode === 'register' ? 'Опубликовать объявление' : 'Войти и Опубликовать')}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm font-medium text-slate-500">
                            {authMode === 'register' ? (
                                <>Уже есть аккаунт? <button type="button" onClick={() => setAuthMode('login')} className="text-blue-600 font-bold hover:underline">Войти</button></>
                            ) : (
                                <>Нет аккаунта? <button type="button" onClick={() => setAuthMode('register')} className="text-blue-600 font-bold hover:underline">Зарегистрироваться</button></>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
