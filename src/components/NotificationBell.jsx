import React, { useState, useRef, useEffect } from 'react';
import { Bell, MessageSquare, TrendingDown, CheckCheck, X, ExternalLink } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../lib/utils';

function timeAgo(dateStr) {
    try {
        const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
        if (diff < 60) return 'только что';
        if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
        return `${Math.floor(diff / 86400)} дн назад`;
    } catch { return 'только что'; }
}

function NotifIcon({ type }) {
    if (type === 'message') return <MessageSquare size={14} className="text-blue-500" />;
    if (type === 'price') return <TrendingDown size={14} className="text-emerald-500" />;
    return <Bell size={14} className="text-violet-500" />;
}

export function NotificationBell() {
    const { notifications, unreadCount, markAllRead, markRead, dismiss } = useNotifications();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function click(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', click);
        return () => document.removeEventListener('mousedown', click);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => { setOpen(o => !o); }}
                aria-label="Уведомления"
                className="relative p-2 rounded-lg hover:bg-muted transition-colors group"
            >
                <Bell className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-background animate-in zoom-in">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute top-12 right-0 w-[360px] max-h-[480px] flex flex-col bg-card border border-border shadow-2xl rounded-2xl overflow-hidden z-[200] animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
                        <div className="flex items-center gap-2">
                            <Bell size={16} className="text-primary" />
                            <span className="font-bold text-sm text-foreground">Уведомления</span>
                            {unreadCount > 0 && (
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                                    {unreadCount} новых
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                                <CheckCheck size={13} />
                                Прочитать все
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Bell size={40} className="mb-3 opacity-20" />
                                <p className="text-sm font-medium">Нет уведомлений</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 transition-colors group/item cursor-pointer ${!n.read ? 'bg-primary/3' : 'hover:bg-muted/40'}`}
                                    onClick={() => markRead(n.id)}
                                >
                                    {/* Icon */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${!n.read ? 'bg-primary/10' : 'bg-muted'}`}>
                                        {n.avatar ? (
                                            <img src={getImageUrl(n.avatar)} alt="" className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <NotifIcon type={n.type} />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm leading-tight ${!n.read ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
                                            {n.title}
                                        </p>
                                        {n.body && (
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                                        )}
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {timeAgo(n.createdAt)}
                                        </p>
                                    </div>

                                    <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0">
                                        {n.link && (
                                            <Link to={n.link} onClick={() => setOpen(false)} className="p-1 hover:bg-muted rounded">
                                                <ExternalLink size={12} className="text-muted-foreground" />
                                            </Link>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); dismiss(n.id); }} className="p-1 hover:bg-muted rounded">
                                            <X size={12} className="text-muted-foreground" />
                                        </button>
                                    </div>

                                    {!n.read && (
                                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
