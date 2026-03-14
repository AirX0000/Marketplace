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
import { Lock, ArrowRight, LayoutDashboard, Loader2, Smartphone, KeyRound, CheckCircle2, Car, X } from 'lucide-react';

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
        const lastPath = localStorage.getItem('lastPath');
        localStorage.removeItem('lastPath'); // Clear it after use
        const route = (lastPath && !['/login', '/register'].includes(lastPath))
            ? lastPath
            : user.role === 'PARTNER' ? '/partner'
            : (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? '/admin' : '/profile';
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
        if (!otpCode || otpCode.length !== 4) {
            notify.error('Введите 4-значный код');
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
                                            <p className="text-xs text-emerald-600 dark:text-emerald-400">Пожалуйста, используйте всплывающее окно для ввода кода.</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={switchMode.bind(null, 'otp')}
                                        className="w-full text-center text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mt-4 block"
                                    >
                                        Ввести код заново
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

            {/* OTP VERIFICATION MODAL OVERLAY (Dark Premium Theme) */}
            {mode === 'otp' && otpSent && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-[#0B0A10] font-sans text-slate-200 overflow-hidden animate-in fade-in duration-300">
                    {/* Radial Purple Glow Background */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6919FF]/10 rounded-full blur-[120px] pointer-events-none"></div>

                    {/* Top Header */}
                    <div className="h-20 px-8 flex items-center justify-between relative z-10 w-full max-w-7xl mx-auto">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#6919FF] flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(105,25,255,0.4)]">
                                <Car size={18} />
                            </div>
                            <span className="font-bold text-white tracking-widest text-sm">AUTOHOUSE</span>
                        </div>
                        <button onClick={() => switchMode('otp')} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Center Card */}
                    <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 w-full">
                        <div className="w-full max-w-[440px] bg-[#14121A] rounded-[32px] border border-white/5 px-10 py-12 flex flex-col items-center shadow-2xl relative overflow-hidden">
                            {/* Inner Glow inside card */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-[#6919FF]/10 blur-[50px] pointer-events-none"></div>

                            {/* Icon */}
                            <div className="w-14 h-14 rounded-full bg-[#1A1724] border border-[#6919FF]/20 flex items-center justify-center mb-6 relative">
                                <div className="absolute inset-0 rounded-full bg-[#6919FF]/5 animate-pulse"></div>
                                {/* Simulate a vibrating phone icon using a small icon and padding */}
                                <div className="relative flex items-center justify-center">
                                    <div className="w-1 h-3 bg-[#6919FF]/30 rounded-full absolute -left-3"></div>
                                    <Smartphone size={20} fill="#6919FF" stroke="none" className="text-[#6919FF] z-10" />
                                    <div className="w-1 h-3 bg-[#6919FF]/30 rounded-full absolute -right-3"></div>
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-[28px] font-bold text-white mb-2 tracking-tight">Verify Identity</h2>

                            {/* Subtext */}
                            <p className="text-[14px] text-slate-400 text-center mb-10 leading-relaxed px-2 font-medium">
                                We've sent a 4-digit security code to <strong className="text-white font-bold">{otpPhone || '+998 (••) •••-••-92'}</strong>
                            </p>

                            {/* OTP Inputs */}
                            <div className="flex gap-4 mb-2 md:gap-5 w-full justify-center relative z-20">
                                {[0, 1, 2, 3].map(index => {
                                    const val = otpCode[index];
                                    return (
                                        <div key={index} className="w-[56px] h-[56px] md:w-[64px] md:h-[64px] rounded-full bg-white flex items-center justify-center shadow-lg relative overflow-hidden shrink-0 border-2 border-transparent transition-colors">
                                            {val ? (
                                                <span className="text-2xl font-black text-[#13111C]">{val}</span>
                                            ) : (
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#13111C]/20"></div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Hidden actual input covering the dots */}
                            <div className="relative w-full h-[64px] -mt-[64px] mb-8 z-30 flex justify-center overflow-hidden opacity-0">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    className="w-[280px] h-full text-[40px] tracking-[40px] pl-[30px] bg-transparent outline-none border-none text-transparent cursor-text appearance-none"
                                    autoFocus
                                />
                            </div>

                            {/* Verify Button */}
                            <button
                                onClick={handleOTPLogin}
                                disabled={loading || otpCode.length < 4}
                                className="w-full h-[52px] bg-[#6919FF] hover:bg-[#5914E0] disabled:bg-[#6919FF]/50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(105,25,255,0.3)] hover:shadow-[0_0_30px_rgba(105,25,255,0.5)] transition-all flex items-center justify-center mb-8"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Verify Code'}
                            </button>

                            {/* Resend */}
                            <p className="text-xs text-slate-500 font-medium mb-2">Didn't receive the code?</p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={countdown === 0 ? handleSendOTP : undefined}
                                    className={`text-xs font-bold transition-colors ${countdown === 0 ? 'text-red-500 hover:text-red-400' : 'text-red-500/50 cursor-not-allowed'}`}
                                >
                                    Resend SMS
                                </button>
                                <span className={`bg-white/5 border border-white/5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${countdown > 0 ? 'text-slate-400' : 'text-slate-600'}`}>
                                    00:{countdown.toString().padStart(2, '0')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pb-10 pt-4 flex flex-col items-center gap-5 relative z-10 w-full">
                        <div className="flex gap-8 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">
                            <a href="#" className="hover:text-white transition-colors">Support</a>
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                        </div>
                        <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-600">
                            © 2024 Autohouse Marketplace Inc.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
