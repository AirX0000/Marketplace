import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, Heart, X, Package, Sun, Moon, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { CategoryModal } from './CategoryModal';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';

export function Header() {
    const { t, i18n } = useTranslation();
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const { cartCount, checkAuth, user, isAuthenticated, isBuyer, isPartner, isAdmin, logout } = useShop();
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
                        <LanguageSwitcher />

                        <div className="w-px h-6 bg-border mx-2 hidden md:block" />

                        {/* Theme Switcher */}
                        <button
                            onClick={toggleTheme}
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

                        {/* User Profile / Login */}
                        <Link
                            to={isAuthenticated ? (isAdmin() ? "/admin" : "/profile") : "/login"}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group"
                        >
                            <User className="h-5 w-5 text-foreground group-hover:text-primary" />
                            <span className="hidden lg:block text-sm font-medium text-foreground group-hover:text-primary">
                                {isAuthenticated ? (user?.name || t('common.profile')) : t('common.login')}
                            </span>
                        </Link>

                        {/* Cart - Only for buyers */}
                        {(!isAuthenticated || isBuyer()) && (
                            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-muted transition-colors group">
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
