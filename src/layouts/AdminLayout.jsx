import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Settings, LogOut, Package, Users, BadgeDollarSign, Briefcase, FileText, Mail, Shield, Truck, HandCoins, Store } from 'lucide-react';
import { cn } from '../lib/utils';
import { useShop } from '../context/ShopContext';

export function AdminLayout() {
    const location = useLocation();
    const { user } = useShop();
    const isActive = (path) => location.pathname === path;
    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className="flex h-screen bg-muted/20">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900 hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                        {isAdmin ? 'Admin Panel' : 'Partner Hub'}
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
                        Дашборд
                    </Link>

                    {/* Shared: Listings / Moderation */}


                    {/* PARTNER & ADMIN LISTINGS */}
                    <Link
                        to="/admin/listings"
                        className={cn(
                            "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                            isActive('/admin/listings') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        <Package className="mr-3 h-5 w-5" />
                        {isAdmin ? 'Управление Товарами' : 'Мои Товары'}
                    </Link>

                    {/* ORDERS (PARTNER ONLY) */}
                    {!isAdmin && (
                        <>
                            <Link
                                to="/admin/orders"
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                    isActive('/admin/orders') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <Users className="mr-3 h-5 w-5" />
                                Заказы
                            </Link>
                            <Link
                                to="/admin/customers"
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                    isActive('/admin/customers') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <Users className="mr-3 h-5 w-5" />
                                Клиенты
                            </Link>
                        </>
                    )}

                    {/* ADMIN ONLY */}
                    {isAdmin && (
                        <>
                            <Link
                                to="/super-admin/users"
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                    isActive('/super-admin/users') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <Users className="mr-3 h-5 w-5" />
                                Пользователи
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

                    {/* OFFERS (PARTNER ONLY) */}
                    {!isAdmin && (
                        <Link
                            to="/admin/offers"
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                isActive('/admin/offers') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <HandCoins className="mr-3 h-5 w-5" />
                            Предложения
                        </Link>
                    )}

                    {/* Shared: Finance */}
                    <Link
                        to="/admin/finance"
                        className={cn(
                            "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                            isActive('/admin/finance') ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        <BadgeDollarSign className="mr-3 h-5 w-5" />
                        Финансы
                    </Link>

                    {/* CMS Section (Admin mostly) */}
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
                        Настройки
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <Link
                        to="/"
                        className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-slate-300 hover:bg-red-900/20 hover:text-red-400 transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Выйти
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-auto">
                <header className="h-16 border-b bg-background px-6 flex items-center justify-between md:hidden">
                    <span className="font-bold">
                        {isAdmin ? 'Admin Panel' : 'Partner Hub'}
                    </span>
                    {/* Mobile menu trigger would go here */}
                </header>
                <div className="flex-1 p-6 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div >
    );
}
