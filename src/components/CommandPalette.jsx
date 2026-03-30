import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Command, Car, Home, MessageSquare, 
    User, Settings, Moon, Sun, Globe, Sparkles, 
    ArrowRight, X, LayoutGrid, Heart
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useShop } from '../context/ShopContext';
import { cn } from '../lib/utils';

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { isAuthenticated, isBuyer, isPartner, isAdmin, user } = useShop();

    const actions = [
        { id: 'catalog', name: 'Каталог товаров', icon: LayoutGrid, path: '/marketplaces', shortcut: 'C' },
        { id: 'cars', name: 'Автомобили', icon: Car, path: '/marketplaces?category=Transport', shortcut: 'A' },
        { id: 'homes', name: 'Недвижимость', icon: Home, path: '/marketplaces?category=Real Estate', shortcut: 'R' },
        { id: 'chat', name: 'Сообщения', icon: MessageSquare, path: '/chat', shortcut: 'M' },
        { id: 'favorites', name: 'Избранное', icon: Heart, path: '/favorites', shortcut: 'F' },
        { id: 'profile', name: 'Личный кабинет', icon: User, path: '/profile', shortcut: 'P' },
        { id: 'theme', name: 'Сменить тему', icon: theme === 'dark' ? Sun : Moon, action: toggleTheme, shortcut: 'T' },
    ];

    if (isPartner() || isAdmin()) {
        actions.unshift({ id: 'admin', name: 'Панель управления', icon: Settings, path: '/admin', shortcut: 'D' });
    }

    const filteredActions = actions.filter(a => 
        a.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleKeyDown = useCallback((e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsOpen(prev => !prev);
        }
        
        if (!isOpen) return;

        if (e.key === 'Escape') setIsOpen(false);
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % (filteredActions.length || 1));
        }
        
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredActions.length) % (filteredActions.length || 1));
        }
        
        if (e.key === 'Enter' && filteredActions[selectedIndex]) {
            e.preventDefault();
            runAction(filteredActions[selectedIndex]);
        }
    }, [isOpen, filteredActions, selectedIndex]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const runAction = (action) => {
        if (action.path) navigate(action.path);
        if (action.action) action.action();
        setIsOpen(false);
        setSearch('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-[#0a0a0f]/80 backdrop-blur-xl"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-2xl bg-[#191624] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-white/5 relative">
                            <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input 
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-[#13111C] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-lg text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-purple-600/30 transition-all font-bold uppercase tracking-tight"
                                placeholder="Что вы ищете? (Введите 'A' для авто, 'R' для недвижимости...)"
                            />
                            <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] text-slate-400 font-bold uppercase">ESC</kbd>
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2 scrollbar-none">
                            {filteredActions.length > 0 ? (
                                filteredActions.map((action, idx) => (
                                    <button
                                        key={action.id}
                                        onClick={() => runAction(action)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                                            selectedIndex === idx ? "bg-white/5 ring-1 ring-white/10" : "hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                                <action.icon size={22} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-black text-white uppercase tracking-wider">{action.name}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Перейти в раздел</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {action.shortcut && (
                                                <kbd className="hidden sm:flex px-2 py-1 bg-black/40 border border-white/5 rounded-lg text-[10px] font-black text-slate-400 uppercase">{action.shortcut}</kbd>
                                            )}
                                            <ArrowRight size={16} className="text-slate-700 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="py-20 text-center">
                                    <Sparkles className="mx-auto text-slate-700 mb-4" size={40} />
                                    <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Ничего не найдено</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-[#13111C]/50 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[9px] text-slate-400">↵</kbd>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Выбрать</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[9px] text-slate-400">↑↓</kbd>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Навигация</span>
                                </div>
                            </div>
                            <div className="text-[9px] font-black text-slate-600 uppercase italic tracking-tighter">Autohouse Command Center v1.0</div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
