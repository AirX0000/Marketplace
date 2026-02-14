import React, { useState, useEffect } from 'react';
import { Star, User, Image as ImageIcon, ThumbsUp, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

export function ReviewSection({ marketplaceId, isAuthenticated, currentUser }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        loadReviews();
    }, [marketplaceId]);

    const loadReviews = async () => {
        try {
            const data = await api.getReviews(marketplaceId);
            setReviews(data);
        } catch (error) {
            console.error("Failed to load reviews", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) return;

        setSubmitting(true);
        try {
            const newReview = await api.createReview({
                marketplaceId,
                rating,
                comment
            });
            setReviews([newReview, ...reviews]);
            setComment('');
            setRating(5);
            toast.success("Отзыв опубликован!");
        } catch (error) {
            toast.error("Ошибка публикации отзыва");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                Отзывы <span className="text-slate-400 text-lg font-normal">({reviews.length})</span>
            </h2>

            {/* Write Review Form */}
            {isAuthenticated ? (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h3 className="font-bold text-lg mb-4">Написать отзыв</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        className={`h-8 w-8 ${star <= (hoverRating || rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-slate-300'
                                            }`}
                                    />
                                </button>
                            ))}
                            <span className="ml-3 text-sm font-medium text-slate-500">
                                {rating === 5 ? 'Отлично!' : rating === 4 ? 'Хорошо' : rating === 3 ? 'Нормально' : 'Плохо'}
                            </span>
                        </div>

                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Расскажите о своих впечатлениях..."
                            rows="3"
                            className="w-full rounded-xl border border-slate-200 p-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                            required
                        />

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Публикация...' : 'Оставить отзыв'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-center">
                    <p>Войдите, чтобы оставить отзыв</p>
                </div>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="text-center py-12 text-slate-400">Загрузка отзывов...</div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                        <Star className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">Пока нет отзывов. Станьте первым!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="border-b last:border-0 pb-6">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                                        {review.user?.avatar ? (
                                            <img src={review.user.avatar} alt={review.user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <User size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 flex items-center gap-2">
                                            {review.user?.name || "Пользователь"}
                                            {review.isVerified && (
                                                <span className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                    <CheckCircle2 size={10} /> Купил
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-0.5 mt-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                                                />
                                            ))}
                                            <span className="text-xs text-slate-400 ml-2">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-slate-700 leading-relaxed">{review.comment}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
