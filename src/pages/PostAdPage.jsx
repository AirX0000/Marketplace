import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ListingModal } from '../components/dashboard/ListingModal';
import { useShop } from '../context/ShopContext';
import { api } from '../lib/api';
import { toast } from 'react-hot-toast';
import { X, Phone, Lock, User, Loader2 } from 'lucide-react';

export function PostAdPage() {
    const { isAuthenticated, login: shopLogin, user } = useShop();
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
            // Admins/partners go to listings panel, regular users go to profile
            const isUserAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'PARTNER';
            navigate(isUserAdmin ? '/admin/listings' : '/profile?tab=listings');
        } catch (error) {
            toast.error(error.message || 'Ошибка публикации', { id: toastId });
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
            shopLogin(res.token, res.user);
            setShowAuthModal(false);

            // Now submit the pending ad
            if (pendingData) {
                const toastId = toast.loading('Публикация объявления...');
                try {
                    await api.createListing(pendingData);
                    setPendingData(null); // Clear after success
                    toast.success('Объявление опубликовано!', { id: toastId });
                    navigate('/admin/listings');
                } catch (err) {
                    toast.error(err.message || 'Ошибка публикации', { id: toastId });
                }
            }
        } catch (error) {
            toast.error(error.message || 'Ошибка авторизации');
        } finally {
            setIsSubmittingAuth(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-[var(--container-padding,2rem)] bg-background dark:bg-[#0a0f1e]">
            <div className="w-full max-w-2xl bg-card rounded-3xl shadow-2xl border border-border overflow-hidden dark:border-white/10 dark:bg-[#1e293b]">
                <ListingModal
                    asPage={false}
                    initialCategory="Бозор (Авто с пробегом)"
                    onSave={handleSave}
                    onClose={() => navigate(-1)}
                />
            </div>

            {/* Auth Modal for Guests */}
            {showAuthModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background md:bg-background/80 md:backdrop-blur-sm p-0 md:p-4">
                    <div className="bg-card text-card-foreground md:border md:border-border md:rounded-3xl w-full max-w-md h-full md:h-auto shadow-2xl animate-in zoom-in-95 p-6 flex flex-col justify-center dark:border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-foreground">
                                {authMode === 'register' ? 'Финал: Регистрация' : 'Вход в аккаунт'}
                            </h2>
                            <button onClick={() => setShowAuthModal(false)} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                            {authMode === 'register'
                                ? 'Ваше объявление готово! Завершите регистрацию по номеру телефона, чтобы мы могли опубликовать его от вашего имени.'
                                : 'Ваше объявление готово! Войдите в свой аккаунт для его публикации.'}
                        </p>

                        <form onSubmit={handleAuthSubmit} className="space-y-4">
                            {authMode === 'register' && (
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 text-foreground/80">Ваше Имя</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                                        <input
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-muted/50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-foreground font-medium"
                                            placeholder="Иван Иванов"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold mb-1.5 text-foreground/80">Номер телефона</label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-muted/50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-foreground font-medium"
                                        placeholder="+998 90 123 45 67"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1.5 text-foreground/80">Пароль (мин. 6 символов)</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        required
                                        type="password"
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-muted/50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-foreground font-medium"
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

                        <div className="mt-6 pt-6 border-t border-border text-center text-sm font-medium text-muted-foreground">
                            {authMode === 'register' ? (
                                <>Уже есть аккаунт? <button type="button" onClick={() => setAuthMode('login')} className="text-primary font-bold hover:underline">Войти</button></>
                            ) : (
                                <>Нет аккаунта? <button type="button" onClick={() => setAuthMode('register')} className="text-primary font-bold hover:underline">Зарегистрироваться</button></>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
