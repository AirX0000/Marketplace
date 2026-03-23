import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Settings, LogOut, Package, Users, BadgeDollarSign, Briefcase, FileText, Mail, Shield, Truck, HandCoins, Store, Home, ClipboardList, BookOpen, UserCircle, PhoneCall, CalendarDays, Menu, X, WalletCards } from 'lucide-react';
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
            <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
                <span className="text-xl font-black uppercase tracking-widest bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                    {isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin Panel' : 'Partner Hub'}
                </span>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <Link
                    to="/admin"
                    className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                        isActive('/admin') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                >
                    <LayoutDashboard className="mr-3 h-5 w-5" />
                    {t('admin.dashboard', 'Дашборд')}
                </Link>

                <Link
                    to="/admin/listings"
                    className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                        isActive('/admin/listings') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                                isActive('/admin/orders') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                                isActive('/admin/customers') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                                isActive('/super-admin/users') && location.search.includes('Риелтор') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Home className="mr-3 h-5 w-5" />
                            Риелторы
                        </Link>
                        <Link
                            to="/super-admin/users?role=PARTNER&category=Нотариус"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/super-admin/users') && location.search.includes('Нотариус') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <FileText className="mr-3 h-5 w-5" />
                            Нотариусы
                        </Link>
                        <Link
                            to="/super-admin/users?role=PARTNER&category=Оценка"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/super-admin/users') && location.search.includes('Оценка') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <ClipboardList className="mr-3 h-5 w-5" />
                            Оценщики
                        </Link>
                        <Link
                            to="/super-admin/users?role=PARTNER&category=Страхование"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/super-admin/users') && location.search.includes('Страхование') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                                isActive('/super-admin/users') && !location.search.includes('category=') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Users className="mr-3 h-5 w-5" />
                            Все Пользователи
                        </Link>
                        <Link
                            to="/super-admin/loans"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/super-admin/loans') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <FileText className="mr-3 h-5 w-5" />
                            Кредит / Ипотека
                        </Link>
                        {isSuperAdmin && (
                            <Link
                                to="/admin/autohouse-pay"
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                    isActive('/admin/autohouse-pay') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-bold border border-emerald-100/50 bg-emerald-50/20"
                                )}
                            >
                                <WalletCards className="mr-3 h-5 w-5" />
                                Autohouse Pay
                            </Link>
                        )}
                        <Link
                            to="/admin/companies"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/admin/companies') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Briefcase className="mr-3 h-5 w-5" />
                            Компании
                        </Link>
                        <Link
                            to="/admin/emails"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/admin/emails') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Mail className="mr-3 h-5 w-5" />
                            Рассылки
                        </Link>
                        <Link
                            to="/admin/logistics"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/admin/logistics') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Truck className="mr-3 h-5 w-5" />
                            Логистика
                        </Link>
                        <Link
                            to="/admin/partners"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/admin/partners') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Store className="mr-3 h-5 w-5" />
                            Партнеры
                        </Link>
                    </>
                )}

                {isPartner && !isAdmin && (
                    <>
                        <Link
                            to="/admin/offers"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/admin/offers') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <HandCoins className="mr-3 h-5 w-5" />
                            {t('admin.offers', 'Предложения')}
                        </Link>
                        {(isRealtor || isNotary || isEvaluation || isInsurance) && (
                            <Link
                                to="/admin/leads"
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                    isActive('/admin/leads') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <CalendarDays className="mr-3 h-5 w-5" />
                                Консультации
                            </Link>
                        )}
                    </>
                )}

                {isPartner && (
                    <Link
                        to="/admin/finance"
                        className={cn(
                            "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                            isActive('/admin/finance') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                                isActive('/admin/careers') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Briefcase className="mr-3 h-5 w-5" />
                            Вакансии
                        </Link>
                        <Link
                            to="/admin/blog"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/admin/blog') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                        isActive('/admin/settings') ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                >
                    <Settings className="mr-3 h-5 w-5" />
                    {t('admin.settings', 'Настройки')}
                </Link>
            </nav>
            <div className="p-4 border-t border-border">
                <Link
                    to="/"
                    className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    {t('common.logout')}
                </Link>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Desktop Sidebar */}
            <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
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
                            className="fixed inset-y-0 left-0 w-72 bg-card z-[101] md:hidden flex flex-col shadow-2xl border-r border-border"
                        >
                            <SidebarContent />
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
                            >
                                <X size={20} />
                            </button>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-auto">
                <header className="h-16 border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 px-4 flex items-center justify-between md:hidden">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 active:scale-95 transition-transform"
                        >
                            <Menu size={24} />
                        </button>
                        <span className="font-black text-sm uppercase tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin Panel' : 'Partner Hub'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isAdmin && <LanguageSwitcher />}
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-[10px] shadow-lg shadow-primary/20">
                            {user?.name?.charAt(0)}
                        </div>
                    </div>
                </header>
                <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-6 hidden md:flex items-center justify-end gap-4 shadow-sm">
                    {!isAdmin && <LanguageSwitcher />}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-black uppercase tracking-tight">{user?.name}</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{user?.role}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-xs uppercase shadow-lg shadow-primary/20">
                            {user?.name?.charAt(0)}
                        </div>
                    </div>
                </header>
                <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
                    <Outlet />
                </div>
            </main>
        </div >
    );
}
