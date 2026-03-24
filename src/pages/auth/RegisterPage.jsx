import { useState } from 'react';
import { IMaskInput } from 'react-imask';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../../lib/api';
import { useShop } from '../../context/ShopContext';
import { notify } from '../../lib/notify';
import { registerSchema } from '../../lib/schemas';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User, Briefcase, ShoppingBag, ArrowRight, LayoutDashboard, CheckCircle2, Building, Loader2 } from 'lucide-react';

export function RegisterPage() {
    const { t } = useTranslation();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const navigate = useNavigate();
    const { login } = useShop();

    const {
        register,
        handleSubmit,
        watch,
        control,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: "USER",
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            companyName: "",
            taxId: "",
            phone: "",
            businessCategory: "Retail",
            businessAddress: "",
            businessDescription: ""
        }
    });

    const role = watch("role");

    const handleSendOTP = async () => {
        const phone = watch("phone");
        if (!phone || phone.length < 18) {
            notify.error("Введите корректный номер телефона");
            return;
        }

        try {
            setLoading(true);
            await api.sendOTP(phone);
            setOtpSent(true);
            notify.success("Код отправлен на ваш номер");
        } catch (err) {
            notify.error(err.message || "Ошибка отправки кода");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otpCode || otpCode.length !== 4) {
            notify.error("Введите 4-значный код");
            return;
        }

        try {
            setLoading(true);
            const phone = watch("phone");
            await api.verifyOTP(phone, otpCode);
            setIsVerified(true);
            notify.success("Телефон успешно подтвержден");
        } catch (err) {
            notify.error(err.message || "Неверный код");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        if (!isVerified) return notify.error("Подтвердите телефон через СМС перед регистрацией");

        setLoading(true);
        setError("");
        try {
            // Remove confirmPassword before sending to API
            const { confirmPassword, ...apiData } = data;
            const response = await api.register(apiData);

            login(response.token, response.user);
            notify.success(`Добро пожаловать, ${response.user.name}! Регистрация успешна.`);

            // Redirect based on role
            const defaultRoute = response.user.role === 'PARTNER' ? '/partner' :
                (response.user.role === 'ADMIN' || response.user.role === 'SUPER_ADMIN') ? '/admin' : '/profile';
            navigate(defaultRoute);
        } catch (err) {
            let msg = err.message || 'Ошибка регистрации';
            if (msg.includes('Phone number already registered') || msg.includes('Unique constraint violation')) {
                msg = 'Этот номер телефона уже зарегистрирован. Пожалуйста, авторизуйтесь.';
            } else if (msg.includes('Email already registered')) {
                msg = 'Этот email уже зарегистрирован.';
            }
            setError(msg);
            notify.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-slate-950">
            {/* Left Side - Hero Image */}
            <div className="hidden lg:block lg:w-1/2 relative h-full bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent z-10" />
                <img
                    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1574&q=80"
                    alt="Register Abstract"
                    className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 p-12 z-20 text-white">
                    <h2 className="text-3xl font-bold mb-4">{t('auth.hero_title', 'Начните свой путь с autohouse')}</h2>
                    <ul className="space-y-4 text-white/90">
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            </div>
                            <span>{t('auth.hero_feature_1', 'Мгновенный доступ к тысячам товаров')}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            </div>
                            <span>{t('auth.hero_feature_2', 'Простая интеграция для партнеров')}</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative">
                <div className="absolute top-8 left-8 lg:hidden z-10">
                    <Link to="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <LayoutDashboard className="h-4 w-4 text-white" />
                        </div>
                        <span>autohouse</span>
                    </Link>
                </div>

                <div className="w-full max-w-lg space-y-10">
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('auth.create_account')}</h1>
                        <p className="text-slate-500 dark:text-slate-400">{t('auth.choose_account_type', 'Выберите тип аккаунта и заполните данные.')}</p>
                    </div>

                    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2 border border-red-100 dark:border-red-500/20">
                                {error}
                            </div>
                        )}

                        {/* Role Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`cursor-pointer group relative border-2 rounded-xl p-5 flex flex-col items-center gap-3 transition-all ${role === 'USER' ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-900' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                                <input type="radio" value="USER" {...register("role")} className="hidden" />
                                <ShoppingBag className={`h-8 w-8 ${role === 'USER' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`} />
                                <span className={`font-bold text-sm ${role === 'USER' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{t('auth.buyer')}</span>
                                {role === 'USER' && <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-900 dark:bg-white" />}
                            </label>

                            <label className={`cursor-pointer group relative border-2 rounded-xl p-5 flex flex-col items-center gap-3 transition-all ${role === 'PARTNER' ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-900' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                                <input type="radio" value="PARTNER" {...register("role")} className="hidden" />
                                <Briefcase className={`h-8 w-8 ${role === 'PARTNER' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`} />
                                <span className={`font-bold text-sm ${role === 'PARTNER' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{t('auth.partner')}</span>
                                {role === 'PARTNER' && <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-900 dark:bg-white" />}
                            </label>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-5">
                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-900 dark:text-slate-200">{t('auth.name_label')}</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            className={`w-full h-11 pl-9 pr-4 rounded-lg bg-white dark:bg-slate-900 border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all`}
                                            placeholder="Иван Петров"
                                            {...register("name")}
                                        />
                                    </div>
                                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-900 dark:text-slate-200">{t('auth.phone_label')}</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Controller
                                                    name="phone"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <IMaskInput
                                                            mask="+{998} (00) 000 00 00"
                                                            value={field.value}
                                                            onAccept={(value) => field.onChange(value)}
                                                            disabled={isVerified}
                                                            className={`w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-900 border ${errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} ${isVerified ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-500' : 'text-slate-900 dark:text-white'} placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all`}
                                                            placeholder="+998 (90) 123 11 11"
                                                            inputRef={field.ref}
                                                        />
                                                    )}
                                                />
                                            </div>
                                            {!isVerified && (
                                                <button
                                                    type="button"
                                                    onClick={handleSendOTP}
                                                    disabled={loading || otpSent}
                                                    className="h-11 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 whitespace-nowrap"
                                                >
                                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (otpSent ? 'Отправлено' : 'Получить Код')}
                                                </button>
                                            )}
                                        </div>
                                        {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                                    </div>

                                    {/* OTP Field (Visible only when OTP is sent and not yet verified) */}
                                    {otpSent && !isVerified && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Код из СМС</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    maxLength="4"
                                                    value={otpCode}
                                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                                    className="flex-1 h-11 px-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all tracking-[1em] text-center font-bold"
                                                    placeholder="XXXX"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyOTP}
                                                    disabled={loading || otpCode.length !== 4}
                                                    className="h-11 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 whitespace-nowrap"
                                                >
                                                    Подтвердить
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-900 dark:text-slate-200">{t('auth.password_label')}</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                        <input
                                            type="password"
                                            className={`w-full h-11 pl-9 pr-4 rounded-lg bg-white dark:bg-slate-900 border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all`}
                                            placeholder="Min 6 characters"
                                            {...register("password")}
                                        />
                                    </div>
                                    {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-900 dark:text-slate-200">{t('auth.confirm_password_label')}</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                        <input
                                            type="password"
                                            className={`w-full h-11 pl-9 pr-4 rounded-lg bg-white dark:bg-slate-900 border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all`}
                                            placeholder="Confirm password"
                                            {...register("confirmPassword")}
                                        />
                                    </div>
                                    {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Partner Specific Fields */}
                        <div className={`space-y-5 overflow-hidden transition-all duration-500 ease-in-out ${role === 'PARTNER' ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    {t('auth.company_data', 'Данные Компании')}
                                </h3>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-900 dark:text-slate-200">{t('auth.shop_name', 'Название Магазина')}</label>
                                        <input
                                            type="text"
                                            className={`w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-900 border ${errors.companyName ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent`}
                                            placeholder="Мой Магазин"
                                            {...register("companyName")}
                                        />
                                        {errors.companyName && <p className="text-xs text-red-500">{errors.companyName.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-900 dark:text-slate-200">{t('auth.tax_id', 'ИНН')}</label>
                                            <input
                                                type="text"
                                                className={`w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-900 border ${errors.taxId ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent`}
                                                placeholder="1234567890"
                                                {...register("taxId")}
                                            />
                                            {errors.taxId && <p className="text-xs text-red-500">{errors.taxId.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-900 dark:text-slate-200">{t('auth.email_optional', 'Email (необязательно)')}</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                                <input
                                                    type="email"
                                                    className={`w-full h-11 pl-9 pr-4 rounded-lg bg-white dark:bg-slate-900 border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all`}
                                                    placeholder="name@email.com"
                                                    {...register("email")}
                                                />
                                            </div>
                                            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-900 dark:text-slate-200">{t('auth.category', 'Категория')}</label>
                                        <div className="relative">
                                            <select
                                                className={`w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-900 border ${errors.businessCategory ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent`}
                                                {...register("businessCategory")}
                                            >
                                                <option value="Retail">Розничная торговля</option>
                                                <option value="Auto">Автомобили</option>
                                                <option value="Недвижимость">Недвижимость</option>
                                                <option value="Услуги">Услуги</option>
                                                <option value="Риелтор">Риелтор</option>
                                                <option value="Нотариус">Нотариус</option>
                                                <option value="Оценка">Оценка</option>
                                                <option value="Страхование">Страхование</option>
                                            </select>
                                            <ArrowRight className="absolute right-4 top-3.5 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
                                        </div>
                                        {errors.businessCategory && <p className="text-xs text-red-500">{errors.businessCategory.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-900 dark:text-slate-200">{t('auth.address', 'Адрес')}</label>
                                        <input
                                            type="text"
                                            className="w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent"
                                            placeholder="Улица, дом..."
                                            {...register("businessAddress")}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-900 dark:text-slate-200">{t('auth.description', 'Описание')}</label>
                                        <textarea
                                            className="w-full p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent resize-none h-24"
                                            placeholder="Опишите ваш магазин..."
                                            {...register("businessDescription")}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || isSubmitting}
                            className="w-full h-11 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-200 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {(loading || isSubmitting) ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                            ) : (
                                <>
                                    {t('auth.create_account')}
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>

                        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                            {t('auth.already_have_account')}{' '}
                            <Link to="/login" className="font-semibold text-slate-900 dark:text-white hover:underline">
                                {t('common.login')}
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
