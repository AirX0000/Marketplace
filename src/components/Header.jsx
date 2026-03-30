import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, Heart, X, Package, Sun, Moon, Globe, Plus, Mic, MicOff, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { CategoryModal } from './CategoryModal';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';
import { NotificationBell } from './NotificationBell';
import { CommandPalette } from './CommandPalette';

export function Header() {
    const { t, i18n } = useTranslation();
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const navigate = useNavigate();
    const { cartCount, checkAuth, user, isAuthenticated, isBuyer, isPartner, isAdmin, getUserRole, logout } = useShop();
    const { theme, toggleTheme } = useTheme();
    const [isListening, setIsListening] = useState(false);

    // NLP Query Parser
    const parseNLPQuery = (query) => {
        const lower = query.toLowerCase();
        const params = {};
        
        // Year detection
        const yearMatch = lower.match(/\b(20\d{2}|19\d{2})\b/);
        if (yearMatch) params.attr_year = yearMatch[0];
        
        // Price detection (e.g. "до 10000", "до 10к")
        const priceMatch = lower.match(/до\s*(\d+)(к|k)?/);
        if (priceMatch) {
            let p = parseInt(priceMatch[1]);
            if (priceMatch[2]) p *= 1000;
            params.maxPrice = p;
        }

        // Room count detection ("2 комнатная", "3 комн")
        const roomMatch = lower.match(/(\d)\s*(комн|комнат)/);
        if (roomMatch) params.attr_rooms = roomMatch[1];

        return params;
    };

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
            const params = new URLSearchParams();
            params.set('search', searchTerm.trim());
            
            navigate(`/marketplaces?${params.toString()}`);
            setSearchTerm('');
        }
    };

    const startRecording = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Ваш браузер не поддерживает голосовой поиск.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = i18n.language === 'uz' ? 'uz-UZ' : 'ru-RU';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSearchTerm(transcript);
            // Auto submit after a short delay
            setTimeout(() => {
                const nlpParams = parseNLPQuery(transcript);
                const searchParams = new URLSearchParams();
                searchParams.set('search', transcript);
                Object.entries(nlpParams).forEach(([k, v]) => searchParams.set(k, v));
                navigate(`/marketplaces?${searchParams.toString()}`);
            }, 500);
        };
        recognition.start();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <CommandPalette />
            <header
                className={cn(
                    "sticky top-0 z-[100] w-full border-b border-border bg-background/80 backdrop-blur-md transition-all duration-300",
                    isScrolled ? "h-16 shadow-sm" : "h-20"
                )}
            >
                <div className="container flex h-full items-center gap-4">
                    <Link to="/" className="flex-none flex items-center mr-4 group">
                        <img src="/logo-full.png" alt="Autohouse" className="h-8 md:h-10 w-auto object-contain transition-transform group-hover:scale-105" />
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

                    {/* Search - Global */}
                    {(!isAuthenticated || isBuyer() || user?.role === 'SUPER_ADMIN') && (
                        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-2 md:mx-8 items-center">
                            <div className="relative w-full flex items-center group bg-slate-100 dark:bg-slate-900 rounded-2xl border border-transparent dark:border-slate-800 transition-all hover:bg-slate-200/50 dark:hover:bg-slate-800/50 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder={t('common.search_placeholder', 'Поиск товара по имени...')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-12 pl-12 pr-24 bg-transparent text-sm md:text-base text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none"
                                />
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={startRecording}
                                        className={cn(
                                            "h-10 w-10 flex items-center justify-center rounded-xl transition-all",
                                            isListening ? "text-red-500 bg-red-100 dark:bg-red-500/20 animate-pulse" : "text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                                        )}
                                        title="Голосовой поиск"
                                    >
                                        <Mic size={20} />
                                    </button>
                                    <button
                                        type="submit"
                                        className="h-10 px-6 bg-primary text-primary-foreground rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-primary/20 flex items-center gap-2"
                                    >
                                        <Search size={16} className="md:hidden lg:block" />
                                        <span>{t('common.find', 'Найти')}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    <div className="flex-1" />

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-1 md:gap-2">
                        <Link
                            to="/mortgage"
                            className="hidden md:flex items-center gap-1.5 bg-orange-500/10 text-orange-600 px-3 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-orange-500/20 active:scale-95 transition-all mr-1 md:mr-2"
                        >
                            <Building2 size={16} className="shrink-0" />
                            <span>{t('home.mortgage', 'Ипотека')}</span>
                        </Link>

                        <Link
                            to="/post-ad"
                            className="flex items-center gap-1.5 bg-emerald-600 text-white px-2.5 py-2 rounded-xl text-[10px] md:text-sm font-black md:font-bold uppercase tracking-tight md:tracking-normal shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 active:scale-95 transition-all mr-1 md:mr-2"
                        >
                            <Plus size={16} className="shrink-0" />
                            <span className="leading-none whitespace-nowrap hidden md:inline">{t('common.add_listing', 'Разместить объявление')}</span>
                        </Link>

                        <div className="hidden md:block">
                            <LanguageSwitcher />
                        </div>

                        <div className="w-px h-6 bg-border mx-2 hidden md:block" />

                        {/* Theme Switcher - Desktop */}
                        <button
                            onClick={toggleTheme}
                            aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить темную тему'}
                            className="hidden md:block p-2 rounded-full hover:bg-muted transition-colors mr-2 group"
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
                                <button aria-label="Профиль пользователя" className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted transition-colors -mr-2">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={`Avatar of ${user.name || 'user'}`} className="h-8 w-8 rounded-full object-cover border border-border" />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                            {user?.name?.charAt(0)?.toUpperCase() || <User size={16} />}
                                        </div>
                                    )}
                                    <div className="flex flex-col items-start hidden lg:flex text-foreground">
                                        <span className="text-sm font-bold leading-none">
                                            {user?.name || t('common.profile')}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                            {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : user?.role === 'PARTNER' ? t('common.partner') : user?.role === 'ADMIN' ? t('common.admin') : t('common.profile')}
                                        </span>
                                    </div>
                                </button>

                                {/* Dropdown */}
                                <div className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-slate-900 border border-border/80 shadow-2xl rounded-2xl overflow-hidden hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200 z-[9999]">
                                    <div className="p-4 border-b border-border/60 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-4">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt={`Avatar of ${user?.name || 'user'}`} className="h-12 w-12 rounded-full object-cover border-2 border-primary/20 shadow-sm" />
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-sm font-black shadow-lg">
                                                {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                        <div className="overflow-hidden">
                                            <div className="text-base font-black text-foreground truncate">{user?.name || 'Мой аккаунт'}</div>
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">{user?.phone || ''}</div>
                                        </div>
                                    </div>

                                    <div className="py-2">
                                        {/* Role-specific menu items */}
                                        {isPartner() && (
                                            <Link to="/partner" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors font-bold text-foreground mx-2 rounded-xl mb-1">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">📊</div>
                                                Мой Магазин
                                            </Link>
                                        )}

                                        {isAdmin() && (
                                            <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors font-bold text-foreground mx-2 rounded-xl mb-1">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">⚙️</div>
                                                Панель Управления
                                            </Link>
                                        )}

                                        {isBuyer() && (
                                            <div className="space-y-0.5 px-2">
                                                <Link to="/profile?tab=overview" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted transition-colors text-foreground rounded-lg">
                                                    👤 Личный Кабинет
                                                </Link>
                                                <Link to="/profile?tab=garage" className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted transition-colors text-foreground rounded-lg font-bold">
                                                    <span className="flex items-center gap-3">🏎️ Мой Гараж</span>
                                                    <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase">New</span>
                                                </Link>
                                                <Link to="/profile?tab=listings" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted font-bold transition-colors text-primary rounded-lg">
                                                    📌 Мои объявления
                                                </Link>
                                                <Link to="/chat" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted transition-colors text-foreground rounded-lg">
                                                    💬 Сообщения
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-2 mt-1 border-t border-border">
                                        <Link to="/profile?tab=profile" className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted transition-colors text-foreground rounded-lg mb-1">
                                            🛠️ Настройки
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-red-600 font-bold hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            🚪 {t('common.logout')}
                                        </button>
                                    </div>
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

                        {/* Cart has been removed per user request */}
                        
                        {/* Mobile Theme Toggle & Search Toggle */}
                        <div className="flex items-center md:hidden">
                            <button
                                onClick={() => setShowMobileSearch(!showMobileSearch)}
                                className="p-2 mr-1 rounded-lg bg-muted/50 text-foreground"
                                aria-label="Поиск"
                            >
                                <Search size={20} />
                            </button>
                            <button
                                onClick={toggleTheme}
                                className="p-2 mr-1 rounded-lg bg-muted/50 text-foreground"
                                aria-label="Переключить тему"
                            >
                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar Expandable */}
                <AnimatePresence>
                    {showMobileSearch && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden border-t border-border overflow-hidden bg-background"
                        >
                            <form onSubmit={handleSearch} className="p-4">
                                <div className="relative w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder={t('common.search_placeholder')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-11 pl-10 pr-12 rounded-xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={startRecording}
                                        className={cn(
                                            "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all",
                                            isListening ? "text-red-500 bg-red-500/10 animate-pulse" : "text-muted-foreground hover:text-primary"
                                        )}
                                    >
                                        <Mic size={18} />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <CategoryModal isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
        </>
    );
}
