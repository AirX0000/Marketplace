import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import {
    Wallet, Send, Plus, ArrowUpRight, CreditCard,
    LayoutDashboard, Car, ShoppingBag, MessageSquare, Settings,
    Bell, Building2, ShieldCheck, X, Loader2, Check, Trash2,
    ArrowDownLeft, ShoppingCart, Download, FileText, Link as LinkIcon, Copy
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { PinModal } from '../../components/fintech/PinModal';

// ─── localStorage helpers ───────────────────────────────────────────────────
const CARDS_KEY = 'autohouse_linked_cards';
function loadCards() {
    try { return JSON.parse(localStorage.getItem(CARDS_KEY)) || []; }
    catch { return []; }
}
function saveCards(cards) {
    localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
}

// ─── Detect card network by number ──────────────────────────────────────────
function detectCardType(num) {
    const n = num.replace(/\s/g, '');
    if (/^4/.test(n)) return 'VISA';
    if (/^5[1-5]/.test(n)) return 'MASTERCARD';
    if (/^8600/.test(n)) return 'UZCARD';
    if (/^9860/.test(n)) return 'HUMO';
    return 'CARD';
}
function maskNumber(num) {
    const n = num.replace(/\s/g, '');
    return `**** **** **** ${n.slice(-4)}`;
}
function formatCardInput(val) {
    // add spaces every 4 digits
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

const MOCK_TX = [
    { id: 1, title: 'BMW M4 Maintenance', category: 'Service', amount: -4200000, status: 'COMPLETED', date: '2026-03-20T14:20:00', icon: '🔧' },
    { id: 2, title: 'Wallet Top-Up', category: 'Deposit', amount: +15000000, status: 'COMPLETED', date: '2026-03-18T09:15:00', icon: '➕' },
    { id: 3, title: 'Insurance Renewal', category: 'Insurance', amount: -2500000, status: 'PENDING', date: '2026-03-15T18:45:00', icon: '🔒' },
    { id: 4, title: 'Vehicle Sale Revenue', category: 'Revenue', amount: +120000000, status: 'COMPLETED', date: '2026-03-10T11:30:00', icon: '🚗' },
    { id: 5, title: 'Listing Premium Plan', category: 'Subscription', amount: -1500000, status: 'COMPLETED', date: '2026-03-05T08:00:00', icon: '⭐' },
];

function getTxDetails(tx, accountId) {
    if (tx.icon && tx.title) return { icon: <span className="text-lg">{tx.icon}</span>, title: tx.title, isPositive: tx.amount > 0, displayAmount: tx.amount, bgColor: 'bg-white/5', iconColor: 'text-white' };
    
    const isSender = tx.senderId === accountId;
    const isReceiver = tx.receiverId === accountId;
    const isPositive = isReceiver || tx.type === 'DEPOSIT';
    const amountMult = isPositive ? 1 : -1;
    const displayAmount = Math.abs(tx.amount) * amountMult;

    let icon = <Check size={16} />;
    let title = 'Транзакция';
    let iconColor = 'text-white';
    let bgColor = 'bg-white/10';

    if (tx.type === 'DEPOSIT') {
        icon = <Plus size={16} />;
        title = 'Пополнение кошелька';
        iconColor = 'text-emerald-400';
        bgColor = 'bg-emerald-400/10';
    } else if (tx.type === 'PAYMENT') {
        icon = <ShoppingCart size={16} />;
        title = 'Оплата заказа';
        iconColor = 'text-purple-400';
        bgColor = 'bg-purple-400/10';
    } else if (tx.type === 'TRANSFER') {
        if (isSender) {
            icon = <ArrowUpRight size={16} />;
            title = 'Перевод: ' + (tx.receiverId || 'Пользователю');
            iconColor = 'text-rose-400';
            bgColor = 'bg-rose-400/10';
        } else {
            icon = <ArrowDownLeft size={16} />;
            title = 'Перевод от: ' + (tx.senderId || 'Пользователя');
            iconColor = 'text-emerald-400';
            bgColor = 'bg-emerald-400/10';
        }
    }

    return { icon, title, displayAmount, isPositive, bgColor, iconColor };
}

const SPENDING = [
    { label: 'Service & Repair', percent: 45, color: 'bg-indigo-500' },
    { label: 'Insurance', percent: 30, color: 'bg-rose-500' },
    { label: 'Marketplace Fees', percent: 25, color: 'bg-slate-600' },
];

const SIDEBAR = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/profile' },
    { icon: Wallet, label: 'Wallet', path: '/wallet', active: true },
    { icon: Car, label: 'My Vehicles', path: '/profile?tab=garage' },
    { icon: ShoppingBag, label: 'Orders', path: '/profile?tab=orders' },
    { icon: MessageSquare, label: 'Messages', path: '/chat' },
    { icon: Settings, label: 'Settings', path: '/profile?tab=profile' },
];

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-[#1E1B2E] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1"><X size={20} /></button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

// ─── Card visual component ───────────────────────────────────────────────────
function CardChip({ card, onRemove }) {
    const gradients = {
        VISA: 'from-indigo-700 via-indigo-600 to-blue-700',
        MASTERCARD: 'from-orange-700 via-red-600 to-orange-700',
        UZCARD: 'from-slate-700 via-slate-600 to-slate-700',
        HUMO: 'from-emerald-700 via-teal-600 to-emerald-700',
        CARD: 'from-purple-700 via-purple-600 to-indigo-700',
    };
    const gradient = gradients[card.type] || gradients.CARD;
    return (
        <div className={`relative rounded-2xl p-5 bg-gradient-to-br ${gradient} shadow-lg group overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="flex items-start justify-between mb-5 relative z-10">
                <div className="w-9 h-7 bg-white/20 backdrop-blur-sm rounded flex items-center justify-center border border-white/20">
                    <CreditCard size={14} className="text-white/80" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{card.type}</span>
                    <button
                        onClick={() => onRemove(card.id)}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-rose-600/80 flex items-center justify-center text-white hover:bg-rose-600 transition-all"
                        title="Удалить карту"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
            <p className="font-mono text-white text-sm tracking-widest mb-4 relative z-10">{maskNumber(card.number)}</p>
            <div className="flex justify-between items-end relative z-10">
                <div>
                    <p className="text-white/40 text-[9px] uppercase tracking-widest font-bold">Держатель</p>
                    <p className="text-white text-xs font-bold mt-0.5 uppercase">{card.holder || 'Cardholder'}</p>
                </div>
                <div className="text-right">
                    <p className="text-white/40 text-[9px] uppercase tracking-widest font-bold">Срок</p>
                    <p className="text-white text-xs font-bold mt-0.5">{card.expiry}</p>
                </div>
            </div>
            {card.balance > 0 && (
                <div className="absolute top-3.5 right-12 text-right">
                    <p className="text-white/40 text-[9px] uppercase tracking-widest font-bold">Баланс</p>
                    <p className="text-white text-xs font-bold">{Number(card.balance).toLocaleString('ru-RU')} UZS</p>
                </div>
            )}
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function AutohousePayDashboard() {
    const [wallet, setWallet] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);

    // Cards state (from localStorage)
    const [cards, setCards] = useState(loadCards);

    // Modals
    const [topUpModal, setTopUpModal] = useState(false);
    const [transferModal, setTransferModal] = useState(false);
    const [addCardModal, setAddCardModal] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [topUpCardId, setTopUpCardId] = useState('');
    const [withdrawModal, setWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawCardId, setWithdrawCardId] = useState('');
    const [transferData, setTransferData] = useState({ recipient: '', amount: '' });
    const [requestModal, setRequestModal] = useState(false);
    const [requestData, setRequestData] = useState({ amount: '', desc: '' });
    const [receiptModal, setReceiptModal] = useState(null);
    const [newCard, setNewCard] = useState({ number: '', holder: '', expiry: '', cvv: '', balance: '', mfo: '' });
    const [actionLoading, setActionLoading] = useState(false);
    const [isBusinessMode, setIsBusinessMode] = useState(false);
    
    // Pin Protection State
    const [pinModal, setPinModal] = useState({ isOpen: false, action: null, amount: null, title: '' });

    useEffect(() => {
        async function load() {
            try {
                const [walletData, profileData] = await Promise.all([
                    api.getWallet().catch(() => null),
                    api.getProfile().catch(() => null),
                ]);
                setWallet(walletData);
                setProfile(profileData);
                setTransactions(walletData?.transactions || MOCK_TX);

                // Pre-fill cardholder name from profile
                if (profileData?.name) {
                    setNewCard(p => ({ ...p, holder: profileData.name.toUpperCase() }));
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        }
        load();
    }, []);

    // Persist cards
    useEffect(() => { saveCards(cards); }, [cards]);

    const walletBalance = wallet?.balance ?? 50000;
    const cardsTotal = cards.reduce((sum, c) => sum + (Number(c.balance) || 0), 0);
    const totalBalance = walletBalance + cardsTotal;
    const accountId = wallet?.accountId ?? '122883';
    
    const isPartner = profile?.role === 'PARTNER' || profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN';

    const handleAddCard = () => {
        const num = newCard.number.replace(/\s/g, '');
        
        if (isBusinessMode) {
            if (num.length < 20) return toast.error('Введите полный номер расчетного счета (IBAN, 20 цифр)');
            if (!newCard.mfo || newCard.mfo.length < 5) return toast.error('Введите корректный МФО банка (5 цифр)');
            if (!newCard.holder.trim()) return toast.error('Укажите наименование компании');

            const card = {
                id: Date.now().toString(),
                number: num,
                holder: newCard.holder.trim().toUpperCase(),
                expiry: 'БЕССРОЧНО',
                type: 'IBAN',
                balance: Math.floor(Math.random() * 50000000) + 10000000,
            };
            setCards(prev => [...prev, card]);
            setAddCardModal(false);
            setNewCard({ number: '', holder: profile?.name?.toUpperCase() || '', expiry: '', cvv: '', balance: '', mfo: '' });
            toast.success('Расчетный счет успешно добавлен!');
            return;
        }

        if (num.length < 16) return toast.error('Введите полный номер карты (16 цифр)');
        if (!newCard.expiry.match(/^\d{2}\/\d{2}$/)) return toast.error('Формат срока: ММ/ГГ');
        if (!newCard.holder.trim()) return toast.error('Укажите имя держателя карты');

        const simulatedBalance = Math.floor(Math.random() * 5000000) + 500000;

        const card = {
            id: Date.now().toString(),
            number: num,
            holder: newCard.holder.trim().toUpperCase(),
            expiry: newCard.expiry,
            type: detectCardType(num),
            balance: simulatedBalance,
        };
        setCards(prev => [...prev, card]);
        setAddCardModal(false);
        setNewCard({ number: '', holder: profile?.name?.toUpperCase() || '', expiry: '', cvv: '', balance: '', mfo: '' });
        toast.success('Карта успешно добавлена!');
    };

    const handleRemoveCard = (id) => {
        setCards(prev => prev.filter(c => c.id !== id));
        toast.success('Карта удалена');
    };

    const handleTopUpConfirm = async () => {
        setActionLoading(true);
        try {
            await api.walletDeposit(Number(topUpAmount));
            if (topUpCardId) {
                setCards(prev => prev.map(c => c.id === topUpCardId ? { ...c, balance: Math.max(0, (c.balance || 0) - Number(topUpAmount)) } : c));
            }
            toast.success(`Кошелек пополнен на ${Number(topUpAmount).toLocaleString('ru-RU')} UZS!`);
            setTopUpModal(false); setTopUpAmount(''); setTopUpCardId('');
            const fresh = await api.getWallet().catch(() => null);
            if (fresh) setWallet(fresh);
        } catch { toast.error('Ошибка пополнения. Попробуйте позже.'); }
        finally { setActionLoading(false); }
    };

    const handleTopUpClick = () => {
        if (!topUpCardId) return toast.error('Выберите карту для пополнения');
        if (!topUpAmount || isNaN(topUpAmount) || Number(topUpAmount) <= 0) return toast.error('Введите корректную сумму');
        
        const selectedCard = cards.find(c => c.id === topUpCardId);
        if (selectedCard && selectedCard.balance > 0 && Number(topUpAmount) > selectedCard.balance) {
            return toast.error('Недостаточно средств на выбранной карте. Укажите сумму поменьше.');
        }

        setPinModal({ isOpen: true, action: handleTopUpConfirm, amount: topUpAmount, title: 'Пополнение кошелька' });
    };

    const handleTransferConfirm = async () => {
        setActionLoading(true);
        try {
            await api.walletTransfer({ recipientIdentifier: transferData.recipient, amount: Number(transferData.amount) });
            toast.success('Перевод выполнен!');
            setTransferModal(false); setTransferData({ recipient: '', amount: '' });
            const fresh = await api.getWallet().catch(() => null);
            if (fresh) setWallet(fresh);
        } catch { toast.error('Ошибка перевода. Проверьте данные.'); }
        finally { setActionLoading(false); }
    };

    const handleTransferClick = () => {
        if (!transferData.recipient || !transferData.amount || Number(transferData.amount) <= 0) return toast.error('Заполните все поля');
        if (Number(transferData.amount) > walletBalance) return toast.error('Недостаточно средств на кошельке');
        setPinModal({ isOpen: true, action: handleTransferConfirm, amount: transferData.amount, title: 'Перевод P2P' });
    };

    const handleWithdrawConfirm = async () => {
        setActionLoading(true);
        try {
            // In a real app, this would be a POST to /api/wallet/withdraw
            await api.walletTransfer({ recipientIdentifier: 'INTERNAL_BANK_BRIDGE', amount: Number(withdrawAmount) });
            
            if (withdrawCardId) {
                setCards(prev => prev.map(c => c.id === withdrawCardId ? { ...c, balance: (Number(c.balance) || 0) + Number(withdrawAmount) } : c));
            }
            
            toast.success(`Средства в размере ${Number(withdrawAmount).toLocaleString('ru-RU')} UZS выведены на карту!`);
            setWithdrawModal(false); setWithdrawAmount(''); setWithdrawCardId('');
            const fresh = await api.getWallet().catch(() => null);
            if (fresh) setWallet(fresh);
        } catch { toast.error('Ошибка вывода. Попробуйте позже.'); }
        finally { setActionLoading(false); }
    };

    const handleWithdrawClick = () => {
        if (!withdrawCardId) return toast.error('Выберите карту для вывода');
        if (!withdrawAmount || isNaN(withdrawAmount) || Number(withdrawAmount) <= 0) return toast.error('Введите корректную сумму');
        if (Number(withdrawAmount) > walletBalance) return toast.error('Недостаточно средств в кошельке');

        setPinModal({ isOpen: true, action: handleWithdrawConfirm, amount: withdrawAmount, title: 'Вывод на карту' });
    };

    const formatDate = (s) => new Date(s).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

    if (loading) return (
        <div className="min-h-screen bg-[#0F0D1A] flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-purple-500 rounded-full" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0F0D1A] text-slate-200 font-sans flex">
            {/* ── Sidebar ── */}
            <aside className="hidden lg:flex flex-col w-64 bg-[#13111C] border-r border-white/5 p-6 shrink-0 sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/30">
                        <Wallet size={18} className="text-white" />
                    </div>
                    <span className="font-black text-white tracking-wide text-sm">Autohouse</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 mb-8">
                    <img
                        src={profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=7c3aed&color=fff`}
                        alt="Avatar" className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <div className="text-sm font-bold text-white">{profile?.name || 'My Account'}</div>
                        <div className="text-xs text-purple-400">Premium Member</div>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    {SIDEBAR.map(({ icon: Icon, label, path, active }) => (
                        <Link key={label} to={path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <Icon size={18} />{label}
                        </Link>
                    ))}
                </nav>
                <div className="pt-6 border-t border-white/5">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-3">Support</p>
                    <button className="w-full py-2.5 px-4 rounded-xl bg-purple-600/10 text-purple-400 text-sm font-bold hover:bg-purple-600/20 transition-colors flex items-center gap-2">
                        <MessageSquare size={16} /> Help Center
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="flex-1 overflow-y-auto">
                <header className="sticky top-0 z-10 bg-[#0F0D1A]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black text-white">{isBusinessMode ? 'Бизнес-Кошелек' : 'Financial Wallet'}</h1>
                        <p className="text-xs text-slate-500">{isBusinessMode ? 'Управление доходами компании' : 'Manage your funds and cards'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {isPartner && (
                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 hidden sm:flex">
                                <button 
                                    onClick={() => setIsBusinessMode(false)}
                                    className={`px-4 py-1.5 text-[11px] font-bold rounded-lg uppercase tracking-wider transition-all ${!isBusinessMode ? 'bg-[#1E1B2E] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Личный
                                </button>
                                <button 
                                    onClick={() => setIsBusinessMode(true)}
                                    className={`px-4 py-1.5 text-[11px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center gap-1.5 ${isBusinessMode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <Building2 size={12} /> Бизнес
                                </button>
                            </div>
                        )}
                        <button className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white relative">
                            <Bell size={16} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full" />
                        </button>
                        <button onClick={() => setAddCardModal(true)}
                            className={`flex items-center gap-2 px-4 py-2 ${isBusinessMode ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/25'} text-white rounded-xl text-sm font-bold transition-all shadow-lg`}>
                            <Plus size={16} /> Добавить карту
                        </button>
                    </div>
                </header>

                <div className="p-6 grid lg:grid-cols-3 gap-6">
                    {/* ── Left col ── */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Total Balance Card */}
                        <div className={`relative rounded-3xl overflow-hidden p-8 shadow-2xl ${isBusinessMode ? 'bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 shadow-blue-900/40' : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-purple-900/40'}`}>
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.15),_transparent_60%)]" />
                            <div className="relative z-10">
                                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
                                    {isBusinessMode ? 'Доступно к выводу' : 'Общий баланс'}
                                </p>
                                {!isBusinessMode && cardsTotal > 0 && (
                                    <p className="text-white/50 text-[10px] mb-1">
                                        Кошелёк: {walletBalance.toLocaleString('ru-RU')} + Карты: {cardsTotal.toLocaleString('ru-RU')} UZS
                                    </p>
                                )}
                                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
                                    {isBusinessMode ? (walletBalance * 3.5).toLocaleString('ru-RU') : (walletBalance + cardsTotal).toLocaleString('ru-RU')} <span className="text-xl text-white/70 font-bold">UZS</span>
                                </h2>

                                {isBusinessMode && (
                                    <div className="flex gap-4 mb-6">
                                        <div>
                                            <p className="text-white/60 flex items-center gap-1 text-[10px] font-bold uppercase"><ShieldCheck size={12}/> В Холде (Escrow)</p>
                                            <p className="text-white text-sm font-black mt-0.5">{(walletBalance * 1.5).toLocaleString('ru-RU')} UZS</p>
                                        </div>
                                        <div className="w-px bg-white/20" />
                                        <div>
                                            <p className="text-white/60 flex items-center gap-1 text-[10px] font-bold uppercase"><ArrowUpRight size={12}/> Выручка за мес.</p>
                                            <p className="text-white text-sm font-black mt-0.5">{(walletBalance * 8).toLocaleString('ru-RU')} UZS</p>
                                        </div>
                                    </div>
                                )}
                                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
                                    <div>
                                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">{isBusinessMode ? 'Расчетный счет' : 'Account ID'}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-white font-mono text-sm font-bold bg-white/10 px-2 py-0.5 rounded backdrop-blur-md border border-white/10">{isBusinessMode ? '20208000900123456789' : accountId}</p>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(isBusinessMode ? '20208000900123456789' : accountId); toast.success('Скопировано!'); }}
                                                className="text-white/60 hover:text-white transition-colors"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest text-right">Статус</p>
                                        <p className="text-emerald-400 text-sm font-bold flex items-center gap-1 mt-1 justify-end">
                                            <ShieldCheck size={14} /> {isBusinessMode ? 'Активный IBAN' : 'Идентифицирован'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                            {[
                                { label: isBusinessMode ? 'Пополнить Р/С' : 'Top Up', icon: isBusinessMode ? ArrowDownLeft : Plus, action: () => setTopUpModal(true), color: isBusinessMode ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20' },
                                { label: isBusinessMode ? 'Выплата' : 'Transfer', icon: Send, action: () => setTransferModal(true), color: 'bg-[#1E1B2E] hover:bg-[#252236] border border-white/10' },
                                { label: isBusinessMode ? 'На IBAN' : 'Withdraw', icon: CreditCard, action: () => setWithdrawModal(true), color: 'bg-[#1E1B2E] hover:bg-[#252236] border border-white/10' },
                                { label: isBusinessMode ? 'Выставить Счет' : 'Request', icon: LinkIcon, action: () => setRequestModal(true), color: 'bg-[#1E1B2E] hover:bg-[#252236] border border-white/10' },
                                { label: 'QR Pay', icon: ArrowUpRight, isLink: true, path: '/qr-pay', color: 'bg-[#1E1B2E] hover:bg-[#252236] border border-white/10' },
                            ].map(({ label, icon: Icon, action, isLink, path, color }) => (
                                isLink ? (
                                    <Link key={label} to={path}
                                        className={`flex flex-col items-center gap-2 p-5 text-white rounded-2xl transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${color}`}>
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Icon size={20} /></div>
                                        <span className="text-sm font-bold">{label}</span>
                                    </Link>
                                ) : (
                                    <button key={label} onClick={action}
                                        className={`flex flex-col items-center gap-2 p-5 text-white rounded-2xl transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${color}`}>
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Icon size={20} /></div>
                                        <span className="text-sm font-bold">{label}</span>
                                    </button>
                                )
                            ))}
                        </div>

                        {/* Transactions */}
                        <div className="bg-[#13111C] rounded-3xl border border-white/5 overflow-hidden">
                            <div className="px-6 py-5 flex items-center justify-between border-b border-white/5">
                                <h2 className="text-base font-bold text-white">Transaction History</h2>
                                <span className="text-xs text-purple-400 font-bold">View all</span>
                            </div>
                            <div className="grid grid-cols-4 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 border-b border-white/5">
                                <span>Transaction</span><span>Category</span><span>Amount</span><span>Status</span>
                            </div>
                            <div className="divide-y divide-white/5">
                                {transactions.map(tx => {
                                    const { icon, title, displayAmount, isPositive, bgColor, iconColor } = getTxDetails(tx, accountId);
                                    return (
                                        <div 
                                            key={tx.id} 
                                            onClick={() => setReceiptModal({ ...tx, displayAmount, isPositive, generatedTitle: title })}
                                            className="grid grid-cols-4 items-center px-6 py-4 hover:bg-white/[0.04] cursor-pointer transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bgColor} ${iconColor} group-hover:scale-110 transition-transform`}>
                                                    {icon}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white truncate max-w-[130px] group-hover:text-purple-400 transition-colors">{title}</div>
                                                    <div className="text-[10px] text-slate-500">{formatDate(tx.date || tx.createdAt)}</div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg w-fit truncate max-w-[100px]">{tx.category || tx.type}</span>
                                            <span className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-white'}`}>
                                                {isPositive ? '+' : ''}{displayAmount.toLocaleString('ru-RU')} <span className="text-[10px] text-slate-500">UZS</span>
                                            </span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg w-fit ${tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                {tx.status === 'COMPLETED' ? 'Выполнен' : 'Ожидание'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── Right col ── */}
                    <div className="space-y-6">
                        {/* Linked Cards */}
                        <div className="bg-[#13111C] rounded-3xl border border-white/5 p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-base font-bold text-white">Мои карты</h2>
                                <button onClick={() => setAddCardModal(true)}
                                    className="w-7 h-7 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center hover:bg-purple-600/40 transition-colors">
                                    <Plus size={14} />
                                </button>
                            </div>

                            {cards.length > 0 ? (
                                <div className="space-y-4">
                                    {cards.map(card => (
                                        <CardChip key={card.id} card={card} onRemove={handleRemoveCard} />
                                    ))}
                                </div>
                            ) : (
                                <button onClick={() => setAddCardModal(true)}
                                    className="w-full h-32 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-purple-500/40 hover:bg-white/[0.02] transition-all group">
                                    <Plus size={20} className="text-slate-600 group-hover:text-purple-400 mb-2 transition-colors" />
                                    <span className="text-xs text-slate-600 group-hover:text-purple-400 font-bold transition-colors">Добавить карту</span>
                                </button>
                            )}

                            {cards.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-xs text-slate-500 font-medium">{cards.length} карт(а) привязано</span>
                                    <span className="text-xs font-black text-white">{cardsTotal.toLocaleString('ru-RU')} UZS</span>
                                </div>
                            )}
                        </div>

                        {/* Cashback & Rewards */}
                        <div className="bg-gradient-to-br from-purple-900/40 to-[#13111C] rounded-3xl border border-purple-500/20 p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
                            <div className="flex items-start justify-between relative z-10 mb-4">
                                <div>
                                    <h2 className="text-base font-bold text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                            <ShoppingBag size={14} />
                                        </div>
                                        Кешбэк & Бонусы
                                    </h2>
                                    <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-bold">Заработано за всё время</p>
                                </div>
                            </div>
                            <div className="relative z-10 mb-5">
                                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                                    {Math.round(totalBalance * 0.015).toLocaleString('ru-RU')}
                                </span>
                                <span className="text-sm text-emerald-500/70 font-bold ml-2">UZS</span>
                            </div>
                            <div className="relative z-10 bg-[#13111C]/80 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-slate-400 font-bold">Текущий уровень</span>
                                    <span className="text-xs text-purple-400 font-black">1% на всё</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-[35%] shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                </div>
                                <p className="text-[9px] text-slate-500 mt-2 text-center uppercase tracking-widest font-bold">Осталось 4,500,000 UZS до 2% Кешбэка</p>
                            </div>
                        </div>

                        {/* Subscriptions / Автоплатежи */}
                        <div className="bg-[#13111C] rounded-3xl border border-white/5 p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-base font-bold text-white flex items-center gap-2">
                                    Автоплатежи
                                </h2>
                                <button className="text-xs text-purple-400 font-bold hover:text-purple-300 transition-colors">
                                    Все
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                                            <ShieldCheck size={18} className="text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Страховка OSAGO</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Списание 15-го числа</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">-120,000 UZS</p>
                                        <div className="flex items-center justify-end gap-1 mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            <span className="text-[9px] text-emerald-400 uppercase font-bold tracking-widest">Активен</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                            <Car size={18} className="text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Premium Подписка</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Ежедневное обновление</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">-15,000 UZS</p>
                                        <div className="flex items-center justify-end gap-1 mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            <span className="text-[9px] text-emerald-400 uppercase font-bold tracking-widest">Активен</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shared Goals / Сбор средств */}
                        <div className="bg-[#13111C] rounded-3xl border border-white/5 p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-base font-bold text-white">Совместные Цели</h2>
                                <button className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20 transition-colors">
                                    <Plus size={14} />
                                </button>
                            </div>
                            
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 group hover:bg-white/[0.07] transition-all cursor-pointer">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-white">На новую машину 🚗</h3>
                                        <p className="text-[10px] text-slate-500 mt-1">Осталось: 15,000,000 UZS</p>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText('autohouse.uz/goals/car'); toast.success('Ссылка на сбор скопирована!'); }} className="text-slate-400 hover:text-white transition-colors" title="Поделиться">
                                        <LinkIcon size={14} />
                                    </button>
                                </div>
                                
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                                    <div className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: '70%' }} />
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        <img src="https://ui-avatars.com/api/?name=T+M&background=3b82f6&color=fff&size=64" className="w-6 h-6 rounded-full border border-[#13111C]" alt="Cont1" />
                                        <img src="https://ui-avatars.com/api/?name=A+S&background=10b981&color=fff&size=64" className="w-6 h-6 rounded-full border border-[#13111C]" alt="Cont2" />
                                        <div className="w-6 h-6 rounded-full border border-[#13111C] bg-white/20 flex items-center justify-center text-[9px] text-white font-bold backdrop-blur-md">+2</div>
                                    </div>
                                    <div className="text-xs font-black text-white">
                                        35M <span className="text-[10px] text-slate-500 font-bold">/ 50M</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Spending Breakdown */}
                        <div className="bg-[#13111C] rounded-3xl border border-white/5 p-6 hidden lg:block">
                            <h2 className="text-base font-bold text-white mb-5">Spending Breakdown</h2>
                            <div className="space-y-4">
                                {SPENDING.map(({ label, percent, color }) => (
                                    <div key={label}>
                                        <div className="flex justify-between mb-1.5">
                                            <span className="text-xs text-slate-400 font-medium">{label}</span>
                                            <span className="text-xs font-bold text-white">{percent}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-3">
                                <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-emerald-400">Secure Transactions</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">256-bit SSL encryption active.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── Add Card Modal ── */}
            <Modal isOpen={addCardModal} onClose={() => setAddCardModal(false)} title={isBusinessMode ? "Добавить расчетный счет" : "Добавить банковскую карту"}>
                <div className="space-y-4">
                    {/* Live card preview */}
                    {newCard.number && !isBusinessMode && (
                        <div className={`rounded-2xl p-5 bg-gradient-to-br ${
                            detectCardType(newCard.number) === 'VISA' ? 'from-indigo-700 to-blue-700 shadow-blue-500/30' :
                            detectCardType(newCard.number) === 'MASTERCARD' ? 'from-orange-700 to-red-700 shadow-orange-500/30' :
                            detectCardType(newCard.number) === 'UZCARD' ? 'from-slate-700 to-slate-600 shadow-slate-500/30' :
                            detectCardType(newCard.number) === 'HUMO' ? 'from-emerald-700 to-teal-700 shadow-emerald-500/30' :
                            'from-purple-700 to-indigo-700 shadow-purple-500/30'
                        } mb-2 shadow-2xl transition-all`}>
                            <div className="flex justify-between items-start mb-4">
                                <CreditCard size={20} className="text-white/60" />
                                <span className="text-[10px] font-black text-white/90 uppercase tracking-widest px-2 py-0.5 bg-white/10 rounded backdrop-blur-sm">{detectCardType(newCard.number)}</span>
                            </div>
                            <p className="font-mono text-white text-base tracking-widest mb-3">{newCard.number || '0000 0000 0000 0000'}</p>
                            <div className="flex justify-between">
                                <span className="text-white/80 text-xs uppercase font-medium">{newCard.holder || 'ИМЯ ФАМИЛИЯ'}</span>
                                <span className="text-white/80 text-xs font-medium">{newCard.expiry || 'MM/YY'}</span>
                            </div>
                        </div>
                    )}

                    {newCard.number && isBusinessMode && (
                        <div className="rounded-2xl p-5 bg-gradient-to-br from-blue-900 to-[#13111C] border border-blue-500/20 mb-2 shadow-xl shadow-blue-900/20">
                            <div className="flex justify-between items-start mb-4">
                                <Building2 size={20} className="text-blue-400" />
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-2 py-0.5 bg-blue-500/10 rounded">Р/С (IBAN)</span>
                            </div>
                            <p className="font-mono text-white text-sm tracking-wider mb-2 break-all">{newCard.number || '2020 8000 9000 0000 0000'}</p>
                            <div className="flex justify-between border-t border-white/10 pt-3 mt-1">
                                <div>
                                    <p className="text-white/40 text-[9px] uppercase tracking-widest font-bold">Организация</p>
                                    <span className="text-white/80 text-xs uppercase font-medium mt-0.5">{newCard.holder || 'ООО КОМПАНИЯ'}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/40 text-[9px] uppercase tracking-widest font-bold">МФО</p>
                                    <span className="text-white/80 text-xs font-medium mt-0.5">{newCard.mfo || '00000'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Inputs */}
                    {!isBusinessMode ? (
                        <>
                            <div className="relative">
                                <label className="block text-xs text-slate-400 mb-1.5 font-bold uppercase tracking-widest">Номер карты</label>
                                <div className="relative">
                                    <input
                                        type="text" inputMode="numeric" maxLength={19}
                                        value={newCard.number}
                                        onChange={e => setNewCard(p => ({ ...p, number: formatCardInput(e.target.value) }))}
                                        placeholder="0000 0000 0000 0000"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-16 py-3 text-white font-mono text-sm focus:outline-none focus:border-purple-500 transition-colors"
                                    />
                                    {newCard.number.length > 2 && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black px-2 py-1 bg-white/10 text-white rounded uppercase tracking-widest">
                                            {detectCardType(newCard.number)}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5 font-bold uppercase tracking-widest">Имя держателя</label>
                                <input
                                    type="text"
                                    value={newCard.holder}
                                    onChange={e => setNewCard(p => ({ ...p, holder: e.target.value.toUpperCase() }))}
                                    placeholder="IVAN IVANOV"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5 font-bold uppercase tracking-widest">Срок (ММ/ГГ)</label>
                                    <input
                                        type="text" maxLength={5}
                                        value={newCard.expiry}
                                        onChange={e => {
                                            let v = e.target.value.replace(/\D/g, '');
                                            if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                                            setNewCard(p => ({ ...p, expiry: v }));
                                        }}
                                        placeholder="MM/YY"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5 font-bold uppercase tracking-widest">CVV</label>
                                    <input
                                        type="password" maxLength={3}
                                        value={newCard.cvv}
                                        onChange={e => setNewCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '') }))}
                                        placeholder="•••"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>
                            <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl flex items-start gap-3">
                                <ShieldCheck size={16} className="text-purple-400 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                    Текущий баланс карты будет автоматически загружен и синхронизирован с банком после привязки.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1.5 font-bold uppercase tracking-widest">Номер счета (IBAN)</label>
                                <input
                                    type="text" inputMode="numeric" maxLength={20}
                                    value={newCard.number}
                                    onChange={e => setNewCard(p => ({ ...p, number: e.target.value.replace(/\D/g, '') }))}
                                    placeholder="20208000900000000000"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs text-slate-400 mb-1.5 font-bold uppercase tracking-widest">Название компании</label>
                                    <input
                                        type="text"
                                        value={newCard.holder}
                                        onChange={e => setNewCard(p => ({ ...p, holder: e.target.value.toUpperCase() }))}
                                        placeholder="ООО АВТОХАУС"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1.5 font-bold uppercase tracking-widest">МФО Банка</label>
                                    <input
                                        type="text" inputMode="numeric" maxLength={5}
                                        value={newCard.mfo}
                                        onChange={e => setNewCard(p => ({ ...p, mfo: e.target.value.replace(/\D/g, '') }))}
                                        placeholder="00014"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-start gap-3">
                                <ShieldCheck size={16} className="text-blue-400 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                    Ваш корпоративный счет будет привязан к личному кабинету после проверки реквизитов.
                                </p>
                            </div>
                        </>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setAddCardModal(false)} className="flex-1 py-3 border border-white/10 rounded-xl text-slate-400 hover:text-white text-sm font-bold transition-colors">
                            Отмена
                        </button>
                        <button onClick={handleAddCard} className={`flex-1 py-3 rounded-xl text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 ${isBusinessMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-purple-600 hover:bg-purple-500'}`}>
                            <Check size={16} /> Добавить
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Top Up Modal ── */}
            <Modal isOpen={topUpModal} onClose={() => setTopUpModal(false)} title="Пополнить кошелёк">
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-bold uppercase tracking-widest">Выберите карту</label>
                        {cards.length > 0 ? (
                            <select 
                                value={topUpCardId} 
                                onChange={e => setTopUpCardId(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 appearance-none"
                            >
                                <option value="" className="bg-[#1E1B2E]">-- Выберите карту --</option>
                                {cards.map(c => (
                                    <option key={c.id} value={c.id} className="bg-[#1E1B2E]">
                                        {c.type} •••• {c.number.slice(-4)} {c.balance > 0 ? `(${Number(c.balance).toLocaleString('ru-RU')} UZS)` : ''}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="text-sm text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                                У вас нет привязанных карт. Сначала добавьте карту в кошелек.
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-bold uppercase tracking-widest">Сумма (UZS)</label>
                        <input type="number" value={topUpAmount} onChange={e => setTopUpAmount(e.target.value)} placeholder="500000"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500" />
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setTopUpModal(false)} className="flex-1 py-3 border border-white/10 rounded-xl text-slate-400 hover:text-white text-sm font-bold transition-colors">Отмена</button>
                        <button onClick={handleTopUpClick} disabled={actionLoading || cards.length === 0} className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Пополнить
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Transfer Modal ── */}
            <Modal isOpen={transferModal} onClose={() => setTransferModal(false)} title="Перевод средств">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-bold uppercase tracking-widest">Получатель</label>
                        <input type="text" value={transferData.recipient} onChange={e => setTransferData(p => ({ ...p, recipient: e.target.value }))} placeholder="+998..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-bold uppercase tracking-widest">Сумма (UZS)</label>
                        <input type="number" value={transferData.amount} onChange={e => setTransferData(p => ({ ...p, amount: e.target.value }))} placeholder="1000000"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setTransferModal(false)} className="flex-1 py-3 border border-white/10 rounded-xl text-slate-400 hover:text-white text-sm font-bold transition-colors">Отмена</button>
                        <button onClick={handleTransferClick} disabled={actionLoading} className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2">
                            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Отправить
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Withdraw Modal ── */}
            <Modal isOpen={withdrawModal} onClose={() => setWithdrawModal(false)} title="Вывод на карту">
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-bold uppercase tracking-widest">Выберите карту для зачисления</label>
                        {cards.length > 0 ? (
                            <select 
                                value={withdrawCardId} 
                                onChange={e => setWithdrawCardId(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 appearance-none"
                            >
                                <option value="" className="bg-[#1E1B2E]">-- Выберите карту --</option>
                                {cards.map(c => (
                                    <option key={c.id} value={c.id} className="bg-[#1E1B2E]">
                                        {c.type} •••• {c.number.slice(-4)}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="text-sm text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                                У вас нет привязанных карт для вывода.
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-bold uppercase tracking-widest">Сумма вывода (UZS)</label>
                        <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="100000"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500" />
                        <p className="text-[10px] text-slate-500 mt-1">Доступно: {walletBalance.toLocaleString('ru-RU')} UZS</p>
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setWithdrawModal(false)} className="flex-1 py-3 border border-white/10 rounded-xl text-slate-400 hover:text-white text-sm font-bold transition-colors">Отмена</button>
                        <button onClick={handleWithdrawClick} disabled={actionLoading || cards.length === 0} className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpRight size={16} />} Вывести
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Receipt Modal ── */}
            <Modal isOpen={!!receiptModal} onClose={() => setReceiptModal(null)} title="Квитанция об операции">
                {receiptModal && (
                    <div className="relative">
                        <div className="bg-[#13111C] rounded-2xl p-6 border border-white/10 relative overflow-hidden">
                            {/* Receipt Header Pattern */}
                            <div className="absolute top-0 left-0 right-0 h-1 flex justify-around opacity-20">
                                {[...Array(20)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full border border-white"></div>)}
                            </div>
                            
                            <div className="text-center mb-8 pt-4">
                                <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                                    <FileText size={32} className="text-purple-400" />
                                </div>
                                <h3 className="text-2xl font-black text-white">{receiptModal.generatedTitle}</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-2">Электронный Чек</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-white/5 border-dashed">
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Сумма:</span>
                                    <span className={`text-lg font-black ${receiptModal.isPositive ? 'text-emerald-400' : 'text-white'}`}>
                                        {receiptModal.isPositive ? '+' : ''}{receiptModal.displayAmount.toLocaleString('ru-RU')} <span className="text-xs text-slate-500 uppercase">UZS</span>
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-white/5 border-dashed">
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Статус:</span>
                                    <span className={`text-xs font-black uppercase tracking-widest ${receiptModal.status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {receiptModal.status === 'COMPLETED' ? 'Выполнен' : receiptModal.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-white/5 border-dashed">
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Дата и время:</span>
                                    <span className="text-sm font-bold text-white tracking-widest">{formatDate(receiptModal.date || receiptModal.createdAt)}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-white/5 border-dashed">
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">ID Транзакции:</span>
                                    <span className="text-xs font-mono font-bold text-slate-400">TX-{receiptModal.id}</span>
                                </div>
                                {(receiptModal.senderId || receiptModal.receiverId) && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                                            {receiptModal.senderId === accountId ? 'Отправлено на ID:' : 'Получено от ID:'}
                                        </span>
                                        <span className="text-sm font-bold text-white tracking-widest">
                                            {receiptModal.senderId === accountId ? receiptModal.receiverId : receiptModal.senderId}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 h-1 flex justify-around opacity-20">
                                {[...Array(20)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full border border-white"></div>)}
                            </div>
                        </div>

                        <div className="mt-6">
                            <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white text-sm font-bold transition-all flex items-center justify-center gap-2 border border-white/10">
                                <Download size={18} /> Сохранить чек (PDF)
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ── Request Modal ── */}
            <Modal isOpen={requestModal} onClose={() => setRequestModal(false)} title="Запросить средства">
                <div className="space-y-4">
                    <p className="text-xs text-slate-400 mb-4">Сгенерируйте ссылку на онлайн-оплату. Отправьте её тому, от кого ждёте перевод.</p>
                    
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-bold uppercase tracking-widest">Сумма (UZS)</label>
                        <input type="number" value={requestData.amount} onChange={e => setRequestData(p => ({ ...p, amount: e.target.value }))} placeholder="Например: 500000"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500" />
                    </div>
                    
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-bold uppercase tracking-widest">Назначение (необязательно)</label>
                        <input type="text" value={requestData.desc} onChange={e => setRequestData(p => ({ ...p, desc: e.target.value }))} placeholder="Например: Залог за аренду"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500" />
                    </div>

                    {requestData.amount && Number(requestData.amount) > 0 && (
                        <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                            <label className="block text-[10px] text-emerald-400 mb-2 font-bold uppercase tracking-widest">Ваша ссылка для оплаты</label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 overflow-x-auto bg-[#13111C] px-3 py-2 rounded-lg border border-white/5 text-xs font-mono text-slate-300 whitespace-nowrap">
                                    https://autohouse.uz/pay?to={accountId}&amount={requestData.amount}
                                </div>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(`https://autohouse.uz/pay?to=${accountId}&amount=${requestData.amount}`);
                                        toast.success('Ссылка скопирована!');
                                    }}
                                    className="w-10 h-10 shrink-0 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg flex items-center justify-center transition-colors"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="pt-2">
                        <button onClick={() => setRequestModal(false)} className="w-full py-4 border border-white/10 rounded-xl text-slate-400 hover:text-white text-sm font-bold transition-colors">Закрыть</button>
                    </div>
                </div>
            </Modal>
            
            <PinModal 
                isOpen={pinModal.isOpen} 
                onClose={() => setPinModal({ isOpen: false, action: null, amount: null, title: '' })}
                onSuccess={() => { if (pinModal.action) pinModal.action(); }}
                actionName={pinModal.title}
                amount={pinModal.amount}
            />
        </div>
    );
}
