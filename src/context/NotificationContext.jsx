import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useShop } from './ShopContext';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const { user, isAuthenticated } = useShop();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);

    // Connect when user is authenticated
    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        const token = localStorage.getItem('token');
        const s = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnectionDelay: 1000,
        });

        s.on('connect', () => {
            console.log('[Notifications] Socket connected');
        });

        s.on('notification', (notification) => {
            setNotifications(prev => [{ ...notification, read: false, id: Date.now() + Math.random() }, ...prev].slice(0, 50));
            setUnreadCount(c => c + 1);
        });

        s.on('new_message', (msg) => {
            if (msg.senderId !== user?.id) {
                const notif = {
                    id: Date.now() + Math.random(),
                    type: 'message',
                    title: `Новое сообщение от ${msg.senderName || 'пользователя'}`,
                    body: msg.content?.substring(0, 80) || 'Фото/вложение',
                    read: false,
                    createdAt: new Date().toISOString(),
                    link: '/chat',
                    avatar: msg.senderAvatar,
                };
                setNotifications(prev => [notif, ...prev].slice(0, 50));
                setUnreadCount(c => c + 1);
            }
        });

        s.on('price_drop', (data) => {
            const notif = {
                id: Date.now() + Math.random(),
                type: 'price',
                title: '💰 Снижение цены',
                body: `${data.name} теперь стоит ${data.newPrice?.toLocaleString()} сум`,
                read: false,
                createdAt: new Date().toISOString(),
                link: `/listings/${data.listingId}`,
            };
            setNotifications(prev => [notif, ...prev].slice(0, 50));
            setUnreadCount(c => c + 1);
        });

        setSocket(s);
        return () => {
            s.disconnect();
        };
    }, [isAuthenticated, user?.id]);

    const markAllRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    }, []);

    const markRead = useCallback((id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(c => Math.max(0, c - 1));
    }, []);

    const dismiss = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        setUnreadCount(c => Math.max(0, c - 1));
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, markRead, dismiss, socket }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
    return ctx;
}
