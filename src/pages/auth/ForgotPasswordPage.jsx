import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Lock, ArrowLeft, KeyRound, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';

const STEPS = {
    PHONE: 'phone',
    OTP: 'otp',
    NEW_PASSWORD: 'new_password',
    SUCCESS: 'success',
};

export function ForgotPasswordPage() {
    const [step, setStep] = useState(STEPS.PHONE);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const formatPhone = (value) => {
        // Allow only digits, trim and limit
        const digits = value.replace(/\D/g, '').slice(0, 12);
        return digits;
    };

    // Step 1: Send OTP to phone
    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!phone || phone.length < 9) {
            setError('Введите корректный номер телефона');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.sendOTP({ phone: `+${phone}` });
            setStep(STEPS.OTP);
        } catch (err) {
            setError(err.message || 'Ошибка при отправке кода. Проверьте номер телефона.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 4) {
            setError('Введите код подтверждения');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.verifyOTP({ phone: `+${phone}`, code: otp });
            setStep(STEPS.NEW_PASSWORD);
        } catch (err) {
            setError(err.message || 'Неверный код. Попробуйте ещё раз.');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Set new password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 6) {
            setError('Пароль должен содержать минимум 6 символов');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.resetPassword({ phone: `+${phone}`, code: otp, newPassword });
            setStep(STEPS.SUCCESS);
        } catch (err) {
            setError(err.message || 'Ошибка при сбросе пароля. Попробуйте снова.');
        } finally {
            setLoading(false);
        }
    };

    const stepTitles = {
        [STEPS.PHONE]: { title: 'Восстановление пароля', subtitle: 'Введите номер телефона для получения кода' },
        [STEPS.OTP]: { title: 'Введите код', subtitle: `Мы отправили 6-значный код на +${phone}` },
        [STEPS.NEW_PASSWORD]: { title: 'Новый пароль', subtitle: 'Придумайте надёжный пароль для вашего аккаунта' },
        [STEPS.SUCCESS]: { title: 'Пароль изменён!', subtitle: '' },
    };

    const current = stepTitles[step];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                            <KeyRound className="h-7 w-7 text-white" />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-1">{current.title}</h1>
                        {current.subtitle && <p className="text-slate-400 text-sm">{current.subtitle}</p>}
                    </div>

                    {/* Progress dots */}
                    {step !== STEPS.SUCCESS && (
                        <div className="flex justify-center gap-2 mb-8">
                            {[STEPS.PHONE, STEPS.OTP, STEPS.NEW_PASSWORD].map((s, i) => (
                                <div
                                    key={s}
                                    className={`h-2 rounded-full transition-all duration-300 ${step === s ? 'w-8 bg-blue-400' : i < [STEPS.PHONE, STEPS.OTP, STEPS.NEW_PASSWORD].indexOf(step) ? 'w-2 bg-blue-600' : 'w-2 bg-white/20'
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* --- STEP 1: phone --- */}
                    {step === STEPS.PHONE && (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-400 mb-2 block">Номер телефона</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">+</span>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                                        placeholder="998 90 123 45 67"
                                        className="w-full h-12 pl-8 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-60"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Получить код'}
                            </button>
                        </form>
                    )}

                    {/* --- STEP 2: OTP --- */}
                    {step === STEPS.OTP && (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-400 mb-2 block">Код из SMS</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="• • • • • •"
                                    className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white text-center text-2xl tracking-[0.4em] placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-all"
                                    maxLength={6}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-60"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ShieldCheck className="h-5 w-5" /> Подтвердить</>}
                            </button>
                            <button type="button" onClick={() => setStep(STEPS.PHONE)} className="w-full text-slate-400 text-sm hover:text-white transition-colors">
                                Изменить номер
                            </button>
                        </form>
                    )}

                    {/* --- STEP 3: new password --- */}
                    {step === STEPS.NEW_PASSWORD && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-400 mb-2 block">Новый пароль</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Минимум 6 символов"
                                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-all"
                                        minLength={6}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-400 mb-2 block">Подтвердите пароль</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Повторите пароль"
                                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-60"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Сохранить пароль'}
                            </button>
                        </form>
                    )}

                    {/* --- STEP 4: success --- */}
                    {step === STEPS.SUCCESS && (
                        <div className="text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="h-20 w-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle className="h-10 w-10 text-emerald-400" />
                                </div>
                            </div>
                            <p className="text-slate-300 text-sm">
                                Ваш пароль успешно изменён. Теперь вы можете войти с новым паролем.
                            </p>
                            <Link
                                to="/login"
                                className="block w-full h-12 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all text-center leading-[3rem]"
                            >
                                Войти в аккаунт
                            </Link>
                        </div>
                    )}

                    {/* Back link */}
                    {step === STEPS.PHONE && (
                        <div className="mt-6 text-center">
                            <Link to="/login" className="inline-flex items-center gap-1 text-slate-400 text-sm hover:text-white transition-colors">
                                <ArrowLeft className="h-4 w-4" /> Вернуться ко входу
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
