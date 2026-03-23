import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import {
    Wallet, Send, Plus, ArrowUpRight, ArrowDownLeft, CreditCard,
    LayoutDashboard, Car, ShoppingBag, MessageSquare, Settings,
    Bell, Building2, ShieldCheck, TrendingUp, X, Loader2, LogOut, Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';

const MOCK_TRANSACTIONS = [
    { id: 1, title: 'BMW M4 Maintenance', category: 'Service', amount: -4200000, status: 'COMPLETED', date: '2023-10-24T14:20:00', icon: '🔧' },
    { id: 2, title: 'Wallet Top-Up', category: 'Deposit', amount: +15000000, status: 'COMPLETED', date: '2023-10-22T09:15:00', icon: '➕' },
    { id: 3, title: 'Insurance Renewal', category: 'Insurance', amount: -2500000, status: 'PENDING', date: '2023-10-20T18:45:00', icon: '🔒' },
    { id: 4, title: 'Vehicle Sale Revenue', category: 'Revenue', amount: +120000000, status: 'COMPLETED', date: '2023-10-18T11:30:00', icon: '🚗' },
    { id: 5, title: 'Listing Premium Plan', category: 'Subscription', amount: -1500000, status: 'COMPLETED', date: '2023-10-15T08:00:00', icon: '⭐' },
];

const SPENDING_BREAKDOWN = [
    { label: 'Service & Repair', percent: 45, color: 'bg-indigo-500' },
    { label: 'Insurance', percent: 30, color: 'bg-rose-500' },
    { label: 'Marketplace Fees', percent: 25, color: 'bg-slate-600' },
];

const SIDEBAR_LINKS = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/profile' },
    { icon: Wallet, label: 'Wallet', path: '/wallet', active: true },
    { icon: Car, label: 'My Vehicles', path: '/profile' },
    { icon: ShoppingBag, label: 'Orders', path: '/orders' },
    { icon: MessageSquare, label: 'Messages', path: '/chat' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#1E1B2E] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

export function AutohousePayDashboard() {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [transactions, setTransactions] = useState([]);

    const [topUpModal, setTopUpModal] = useState(false);
    const [transferModal, setTransferModal] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [transferData, setTransferData] = useState({ recipient: '', amount: '' });
    const [actionLoading, setActionLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        async function load() {
            try {
                const [walletData, profileData] = await Promise.all([
                    api.getWallet().catch(() => null),
                    api.getProfile().catch(() => null),
                ]);
                setWallet(walletData);
                setProfile(profileData);

                // Try to load real transactions, fall back to mock
                const txSrc = walletData?.transactions || MOCK_TRANSACTIONS;
                setTransactions(txSrc);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const balance = wallet?.balance ?? 75450000;
    const accountId = wallet?.accountId ?? 'UZ82 0000 4512 8821 0932';

    const handleTopUp = async () => {
        if (!topUpAmount || isNaN(topUpAmount)) return toast.error('Введите корректную сумму');
        setActionLoading(true);
        try {
            await api.walletDeposit(Number(topUpAmount));
            toast.success(`Запрос на пополнение ${Number(topUpAmount).toLocaleString()} UZS отправлен!`);
            setTopUpModal(false);
            setTopUpAmount('');
            // Refresh wallet after deposit
            const fresh = await api.getWallet().catch(() => null);
            if (fresh) setWallet(fresh);
        } catch (e) {
            toast.error('Ошибка пополнения. Попробуйте позже.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleTransfer = async () => {
        if (!transferData.recipient || !transferData.amount) return toast.error('Заполните все поля');
        setActionLoading(true);
        try {
            await api.walletTransfer({ recipientIdentifier: transferData.recipient, amount: Number(transferData.amount) });
            toast.success('Перевод выполнен успешно!');
            setTransferModal(false);
            setTransferData({ recipient: '', amount: '' });
            const fresh = await api.getWallet().catch(() => null);
            if (fresh) setWallet(fresh);
        } catch (e) {
            toast.error('Ошибка перевода. Проверьте данные.');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#13111C] flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-purple-500 rounded-full"></div>
        </div>
    );

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-[#0F0D1A] text-slate-200 font-sans flex">
            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-[#13111C] border-r border-white/5 p-6 shrink-0 sticky top-0 h-screen">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/30">
                        <Wallet size={18} className="text-white" />
                    </div>
                    <span className="font-black text-white tracking-wide text-sm">Autohouse</span>
                </div>

                {/* User */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 mb-8">
                    <img
                        src={profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=7c3aed&color=fff`}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <div className="text-sm font-bold text-white">{profile?.name || 'My Account'}</div>
                        <div className="text-xs text-purple-400">Premium Member</div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-1">
                    {SIDEBAR_LINKS.map(({ icon: Icon, label, path, active }) => (
                        <Link
                            key={label}
                            to={path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon size={18} />
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* Support */}
                <div className="pt-6 border-t border-white/5">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-3">Support</p>
                    <button className="w-full py-2.5 px-4 rounded-xl bg-purple-600/10 text-purple-400 text-sm font-bold hover:bg-purple-600/20 transition-colors flex items-center gap-2">
                        <MessageSquare size={16} /> Help Center
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Top Bar */}
                <header className="sticky top-0 z-10 bg-[#0F0D1A]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black text-white">Financial Wallet</h1>
                        <p className="text-xs text-slate-500">Manage your funds and transaction history</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors relative">
                            <Bell size={16} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full"></span>
                        </button>
                        <button
                            onClick={() => setTopUpModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-600/25"
                        >
                            <Plus size={16} /> Connect Bank
                        </button>
                    </div>
                </header>

                <div className="p-6 grid lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Balance Card */}
                        <div className="relative rounded-3xl overflow-hidden p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-2xl shadow-purple-900/40">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2MmgxMHYtMmgtNHptMC0zMFY0aC0ydjRoLTRWNmgxMFY0aC00ek02IDM0di00SDR2NGgtNHYyaDEwdi0ySDZ6bTAtMzBWNEg0djRIMFY2aDEwVjZINnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
                            <div className="relative z-10">
                                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">Current Balance</p>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-4xl font-black text-white tracking-tight">
                                            {balance.toLocaleString('ru-RU')} <span className="text-2xl font-bold opacity-80">UZS</span>
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                                        <CreditCard size={22} className="text-white" />
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Account ID</p>
                                        <p className="text-white font-mono text-sm font-bold mt-1">{accountId}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest text-right">Card Status</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                            <span className="text-emerald-400 text-sm font-bold">Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => setTopUpModal(true)}
                                className="flex flex-col items-center gap-2 p-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Plus size={20} />
                                </div>
                                <span className="text-sm font-bold">Top Up</span>
                            </button>
                            <button
                                onClick={() => setTransferModal(true)}
                                className="flex flex-col items-center gap-2 p-5 bg-[#1E1B2E] hover:bg-[#252236] border border-white/10 text-white rounded-2xl transition-all hover:-translate-y-0.5"
                            >
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                    <Send size={20} />
                                </div>
                                <span className="text-sm font-bold">Transfer</span>
                            </button>
                            <button
                                onClick={() => toast.error('Для вывода обратитесь в поддержку')}
                                className="flex flex-col items-center gap-2 p-5 bg-[#1E1B2E] hover:bg-[#252236] border border-white/10 text-white rounded-2xl transition-all hover:-translate-y-0.5"
                            >
                                <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400">
                                    <ArrowUpRight size={20} />
                                </div>
                                <span className="text-sm font-bold">Withdraw</span>
                            </button>
                        </div>

                        {/* Transaction History */}
                        <div className="bg-[#13111C] rounded-3xl border border-white/5 overflow-hidden">
                            <div className="px-6 py-5 flex items-center justify-between border-b border-white/5">
                                <h2 className="text-base font-bold text-white">Transaction History</h2>
                                <Link to="/profile/history" className="text-xs text-purple-400 hover:text-purple-300 font-bold">View all</Link>
                            </div>

                            {/* Table Header */}
                            <div className="grid grid-cols-4 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 border-b border-white/5">
                                <span>Transaction</span>
                                <span>Category</span>
                                <span>Amount</span>
                                <span>Status</span>
                            </div>

                            <div className="divide-y divide-white/5">
                                {transactions.map((tx) => (
                                    <div key={tx.id} className="grid grid-cols-4 items-center px-6 py-4 hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center text-lg shrink-0">
                                                {tx.icon}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white truncate max-w-[120px]">{tx.title}</div>
                                                <div className="text-[10px] text-slate-500">{formatDate(tx.date)}</div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg w-fit">
                                            {tx.category}
                                        </span>
                                        <span className={`text-sm font-bold ${tx.amount >= 0 ? 'text-emerald-400' : 'text-white'}`}>
                                            {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString('ru-RU')} <span className="text-[10px] text-slate-500">UZS</span>
                                        </span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg w-fit ${tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                            {tx.status === 'COMPLETED' ? 'Завершён' : 'Ожидание'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Cards + Spending */}
                    <div className="space-y-6">
                        {/* Linked Cards */}
                        <div className="bg-[#13111C] rounded-3xl border border-white/5 p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-base font-bold text-white">Linked Cards</h2>
                                <button className="w-7 h-7 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center hover:bg-purple-600/40 transition-colors">
                                    <Plus size={14} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {/* Card 1 */}
                                <div className="bg-[#1E1B2E] border border-white/10 rounded-2xl p-4">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-8 h-6 bg-white/10 rounded flex items-center justify-center">
                                            <Building2 size={14} className="text-slate-400" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">VISA PLATINUM</span>
                                    </div>
                                    <p className="font-mono text-white text-sm tracking-widest mb-3">**** **** **** 8821</p>
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-400">{profile?.name?.toUpperCase() || 'ALEX JOHNSON'}</span>
                                        <span className="text-xs font-bold text-slate-400">12/26</span>
                                    </div>
                                </div>
                                {/* Card 2 */}
                                <div className="bg-[#1E1B2E] border border-white/10 rounded-2xl p-4">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-8 h-6 bg-white/10 rounded flex items-center justify-center">
                                            <Building2 size={14} className="text-slate-400" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">UZCARD</span>
                                    </div>
                                    <p className="font-mono text-white text-sm tracking-widest mb-3">**** **** **** 4092</p>
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-400">{profile?.name?.toUpperCase() || 'ALEX JOHNSON'}</span>
                                        <span className="text-xs font-bold text-slate-400">09/25</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Spending Breakdown */}
                        <div className="bg-[#13111C] rounded-3xl border border-white/5 p-6">
                            <h2 className="text-base font-bold text-white mb-5">Spending Breakdown</h2>
                            <div className="space-y-4">
                                {SPENDING_BREAKDOWN.map(({ label, percent, color }) => (
                                    <div key={label}>
                                        <div className="flex justify-between mb-1.5">
                                            <span className="text-xs text-slate-400 font-medium">{label}</span>
                                            <span className="text-xs font-bold text-white">{percent}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${color} rounded-full transition-all duration-1000`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-3">
                                <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-emerald-400">Secure Transactions</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">End-to-end encrypted banking protocol active.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- Top Up Modal --- */}
            <Modal isOpen={topUpModal} onClose={() => setTopUpModal(false)} title="Пополнить кошелёк">
                <div className="space-y-4">
                    <p className="text-sm text-slate-400">Введите сумму пополнения в UZS. После подтверждения администратором средства поступят на счёт.</p>
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-bold uppercase tracking-widest">Сумма (UZS)</label>
                        <input
                            type="number"
                            value={topUpAmount}
                            onChange={(e) => setTopUpAmount(e.target.value)}
                            placeholder="Например: 500000"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setTopUpModal(false)} className="flex-1 py-3 border border-white/10 rounded-xl text-slate-400 hover:text-white text-sm font-bold transition-colors">
                            Отмена
                        </button>
                        <button
                            onClick={handleTopUp}
                            disabled={actionLoading}
                            className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            Пополнить
                        </button>
                    </div>
                </div>
            </Modal>

            {/* --- Transfer Modal --- */}
            <Modal isOpen={transferModal} onClose={() => setTransferModal(false)} title="Перевод средств">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-bold uppercase tracking-widest">Получатель (телефон / email)</label>
                        <input
                            type="text"
                            value={transferData.recipient}
                            onChange={(e) => setTransferData(p => ({ ...p, recipient: e.target.value }))}
                            placeholder="+998..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-bold uppercase tracking-widest">Сумма (UZS)</label>
                        <input
                            type="number"
                            value={transferData.amount}
                            onChange={(e) => setTransferData(p => ({ ...p, amount: e.target.value }))}
                            placeholder="Например: 1000000"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setTransferModal(false)} className="flex-1 py-3 border border-white/10 rounded-xl text-slate-400 hover:text-white text-sm font-bold transition-colors">
                            Отмена
                        </button>
                        <button
                            onClick={handleTransfer}
                            disabled={actionLoading}
                            className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            Отправить
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
