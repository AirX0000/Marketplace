import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Wallet, Send, Plus, History, QrCode, ArrowUpRight, ArrowDownLeft, CreditCard, ChevronRight, Settings, Smartphone, Bitcoin, CircleDollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function AutohousePayDashboard() {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWallet();
    }, []);

    async function loadWallet() {
        try {
            const data = await api.getWallet();
            setWallet(data);
        } catch (error) {
            console.error("Wallet load failed", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-[#13111C] flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-purple-500 rounded-full"></div>
        </div>
    );

    // Mock data if no real wallet exists for visual purposes
    const balance = wallet ? wallet.balance : 8450000;
    const accountId = wallet ? wallet.accountId : 'AH-2891-XXX';

    return (
        <div className="min-h-screen bg-[#13111C] text-slate-200 font-sans pb-20">
            {/* Header / Nav */}
            <header className="bg-[#191624] border-b border-white/5 sticky top-0 z-10 hidden md:block">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-600 outline outline-1 outline-offset-1 outline-purple-500/50 rounded flex items-center justify-center text-white">
                                <Wallet size={16} />
                            </div>
                            <span className="font-bold text-white tracking-widest text-sm">AUTOHOUSE PAY</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="text-slate-400 hover:text-white transition-colors relative">
                            <History size={20} />
                        </button>
                        <button className="text-slate-400 hover:text-white transition-colors">
                            <Settings size={20} />
                        </button>
                        <div className="w-px h-6 bg-white/10 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-bold text-white">Alexander M.</div>
                                <div className="text-xs text-purple-400">Premium Member</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[#252236] border border-white/10 overflow-hidden">
                                <img src="https://i.pravatar.cc/100?img=33" alt="Profile" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">Digital Wallet</h1>
                        <p className="text-sm text-slate-400">Manage your cards, crypto assets, and recent transactions.</p>
                    </div>
                    <div className="flex bg-[#191624] p-1.5 rounded-xl border border-white/5">
                        <button className="px-6 py-2 rounded-lg text-sm font-bold bg-[#2A273D] text-white shadow-sm">Overview</button>
                        <button className="px-6 py-2 rounded-lg text-sm font-bold text-slate-400 hover:text-white transition-colors">Cards</button>
                        <button className="px-6 py-2 rounded-lg text-sm font-bold text-slate-400 hover:text-white transition-colors">Crypto</button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">

                    {/* Left Column: Cards & Assets */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Section: My Cards */}
                        <section>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-white">Payment Methods</h2>
                                <button className="text-sm text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 transition-colors">
                                    <Plus size={16} /> Add New
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Digital Card 1 (Visa Black) */}
                                <div className="group relative">
                                    {/* Hover Glow */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>

                                    <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden h-[220px] flex flex-col justify-between border border-white/10 transform transition-transform duration-500 group-hover:scale-[1.02]">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
                                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full -ml-16 -mb-16 blur-xl pointer-events-none"></div>

                                        <div className="relative z-10 flex justify-between items-start">
                                            <div className="flex gap-2 items-center">
                                                {/* Chip */}
                                                <div className="w-10 h-8 rounded shrink-0 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 opacity-80 flex items-center justify-center overflow-hidden relative">
                                                    <div className="absolute inset-0 border border-yellow-800/30 rounded"></div>
                                                    <div className="w-full h-px bg-yellow-800/20 absolute top-1/2 -translate-y-1/2"></div>
                                                    <div className="w-full h-px bg-yellow-800/20 absolute top-1/3"></div>
                                                    <div className="w-full h-px bg-yellow-800/20 absolute bottom-1/3"></div>
                                                </div>
                                                <Smartphone size={20} className="text-slate-400" />
                                            </div>
                                            {/* Visa Pattern/Logo */}
                                            <div className="text-xl font-bold italic tracking-widest opacity-90 drop-shadow-md">VISA</div>
                                        </div>

                                        <div className="relative z-10 mt-auto">
                                            <div className="text-2xl font-mono tracking-[0.2em] mb-4 text-white/90 drop-shadow-sm">···· ···· ···· 4289</div>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <div className="opacity-50 text-[10px] uppercase tracking-widest mb-1 font-bold">Card Holder</div>
                                                    <div className="font-bold tracking-widest text-sm uppercase">Alexander M.</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="opacity-50 text-[10px] uppercase tracking-widest mb-1 font-bold">Expires</div>
                                                    <div className="font-bold tracking-widest text-sm">12/26</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Set as Default Badge */}
                                    <div className="absolute -top-3 -right-3 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full border-4 border-[#13111C] shadow-lg flex items-center gap-1 z-20">
                                        <Check size={10} strokeWidth={4} /> Default
                                    </div>
                                </div>

                                {/* Digital Card 2 (Apple Pay Style) */}
                                <div className="group relative">
                                    <div className="bg-gradient-to-br from-[#2D2B3D] to-[#1E1B29] rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden h-[220px] flex flex-col justify-between border border-white/5 transform transition-transform duration-500 group-hover:scale-[1.02]">
                                        <div className="relative z-10 flex justify-between items-start">
                                            <div className="w-12 h-8 rounded bg-white/10 flex items-center justify-center">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
                                            </div>
                                            <div className="flex items-center gap-1 bg-black/30 px-3 py-1 rounded-full">
                                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                                <span className="text-xs font-bold text-emerald-400">Connected</span>
                                            </div>
                                        </div>

                                        <div className="relative z-10 flex flex-col items-center justify-center flex-grow">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                                {/* Apple Logo SVG Placeholder */}
                                                <svg viewBox="0 0 384 512" width="28" height="28"><path fill="black" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.3 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.3zM34.4 46.2C69 4 102.6 5.6 119.3 6.9c-2.3 35.8-22.1 72.8-54.8 95.8-5.3 3.8-12.8 8.8-20.9 12.3-5-32.9 20.3-67.4 33.3-80.4 12.5-12.4-42.5-13.8-42.5-13.8z" /></svg>
                                            </div>
                                            <div className="text-lg font-bold">Apple Pay</div>
                                            <div className="text-xs text-slate-400 mt-1">Ready for contactless</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section: Crypto Assets */}
                        <section>
                            <h2 className="text-lg font-bold text-white mb-6">Digital Assets</h2>

                            <div className="bg-[#191624] rounded-3xl border border-white/5 overflow-hidden">
                                {/* Header */}
                                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1D1A2A]">
                                    <div>
                                        <div className="text-sm font-medium text-slate-400 mb-1">Total Portfolio Value</div>
                                        <div className="text-3xl font-black text-white">$142,500.00 <span className="text-sm text-emerald-400 font-bold ml-2">↑ 2.4%</span></div>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                                        <QrCode size={20} />
                                    </div>
                                </div>

                                {/* Asset List */}
                                <div className="divide-y divide-white/5">
                                    {/* Bitcoin Row */}
                                    <div className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#F7931A]/10 rounded-2xl flex items-center justify-center text-[#F7931A]">
                                                <Bitcoin size={24} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white mb-0.5">Bitcoin</div>
                                                <div className="text-xs font-medium text-slate-500">BTC</div>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-4">
                                            <div>
                                                <div className="font-bold text-white mb-0.5">2.450</div>
                                                <div className="text-xs font-medium text-slate-500">$98,000.00</div>
                                            </div>
                                            <ChevronRight size={18} className="text-slate-600 group-hover:text-purple-400 transition-colors" />
                                        </div>
                                    </div>

                                    {/* USDT Row */}
                                    <div className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#26A17B]/10 rounded-2xl flex items-center justify-center text-[#26A17B]">
                                                <CircleDollarSign size={24} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white mb-0.5">Tether</div>
                                                <div className="text-xs font-medium text-slate-500">USDT (TRC20)</div>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-4">
                                            <div>
                                                <div className="font-bold text-white mb-0.5">44,500.00</div>
                                                <div className="text-xs font-medium text-slate-500">$44,500.00</div>
                                            </div>
                                            <ChevronRight size={18} className="text-slate-600 group-hover:text-purple-400 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Right Column: Transactions & Actions */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Quick Actions (Compact) */}
                        <div className="grid grid-cols-2 gap-4">
                            <button className="bg-purple-600 hover:bg-purple-500 text-white rounded-2xl p-4 transition-colors text-left group shadow-[0_0_20px_rgba(147,51,234,0.15)] hover:shadow-[0_0_30px_rgba(147,51,234,0.3)]">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <ArrowUpRight size={20} />
                                </div>
                                <div className="font-bold text-sm">Send Funds</div>
                                <div className="text-xs text-purple-200 mt-1">To wallet or bank</div>
                            </button>
                            <button className="bg-[#191624] hover:bg-[#201C2E] border border-white/5 text-white rounded-2xl p-4 transition-colors text-left group">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-emerald-400">
                                    <ArrowDownLeft size={20} />
                                </div>
                                <div className="font-bold text-sm">Receive</div>
                                <div className="text-xs text-slate-500 mt-1">Show QR code</div>
                            </button>
                        </div>

                        {/* Recent Transactions List */}
                        <div className="bg-[#191624] rounded-3xl border border-white/5 p-6 h-[500px] flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="font-bold text-white text-lg">Recent Transactions</h2>
                                <button className="text-xs font-bold text-purple-400 hover:text-purple-300">View All</button>
                            </div>

                            <div className="space-y-1 overflow-y-auto pr-2 -mr-2 flex-grow scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {/* Mock TX 1 */}
                                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                                            <Car size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-white mb-0.5">Ferrari Roma Spider</div>
                                            <div className="text-[10px] font-medium text-slate-500">Today, 14:32 • Vehicle Purchase</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-sm text-white">-3,850M UZS</div>
                                        <div className="text-[10px] font-medium text-slate-500">Completed</div>
                                    </div>
                                </div>

                                {/* Mock TX 2 */}
                                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                                            <ArrowDownLeft size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-white mb-0.5">Deposit via USDT</div>
                                            <div className="text-[10px] font-medium text-slate-500">Yesterday, 09:15 • Crypto Top-up</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-sm text-emerald-400">+125,000 USDT</div>
                                        <div className="text-[10px] font-medium text-slate-500">Completed</div>
                                    </div>
                                </div>

                                {/* Mock TX 3 */}
                                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                                            <Settings size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-white mb-0.5">Premium Subscription</div>
                                            <div className="text-[10px] font-medium text-slate-500">Oct 20, 11:00 • Autohouse Pro</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-sm text-white">-1,500,000 UZS</div>
                                        <div className="text-[10px] font-medium text-slate-500">Completed</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-500/10 text-slate-400 flex items-center justify-center shrink-0">
                                            <History size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-white mb-0.5">Insurance Payment</div>
                                            <div className="text-[10px] font-medium text-slate-500">Oct 15, 08:30 • CASCO</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-sm text-white">-50,000 UZS</div>
                                        <div className="text-[10px] font-medium text-slate-500">Completed</div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
