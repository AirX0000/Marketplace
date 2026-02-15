import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ArrowRight, Store, Calendar, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { api } from '../lib/api';

export function CartPage() {
    const { cartItems, updateQuantity, removeFromCart, cartTotal } = useShop();
    const navigate = useNavigate();
    const [settings, setSettings] = React.useState({ enable_discount: 'false', discount_percent: '0', enable_installments: 'false', installment_months: '3,6,12' });
    const [viewMode, setViewMode] = useState('FULL'); // 'FULL' or 'INSTALLMENT'

    React.useEffect(() => {
        api.getSettings().then(setSettings).catch(console.error);
    }, []);

    const discountAmount = settings.enable_discount === 'true'
        ? Math.round(cartTotal * (parseFloat(settings.discount_percent) / 100))
        : 0;

    const finalTotal = cartTotal - discountAmount;

    // Installment Calculation for Preview
    const months = 6; // Default preview
    const monthlyTotal = Math.ceil(finalTotal / months);

    return (
        <div className="container py-8 px-4 md:px-6">
            <h1 className="text-2xl font-bold mb-6">Корзина ({cartItems.length})</h1>

            {cartItems.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-muted-foreground mb-4">Ваша корзина пуста.</p>
                    <Link to="/marketplaces" className="text-primary hover:underline">Перейти в каталог</Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Cart Items List */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex justify-end mb-2">
                            {settings.enable_installments === 'true' && (
                                <div className="bg-slate-100 p-1 rounded-lg inline-flex items-center">
                                    <button
                                        onClick={() => setViewMode('FULL')}
                                        className={`px-3 py-1 text-sm rounded-md transition-all font-medium ${viewMode === 'FULL' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
                                    >
                                        Полная оплата
                                    </button>
                                    <button
                                        onClick={() => setViewMode('INSTALLMENT')}
                                        className={`px-3 py-1 text-sm rounded-md transition-all font-medium ${viewMode === 'INSTALLMENT' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
                                    >
                                        Рассрочка
                                    </button>
                                </div>
                            )}
                        </div>

                        {cartItems.map((item) => (
                            <div key={item.id} className="flex gap-4 p-4 rounded-xl border bg-card relative group">
                                <div className="h-24 w-24 flex-none rounded-md bg-muted overflow-hidden">
                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between w-full pr-8">
                                            <h3 className="font-medium text-foreground">{item.name}</h3>
                                        </div>
                                        <div className="text-sm text-slate-600 flex items-center gap-1 mt-1 font-medium">
                                            <Store className="h-3 w-3" />
                                            {item.owner?.storeName || 'autohouse'}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center border rounded-md">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-muted"><Minus className="h-4 w-4" /></button>
                                            <span className="px-3 text-sm font-medium">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-muted"><Plus className="h-4 w-4" /></button>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">
                                                {viewMode === 'FULL' ? (
                                                    <span>{(item.price * item.quantity).toLocaleString()} So'm</span>
                                                ) : (
                                                    <span className="text-emerald-600">
                                                        {(Math.ceil((item.price * item.quantity) / months)).toLocaleString()} So'm <span className="text-xs text-slate-500 font-bold">x {months} мес</span>
                                                    </span>
                                                )}
                                            </div>
                                            {item.quantity > 1 && viewMode === 'FULL' && (
                                                <div className="text-xs text-slate-500 font-medium">{item.price.toLocaleString()} / шт</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive p-1">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Summary Sidebar */}
                    <div className="md:col-span-1">
                        <div className="rounded-xl border bg-card p-6 sticky top-24 shadow-sm">
                            <h3 className="font-semibold text-lg mb-4">Ваш заказ</h3>
                            <div className="space-y-3 mb-6 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Товары ({cartItems.length})</span>
                                    <span className="font-medium text-slate-900">{cartTotal.toLocaleString()} So'm</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Скидка ({settings.discount_percent}%)</span>
                                        <span>-{discountAmount.toLocaleString()} So'm</span>
                                    </div>
                                )}

                                <div className="border-t pt-3 mt-3">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-lg text-slate-800">Итого</span>
                                        <div className="text-right">
                                            <div className="font-bold text-xl text-slate-900">{finalTotal.toLocaleString()} So'm</div>
                                            {viewMode === 'INSTALLMENT' && (
                                                <div className="text-sm text-emerald-600 font-medium">
                                                    или {monthlyTotal.toLocaleString()} So'm / мес
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full h-12 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-opacity shadow-lg shadow-blue-600/20"
                            >
                                Оформить заказ <ArrowRight className="ml-2 h-4 w-4" />
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-4 text-slate-400 opacity-70">
                                <CreditCard className="h-6 w-6" />
                                <div className="flex gap-1">
                                    <div className="h-6 w-8 bg-gray-200 rounded"></div>
                                    <div className="h-6 w-8 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
