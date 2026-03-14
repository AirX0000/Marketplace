import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useShop } from '../context/ShopContext';

export function BottomNav() {
    const location = useLocation();
    const { isAuthenticated, isBuyer } = useShop();

    const tabs = [
        { id: 'home', path: '/', icon: Home, label: 'Главная' },
        { id: 'catalog', path: '/catalog', icon: LayoutGrid, label: 'Каталог' },
        { id: 'post-ad', path: '/post-ad', icon: Plus, label: 'Разместить', primary: true },
        { id: 'favorites', path: '/favorites', icon: Heart, label: 'Избранное' },
        { id: 'profile', path: isAuthenticated ? '/profile' : '/login', icon: User, label: 'Профиль' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-background/80 backdrop-blur-lg border-t border-border px-4 py-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center max-w-md mx-auto h-12">
                {tabs.map((tab) => {
                    const active = location.pathname === tab.path;
                    return (
                        <Link
                            key={tab.id}
                            to={tab.path}
                            className={cn(
                                "relative flex flex-col items-center justify-center flex-1 transition-all duration-300",
                                active ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground",
                                tab.primary ? "scale-125 -translate-y-2" : ""
                            )}
                        >
                            {tab.primary ? (
                                <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-transform">
                                    <tab.icon className="h-6 w-6" />
                                </div>
                            ) : (
                                <tab.icon className={cn("h-6 w-6", active ? "fill-primary/10" : "")} />
                            )}
                            <span className={cn(
                                "text-[10px] font-bold mt-1 uppercase tracking-tighter",
                                tab.primary ? "mt-2 text-primary" : ""
                            )}>
                                {tab.label}
                            </span>
                            {active && !tab.primary && (
                                <motion.div
                                    layoutId="bottom-nav-indicator"
                                    className="absolute -top-1 w-1 h-1 rounded-full bg-primary"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
