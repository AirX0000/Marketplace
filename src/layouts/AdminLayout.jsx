import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Settings, LogOut, Package, Users, BadgeDollarSign, Briefcase, FileText, Mail, Shield, Truck, HandCoins, Store, Home, ClipboardList, BookOpen, UserCircle, PhoneCall, CalendarDays, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { cn } from '../lib/utils';
import { useShop } from '../context/ShopContext';

export function AdminLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { user } = useShop();
    const { t, i18n } = useTranslation();
    const isActive = (path) => location.pathname === path;
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const isPartner = user?.role === 'PARTNER' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const businessCategory = user?.businessCategory || '';

    const isRealtor = businessCategory === 'Риелтор';
    const isNotary = businessCategory === 'Нотариус';
    const isEvaluation = businessCategory === 'Оценка';
    const isInsurance = businessCategory === 'Страхование';
    const isStandardRetail = !isRealtor && !isNotary && !isEvaluation && !isInsurance;

    // Force Russian for Admin if they happen to have it switched
    useEffect(() => {
        if (isAdmin && i18n.language !== 'ru') {
            i18n.changeLanguage('ru');
        }
    }, [isAdmin, i18n]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const SidebarContent = () => (
        <>
            <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    {isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin Panel' : 'Partner Hub'}
                </span>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <Link
                    to="/admin"
                    className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                        isActive('/admin') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                >
                    <LayoutDashboard className="mr-3 h-5 w-5" />
                    {t('admin.dashboard', 'Дашборд')}
                </Link>

                <Link
                    to="/admin/listings"
                    className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                        isActive('/admin/listings') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                >
                    {isRealtor ? <Home className="mr-3 h-5 w-5" /> :
                        isNotary ? <FileText className="mr-3 h-5 w-5" /> :
                            isEvaluation ? <ClipboardList className="mr-3 h-5 w-5" /> :
                                isInsurance ? <Shield className="mr-3 h-5 w-5" /> :
                                    <Package className="mr-3 h-5 w-5" />}

                    {isAdmin ? 'Управление Товарами' :
                        isRealtor ? 'Мои Объекты' :
                            isNotary ? 'Мои Документы / Услуги' :
                                isEvaluation ? 'Мои Отчеты' :
                                    isInsurance ? 'Мои Полисы' :
                                        t('admin.my_listings', 'Мои Товары')}
                </Link>

                {isPartner && !isAdmin && (
                    <>
                        <Link
                            to="/admin/orders"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/admin/orders') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            {isNotary ? <CalendarDays className="mr-3 h-5 w-5" /> : <ClipboardList className="mr-3 h-5 w-5" />}
                            {isRealtor ? 'Заявки' :
                                isNotary ? 'Записи на прием' :
                                    isEvaluation ? 'Запросы на оценку' :
                                        isInsurance ? 'Заявки на страхование' :
                                            t('admin.orders', 'Заказы')}
                        </Link>
                        <Link
                            to="/admin/customers"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/admin/customers') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Users className="mr-3 h-5 w-5" />
                            {t('admin.customers', 'Клиенты')}
                        </Link>
                    </>
                )}

                {isAdmin && (
                    <>
                        <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Сфера Услуг
                        </div>
                        <Link
                            to="/super-admin/users?role=PARTNER&category=Риелтор"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/super-admin/users') && location.search.includes('Риелтор') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Home className="mr-3 h-5 w-5" />
                            Риелторы
                        </Link>
                        <Link
                            to="/super-admin/users?role=PARTNER&category=Нотариус"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/super-admin/users') && location.search.includes('Нотариус') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <FileText className="mr-3 h-5 w-5" />
                            Нотариусы
                        </Link>
                        <Link
                            to="/super-admin/users?role=PARTNER&category=Оценка"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/super-admin/users') && location.search.includes('Оценка') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <ClipboardList className="mr-3 h-5 w-5" />
                            Оценщики
                        </Link>
                        <Link
                            to="/super-admin/users?role=PARTNER&category=Страхование"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/super-admin/users') && location.search.includes('Страхование') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Shield className="mr-3 h-5 w-5" />
                            Страхование
                        </Link>

                        <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Главное Управление
                        </div>
                        <Link
                            to="/super-admin/users"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/super-admin/users') && !location.search.includes('category=') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Users className="mr-3 h-5 w-5" />
                            Все Пользователи
                        </Link>
                        <Link
                            to="/super-admin/loans"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/super-admin/loans') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <FileText className="mr-3 h-5 w-5" />
                            Кредит / Ипотека
                        </Link>
                        <Link
                            to="/admin/companies"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/admin/companies') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Briefcase className="mr-3 h-5 w-5" />
                            Компании
                        </Link>
                        <Link
                            to="/admin/emails"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/admin/emails') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Mail className="mr-3 h-5 w-5" />
                            Рассылки
                        </Link>
                        <Link
                            to="/admin/logistics"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/admin/logistics') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Truck className="mr-3 h-5 w-5" />
                            Логистика
                        </Link>
                        <Link
                            to="/admin/partners"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/admin/partners') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Store className="mr-3 h-5 w-5" />
                            Партнеры
                        </Link>
                    </>
                )}

                {isPartner && !isAdmin && (
                    <Link
                        to="/admin/offers"
                        className={cn(
                            "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                            isActive('/admin/offers') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        <HandCoins className="mr-3 h-5 w-5" />
                        {t('admin.offers', 'Предложения')}
                    </Link>
                )}

                {isPartner && (
                    <Link
                        to="/admin/finance"
                        className={cn(
                            "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                            isActive('/admin/finance') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        <BadgeDollarSign className="mr-3 h-5 w-5" />
                        {t('admin.finance', 'Финансы')}
                    </Link>
                )}

                <div className="pt-4 pb-2 px-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Контент</div>
                </div>

                {isAdmin && (
                    <>
                        <Link
                            to="/admin/careers"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/admin/careers') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Briefcase className="mr-3 h-5 w-5" />
                            Вакансии
                        </Link>
                        <Link
                            to="/admin/blog"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/admin/blog') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <FileText className="mr-3 h-5 w-5" />
                            Блог
                        </Link>
                    </>
                )}

                <Link
                    to="/admin/settings"
                    className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                        isActive('/admin/settings') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                >
                    <Settings className="mr-3 h-5 w-5" />
                    {t('admin.settings', 'Настройки')}
                </Link>
            </nav>
            <div className="p-4 border-t border-slate-800">
                <Link
                    to="/"
                    className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-slate-300 hover:bg-red-900/20 hover:text-red-400 transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    {t('common.logout')}
                </Link>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-muted/20">
            {/* Desktop Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900 hidden md:flex flex-col">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-72 bg-slate-900 z-[101] md:hidden flex flex-col shadow-2xl border-r border-slate-800"
                        >
                            <SidebarContent />
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-auto">
                <header className="h-16 border-b bg-background px-4 flex items-center justify-between md:hidden">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 -ml-2 text-slate-500 hover:text-slate-900"
                        >
                            <Menu size={24} />
                        </button>
                        <span className="font-bold">
                            {isAdmin ? 'Admin Panel' : 'Partner Hub'}
                        </span>
                    </div>
                    {!isAdmin && <LanguageSwitcher />}
                </header>
                <header className="h-16 border-b bg-background px-6 hidden md:flex items-center justify-end gap-4">
                    {!isAdmin && <LanguageSwitcher />}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-bold">{user?.name}</p>
                            <p className="text-xs text-muted-foreground uppercase">{user?.role}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs uppercase">
                            {user?.name?.charAt(0)}
                        </div>
                    </div>
                </header>
                <div className="flex-1 p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div >
    );
}
