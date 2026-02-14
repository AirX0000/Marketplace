import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema } from '../lib/schemas';
import { CreditCard, Calendar, Check, ShieldCheck, ArrowRight, Truck, MapPin, User, Mail, Phone, Store, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { EscrowInfo } from '../components/checkout/EscrowInfo';
import { cn } from '../lib/utils';
import { useShop } from '../context/ShopContext';
import CheckoutMap from '../components/CheckoutMap';
import toast from 'react-hot-toast';

const STEPS = [
    { id: 1, title: 'Контакты' },
    { id: 2, title: 'Доставка' },
    { id: 3, title: 'Оплата' },
    { id: 4, title: 'Подтверждение' }
];

export function CheckoutPage() {
    const { cartItems, cartTotal, clearCart } = useShop();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [centers, setCenters] = useState([]);
    const [settings, setSettings] = useState({});

    // Derived state for Shipping Cost logic (kept separate as it relies on complex map logic)
    const [shippingDistance, setShippingDistance] = useState(0);
    const [shippingCost, setShippingCost] = useState(25000);

    const { register, control, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            contactName: '',
            contactPhone: '+998',
            contactEmail: '',
            shippingMethod: 'COURIER',
            shippingCity: 'Tashkent',
            shippingAddress: '',
            paymentMethod: 'FULL',
            paymentProvider: 'CLICK',
            installmentMonths: 6,
            cardDetails: { number: '', expiry: '', name: '' }
        }
    });

    const formValues = watch(); // Watch all values for UI updates

    useEffect(() => {
        api.getCenters().then(setCenters).catch(console.error);
    }, []);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const getNearestCenterDistance = (lat, lng) => {
        if (!centers || centers.length === 0) {
            return calculateDistance(41.2995, 69.2401, lat, lng);
        }
        let minDist = Infinity;
        centers.forEach(center => {
            const dist = calculateDistance(center.lat, center.lng, lat, lng);
            if (dist < minDist) minDist = dist;
        });
        return minDist;
    };

    // Calculate Shipping Cost
    useEffect(() => {
        const method = formValues.shippingMethod;
        const coords = formValues.shippingLocation;

        if (method === 'PICKUP') {
            setShippingCost(0);
            setShippingDistance(0);
            return;
        }

        if (coords) {
            const dist = getNearestCenterDistance(coords.lat, coords.lng);
            // Pricing: Base 15,000 + 2,000 per km
            const cost = 15000 + (Math.ceil(dist) * 2000);
            setShippingDistance(dist.toFixed(1));
            setShippingCost(cost);
        } else {
            setShippingCost(25000); // Default flat rate
            setShippingDistance(0);
        }
    }, [formValues.shippingLocation, formValues.shippingMethod, centers]);

    // Fetch Data & Profile
    useEffect(() => {
        api.getSettings().then(setSettings).catch(console.error);
        api.getProfile().then(user => {
            if (user) {
                setValue('contactName', user.name || '');
                setValue('contactPhone', user.phone || '+998');
                setValue('contactEmail', user.email || '');
                setSettings(prev => ({ ...prev, userBalance: user.balance || 0 }));
            }
        }).catch(() => { });
    }, [setValue]);

    // Derived Financials
    const discountAmount = settings.enable_discount === 'true'
        ? Math.round(cartTotal * (parseFloat(settings.discount_percent || 0) / 100))
        : 0;

    const subtotal = cartTotal;
    const total = subtotal - discountAmount + shippingCost;
    const interest = parseFloat(settings.interest_rate || 0) / 100;
    const totalWithInterest = Math.ceil(total * (1 + interest));
    const monthlyPrice = Math.ceil(totalWithInterest / (formValues.installmentMonths || 6));

    const calculateSchedule = (total, months) => {
        const monthly = Math.ceil(total / months);
        const schedule = [];
        const today = new Date();
        for (let i = 0; i < months; i++) {
            const date = new Date(today);
            date.setMonth(today.getMonth() + i);
            schedule.push({
                date: date.toISOString(),
                amount: monthly,
                status: i === 0 ? 'PENDING' : 'SCHEDULED'
            });
        }
        return schedule;
    };

    const paymentSchedule = calculateSchedule(totalWithInterest, formValues.installmentMonths || 6);

    const handleNext = async () => {
        let valid = false;
        if (step === 1) {
            valid = await trigger(['contactName', 'contactPhone', 'contactEmail']);
        } else if (step === 2) {
            valid = await trigger(['shippingMethod', 'shippingCity', 'shippingAddress', 'pickupCenterId']);
        } else if (step === 3) {
            // Payment validation is mostly implicit/default, but check logic
            valid = await trigger(['paymentMethod', 'installmentMonths']);
            // Custom check if FULL + Card? No, Zod handles optionality.
        }

        if (valid || step === 3) { // Force step 3 -> 4 transition without strict validation if Zod passes
            if (step < 4) setStep(step + 1);
        }
    };

    const onPlaceOrder = async (data) => {
        setLoading(true);
        try {
            const isDepositRequired = cartItems.some(i => ['Apartments', 'Houses', 'Commercial', 'Land', 'Cars', 'Transport'].includes(i.category));
            const effectivePaymentMethod = isDepositRequired ? 'DEPOSIT' : data.paymentMethod;

            if (isDepositRequired && (settings.userBalance || 0) < 100000) {
                toast.error("Недостаточно средств для залога. Пополните баланс.");
                setLoading(false);
                return;
            }

            const finalTotal = effectivePaymentMethod === 'FULL' ? total : (effectivePaymentMethod === 'DEPOSIT' ? 100000 : totalWithInterest);

            const response = await api.createOrder({
                items: cartItems.map(item => ({ marketplaceId: item.id, quantity: item.quantity, price: item.price })),
                total: finalTotal,
                paymentMethod: effectivePaymentMethod,
                paymentProvider: effectivePaymentMethod === 'FULL' ? data.paymentProvider : null,
                installmentPlan: effectivePaymentMethod === 'INSTALLMENT' ? `${data.installmentMonths}_MONTHS` : null,
                paymentDetails: {
                    cardLast4: data.cardDetails?.number?.slice(-4) || '0000',
                    schedule: effectivePaymentMethod === 'INSTALLMENT' ? paymentSchedule : null
                },
                contactName: data.contactName,
                contactPhone: data.contactPhone,
                contactEmail: data.contactEmail,
                shippingAddress: data.shippingMethod === 'COURIER' ? data.shippingAddress : (centers.find(c => c.id === data.pickupCenterId)?.address || 'Pickup'),
                shippingCity: data.shippingCity,
                shippingMethod: data.shippingMethod,
                shippingLocation: data.shippingLocation,
                shippingCost: shippingCost
            });

            if (response.requiresPayment && response.paymentUrl) {
                localStorage.setItem('pendingOrderId', response.order.id);
                window.location.href = response.paymentUrl;
                return;
            }

            clearCart();
            setStep(5);
            toast.success("Заказ успешно оформлен!");
        } catch (error) {
            console.error("Order failed", error);
            toast.error(`Ошибка: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0 && step !== 5) {
        return (
            <div className="container py-20 text-center">
                <h2 className="text-xl font-bold mb-4">Корзина пуста</h2>
                <button onClick={() => navigate('/marketplaces')} className="text-primary hover:underline">Вернуться в каталог</button>
            </div>
        );
    }

    if (step === 5) {
        return (
            <div className="container max-w-lg py-20 text-center animate-in zoom-in-95 duration-500">
                <div className="mx-auto h-24 w-24 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                    <Check className="h-12 w-12 text-accent" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Заказ успешно оформлен!</h2>
                <p className="text-muted-foreground mb-8">
                    Спасибо за покупку, {contact.name}. <br />
                    {paymentMethod === 'INSTALLMENT'
                        ? `График платежей сохранен. Первый платеж: ${paymentSchedule[0].amount.toLocaleString()} сум.`
                        : "Мы отправили подтверждение на ваш email."
                    }
                </p>
                <div className="flex flex-col gap-3">
                    <button onClick={() => navigate('/orders')} className="w-full h-12 rounded-lg bg-primary text-white font-bold">Мои заказы</button>
                    <button onClick={() => navigate('/')} className="w-full h-12 rounded-lg border hover:bg-muted font-medium">На главную</button>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-6xl py-8 px-4 md:px-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-8">Оформление заказа</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Stepper Header */}
                    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
                        {STEPS.map((s, idx) => (
                            <div key={s.id} className="flex items-center">
                                <div className={cn(
                                    "flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold border-2 transition-colors",
                                    step >= s.id ? "border-blue-600 bg-blue-600 text-white" : "border-slate-400 text-slate-600 bg-slate-100"
                                )}>
                                    {s.id}
                                </div>
                                <span className={cn(
                                    "ml-2 text-sm font-semibold pr-4 whitespace-nowrap",
                                    step >= s.id ? "text-slate-900" : "text-slate-600"
                                )}>
                                    {s.title}
                                </span>
                                {idx < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-slate-400 mx-2" />}
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Contact */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-left-4 fade-in">
                            <div className="bg-yellow-50/50 border border-yellow-200 text-yellow-900 p-4 rounded-xl flex items-start gap-3 shadow-sm">
                                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-yellow-600" />
                                <div className="text-sm font-medium leading-relaxed">
                                    <span className="font-bold block mb-1">Важно:</span>
                                    Пожалуйста, укажите действующий номер телефона. Это обязательно для подтверждения заказа.
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-slate-900 flex items-center"><User className="mr-2 h-5 w-5" /> Контактные данные</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-800">Ваше Имя *</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                        <input
                                            {...register('contactName')}
                                            className={cn("w-full pl-9 h-10 rounded-md border bg-white px-3 text-slate-900 placeholder:text-slate-400", errors.contactName ? "border-red-500 focus:ring-red-500" : "border-slate-300")}
                                            placeholder="Иван Иванов"
                                        />
                                    </div>
                                    {errors.contactName && <span className="text-xs text-red-500">{errors.contactName.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-800">Телефон *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                        <Controller
                                            control={control}
                                            name="contactPhone"
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    onChange={e => {
                                                        let val = e.target.value.replace(/\D/g, '');
                                                        if (!val.startsWith('998')) val = '998' + val;
                                                        val = val.slice(0, 12);
                                                        let formatted = '+998 ';
                                                        if (val.length > 3) formatted += `(${val.slice(3, 5)}) `;
                                                        if (val.length > 5) formatted += `${val.slice(5, 8)}`;
                                                        if (val.length > 8) formatted += `-${val.slice(8, 10)}`;
                                                        if (val.length > 10) formatted += `-${val.slice(10, 12)}`;
                                                        field.onChange(formatted.trim());
                                                    }}
                                                    className={cn("w-full pl-9 h-10 rounded-md border bg-white px-3 font-mono text-sm tracking-wide text-slate-900 placeholder:text-slate-400", errors.contactPhone ? "border-red-500" : "border-slate-300")}
                                                    placeholder="+998 (90) 123-45-67"
                                                />
                                            )}
                                        />
                                    </div>
                                    {errors.contactPhone && <span className="text-xs text-red-500">{errors.contactPhone.message}</span>}
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-800">Email (необязательно)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                        <input
                                            {...register('contactEmail')}
                                            className={cn("w-full pl-9 h-10 rounded-md border bg-white px-3 text-slate-900 placeholder:text-slate-400", errors.contactEmail ? "border-red-500" : "border-slate-300")}
                                            placeholder="example@mail.com"
                                        />
                                    </div>
                                    {errors.contactEmail && <span className="text-xs text-red-500">{errors.contactEmail.message}</span>}
                                </div>
                            </div>
                            <button onClick={handleNext} className="w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold mt-4 shadow-sm transition-all">Далее: Доставка</button>
                        </div>
                    )}

                    {/* Step 2: Shipping */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center"><Truck className="mr-2 h-5 w-5" /> Доставка</h2>

                            <Controller
                                control={control}
                                name="shippingMethod"
                                render={({ field }) => (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div
                                            onClick={() => field.onChange('COURIER')}
                                            className={cn("p-4 border-2 rounded-xl cursor-pointer hover:border-blue-600 transition-all text-center", field.value === 'COURIER' ? "border-blue-600 bg-blue-50" : "border-slate-300")}
                                        >
                                            <Truck className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                                            <div className="font-bold text-slate-900">Курьер</div>
                                            <div className="text-sm text-slate-700 font-medium">
                                                {shippingDistance > 0 ? `${shippingCost.toLocaleString()} sum (${shippingDistance} km)` : "от 25 000 sum"}
                                            </div>
                                        </div>
                                        <div
                                            onClick={() => field.onChange('PICKUP')}
                                            className={cn("p-4 border-2 rounded-xl cursor-pointer hover:border-blue-600 transition-all text-center", field.value === 'PICKUP' ? "border-blue-600 bg-blue-50" : "border-slate-300")}
                                        >
                                            <Store className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                                            <div className="font-bold text-slate-900">Самовывоз</div>
                                            <div className="text-sm text-green-700 font-semibold">Бесплатно</div>
                                        </div>
                                    </div>
                                )}
                            />

                            {formValues.shippingMethod === 'PICKUP' && (
                                <div className="space-y-4 pt-4 animate-in fade-in">
                                    <label className="text-sm font-semibold text-slate-800">Выберите пункт выдачи</label>
                                    <div className="grid gap-3">
                                        {centers.length === 0 ? (
                                            <div className="p-4 border rounded-xl bg-orange-50 border-orange-200 text-orange-900 text-sm">
                                                Нет доступных пунктов выдачи. Пожалуйста, выберите доставку курьером.
                                            </div>
                                        ) : (
                                            <Controller
                                                control={control}
                                                name="pickupCenterId"
                                                render={({ field }) => (
                                                    <>
                                                        {centers.map(center => (
                                                            <label
                                                                key={center.id}
                                                                className={cn(
                                                                    "flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:border-blue-600 transition-all",
                                                                    field.value === center.id ? "border-blue-600 bg-blue-50" : "bg-card"
                                                                )}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    className="mt-1"
                                                                    checked={field.value === center.id}
                                                                    onChange={() => field.onChange(center.id)}
                                                                />
                                                                <div>
                                                                    <div className="font-bold text-sm text-slate-900">{center.name}</div>
                                                                    <div className="text-xs text-slate-600">{center.address}</div>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </>
                                                )}
                                            />
                                        )}
                                    </div>
                                    {errors.pickupCenterId && <span className="text-xs text-red-500">{errors.pickupCenterId.message}</span>}
                                </div>
                            )}

                            {formValues.shippingMethod === 'COURIER' && (
                                <div className="space-y-4 pt-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-800">Город</label>
                                            <select
                                                {...register('shippingCity')}
                                                className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-slate-900"
                                            >
                                                <option value="Tashkent">Ташкент</option>
                                                <option value="Samarkand">Самарканд</option>
                                                <option value="Bukhara">Бухара</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-800">Адрес *</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                                <input
                                                    {...register('shippingAddress')}
                                                    className={cn("w-full pl-9 h-10 rounded-md border bg-white px-3 text-slate-900 placeholder:text-slate-400", errors.shippingAddress ? "border-red-500" : "border-slate-300")}
                                                    placeholder="Улица, Дом, Квартира"
                                                />
                                            </div>
                                            {errors.shippingAddress && <span className="text-xs text-red-500">{errors.shippingAddress.message}</span>}
                                        </div>
                                    </div>
                                    {/* Map Component */}
                                    <div className="space-y-2 pt-2">
                                        <label className="text-sm font-semibold text-slate-800">Укажите на карте</label>
                                        <CheckoutMap
                                            onLocationSelect={(coords) => setValue('shippingLocation', coords)}
                                            onAddressFound={(addr, city) => {
                                                setValue('shippingAddress', addr);
                                                const normalizedCity = ['Tashkent', 'Samarkand', 'Bukhara'].includes(city) ? city : (city === 'Ташкент' ? 'Tashkent' : 'Tashkent');
                                                setValue('shippingCity', normalizedCity);
                                            }}
                                        />
                                        <p className="text-xs text-slate-600 flex justify-between">
                                            <span>Адрес заполнится автоматически при выборе точки на карте</span>
                                            {shippingDistance > 0 && <span className="text-blue-700 font-bold">Расстояние: {shippingDistance} км</span>}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 mt-6">
                                <button onClick={() => setStep(1)} className="flex-1 h-12 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 font-bold transition-all">Назад</button>
                                <button onClick={handleNext} className="flex-[2] h-12 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm">Далее: Оплата</button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Payment (Enhanced) */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center"><CreditCard className="mr-2 h-5 w-5" /> Оплата</h2>

                            <Controller
                                control={control}
                                name="paymentMethod"
                                render={({ field }) => (
                                    <div className="grid gap-4">
                                        {cartItems.some(i => ['Apartments', 'Houses', 'Commercial', 'Land', 'Cars', 'Transport'].includes(i.category)) ? (
                                            <EscrowInfo total={total} userBalance={settings.userBalance} />
                                        ) : (
                                            <>
                                                <label className={cn("flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer hover:border-blue-600 transition-all", field.value === 'FULL' ? "border-blue-600 bg-blue-50" : "")}>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="radio"
                                                            checked={field.value === 'FULL'}
                                                            onChange={() => field.onChange('FULL')}
                                                            className="h-5 w-5 text-blue-600"
                                                        />
                                                        <div>
                                                            <div className="font-bold">Оплата картой</div>
                                                            <div className="text-sm text-muted-foreground">UzCard, Humo, Visa</div>
                                                        </div>
                                                    </div>
                                                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                                                </label>

                                                {settings.enable_installments === 'true' && (
                                                    <label className={cn("flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer hover:border-blue-600 transition-all", field.value === 'INSTALLMENT' ? "border-blue-600 bg-blue-50" : "")}>
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="radio"
                                                                checked={field.value === 'INSTALLMENT'}
                                                                onChange={() => field.onChange('INSTALLMENT')}
                                                                className="h-5 w-5 text-blue-600"
                                                            />
                                                            <div>
                                                                <div className="font-bold">Рассрочка</div>
                                                                <div className="text-sm text-accent font-medium">{settings.interest_rate === '0' ? '0% Переплаты' : `${settings.interest_rate}% Переплата`}</div>
                                                            </div>
                                                        </div>
                                                        <Calendar className="h-6 w-6 text-muted-foreground" />
                                                    </label>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            />

                            {formValues.paymentMethod === 'FULL' && (
                                <div className="space-y-6 animate-in fade-in">
                                    {/* Provider Selection */}
                                    <Controller
                                        control={control}
                                        name="paymentProvider"
                                        render={({ field }) => (
                                            <div className="grid grid-cols-3 gap-3">
                                                {['CLICK', 'PAYME', 'UZUM'].map(p => (
                                                    <button
                                                        key={p}
                                                        onClick={() => field.onChange(p)}
                                                        className={cn("h-12 border rounded-lg font-bold text-sm transition-all", field.value === p ? "border-blue-600 ring-1 ring-blue-600 bg-blue-50 text-blue-700" : "hover:border-blue-400")}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    />

                                    {/* Simulated Card Input (Optional/Visual) */}
                                    <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl shadow-xl max-w-sm mx-auto transform transition-all hover:scale-105">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="text-2xl font-bold tracking-widest">{formValues.paymentProvider || 'CARD'}</div>
                                            <CreditCard className="h-8 w-8 text-white/50" />
                                        </div>
                                        <div className="mb-6 relative h-10">
                                            <input
                                                {...register('cardDetails.number')}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                                    setValue('cardDetails.number', val);
                                                }}
                                                placeholder="0000 0000 0000 0000"
                                                className="w-full bg-transparent text-xl tracking-[0.2em] placeholder:text-white/20 focus:outline-none font-mono font-bold"
                                                maxLength={19}
                                                value={formValues.cardDetails?.number?.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim() || ''}
                                            />
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="flex-1 mr-4">
                                                <div className="text-xs text-white/50 uppercase mb-1">Владелец</div>
                                                <input
                                                    {...register('cardDetails.name')}
                                                    placeholder="ИМЯ ФАМИЛИЯ"
                                                    className="w-full bg-transparent text-sm tracking-wide placeholder:text-white/20 focus:outline-none uppercase truncate"
                                                />
                                            </div>
                                            <div>
                                                <div className="text-xs text-white/50 uppercase mb-1">Срок</div>
                                                <input
                                                    {...register('cardDetails.expiry')}
                                                    onChange={e => {
                                                        let val = e.target.value.replace(/\D/g, '');
                                                        if (val.length >= 3) {
                                                            val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                                        }
                                                        setValue('cardDetails.expiry', val.slice(0, 5));
                                                    }}
                                                    placeholder="MM/YY"
                                                    className="w-16 bg-transparent text-sm tracking-wide placeholder:text-white/20 focus:outline-none text-right"
                                                    maxLength={5}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formValues.paymentMethod === 'INSTALLMENT' && (
                                <div className="space-y-6 animate-in fade-in">
                                    <div className="p-4 bg-muted/50 rounded-xl space-y-4">
                                        <h4 className="font-medium text-sm">Выберите срок:</h4>
                                        <Controller
                                            control={control}
                                            name="installmentMonths"
                                            render={({ field }) => (
                                                <div className="grid grid-cols-3 gap-2">
                                                    {[3, 6, 12].map(m => (
                                                        <button
                                                            key={m}
                                                            onClick={() => field.onChange(m)}
                                                            className={cn("py-2 rounded-lg text-sm font-bold border transition-all", field.value === m ? "bg-blue-600 text-white border-blue-600" : "bg-background hover:border-blue-600")}
                                                        >
                                                            {m} мес
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        />
                                    </div>

                                    {/* Sync Date Schedule Display */}
                                    <div className="border rounded-xl overflow-hidden">
                                        <div className="bg-muted px-4 py-2 font-medium text-sm border-b">График Платежей</div>
                                        <div className="divide-y max-h-60 overflow-y-auto">
                                            {paymentSchedule.map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 text-sm hover:bg-muted/30">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", i === 0 ? "bg-accent/10 text-accent" : "bg-gray-100 text-gray-600")}>
                                                            {i + 1}
                                                        </div>
                                                        <div className="font-medium">
                                                            {new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </div>
                                                    </div>
                                                    <div className="font-bold">
                                                        {item.amount.toLocaleString()} сум
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-muted/30 p-3 text-right text-sm font-bold border-t">
                                            Итого: {totalWithInterest.toLocaleString()} сум
                                        </div>
                                    </div>

                                    {/* Card Input for Binding */}
                                    <div className="p-4 border rounded-xl space-y-3 bg-blue-50/50 border-blue-100">
                                        <h4 className="font-medium text-sm flex items-center gap-2"><CreditCard className="h-4 w-4 text-blue-600" /> Привязать карту для списания</h4>
                                        <input
                                            {...register('cardDetails.number')}
                                            onChange={e => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                                setValue('cardDetails.number', val);
                                            }}
                                            className="w-full h-10 rounded-md border bg-white px-3 font-mono font-medium tracking-wider"
                                            placeholder="Номер карты (8600 0000 0000 0000)"
                                            maxLength={19}
                                            value={formValues.cardDetails?.number?.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim() || ''}
                                        />
                                        <p className="text-xs text-muted-foreground">Мы будем списывать {monthlyPrice.toLocaleString()} сум ежемесячно согласно графику.</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 mt-6">
                                <button onClick={() => setStep(2)} className="flex-1 h-12 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 font-bold transition-all">Назад</button>
                                <button onClick={handleNext} className="flex-[2] h-12 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm">Далее: Подтверждение</button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Confirmation */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center"><ShieldCheck className="mr-2 h-5 w-5" /> Подтверждение</h2>

                            <div className="bg-card border rounded-xl p-6 space-y-4 shadow-sm">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-700 mb-1">Получатель</h4>
                                        <div className="font-medium text-slate-900">{formValues.contactName}</div>
                                        <div className="text-sm text-slate-700">{formValues.contactPhone}</div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-700 mb-1">Доставка</h4>
                                        <div className="font-medium text-slate-900">{formValues.shippingMethod === 'COURIER' ? 'Курьер' : 'Самовывоз'}</div>
                                        {formValues.shippingMethod === 'COURIER' && <div className="text-sm text-slate-700">{formValues.shippingCity}, {formValues.shippingAddress}</div>}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-700 mb-1">Оплата</h4>
                                        <div className="font-medium text-slate-900">{formValues.paymentMethod === 'FULL' ? `Картой (${formValues.paymentProvider})` : `Рассрочка (${formValues.installmentMonths} мес)`}</div>
                                        {formValues.cardDetails?.number && <div className="text-sm text-green-700 flex items-center gap-1"><Check className="h-3 w-3" /> Карта **** {formValues.cardDetails.number.slice(-4)}</div>}
                                    </div>
                                </div>
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold text-slate-900 mb-2">Товары</h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {cartItems.map(item => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span className="text-slate-700">{item.name} x {item.quantity}</span>
                                                <span className="font-medium text-slate-900">{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button onClick={() => setStep(3)} className="flex-1 h-12 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 font-bold transition-all">Назад</button>
                                <button onClick={handleSubmit(onPlaceOrder)} disabled={loading} className="flex-[2] h-12 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all btn-press">
                                    {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Обработка...</span> : `Подтвердить заказ (${formValues.paymentMethod === 'FULL' ? total.toLocaleString() : totalWithInterest.toLocaleString()})`}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Order Summary (Always Visible) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <h3 className="font-bold text-lg text-slate-900 mb-4">Ваш заказ</h3>
                            <div className="space-y-3 mb-6 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-700">Товары</span>
                                    <span className="font-medium text-slate-900">{subtotal.toLocaleString()} So'm</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-700">Доставка</span>
                                    <span className="font-medium text-slate-900">{SHIPPING_COST === 0 ? <span className="text-green-600 font-semibold">Бесплатно</span> : `${SHIPPING_COST.toLocaleString()} So'm`}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Скидка</span>
                                        <span>-{discountAmount.toLocaleString()} So'm</span>
                                    </div>
                                )}
                                <div className="border-t pt-3 mt-3">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-lg text-slate-900">Итого</span>
                                        <div className="text-right">
                                            <div className="font-bold text-xl text-slate-900">{total.toLocaleString()} So'm</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
