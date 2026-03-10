import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, Heart, X, Package, Sun, Moon, Globe, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { CategoryModal } from './CategoryModal';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';
import { NotificationBell } from './NotificationBell';

export function Header() {
    const { t, i18n } = useTranslation();
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const { cartCount, checkAuth, user, isAuthenticated, isBuyer, isPartner, isAdmin, getUserRole, logout } = useShop();
    const { theme, toggleTheme } = useTheme();

    // Re-check auth on mount and handle scroll
    React.useEffect(() => {
        checkAuth();

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
            <header
                className={cn(
                    "sticky top-0 z-[100] w-full border-b border-border bg-background/80 backdrop-blur-md transition-all duration-300",
                    isScrolled ? "h-16 shadow-sm" : "h-20"
                )}
            >
                <div className="container mx-auto flex h-full items-center px-4 md:px-6 gap-4">
                    <Link to="/" className="flex-none flex items-center mr-4 group">
                        <img src="/logo-full.png" alt="Autohouse" className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" />
                    </Link>

                    {/* Catalog Button - Only for buyers */}
                    {(!isAuthenticated || isBuyer()) && (
                        <button
                            onClick={() => setIsCatalogOpen(true)}
                            aria-label="Открыть каталог"
                            className="hidden md:flex items-center justify-center h-10 px-6 rounded-lg font-bold transition-all bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95"
                        >
                            <Menu className="mr-2 h-5 w-5" />
                            {t('common.catalog')}
                        </button>
                    )}

                    {/* Search - Only for buyers */}
                    {(!isAuthenticated || isBuyer()) && (
                        <form onSubmit={handleSearch} className="flex-1 md:max-w-xl mx-2 md:mx-0">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder={t('common.search_placeholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                                />
                            </div>
                        </form>
                    )}

                    <div className="flex-1" />

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-1">
                        <Link
                            to="/post-ad"
                            className="hidden md:flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all mr-2"
                        >
                            <Plus size={16} />
                            {t('common.add_listing', 'Разместить объявление')}
                        </Link>

                        <LanguageSwitcher />

                        <div className="w-px h-6 bg-border mx-2 hidden md:block" />

                        {/* Theme Switcher */}
                        <button
                            onClick={toggleTheme}
                            aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить темную тему'}
                            className="p-2 rounded-full hover:bg-muted transition-colors mr-2 group"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'light' ? (
                                <Moon className="h-5 w-5 text-foreground group-hover:text-primary" />
                            ) : (
                                <Sun className="h-5 w-5 text-foreground group-hover:text-primary" />
                            )}
                        </button>

                        <div className="w-px h-6 bg-border mx-2 hidden md:block" />

                        {/* Notification Bell */}
                        {isAuthenticated && <NotificationBell />}

                        <div className="w-px h-6 bg-border mx-2 hidden md:block" />

                        {/* User Profile / Login */}
                        {isAuthenticated ? (
                            <div className="relative group">
                                <button aria-label="Профиль пользователя" className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted transition-colors">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={`Avatar of ${user.name || 'user'}`} className="h-8 w-8 rounded-full object-cover border border-border" />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                            {user?.name ? user.name[0].toUpperCase() : <User size={16} />}
                                        </div>
                                    )}
                                    <div className="flex flex-col items-start hidden lg:flex text-foreground">
                                        <span className="text-sm font-bold leading-none">
                                            {user?.name || t('common.profile')}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                            {getUserRole() === 'SUPER_ADMIN' ? 'Super Admin' : isPartner() ? t('common.partner') : isAdmin() ? t('common.admin') : t('common.profile')}
                                        </span>
                                    </div>
                                </button>

                                {/* Dropdown */}
                                <div className="absolute top-11 right-0 w-56 bg-card border border-border shadow-lg rounded-xl overflow-hidden hidden group-hover:block animate-in fade-in zoom-in-95 duration-200 z-50">
                                    <div className="p-3 border-b border-border bg-muted/30 flex items-center gap-3">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt={`Avatar of ${user?.name || 'user'}`} className="h-10 w-10 rounded-full object-cover border-2 border-background shadow" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow">
                                                {user?.name ? user.name[0].toUpperCase() : '?'}
                                            </div>
                                        )}
                                        <div className="overflow-hidden">
                                            <div className="text-sm font-bold text-foreground truncate">{user?.name || 'Мой аккаунт'}</div>
                                            <div className="text-xs text-muted-foreground truncate">{user?.phone || ''}</div>
                                        </div>
                                    </div>

                                    {/* Role-specific menu items */}
                                    {isPartner() && (
                                        <Link to="/partner" className="block px-4 py-3 text-sm hover:bg-muted transition-colors border-b border-border font-medium text-foreground">
                                            📊 Мой Магазин
                                        </Link>
                                    )}

                                    {isAdmin() && (
                                        <Link to="/admin" className="block px-4 py-3 text-sm hover:bg-muted transition-colors border-b border-border font-medium text-foreground">
                                            ⚙️ Панель Управления
                                        </Link>
                                    )}

                                    {isBuyer() && (
                                        <>
                                            <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-muted transition-colors text-foreground">
                                                Личный Кабинет
                                            </Link>
                                            <Link to="/profile?tab=garage" className="block px-4 py-2 text-sm hover:bg-muted transition-colors text-foreground font-bold flex items-center justify-between">
                                                Мой Гараж
                                                <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase">New</span>
                                            </Link>
                                            <Link to="/admin/listings" className="block px-4 py-2 text-sm hover:bg-muted font-bold transition-colors text-primary">
                                                Мои объявления
                                            </Link>
                                            <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-muted transition-colors text-foreground">
                                                Мои заказы
                                            </Link>
                                            <Link to="/chat" className="block px-4 py-2 text-sm hover:bg-muted transition-colors text-foreground">
                                                Сообщения
                                            </Link>
                                            <Link to="/profile/offers" className="block px-4 py-2 text-sm hover:bg-muted transition-colors text-foreground">
                                                Мои предложения
                                            </Link>
                                            <Link to="/favorites" className="block px-4 py-2 text-sm hover:bg-muted transition-colors text-foreground">
                                                Список желаний
                                            </Link>
                                        </>
                                    )}

                                    <Link to="/settings" className="block px-4 py-2 text-sm hover:bg-muted transition-colors border-t border-border text-foreground">
                                        Настройки
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20"
                                    >
                                        {t('common.logout')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group"
                            >
                                <User className="h-5 w-5 text-foreground group-hover:text-primary" />
                                <span className="hidden lg:block text-sm font-medium text-foreground group-hover:text-primary">
                                    {t('common.login')}
                                </span>
                            </Link>
                        )}

                        {/* Cart - Only for buyers */}
                        {(!isAuthenticated || isBuyer()) && (
                            <Link to="/cart" aria-label="Корзина" className="relative p-2 rounded-lg hover:bg-muted transition-colors group">
                                <ShoppingCart className="h-5 w-5 text-foreground group-hover:text-primary" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-background animate-in zoom-in">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}
                    </div>
                </div>
            </header>
            <CategoryModal isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
        </>
    );
}
