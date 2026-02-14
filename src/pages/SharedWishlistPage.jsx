import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { MarketplaceCard } from '../components/MarketplaceCard';
import { Heart, User, Lock } from 'lucide-react';

export function SharedWishlistPage() {
    const { userId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.getSharedWishlist(userId)
            .then(setData)
            .catch(err => {
                setError("Этот список желаний скрыт или не существует.");
            })
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) return <div className="p-10 text-center">Загрузка...</div>;

    if (error) {
        return (
            <div className="container py-20 text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 bg-slate-100 rounded-full mb-4">
                    <Lock className="h-8 w-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Доступ запрещен</h2>
                <p className="text-slate-500">{error}</p>
                <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">Вернуться на главную</Link>
            </div>
        );
    }

    const { user, favorites } = data;

    return (
        <div className="container py-8 px-4 md:px-6">
            <div className="flex items-center gap-4 mb-8 pb-8 border-b">
                <div className="h-16 w-16 rounded-full bg-slate-200 overflow-hidden">
                    {user.avatar ? (
                        <img src={user.avatar} className="w-full h-full object-cover" />
                    ) : (
                        <User className="h-full w-full p-4 text-slate-400" />
                    )}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Список желаний: {user.name}</h1>
                    <p className="text-slate-500 flex items-center gap-1">
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        {favorites.length} товаров
                    </p>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {favorites.map((item) => (
                    <MarketplaceCard key={item.id} marketplace={item} hideLikeButton />
                ))}
            </div>
        </div>
    );
}
