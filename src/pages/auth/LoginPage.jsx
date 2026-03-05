import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IMaskInput } from 'react-imask';
import { api } from '../../lib/api';
import { useShop } from '../../context/ShopContext';
import { notify } from '../../lib/notify';
import { loginSchema } from '../../lib/schemas';
import { useTranslation } from 'react-i18next';
import { Lock, ArrowRight, LayoutDashboard, Loader2, Smartphone, KeyRound, CheckCircle2 } from 'lucide-react';

export function LoginPage() {
    const { t } = useTranslation();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('password'); // 'password' | 'otp'

    // OTP state
    const [otpPhone, setOtpPhone] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const navigate = useNavigate();
    const { login } = useShop();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(loginSchema)
    });

    const redirectAfterLogin = (user) => {
        const route = user.role === 'PARTNER' ? '/partner'
            : user.role === 'ADMIN' ? '/admin' : '/profile';
        navigate(route);
    };

    // --- Password Login ---
    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            const response = await api.login(data);
            login(response.token, response.user);
            notify.success(`Добро пожаловать, ${response.user.name}!`);
            redirectAfterLogin(response.user);
        } catch (err) {
            setError(err.message || 'Ошибка входа');
            notify.error(err.message || 'Неверный логин или пароль');
        } finally {
            setLoading(false);
        }
    };

    // --- OTP Send ---
    const handleSendOTP = async () => {
        const cleaned = otpPhone.replace(/\D/g, '');
        if (cleaned.length < 11) {
            notify.error('Введите корректный номер телефона');
            return;
        }
        try {
            setLoading(true);
            await api.sendOTP(otpPhone);
            setOtpSent(true);
            notify.success('Код отправлен на ваш номер');
            // Countdown 60s resend timer
            setCountdown(60);
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) { clearInterval(timer); return 0; }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) {
            notify.error(err.message || 'Ошибка отправки кода');
        } finally {
            setLoading(false);
        }
    };

    // --- OTP Login ---
    const handleOTPLogin = async () => {
        if (!otpCode || otpCode.length < 6) {
            notify.error('Введите 6-значный код');
            return;
        }
        try {
            setLoading(true);
            const response = await api.loginByOTP(otpPhone, otpCode);
            login(response.token, response.user);
            notify.success(`Добро пожаловать, ${response.user.name}!`);
            redirectAfterLogin(response.user);
        } catch (err) {
            setError(err.message || 'Неверный или устаревший код');
            notify.error(err.message || 'Неверный или устаревший код');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (m) => {
        setMode(m);
        setError('');
        setOtpSent(false);
        setOtpCode('');
        setCountdown(0);
    };

    return (
        <div className="h-screen w-full flex overflow-hidden bg-white dark:bg-slate-950">
            {/* Left Side - Hero Image */}
            <div className="hidden lg:block lg:w-1/2 relative h-full bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent z-10" />
                <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
                    alt="Abstract Design"
                    className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 p-12 z-20 text-white">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <LayoutDashboard className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">autohouse</h2>
                    </div>
                    <blockquote className="text-3xl font-medium leading-normal mb-8 max-w-lg">
                        {t('auth.login_quote', '"Единая платформа для управления вашим бизнесом и покупками. Просто, быстро, надежно."')}
                    </blockquote>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 h-full overflow-y-auto flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
                <div className="absolute top-8 left-8 lg:hidden z-10">
                    <Link to="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <LayoutDashboard className="h-4 w-4 text-white" />
                        </div>
                        <span>autohouse</span>
                    </Link>
                </div>

                <div className="w-full max-w-[400px] space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('auth.welcome_back', 'С возвращением!')}</h1>
                        <p className="text-slate-500 dark:text-slate-400">{t('auth.enter_credentials', 'Войдите в свой аккаунт')}</p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
                        <button
                            onClick={() => switchMode('password')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'password' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <Lock size={15} />
                            По паролю
                        </button>
                        <button
                            onClick={() => switchMode('otp')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'otp' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <Smartphone size={15} />
                            По СМС
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium animate-in fade-in border border-red-100 dark:border-red-500/20">
                            {error}
                        </div>
                    )}

                    {/* PASSWORD MODE */}
                    {mode === 'password' && (
                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-900 dark:text-slate-200">{t('auth.identifier_label', 'Email или Телефон')}</label>
                                    <input
                                        type="text"
                                        className={`w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-900 border ${errors.identifier ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${errors.identifier ? 'focus:ring-red-500' : 'focus:ring-slate-900 dark:focus:ring-white'} focus:border-transparent transition-all`}
                                        placeholder="email@example.com или +998..."
                                        {...register('identifier')}
                                    />
                                    {errors.identifier && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.identifier.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-slate-900 dark:text-slate-200">{t('auth.password_label', 'Пароль')}</label>
                                        <Link to="/forgot-password" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors">
                                            {t('auth.forgot_password', 'Забыли пароль?')}
                                        </Link>
                                    </div>
                                    <input
                                        type="password"
                                        className={`w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-900 border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${errors.password ? 'focus:ring-red-500' : 'focus:ring-slate-900 dark:focus:ring-white'} focus:border-transparent transition-all`}
                                        placeholder="••••••••"
                                        {...register('password')}
                                    />
                                    {errors.password && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.password.message}</p>}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || isSubmitting}
                                className="w-full h-11 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-200 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {(loading || isSubmitting) ? <Loader2 className="animate-spin h-4 w-4" /> : <>{t('common.login', 'Войти')}<ArrowRight className="h-4 w-4" /></>}
                            </button>
                        </form>
                    )}

                    {/* OTP / SMS MODE */}
                    {mode === 'otp' && (
                        <div className="space-y-5">
                            {!otpSent ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Номер телефона</label>
                                        <IMaskInput
                                            mask="+{998} (00) 000-00-00"
                                            value={otpPhone}
                                            onAccept={(val) => setOtpPhone(val)}
                                            className="w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all"
                                            placeholder="+998 (90) 123-45-67"
                                        />
                                        <p className="text-xs text-slate-500">Введите номер, на который зарегистрирован аккаунт</p>
                                    </div>
                                    <button
                                        onClick={handleSendOTP}
                                        disabled={loading}
                                        className="w-full h-11 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <><Smartphone size={16} /> Получить код</>}
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* OTP Sent — show code input */}
                                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                                        <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
                                        <div>
                                            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Код отправлен</p>
                                            <p className="text-xs text-emerald-600 dark:text-emerald-400">На номер {otpPhone}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-900 dark:text-slate-200">6-значный код из СМС</label>
                                        <div className="relative">
                                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                value={otpCode}
                                                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                                className="w-full h-11 pl-10 pr-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-lg tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
                                                placeholder="• • • • • •"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleOTPLogin}
                                        disabled={loading || otpCode.length < 6}
                                        className="w-full h-11 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <>Войти <ArrowRight size={16} /></>}
                                    </button>

                                    <button
                                        onClick={countdown === 0 ? handleSendOTP : undefined}
                                        disabled={countdown > 0 || loading}
                                        className="w-full text-center text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
                                    >
                                        {countdown > 0 ? `Отправить повторно через ${countdown}с` : 'Отправить повторно'}
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                        {t('auth.no_account', 'Нет аккаунта?')}{' '}
                        <Link to="/register" className="font-semibold text-slate-900 dark:text-white hover:underline">
                            {t('auth.create_account', 'Зарегистрироваться')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
