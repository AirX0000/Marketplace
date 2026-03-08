import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useShop } from '../context/ShopContext';
import { Star, Send, Trash2, User as UserIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function ReviewSection({ marketplaceId }) {
    const { user } = useShop();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadReviews();
    }, [marketplaceId]);

    const loadReviews = async () => {
        try {
            const data = await api.getMarketplaceReviews(marketplaceId);
            setReviews(data);
        } catch (error) {
            console.error("Failed to load reviews", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("Пожалуйста, войдите, чтобы оставить отзыв");
            return;
        }

        setSubmitting(true);
        try {
            const newReview = await api.createReview(marketplaceId, { rating, comment });
            setReviews([newReview, ...reviews]);
            setComment('');
            setRating(5);
            toast.success("Отзыв отправлен!");
        } catch (error) {
            toast.error("Не удалось отправить отзыв");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm("Удалить отзыв?")) return;
        try {
            await api.deleteReview(reviewId);
            setReviews(reviews.filter(r => r.id !== reviewId));
            toast.success("Отзыв удален");
        } catch (error) {
            toast.error("Не удалось удалить отзыв");
        }
    };

    if (loading) return <div className="animate-pulse h-20 bg-slate-100 rounded-xl" />;

    return (
        <div className="mt-12 space-y-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                Отзывы и оценки <span className="text-slate-400 font-normal">({reviews.length})</span>
            </h2>

            {/* Review Form */}
            {user && (
                <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`transition-colors ${star <= rating ? 'text-yellow-400' : 'text-slate-200'}`}
                                >
                                    <Star className="w-6 h-6 fill-current" />
                                </button>
                            ))}
                        </div>
                        <span className="text-sm font-medium text-slate-500">Ваша оценка</span>
                    </div>
                    <div className="relative">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Напишите ваш отзыв..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900"
                            required
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="absolute bottom-4 right-4 bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                            {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                </form>
            )}

            {/* List */}
            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed">
                        Пока нет отзывов. Будьте первым!
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="flex gap-4 p-6 bg-white border rounded-2xl shadow-sm">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 shrink-0">
                                {review.user?.avatar ? (
                                    <img src={review.user.avatar} alt={`Avatar of ${review.user?.name || 'user'}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <UserIcon className="w-6 h-6" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-bold text-slate-900">{review.user?.name || 'Пользователь'}</div>
                                        <div className="flex items-center gap-0.5 mt-0.5">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-yellow-400 fill-current' : 'text-slate-100'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                        {user && user.id === review.userId && (
                                            <button onClick={() => handleDelete(review.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
