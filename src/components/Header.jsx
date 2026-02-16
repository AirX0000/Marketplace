import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, Heart, X, Package, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { CategoryModal } from './CategoryModal';
import { useShop } from '../context/ShopContext';

export function Header() {
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const { cartCount, checkAuth, user, isAuthenticated, isBuyer, isPartner, isAdmin, logout } = useShop();

    // Re-check auth on mount
    React.useEffect(() => {
        checkAuth();
    }, []);

    // Theme initialization
    React.useEffect(() => {
        const isDark = localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/catalog?q=${encodeURIComponent(searchTerm)}`);
            setSearchTerm('');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900 shadow-sm">
                <div className="container flex h-16 items-center px-4 md:px-6 gap-4">
                    <Link to="/" className="flex-none flex items-center space-x-2 mr-4">
                        <span className="text-2xl font-black bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent italic tracking-tighter uppercase">
                            autohouse
                        </span>
                    </Link>

                    {/* Catalog Button - Only for buyers */}
                    {(!isAuthenticated || isBuyer()) && (
                        <button
                            onClick={() => setIsCatalogOpen(true)}
                            className="hidden md:flex items-center justify-center h-10 px-6 rounded-lg font-bold transition-all bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95"
                        >
                            <Menu className="mr-2 h-5 w-5" />
                            Каталог
                        </button>
                    )}

                    {/* Search - Only for buyers */}
                    {(!isAuthenticated || isBuyer()) && (
                        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Поиск товаров..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 rounded-md border border-slate-700 bg-slate-800 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                        </form>
                    )}

                    <div className="flex-1" />

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-1">

                        {/* Theme Switcher */}
                        <button
                            onClick={() => {
                                const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
                                if (newTheme === 'dark') {
                                    document.documentElement.classList.add('dark');
                                    localStorage.setItem('theme', 'dark');
                                } else {
                                    document.documentElement.classList.remove('dark');
                                    localStorage.setItem('theme', 'light');
                                }
                                // Force re-render not strictly needed if we just use direct DOM manipulation for speed, 
                                // but for icon toggle we usually need state. 
                                // Simplified for robust replacement:
                                window.dispatchEvent(new Event('storage'));
                            }}
                            className="p-2 rounded-full hover:bg-slate-800 transition-colors mr-2 group"
                        >
                            <span className="dark:hidden block"><Moon className="h-5 w-5 text-slate-300 group-hover:text-blue-400" /></span>
                            <span className="hidden dark:block"><Sun className="h-5 w-5 text-yellow-400 group-hover:text-yellow-300" /></span>
                        </button>



                        {!isAuthenticated ? (
                            <>
                                <Link to="/login" className="hidden md:inline-flex h-9 px-4 items-center justify-center rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white">
                                    Войти
                                </Link>
                                <Link to="/register" className="inline-flex h-9 px-4 items-center justify-center rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white">
                                    Регистрация
                                </Link>
                            </>
                        ) : (
                            <>
                                {/* Navigation icons - visible for all authenticated users */}
                                <Link to="/favorites" className="hidden md:flex flex-col items-center justify-center h-full px-2 text-slate-300 hover:text-primary transition-colors">
                                    <Heart className="h-5 w-5" />
                                    <span className="text-[10px] font-medium mt-1">Избранное</span>
                                </Link>

                                <Link to="/cart" className="flex flex-col items-center justify-center h-full px-2 text-slate-300 hover:text-primary transition-colors">
                                    <div className="relative">
                                        <ShoppingCart className="h-5 w-5" />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center">
                                                {cartCount}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-medium mt-1">Корзина</span>
                                </Link>

                                <Link to="/orders" className="hidden md:flex flex-col items-center justify-center h-full px-2 text-slate-300 hover:text-primary transition-colors">
                                    <Package className="h-5 w-5" />
                                    <span className="text-[10px] font-medium mt-1">Заказы</span>
                                </Link>

                                {/* autohouse Pay */}
                                {isBuyer() && (
                                    <Link to="/wallet" className="flex flex-col items-center justify-center h-full px-2 text-emerald-400 hover:text-emerald-300 transition-colors animate-pulse hover:animate-none">
                                        <div className="relative">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
                                        </div>
                                        <span className="text-[10px] font-bold mt-1">autohouse Pay</span>
                                    </Link>
                                )}

                                {/* User Menu Dropdown */}
                                <div className="group relative flex flex-col items-center justify-center h-full px-2 text-slate-300 hover:text-primary transition-colors cursor-pointer">
                                    <User className="h-5 w-5" />
                                    <span className="text-[10px] font-medium mt-1">
                                        {isPartner() ? 'Партнер' : isAdmin() ? 'Админ' : 'Профиль'}
                                    </span>

                                    {/* Dropdown */}
                                    <div className="absolute top-10 right-0 w-48 bg-white border shadow-lg rounded-xl overflow-hidden hidden group-hover:block animate-in fade-in zoom-in-95 duration-200 z-50">
                                        <div className="p-2 border-b text-xs text-slate-700 font-semibold px-4 rounded-t-xl bg-slate-100">
                                            {user?.name || 'Мой аккаунт'}
                                        </div>

                                        {/* Role-specific menu items */}
                                        {isPartner() && (
                                            <Link to="/partner" className="block px-4 py-3 text-sm hover:bg-slate-100 transition-colors border-b font-medium text-slate-700">
                                                📊 Мой Магазин
                                            </Link>
                                        )}

                                        {isAdmin() && (
                                            <Link to="/admin" className="block px-4 py-3 text-sm hover:bg-slate-100 transition-colors border-b font-medium text-slate-700">
                                                ⚙️ Панель Управления
                                            </Link>
                                        )}

                                        {isBuyer() && (
                                            <>
                                                <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-slate-100 transition-colors text-slate-700">
                                                    Личный Кабинет
                                                </Link>
                                                <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-slate-100 transition-colors text-slate-700">
                                                    Мои заказы
                                                </Link>
                                                <Link to="/favorites" className="block px-4 py-2 text-sm hover:bg-slate-100 transition-colors text-slate-700">
                                                    Список желаний
                                                </Link>
                                            </>
                                        )}

                                        <Link to="/settings" className="block px-4 py-2 text-sm hover:bg-slate-100 transition-colors border-t text-slate-700">
                                            Настройки
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20"
                                        >
                                            Выйти
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>
            <CategoryModal isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
        </>
    );
}
