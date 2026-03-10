import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

const ShopContext = createContext();

export function useShop() {
    return useContext(ShopContext);
}

export function ShopProvider({ children }) {
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });

    const [favorites, setFavorites] = useState([]); // Array of IDs
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [user, setUser] = useState(null);

    // Persist cart
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Load user and favorites on auth change
    useEffect(() => {
        if (isAuthenticated) {
            loadUser();
            loadFavorites();
        } else {
            setUser(null);
            setFavorites([]);
        }
    }, [isAuthenticated]);

    const loadUser = async () => {
        try {
            const userData = await api.getUserProfile();
            setUser(userData);
        } catch (e) {
            console.error("Failed to load user", e);
            // If token is invalid, logout
            if (e.message?.includes('401') || e.message?.includes('Unauthorized')) {
                logout();
            }
        }
    };

    const loadFavorites = async () => {
        try {
            const favs = await api.getFavorites();
            setFavorites(favs.map(f => f.id));
        } catch (e) {
            console.error("Failed to load favorites", e);
        }
    };

    const addToCart = (marketplace) => {
        if (!isAuthenticated) {
            toast.error("Чтобы добавить товар в корзину, пожалуйста, войдите или зарегистрируйтесь", {
                duration: 4000,
                position: 'top-center',
                style: {
                    background: '#333',
                    color: '#fff',
                },
                icon: '🔒',
            });
            return;
        }

        // STOCK VALIDATION: Check if product is available
        if (!marketplace.isAvailable) {
            toast.error("Этот товар недоступен для заказа", {
                duration: 3000,
                icon: '❌',
            });
            return;
        }

        // STOCK VALIDATION: Check if product is in stock
        if (marketplace.stock === 0) {
            toast.error("Товар закончился", {
                duration: 3000,
                icon: '⚠️',
            });
            return;
        }

        setCartItems(prev => {
            const existing = prev.find(item => item.id === marketplace.id);
            if (existing) {
                // STOCK VALIDATION: Check if we can add more
                if (existing.quantity >= marketplace.stock) {
                    toast.error(`Максимальное количество: ${marketplace.stock} шт.`, {
                        duration: 3000,
                        icon: '⚠️',
                    });
                    return prev;
                }
                toast.success("Количество обновлено", { duration: 2000 });
                return prev.map(item =>
                    item.id === marketplace.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            const price = marketplace.price || 4999000;
            toast.success("Товар добавлен в корзину", { duration: 2000, icon: '🛒' });
            return [...prev, { ...marketplace, quantity: 1, price }];
        });
    };

    const removeFromCart = (id) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id, quantity) => {
        if (quantity < 1) return;

        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                // STOCK VALIDATION: Check if requested quantity exceeds stock
                if (item.stock && quantity > item.stock) {
                    toast.error(`Максимальное количество: ${item.stock} шт.`, {
                        duration: 3000,
                        icon: '⚠️',
                    });
                    return item; // Don't update
                }
                return { ...item, quantity };
            }
            return item;
        }));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const toggleFavorite = async (marketplace) => {
        if (!isAuthenticated) {
            toast.error("Чтобы добавить в избранное, пожалуйста, войдите или зарегистрируйтесь", {
                duration: 4000,
                position: 'top-center',
                style: {
                    background: '#333',
                    color: '#fff',
                },
                icon: '❤️',
            });
            return;
        }

        const id = marketplace.id;
        const isFav = favorites.includes(id);

        // Optimistic Update
        setFavorites(prev => isFav ? prev.filter(favId => favId !== id) : [...prev, id]);

        try {
            if (isFav) {
                await api.removeFavorite(id);
            } else {
                await api.addFavorite(id);
            }
        } catch (e) {
            console.error("Failed to toggle favorite", e);
            // Revert on failure
            setFavorites(prev => isFav ? [...prev, id] : prev.filter(favId => favId !== id));
            toast.error("Не удалось обновить избранное");
        }
    };

    const isFavorite = (id) => {
        return favorites.includes(id);
    };

    const checkAuth = () => {
        setIsAuthenticated(!!localStorage.getItem('token'));
    };

    // Auth methods
    const login = (token, userData) => {
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        setCartItems([]);
        setFavorites([]);
    };

    // Role helpers
    const getUserRole = () => user?.role || null;
    const isBuyer = () => getUserRole() === 'USER';
    const isPartner = () => getUserRole() === 'PARTNER';
    const isAdmin = () => getUserRole() === 'ADMIN' || getUserRole() === 'SUPER_ADMIN';

    const getDefaultRoute = () => {
        if (!isAuthenticated || !user) return '/';
        switch (user.role) {
            case 'PARTNER':
                return '/partner';
            case 'ADMIN':
            case 'SUPER_ADMIN':
                return '/admin';
            case 'USER':
            default:
                return '/profile';
        }
    };

    const canAccess = (route) => {
        if (!isAuthenticated) return false;
        if (route.startsWith('/partner')) return isPartner() || isAdmin();
        if (route.startsWith('/admin')) return isAdmin();
        return true;
    };

    return (
        <ShopContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
            cartTotal: cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
            favorites,
            toggleFavorite,
            isFavorite,
            checkAuth,
            isAuthenticated,
            user,
            login,
            logout,
            loadUser,
            // Role helpers
            getUserRole,
            isBuyer,
            isPartner,
            isAdmin,
            getDefaultRoute,
            canAccess
        }}>
            {children}
        </ShopContext.Provider>
    );
}
