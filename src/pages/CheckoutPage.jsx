import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema } from '../lib/schemas';
import { CreditCard, Calendar, Check, ShieldCheck, ArrowRight, Truck, MapPin, User, Mail, Phone, Store, ChevronRight, AlertCircle, Loader2, Car, X, Wallet, ShoppingCart, ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import { EscrowInfo } from '../components/checkout/EscrowInfo';
import { cn, getImageUrl } from '../lib/utils';
import { useShop } from '../context/ShopContext';
import CheckoutMap from '../components/CheckoutMap';
import { PinModal } from '../components/fintech/PinModal';
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
    
    // Pin Protection State
    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [pendingOrderData, setPendingOrderData] = useState(null);
    const [isEscrowEnabled, setIsEscrowEnabled] = useState(true);

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

    const isPropertyOrCar = cartItems.some(i => ['Apartments', 'Houses', 'Commercial', 'Land', 'Cars', 'Transport'].includes(i.category));

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

    const initiateOrder = (data) => {
        const isDepositRequired = cartItems.some(i => ['Apartments', 'Houses', 'Commercial', 'Land', 'Cars', 'Transport'].includes(i.category));
        const effectivePaymentMethod = isDepositRequired ? 'DEPOSIT' : data.paymentMethod;

        if (effectivePaymentMethod === 'WALLET' || effectivePaymentMethod === 'DEPOSIT') {
             // Require PIN for internal balance deductions
             setPendingOrderData({ ...data, isEscrowEnabled });
             setPinModalOpen(true);
        } else {
             // Direct process for external cards or other methods
             onPlaceOrder(data);
        }
    };

    const confirmWalletOrder = () => {
        if (pendingOrderData) {
            onPlaceOrder(pendingOrderData);
            setPendingOrderData(null);
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
                isEscrowEnabled: data.isEscrowEnabled || false,
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

            // Simulate random failure for demonstration if needed, or simply proceed
            if (Math.random() > 0.9) {
                setStep(6); // Force fail
                setLoading(false);
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
            <div className="min-h-screen bg-[#13111C] flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/5">
                    <ShoppingCart size={40} className="text-slate-700" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-4">Корзина пуста</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-8">Добавьте что-нибудь в корзину, чтобы продолжить</p>
                <button
                    onClick={() => navigate('/marketplaces')}
                    className="px-10 py-4 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 transition-all shadow-[0_15px_30px_rgba(147,51,234,0.3)] active:scale-95 flex items-center gap-2"
                >
                    <ArrowLeft size={14} /> К покупкам
                </button>
            </div>
        );
    }

    // Define current transaction specific variables (Mocked from latest cart data for visual UI)
    const transactionFailed = step === 6; // New condition to show failure UI
    const latestItem = cartItems[0] || { name: 'Ferrari Roma Spider 2024', price: 3850000000, image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=400' };

    if (step === 5 || step === 6) {
        return (
            <div className="min-h-screen bg-[#13111C] flex items-center justify-center py-12 px-4 sm:px-6 animate-in fade-in">
                {/* Header Logo */}
                <div className="absolute top-8 left-8 flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white">
                        <Car size={16} />
                    </div>
                    <span className="text-white font-bold tracking-widest text-sm">AUTOHOUSE</span>
                </div>

                {/* Header Actions */}
                <div className="absolute top-8 right-8 flex items-center gap-3">
                    <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-purple-500 hover:bg-white/10 transition-colors">
                        ?
                    </button>
                    <button onClick={() => navigate('/')} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="max-w-xl w-full">
                    {step === 5 ? (
                        /* ================= SUCCESS STATE ================= */
                        <div className="bg-[#191624] rounded-[2rem] border border-white/5 shadow-2xl p-8 md:p-12 relative overflow-hidden">
                            {/* Glow Effect */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-purple-600/20 blur-[100px] pointer-events-none"></div>

                            <div className="flex flex-col items-center text-center">
                                {/* Success Icon */}
                                <div className="w-24 h-24 bg-purple-600/20 rounded-full flex items-center justify-center mb-6">
                                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.5)]">
                                        <Check className="w-8 h-8 text-white" strokeWidth={3} />
                                    </div>
                                </div>

                                <h1 className="text-3xl font-black text-white mb-3">Payment Successful</h1>
                                <p className="text-slate-400 mb-10 max-w-sm mx-auto">
                                    Your luxury acquisition has been secured. Your transaction was completed successfully.
                                </p>

                                {/* Order Summary Card */}
                                <div className="w-full bg-[#1E1B29] rounded-2xl border border-white/5 overflow-hidden mb-8">
                                    <div className="flex items-center gap-4 p-4 border-b border-white/5">
                                        <div className="w-24 h-16 bg-black rounded-lg overflow-hidden shrink-0">
                                            <img src={getImageUrl(latestItem.image)} alt="Vehicle" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="text-left flex-grow">
                                            <div className="text-purple-500 text-xs font-bold tracking-wider mb-1">ORDER #AH-88291</div>
                                            <h3 className="font-bold text-white text-lg leading-tight mb-2">{latestItem.name}</h3>
                                            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                                                <Wallet size={12} /> Total Amount Paid
                                            </div>
                                            <div className="text-xl font-black text-purple-400">
                                                {total.toLocaleString()} UZS
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 p-6 bg-[#181521]/50">
                                        <div className="text-left space-y-4">
                                            <div>
                                                <div className="text-xs text-slate-500 font-medium mb-1">Date</div>
                                                <div className="text-sm font-bold text-white tracking-wide">Oct 24, 2023, 14:32</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500 font-medium mb-1">Showroom</div>
                                                <div className="text-sm font-bold text-white tracking-wide">Autohouse Tashkent Central</div>
                                            </div>
                                        </div>
                                        <div className="text-left space-y-4">
                                            <div>
                                                <div className="text-xs text-slate-500 font-medium mb-1">Payment Method</div>
                                                <div className="text-sm font-bold text-white tracking-wide">Digital Wallet ({paymentProvider || 'CARD'})</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500 font-medium mb-1">Status</div>
                                                <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div> Verified
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="w-full grid grid-cols-2 gap-4">
                                    <button onClick={() => navigate('/profile?tab=orders')} className="py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-colors shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]">
                                        View Order History
                                    </button>
                                    <button onClick={() => navigate('/')} className="py-4 bg-[#252236] hover:bg-[#2A273D] text-white rounded-xl font-bold transition-colors border border-white/5">
                                        Back to Home
                                    </button>
                                </div>

                                <div className="mt-8 text-sm text-slate-400">
                                    Need help with your transaction? <a href="#" className="text-purple-500 hover:text-purple-400 transition-colors">Contact Autohouse Support</a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ================= ERROR STATE ================= */
                        <div className="bg-[#191624] rounded-[2rem] border border-white/5 shadow-2xl p-8 md:p-12 relative overflow-hidden">
                            {/* Glow Effect */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-red-600/10 blur-[100px] pointer-events-none"></div>

                            <div className="flex flex-col items-center text-center">
                                {/* Error Icon */}
                                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                                    <div className="w-16 h-16 bg-[#2B1B22] border border-red-500/30 rounded-full flex items-center justify-center">
                                        <AlertCircle className="w-8 h-8 text-red-500" strokeWidth={2.5} />
                                    </div>
                                </div>

                                <h1 className="text-3xl font-black text-white mb-3">Payment Failed</h1>
                                <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                                    We couldn't process your transaction for the<br />
                                    <span className="text-white font-medium">{latestItem.name}</span>.
                                </p>

                                {/* Checklist */}
                                <div className="w-full mb-8 text-left">
                                    <h4 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4 pl-2">Common issues to check</h4>

                                    <div className="space-y-3">
                                        <div className="bg-[#1E1B29] border border-white/5 rounded-2xl p-4 flex gap-4">
                                            <div className="mt-0.5"><Wallet size={16} className="text-purple-500" /></div>
                                            <div>
                                                <div className="text-sm font-bold text-white mb-1">Insufficient funds</div>
                                                <div className="text-xs text-slate-400 leading-relaxed">Please ensure your account has enough balance for this transaction.</div>
                                            </div>
                                        </div>
                                        <div className="bg-[#1E1B29] border border-white/5 rounded-2xl p-4 flex gap-4">
                                            <div className="mt-0.5"><ShieldCheck size={16} className="text-purple-500" /></div>
                                            <div>
                                                <div className="text-sm font-bold text-white mb-1">Bank or card decline</div>
                                                <div className="text-xs text-slate-400 leading-relaxed">Your bank may have flagged this high-value transaction for security.</div>
                                            </div>
                                        </div>
                                        <div className="bg-[#1E1B29] border border-white/5 rounded-2xl p-4 flex gap-4">
                                            <div className="mt-0.5"><CreditCard size={16} className="text-purple-500" /></div>
                                            <div>
                                                <div className="text-sm font-bold text-white mb-1">Incorrect card details</div>
                                                <div className="text-xs text-slate-400 leading-relaxed">Check the expiry date, CVV, or card number for any errors.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="w-full flex flex-col gap-4">
                                    <button onClick={() => setStep(3)} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-colors shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                                        Try Again
                                    </button>
                                    <button onClick={() => { }} className="w-full py-4 bg-[#252236] hover:bg-[#2A273D] text-white rounded-xl font-bold transition-colors border border-white/5">
                                        Contact Support
                                    </button>
                                </div>

                                <button onClick={() => navigate('/cart')} className="mt-8 text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2">
                                    ← Return to Shopping Cart
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Security Note */}
                <div className="fixed bottom-8 text-center left-0 right-0 pointer-events-none">
                    <p className="text-xs text-slate-500">Secure 256-bit SSL Encrypted Payment Gateway.</p>
                    <p className="text-xs text-slate-600 mt-1">Transaction Reference: <span className="font-mono">AH-882-991-XP</span></p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#13111C] text-white py-12 px-4 relative overflow-hidden">
            {/* Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px]" />
            </div>

            <div className="container max-w-6xl mx-auto relative z-10">
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-2 w-12 bg-purple-600 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">Оформление</span>
                    </div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">
                        Оформление <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Заказа</span>
                    </h1>
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stepper Header */}
                        <div className="bg-[#191624] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl mb-8 overflow-x-auto scrollbar-hide">
                            <div className="flex items-center justify-between min-w-[500px]">
                                {STEPS.map((s, idx) => (
                                    <React.Fragment key={s.id}>
                                        <div className="flex items-center gap-4 group">
                                            <div className={cn(
                                                "flex items-center justify-center h-10 w-10 rounded-xl text-xs font-black transition-all duration-500",
                                                step >= s.id
                                                    ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)] scale-110"
                                                    : "bg-[#13111C] text-slate-600 border border-white/5"
                                            )}>
                                                {s.id}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest transition-colors duration-500",
                                                    step >= s.id ? "text-white" : "text-slate-600"
                                                )}>
                                                    Шаг 0{s.id}
                                                </span>
                                                <span className={cn(
                                                    "text-sm font-bold transition-colors duration-500",
                                                    step >= s.id ? "text-purple-400" : "text-slate-500"
                                                )}>
                                                    {s.title}
                                                </span>
                                            </div>
                                        </div>
                                        {idx < STEPS.length - 1 && (
                                            <div className={cn(
                                                "h-[2px] w-8 rounded-full transition-all duration-1000",
                                                step > s.id ? "bg-purple-600" : "bg-white/5"
                                            )} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Step 1: Contact */}
                        {step === 1 && (
                            <div className="space-y-8 animate-in slide-in-from-left-4 fade-in duration-500">
                                <div className="bg-purple-600/10 border border-purple-600/20 text-purple-200 p-6 rounded-3xl flex items-start gap-4 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <AlertCircle className="h-6 w-6 shrink-0 text-purple-400 mt-1" />
                                    <div className="text-sm font-medium leading-relaxed">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 block mb-2">Безопасность</span>
                                        Пожалуйста, укажите действующий номер телефона. Это необходимо для подтверждения заказа и обеспечения безопасности сделки.
                                    </div>
                                </div>

                                <div className="bg-[#191624] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                                    <h2 className="text-2xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                                        <User className="text-purple-500" size={24} /> Контактные <span className="text-slate-500">Данные</span>
                                    </h2>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Ваше Имя</label>
                                            <div className="relative group/input">
                                                <div className="absolute inset-0 bg-purple-600/5 rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within/input:text-purple-400 transition-colors" />
                                                <input
                                                    {...register('contactName')}
                                                    className={cn(
                                                        "w-full pl-12 h-14 rounded-2xl border bg-[#13111C]/50 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all font-bold",
                                                        errors.contactName ? "border-red-500/50" : "border-white/5 group-hover/input:border-white/10"
                                                    )}
                                                    placeholder="Иван Иванов"
                                                />
                                            </div>
                                            {errors.contactName && <span className="text-[10px] font-black uppercase tracking-widest text-red-500 ml-1">{errors.contactName.message}</span>}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Телефон</label>
                                            <div className="relative group/input">
                                                <div className="absolute inset-0 bg-purple-600/5 rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within/input:text-purple-400 transition-colors" />
                                                <Controller
                                                    control={control}
                                                    name="contactPhone"
                                                    render={({ field }) => (
                                                        <input
                                                            {...field}
                                                            onChange={e => {
                                                                let val = e.target.value;
                                                                // Just ensure it starts with + if they are typing a number
                                                                if (val && !val.startsWith('+') && /\d/.test(val[0])) {
                                                                    val = '+' + val;
                                                                }
                                                                field.onChange(val);
                                                            }}
                                                            type="tel"
                                                            className={cn(
                                                                "w-full pl-12 h-14 rounded-2xl border bg-[#13111C]/50 text-white font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all",
                                                                errors.contactPhone ? "border-red-500/50" : "border-white/5 group-hover/input:border-white/10"
                                                            )}
                                                            placeholder="+998 90 123 45 67"
                                                        />
                                                    )}
                                                />
                                            </div>
                                            {errors.contactPhone && <span className="text-[10px] font-black uppercase tracking-widest text-red-500 ml-1">{errors.contactPhone.message}</span>}
                                        </div>

                                        <div className="space-y-3 md:col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email (необязательно)</label>
                                            <div className="relative group/input">
                                                <div className="absolute inset-0 bg-purple-600/5 rounded-2xl opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within/input:text-purple-400 transition-colors" />
                                                <input
                                                    {...register('contactEmail')}
                                                    className={cn(
                                                        "w-full pl-12 h-14 rounded-2xl border bg-[#13111C]/50 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all font-bold",
                                                        errors.contactEmail ? "border-red-500/50" : "border-white/5 group-hover/input:border-white/10"
                                                    )}
                                                    placeholder="example@mail.com"
                                                />
                                            </div>
                                            {errors.contactEmail && <span className="text-[10px] font-black uppercase tracking-widest text-red-500 ml-1">{errors.contactEmail.message}</span>}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        className="w-full h-16 rounded-[1.25rem] bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-[0.2em] text-xs mt-10 shadow-[0_15px_30px_rgba(147,51,234,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                    >
                                        Далее: Доставка <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Shipping */}
                        {step === 2 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-500">
                                <div className="bg-[#191624] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                                    <h2 className="text-2xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                                        <Truck className="text-purple-500" size={24} /> Способ <span className="text-slate-500">Доставки</span>
                                    </h2>

                                    <Controller
                                        control={control}
                                        name="shippingMethod"
                                        render={({ field }) => (
                                            <div className="grid grid-cols-2 gap-6">
                                                <div
                                                    onClick={() => field.onChange('COURIER')}
                                                    className={cn(
                                                        "p-8 rounded-3xl border transition-all cursor-pointer group/choice relative overflow-hidden",
                                                        field.value === 'COURIER'
                                                            ? "bg-purple-600/10 border-purple-600/50 shadow-[0_0_30px_rgba(147,51,234,0.1)]"
                                                            : "bg-[#13111C]/50 border-white/5 hover:border-white/10"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all",
                                                        field.value === 'COURIER' ? "bg-purple-600 text-white shadow-lg" : "bg-white/5 text-slate-500"
                                                    )}>
                                                        <Truck size={28} />
                                                    </div>
                                                    <div className="font-black uppercase tracking-widest text-xs mb-1">Курьер</div>
                                                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                                        {shippingDistance > 0 ? `${shippingCost.toLocaleString()} SUM` : "ОТ 25 000 SUM"}
                                                    </div>
                                                    {field.value === 'COURIER' && (
                                                        <div className="absolute top-4 right-4 text-purple-500">
                                                            <Check size={16} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div
                                                    onClick={() => field.onChange('PICKUP')}
                                                    className={cn(
                                                        "p-8 rounded-3xl border transition-all cursor-pointer group/choice relative overflow-hidden",
                                                        field.value === 'PICKUP'
                                                            ? "bg-purple-600/10 border-purple-600/50 shadow-[0_0_30px_rgba(147,51,234,0.1)]"
                                                            : "bg-[#13111C]/50 border-white/5 hover:border-white/10"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all",
                                                        field.value === 'PICKUP' ? "bg-purple-600 text-white shadow-lg" : "bg-white/5 text-slate-500"
                                                    )}>
                                                        <Store size={28} />
                                                    </div>
                                                    <div className="font-black uppercase tracking-widest text-xs mb-1">Самовывоз</div>
                                                    <div className="text-emerald-500 text-[10px] font-black uppercase tracking-wider">Бесплатно</div>
                                                    {field.value === 'PICKUP' && (
                                                        <div className="absolute top-4 right-4 text-purple-500">
                                                            <Check size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    />

                                    {formValues.shippingMethod === 'PICKUP' && (
                                        <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-top-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Пункты Выдачи</label>
                                            <div className="space-y-3">
                                                <Controller
                                                    control={control}
                                                    name="pickupCenterId"
                                                    render={({ field }) => (
                                                        <>
                                                            {centers.map(center => (
                                                                <div
                                                                    key={center.id}
                                                                    onClick={() => field.onChange(center.id)}
                                                                    className={cn(
                                                                        "p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4",
                                                                        field.value === center.id ? "bg-purple-600/5 border-purple-600/30" : "bg-[#13111C]/30 border-white/5 hover:border-white/10"
                                                                    )}
                                                                >
                                                                    <div className={cn(
                                                                        "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                                                                        field.value === center.id ? "border-purple-500" : "border-slate-700"
                                                                    )}>
                                                                        {field.value === center.id && <div className="h-2 w-2 rounded-full bg-purple-500" />}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-bold text-white">{center.name}</div>
                                                                        <div className="text-xs text-slate-500">{center.address}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </>
                                                    )}
                                                />
                                            </div>
                                            {errors.pickupCenterId && <span className="text-[10px] font-black uppercase tracking-widest text-red-500 ml-1">{errors.pickupCenterId.message}</span>}
                                        </div>
                                    )}

                                    {formValues.shippingMethod === 'COURIER' && (
                                        <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-top-4">
                                            <div className="grid md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Город</label>
                                                    <select
                                                        {...register('shippingCity')}
                                                        className="w-full h-14 rounded-2xl border border-white/5 bg-[#13111C]/50 text-white px-4 font-bold focus:outline-none focus:ring-2 focus:ring-purple-600/50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjOTQ5OUE3IiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik02IDlsNiA2IDYtNiIvPjwvc3ZnPg==')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat"
                                                    >
                                                        <option value="Tashkent">Ташкент</option>
                                                        <option value="Samarkand">Самарканд</option>
                                                        <option value="Bukhara">Бухара</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Адрес Доставки</label>
                                                    <div className="relative group/input">
                                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within/input:text-purple-400 transition-colors" />
                                                        <input
                                                            {...register('shippingAddress')}
                                                            className={cn(
                                                                "w-full pl-12 h-14 rounded-2xl border bg-[#13111C]/50 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all font-bold",
                                                                errors.shippingAddress ? "border-red-500/50" : "border-white/5 group-hover/input:border-white/10"
                                                            )}
                                                            placeholder="Улица, Дом, Квартира"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Укажите на Карте</label>
                                                <div className="rounded-[2rem] overflow-hidden border border-white/5 bg-[#13111C]/50 relative">
                                                    <CheckoutMap
                                                        onLocationSelect={(coords) => setValue('shippingLocation', coords)}
                                                        onAddressFound={(addr, city) => {
                                                            setValue('shippingAddress', addr);
                                                            const normalizedCity = ['Tashkent', 'Samarkand', 'Bukhara'].includes(city) ? city : (city === 'Ташкент' ? 'Tashkent' : 'Tashkent');
                                                            setValue('shippingCity', normalizedCity);
                                                        }}
                                                    />
                                                    {shippingDistance > 0 && (
                                                        <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                                                            {shippingDistance} КМ
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">
                                                    Адрес заполнится автоматически при выборе точки на карте
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-6 mt-10">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="h-16 rounded-[1.25rem] bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-[0.2em] text-xs transition-all border border-white/5 active:scale-[0.98]"
                                        >
                                            Назад
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="h-16 rounded-[1.25rem] bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-[0.2em] text-xs shadow-[0_15px_30px_rgba(147,51,234,0.3)] transition-all active:scale-[0.98]"
                                        >
                                            Далее: Оплата
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Payment */}
                        {step === 3 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-500">
                                <div className="bg-[#191624] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                                    <h2 className="text-2xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                                        <CreditCard className="text-purple-500" size={24} /> Способ <span className="text-slate-500">Оплаты</span>
                                    </h2>

                                    <Controller
                                        control={control}
                                        name="paymentMethod"
                                        render={({ field }) => (
                                            <div className="grid gap-4">
                                                {cartItems.some(i => ['Apartments', 'Houses', 'Commercial', 'Land', 'Cars', 'Transport'].includes(i.category)) ? (
                                                    <EscrowInfo total={total} userBalance={settings.userBalance} />
                                                ) : (
                                                    <>
                                                        <div
                                                            onClick={() => field.onChange('WALLET')}
                                                            className={cn(
                                                                "p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group",
                                                                field.value === 'WALLET' ? "bg-purple-600/10 border-purple-600/30 shadow-[0_0_30px_rgba(147,51,234,0.1)]" : "bg-[#13111C]/30 border-white/5 hover:border-white/10"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={cn(
                                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-inner",
                                                                    field.value === 'WALLET' ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white" : "bg-white/5 text-slate-500"
                                                                )}>
                                                                    <Wallet size={20} />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="text-sm font-bold text-white">Autohouse Pay</div>
                                                                        {field.value === 'WALLET' && <div className="text-[9px] font-black tracking-widest uppercase bg-purple-500 text-white px-2 py-0.5 rounded-full">Выбран</div>}
                                                                    </div>
                                                                    <div className={cn(
                                                                        "text-xs font-medium transition-colors mt-1",
                                                                        (settings.userBalance || 0) < total ? "text-red-400" : "text-emerald-400"
                                                                    )}>
                                                                        Баланс: {(settings.userBalance || 0).toLocaleString()} UZS
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className={cn(
                                                                "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                                                field.value === 'WALLET' ? "border-purple-500" : "border-slate-700"
                                                            )}>
                                                                {field.value === 'WALLET' && <div className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(147,51,234,1)]" />}
                                                            </div>
                                                        </div>

                                                        {((settings.userBalance || 0) < total && field.value === 'WALLET') && (
                                                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3 text-xs mt-2">
                                                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                                                <div>Недостаточно средств. Пожалуйста, пополните баланс в <a href="/wallet" target="_blank" className="font-bold underline underline-offset-2">Кошельке</a> перед покупкой.</div>
                                                            </div>
                                                        )}

                                                        {field.value === 'WALLET' && (
                                                            <div 
                                                                className="mt-2 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 cursor-pointer flex items-start gap-3 transition-colors hover:bg-emerald-500/10"
                                                                onClick={() => setIsEscrowEnabled(!isEscrowEnabled)}
                                                            >
                                                                <div className={cn(
                                                                    "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                                                                    isEscrowEnabled ? "bg-emerald-500 border-emerald-500" : "bg-white/5 border-white/20"
                                                                )}>
                                                                    {isEscrowEnabled && <Check size={14} className="text-white" />}
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs font-bold text-emerald-400">Безопасная сделка (Эскроу)</div>
                                                                    <div className="text-[10px] text-emerald-500/70 mt-1 leading-relaxed">
                                                                        Ваши средства будут заморожены на счету гаранта и переведены продавцу только после того, как вы подтвердите получение товара в истории заказов.
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div
                                                            onClick={() => field.onChange('FULL')}
                                                            className={cn(
                                                                "p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group opacity-50 cursor-not-allowed",
                                                                field.value === 'FULL' ? "bg-purple-600/10 border-purple-600/30" : "bg-[#13111C]/30 border-white/5"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={cn(
                                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                                    field.value === 'FULL' ? "bg-purple-600 text-white" : "bg-white/5 text-slate-500"
                                                                )}>
                                                                    <CreditCard size={20} />
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-bold text-white">Банковская Карта</div>
                                                                    <div className="text-xs text-slate-500 font-medium">Временно недоступно (Используйте кошелёк)</div>
                                                                </div>
                                                            </div>
                                                            <div className={cn(
                                                                "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                                                                field.value === 'FULL' ? "border-purple-500" : "border-slate-700"
                                                            )}>
                                                                {field.value === 'FULL' && <div className="h-2 w-2 rounded-full bg-purple-500" />}
                                                            </div>
                                                        </div>

                                                        {settings.enable_installments === 'true' && (
                                                            <div
                                                                onClick={() => field.onChange('INSTALLMENT')}
                                                                className={cn(
                                                                    "p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group",
                                                                    field.value === 'INSTALLMENT' ? "bg-purple-600/10 border-purple-600/30" : "bg-[#13111C]/30 border-white/5 hover:border-white/10"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className={cn(
                                                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                                        field.value === 'INSTALLMENT' ? "bg-purple-600 text-white" : "bg-white/5 text-slate-500"
                                                                    )}>
                                                                        <Calendar size={20} />
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-bold text-white">Рассрочка</div>
                                                                        <div className="text-xs text-emerald-500 font-black uppercase tracking-widest text-[10px]">
                                                                            {settings.interest_rate === '0' ? '0% Переплаты' : `${settings.interest_rate}% Комиссия`}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className={cn(
                                                                    "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                                                                    field.value === 'INSTALLMENT' ? "border-purple-500" : "border-slate-700"
                                                                )}>
                                                                    {field.value === 'INSTALLMENT' && <div className="h-2 w-2 rounded-full bg-purple-500" />}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    />

                                    {formValues.paymentMethod === 'FULL' && (
                                        <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-top-4">
                                            <Controller
                                                control={control}
                                                name="paymentProvider"
                                                render={({ field }) => (
                                                    <div className="grid grid-cols-3 gap-4">
                                                        {['CLICK', 'PAYME', 'UZUM'].map(p => (
                                                            <button
                                                                key={p}
                                                                onClick={() => field.onChange(p)}
                                                                className={cn(
                                                                    "h-14 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all",
                                                                    field.value === p
                                                                        ? "bg-purple-600 text-white border-purple-600 shadow-lg"
                                                                        : "bg-[#13111C]/50 border-white/5 text-slate-500 hover:border-white/10"
                                                                )}
                                                            >
                                                                {p}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            />

                                            <div className="relative max-w-sm mx-auto group">
                                                <div className="absolute inset-0 bg-purple-600/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                <div className="relative p-8 rounded-[2rem] bg-gradient-to-br from-slate-900 to-[#13111C] border border-white/10 shadow-2xl overflow-hidden aspect-[1.58/1] flex flex-col justify-between">
                                                    <div className="flex justify-between items-start">
                                                        <div className="text-2xl font-black italic tracking-tighter text-white opacity-50">{formValues.paymentProvider || 'CARD'}</div>
                                                        <div className="w-12 h-8 bg-white/5 rounded-md flex items-center justify-center">
                                                            <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center">
                                                                <CreditCard size={16} className="text-purple-400" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Номер Карты</div>
                                                        <input
                                                            {...register('cardDetails.number')}
                                                            onChange={e => {
                                                                const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                                                setValue('cardDetails.number', val);
                                                            }}
                                                            placeholder="0000 0000 0000 0000"
                                                            className="w-full bg-transparent text-xl tracking-[0.2em] placeholder:text-white/10 focus:outline-none font-mono font-black text-white"
                                                            maxLength={19}
                                                            value={formValues.cardDetails?.number?.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim() || ''}
                                                        />
                                                    </div>

                                                    <div className="flex justify-between items-end">
                                                        <div className="flex-1">
                                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Держатель</div>
                                                            <input
                                                                {...register('cardDetails.name')}
                                                                placeholder="NAME SURNAME"
                                                                className="w-full bg-transparent text-xs font-black uppercase tracking-widest placeholder:text-white/10 focus:outline-none text-white"
                                                            />
                                                        </div>
                                                        <div className="w-20 text-right">
                                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Срок</div>
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
                                                                className="w-full bg-transparent text-xs font-black tracking-widest placeholder:text-white/10 focus:outline-none text-right text-white"
                                                                maxLength={5}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {formValues.paymentMethod === 'INSTALLMENT' && (
                                        <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-top-4">
                                            <div className="bg-[#13111C]/50 p-6 rounded-3xl border border-white/5">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                                                    <Calendar size={14} className="text-purple-500" /> Срок Рассрочки
                                                </h4>
                                                <Controller
                                                    control={control}
                                                    name="installmentMonths"
                                                    render={({ field }) => (
                                                        <div className="grid grid-cols-3 gap-4">
                                                            {[3, 6, 12].map(m => (
                                                                <button
                                                                    key={m}
                                                                    onClick={() => field.onChange(m)}
                                                                    className={cn(
                                                                        "h-14 rounded-2xl border font-black text-xs transition-all",
                                                                        field.value === m
                                                                            ? "bg-purple-600 text-white border-purple-600 shadow-lg"
                                                                            : "bg-[#13111C] border-white/5 text-slate-500 hover:border-white/10"
                                                                    )}
                                                                >
                                                                    {m} <span className="opacity-50 text-[10px]">МЕС</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                />
                                            </div>

                                            <div className="border border-white/5 rounded-3xl overflow-hidden bg-[#13111C]/30 shadow-xl">
                                                <div className="bg-white/5 px-6 py-4 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-white/5">График Платежей</div>
                                                <div className="divide-y divide-white/5 max-h-64 overflow-y-auto scrollbar-hide">
                                                    {paymentSchedule.map((item, i) => (
                                                        <div key={i} className="flex items-center justify-between p-5 transition-colors hover:bg-white/5">
                                                            <div className="flex items-center gap-4">
                                                                <div className={cn(
                                                                    "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black",
                                                                    i === 0 ? "bg-purple-600 text-white shadow-lg" : "bg-white/5 text-slate-600"
                                                                )}>
                                                                    {i + 1}
                                                                </div>
                                                                <div className="text-sm font-bold text-white">
                                                                    {new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                                                                </div>
                                                            </div>
                                                            <div className="text-sm font-black text-purple-400">
                                                                {item.amount.toLocaleString()} SUM
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="bg-purple-600/5 p-6 flex justify-between items-center border-t border-white/5">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Общая Сумма</span>
                                                    <span className="text-lg font-black text-white">{totalWithInterest.toLocaleString()} SUM</span>
                                                </div>
                                            </div>

                                            <div className="p-8 border border-purple-600/20 rounded-[2.5rem] bg-purple-600/5 space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-2">
                                                    <CreditCard size={14} /> Привязка Карты для Автосписания
                                                </h4>
                                                <div className="relative group">
                                                    <input
                                                        {...register('cardDetails.number')}
                                                        onChange={e => {
                                                            const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                                            setValue('cardDetails.number', val);
                                                        }}
                                                        className="w-full h-16 rounded-2xl border border-white/5 bg-[#13111C]/50 px-6 font-mono font-black tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-purple-600/50 transition-all"
                                                        placeholder="8600 0000 0000 0000"
                                                        maxLength={19}
                                                        value={formValues.cardDetails?.number?.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim() || ''}
                                                    />
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
                                                    Мы будем автоматически списывать <span className="text-purple-400">{monthlyPrice.toLocaleString()} SUM</span> ежемесячно.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-6 mt-10">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="h-16 rounded-[1.25rem] bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-[0.2em] text-xs transition-all border border-white/5 active:scale-[0.98]"
                                        >
                                            Назад
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="h-16 rounded-[1.25rem] bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-[0.2em] text-xs shadow-[0_15px_30px_rgba(147,51,234,0.3)] transition-all active:scale-[0.98]"
                                        >
                                            Далее: Подтверждение
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Confirmation */}
                        {step === 4 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-500">
                                <div className="bg-[#191624] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                                    <h2 className="text-2xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                                        <ShieldCheck className="text-purple-500" size={24} /> Финальное <span className="text-slate-500">Подтверждение</span>
                                    </h2>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="p-6 rounded-3xl bg-[#13111C]/50 border border-white/5 group hover:border-purple-600/30 transition-all">
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 flex items-center gap-2">
                                                <User size={12} className="text-purple-500" /> Получатель
                                            </div>
                                            <div className="text-sm font-black text-white mb-1">{formValues.contactName}</div>
                                            <div className="text-xs font-bold text-slate-500">{formValues.contactPhone}</div>
                                        </div>

                                        <div className="p-6 rounded-3xl bg-[#13111C]/50 border border-white/5 group hover:border-purple-600/30 transition-all">
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 flex items-center gap-2">
                                                <Truck size={12} className="text-purple-500" /> Доставка
                                            </div>
                                            <div className="text-sm font-black text-white mb-1">
                                                {formValues.shippingMethod === 'COURIER' ? 'Курьерская доставка' : 'Самовывоз'}
                                            </div>
                                            {formValues.shippingMethod === 'COURIER' && (
                                                <div className="text-xs font-bold text-slate-500 truncate">
                                                    {formValues.shippingCity}, {formValues.shippingAddress}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 rounded-3xl bg-[#13111C]/50 border border-white/5 group hover:border-purple-600/30 transition-all md:col-span-2">
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 flex items-center gap-2">
                                                <CreditCard size={12} className="text-purple-500" /> Метод Оплаты
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-sm font-black text-white mb-1">
                                                        {formValues.paymentMethod === 'FULL' ? `Полная оплата (${formValues.paymentProvider})` : `Рассрочка (${formValues.installmentMonths} месяцев)`}
                                                    </div>
                                                    {formValues.cardDetails?.number && (
                                                        <div className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            Карта привязана: **** {formValues.cardDetails.number.slice(-4)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">К Оплате</div>
                                                    <div className="text-lg font-black text-purple-400">
                                                        {formValues.paymentMethod === 'FULL' ? total.toLocaleString() : totalWithInterest.toLocaleString()} SUM
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 p-6 rounded-3xl bg-purple-600/5 border border-purple-600/20">
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-4 flex items-center gap-2">
                                            <ShoppingCart size={14} /> Состав Заказа
                                        </div>
                                        <div className="space-y-4 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                                            {cartItems.map(item => (
                                                <div key={item.id} className="flex justify-between items-center group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-white/5 overflow-hidden">
                                                            <img src={getImageUrl(item.image)} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-black text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight">{item.name}</div>
                                                            <div className="text-[10px] font-bold text-slate-600">КОЛ-ВО: {item.quantity}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs font-black text-white">
                                                        {(item.price * item.quantity).toLocaleString()} SUM
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 mt-10">
                                        <button
                                            onClick={() => setStep(3)}
                                            className="h-16 rounded-[1.25rem] bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-[0.2em] text-xs transition-all border border-white/5 active:scale-[0.98]"
                                        >
                                            Назад
                                        </button>
                                        <button
                                            onClick={handleSubmit(initiateOrder)}
                                            disabled={loading}
                                            className="h-16 rounded-[1.25rem] bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-[0.2em] text-xs shadow-[0_15px_30px_rgba(147,51,234,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={16} /> : "Подтвердить Заказ"} <Check size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-[#191624] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-indigo-600" />
                                <h3 className="text-xl font-black uppercase tracking-tight text-white mb-8">Итог <span className="text-slate-500">Заказа</span></h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Товары</span>
                                        <span className="text-xs font-black text-white">{subtotal.toLocaleString()} SUM</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Доставка</span>
                                        <span className={cn(
                                            "text-xs font-black",
                                            shippingCost === 0 ? "text-emerald-500" : "text-white"
                                        )}>
                                            {shippingCost === 0 ? "БЕСПЛАТНО" : `${shippingCost.toLocaleString()} SUM`}
                                        </span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Скидка</span>
                                            <span className="text-xs font-black text-emerald-500">-{discountAmount.toLocaleString()} SUM</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-8 border-t border-white/5">
                                    <div className="flex justify-between items-end mb-8">
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">К Оплате</div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-white tracking-tighter leading-none">{total.toLocaleString()}</div>
                                            <div className="text-[10px] font-bold text-slate-600 tracking-widest uppercase mt-1">UZBEK SUM</div>
                                        </div>
                                    </div>

                                    <div className="bg-purple-600/10 border border-purple-600/20 p-4 rounded-2xl flex items-center gap-3">
                                        <ShieldCheck className="text-purple-400" size={18} />
                                        <span className="text-[10px] font-bold text-purple-200 uppercase tracking-widest leading-tight">
                                            Безопасная оплата через шлюз AUTOHOUSE
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Promotional Banner */}
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2 leading-tight">Нужна помощь?</h4>
                                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-6">
                                    Наши специалисты помогут <br /> с оформлением заказа 24/7
                                </p>
                                <button className="w-full h-12 bg-white text-purple-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all active:scale-95 shadow-xl">
                                    Связаться
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <PinModal 
                isOpen={pinModalOpen} 
                onClose={() => { setPinModalOpen(false); setPendingOrderData(null); }}
                onSuccess={confirmWalletOrder}
                actionName="Оплата заказа"
                amount={
                    pendingOrderData && (
                        cartItems.some(i => ['Apartments', 'Houses', 'Commercial', 'Land', 'Cars', 'Transport'].includes(i.category)) 
                        ? 100000 
                        : (pendingOrderData.paymentMethod === 'WALLET' ? total : totalWithInterest)
                    )
                }
            />
        </main>
    );
}
