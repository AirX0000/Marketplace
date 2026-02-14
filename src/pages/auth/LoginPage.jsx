import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../../lib/api';
import { useShop } from '../../context/ShopContext';
import { notify } from '../../lib/notify';
import { loginSchema } from '../../lib/schemas';
import { Mail, Lock, ArrowRight, LayoutDashboard, Loader2 } from 'lucide-react';

export function LoginPage() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useShop();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setError("");
        try {
            const response = await api.login(data);
            login(response.token, response.user);
            notify.success(`Добро пожаловать, ${response.user.name}!`);

            // Redirect based on role
            const defaultRoute = response.user.role === 'PARTNER' ? '/partner' :
                response.user.role === 'ADMIN' ? '/admin' : '/profile';
            navigate(defaultRoute);
        } catch (err) {
            setError(err.message || 'Ошибка входа');
            notify.error(err.message || 'Неверный email или пароль');
        } finally {
            setLoading(false);
        }
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
                        <h2 className="text-2xl font-bold tracking-tight">MarketApp</h2>
                    </div>
                    <blockquote className="text-3xl font-medium leading-normal mb-8 max-w-lg">
                        "Единая платформа для управления вашим бизнесом и покупками. Просто, быстро, надежно."
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
                        <span>MarketApp</span>
                    </Link>
                </div>

                <div className="w-full max-w-[400px] space-y-10">
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">С возвращением!</h1>
                        <p className="text-slate-500 dark:text-slate-400">Введите свои учетные данные для доступа.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2 border border-red-100 dark:border-red-500/20">
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Email</label>
                                <input
                                    type="email"
                                    className={`w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-900 border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                                        } text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-500' : 'focus:ring-slate-900 dark:focus:ring-white'
                                        } focus:border-transparent transition-all`}
                                    placeholder="name@company.com"
                                    {...register('email')}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Пароль</label>
                                    <Link to="/forgot-password" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors">
                                        Забыли пароль?
                                    </Link>
                                </div>
                                <input
                                    type="password"
                                    className={`w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-900 border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                                        } text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${errors.password ? 'focus:ring-red-500' : 'focus:ring-slate-900 dark:focus:ring-white'
                                        } focus:border-transparent transition-all`}
                                    placeholder="••••••••"
                                    {...register('password')}
                                />
                                {errors.password && (
                                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.password.message}
                                    </p>
                                )}
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
                                    Войти
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                        Нет аккаунта?{' '}
                        <Link to="/register" className="font-semibold text-slate-900 dark:text-white hover:underline">
                            Создать аккаунт
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
