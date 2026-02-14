import React, { useState } from 'react';
import { X, Check, ShoppingCart, Heart, Scale } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useCompare } from '../context/CompareContext';
import { Link } from 'react-router-dom';

export function QuickViewModal({ product, onClose }) {
    const { toggleFavorite, isFavorite, addToCart } = useShop();
    const { addToCompare, compareItems, removeFromCompare } = useCompare();
    const [currentImage, setCurrentImage] = useState(0);
    const [isAdded, setIsAdded] = useState(false);

    if (!product) return null;

    const images = product.images ? JSON.parse(product.images) : [product.image];
    const isFav = isFavorite(product.id);
    const isInCompare = compareItems.some(i => i.id === product.id);

    const handleAddToCart = () => {
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-auto">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-slate-700/80 rounded-full hover:bg-white dark:hover:bg-slate-600 transition-colors"
                >
                    <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>

                {/* Gallery */}
                <div className="w-full md:w-1/2 bg-slate-100 dark:bg-slate-900 relative flex flex-col justify-center p-4">
                    <div className="aspect-[4/3] relative rounded-lg overflow-hidden mb-4">
                        <img
                            src={images[currentImage] || product.image}
                            alt={product.name}
                            className="w-full h-full object-contain"
                        />
                    </div>
                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImage(idx)}
                                    className={`w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0 transition-all ${currentImage === idx
                                        ? 'border-primary ring-2 ring-primary/20'
                                        : 'border-transparent opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto">
                    <div className="mb-1">
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-primary/10 text-primary dark:text-white dark:border-white/20 dark:bg-white/10 mb-3">
                            {product.region}
                        </span>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            {product.name}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <span>ID: {product.id}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span>{product.category}</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="text-3xl font-bold text-primary mb-1">
                            {(Math.round((product.price || 0) * (1 - (product.discount || 0) / 100))).toLocaleString()} So'm
                        </div>
                        {product.discount > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="line-through text-slate-400">{(product.price).toLocaleString()} So'm</span>
                                <span className="text-red-500 font-bold">-{product.discount}%</span>
                            </div>
                        )}
                    </div>

                    <div className="prose prose-sm dark:prose-invert mb-8 text-slate-600 dark:text-slate-300">
                        <p>{product.description}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-700 pt-6 mt-auto">
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdded}
                            className={`flex-1 flex items-center justify-center h-11 rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-xl ${isAdded
                                ? 'bg-emerald-500 text-white'
                                : 'bg-primary text-secondary-foreground hover:bg-primary/90'
                                }`}
                        >
                            {isAdded ? (
                                <>
                                    <Check className="mr-2 h-5 w-5" />
                                    В корзине
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                    В корзину
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => toggleFavorite(product)}
                            className={`p-3 rounded-lg border transition-all ${isFav
                                ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-500/10'
                                : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                                }`}
                            title="В избранное"
                        >
                            <Heart className={`h-5 w-5 ${isFav ? 'fill-current' : ''}`} />
                        </button>

                        <button
                            onClick={() => isInCompare ? removeFromCompare(product.id) : addToCompare(product)}
                            className={`p-3 rounded-lg border transition-all ${isInCompare
                                ? 'border-emerald-500 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                                : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                                }`}
                            title="Сравнить"
                        >
                            <Scale className="h-5 w-5" />
                        </button>
                    </div>

                    <Link
                        to={`/marketplaces/${product.id}`}
                        className="block text-center text-sm text-primary hover:underline mt-4"
                        onClick={onClose}
                    >
                        Показать полное описание
                    </Link>
                </div>
            </div>

            {/* Backdrop close handler */}
            <div className="absolute inset-0 -z-10" onClick={onClose}></div>
        </div>
    );
}
