import React, { useEffect, useState } from 'react';
import { MarketplaceCard } from '../components/MarketplaceCard';
import { api } from '../lib/api';
import { useShop } from '../context/ShopContext';
import { Share2, Lock, Unlock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function FavoritesPage() {
    const [favoritesList, setFavoritesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const { favorites } = useShop(); // Just use the IDs to trigger re-fetch if needed or handled internally

    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const [favData, userData] = await Promise.all([
                    api.getFavorites(),
                    api.getProfile()
                ]);
                setFavoritesList(favData);
                setUserProfile(userData);
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [favorites]); // Reload when favorites ID list changes

    const togglePrivacy = async () => {
        try {
            const updated = await api.toggleWishlistPrivacy();
            setUserProfile(prev => ({ ...prev, isWishlistPublic: updated.isWishlistPublic }));
            toast.success(updated.isWishlistPublic ? "Список желаний теперь публичный" : "Список желаний скрыт");
        } catch (error) {
            toast.error("Ошибка обновления настроек");
        }
    };

    const copyShareLink = () => {
        const url = `${window.location.origin}/wishlist/${userProfile.id}`;
        navigator.clipboard.writeText(url);
        toast.success("Ссылка скопирована!");
    };

    return (
        <div className="container py-8 px-4 md:px-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Мое Избранное</h1>

                {userProfile && (
                    <div className="flex gap-2">
                        <button
                            onClick={togglePrivacy}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${userProfile.isWishlistPublic
                                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {userProfile.isWishlistPublic ? <Unlock size={16} /> : <Lock size={16} />}
                            {userProfile.isWishlistPublic ? 'Публичный' : 'Приватный'}
                        </button>

                        {userProfile.isWishlistPublic && (
                            <button
                                onClick={copyShareLink}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                            >
                                <Share2 size={16} />
                                Поделиться
                            </button>
                        )}
                    </div>
                )}
            </div>

            {loading ? (
                <div>Загрузка...</div>
            ) : favoritesList.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {favoritesList.map((item) => (
                        <MarketplaceCard key={item.id} marketplace={item} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-slate-500">
                    Вы еще не добавили товары в избранное.
                </div>
            )}
        </div>
    );
}
