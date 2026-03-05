import React, { useState } from 'react';
import { Building2, Percent, Calendar, Wallet, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const BANKS_DATA = [
    {
        name: "Халқ банки",
        primary: { percent: "17%", term: "20 йилгача", initial: "15% дан", max: "420 млн сўмгача" },
        secondary: { percent: "25%", term: "15 йил", initial: "25%", max: "800 млн сўмгача" }
    },
    {
        name: "Азия Альянс Банк",
        primary: { percent: "18%", term: "20 йилгача", initial: "15% дан", max: "420 млн сўмгача" },
        secondary: { percent: "26%", term: "15 йил", initial: "26% дан", max: "1 млрд 318 млн сўмгача" }
    },
    {
        name: "БРБ",
        primary: { percent: "17.5% - 18%", term: "20 йилгача", initial: "15% - 25%", max: "420 млн сўмгача" },
        secondary: { percent: "24.5% - 26%", term: "15 йилгача", initial: "20% дан", max: "2 млрд 60 млн сўмгача" }
    },
    {
        name: "Гарант банк",
        primary: null,
        secondary: { percent: "26% - 28%", term: "20 йилгача", initial: "25% - 45%", max: "420 млн сўмгача" }
    },
    {
        name: "Тенге Банк",
        primary: { percent: "23.9% - 24.9%", term: "15 йилгача", initial: "25% дан", max: "820 млн сўмгача" },
        secondary: { percent: "24.6%", term: "10 йилгача", initial: "28% дан", max: "820 млн сўмгача" }
    },
    {
        name: "Ипак Йули Банк",
        primary: { percent: "16.5% - 17.5%", term: "20 йилгача", initial: "5% - 15%", max: "420 млн сўмгача" },
        secondary: { percent: "23% - 24.9%", term: "15 йил", initial: "25% - 50%", max: "1.5 млрд сўмгача" }
    },
    {
        name: "МКБанк",
        primary: { percent: "18%", term: "20 йилгача", initial: "15% дан", max: "420 млн сўмгача" },
        secondary: { percent: "24% - 26%", term: "20 йилгача", initial: "25% дан", max: "1 млрд 648 млн сўмгача" }
    },
    {
        name: "Ўзмиллийбанк",
        primary: { percent: "17% - 17.5%", term: "20 йилгача", initial: "15% - 40%", max: "420 млн сўмгача" },
        secondary: { percent: "21.5% - 22%", term: "20 йилгача", initial: "25% дан", max: "800 млн сўмгача" }
    },
    {
        name: "Туронбанк",
        primary: { percent: "17% - 18%", term: "20 йилгача", initial: "15% - 70%", max: "420 млн сўмгача" },
        secondary: { percent: "26%", term: "10 йилгача", initial: "20% - 30%", max: "1 млрд 648 млн сўмгача" }
    },
    {
        name: "Асакабанк",
        primary: { percent: "20%", term: "20 йилгача", initial: "25% дан", max: "800 млн сўмгача" },
        secondary: { percent: "24.5%", term: "10 йилгача", initial: "25%", max: "800 млн сўмгача" }
    },
    {
        name: "ЎзСҚБ",
        primary: { percent: "19%", term: "20 йилгача", initial: "25% дан", max: "800 млн сўмгача" },
        secondary: { percent: "23.5% - 24.5%", term: "15 йилгача", initial: "20% дан", max: "1.5 млрд сўмгача" }
    }
];

export function MortgageInfoPage() {
    const [marketType, setMarketType] = useState('primary'); // 'primary' | 'secondary'

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* Header / Hero */}
            <div className="bg-emerald-600 text-white py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-emerald-50 text-xs font-semibold uppercase tracking-wider mb-6">
                        <Building2 size={16} />
                        Недвижимость
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                        Ипотека Кредитлари
                    </h1>
                    <p className="text-emerald-100 max-w-2xl text-lg mb-8">
                        Бирламчи ва иккиламчи бозор учун ипотека кредитлари бўйича энг сўнгги маълумотлар. Банкларнинг бош офис масъул ходимлари томонидан берилган маълумот асосида тайёрланди.
                    </p>

                    {/* Toggle */}
                    <div className="inline-flex p-1 bg-black/20 backdrop-blur-md rounded-2xl">
                        <button
                            onClick={() => setMarketType('primary')}
                            className={`px-6 md:px-8 py-3 rounded-xl font-bold transition-all ${marketType === 'primary' ? 'bg-white text-emerald-600 shadow-lg scale-100' : 'text-white/80 hover:bg-white/10 hover:text-white scale-95'}`}
                        >
                            Бирламчи Бозор
                        </button>
                        <button
                            onClick={() => setMarketType('secondary')}
                            className={`px-6 md:px-8 py-3 rounded-xl font-bold transition-all ${marketType === 'secondary' ? 'bg-white text-emerald-600 shadow-lg scale-100' : 'text-white/80 hover:bg-white/10 hover:text-white scale-95'}`}
                        >
                            Иккиламчи Бозор
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {BANKS_DATA.filter(b => b[marketType] !== null).map((bank, idx) => {
                        const data = bank[marketType];
                        return (
                            <div key={idx} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:-translate-y-1 transition-transform group">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                        {bank.name}
                                    </h3>
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                        🏦
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    {/* Percent */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                                                <Percent size={14} className="text-emerald-600" />
                                            </div>
                                            <span className="text-sm font-medium">Фоизи</span>
                                        </div>
                                        <div className="font-bold text-slate-900 dark:text-white">{data.percent}</div>
                                    </div>

                                    {/* Term */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                                                <Calendar size={14} className="text-blue-500" />
                                            </div>
                                            <span className="text-sm font-medium">Муддати</span>
                                        </div>
                                        <div className="font-bold text-slate-900 dark:text-white">{data.term}</div>
                                    </div>

                                    {/* Initial Payment */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                                                <Wallet size={14} className="text-purple-500" />
                                            </div>
                                            <span className="text-sm font-medium">Бошланғич тўлов</span>
                                        </div>
                                        <div className="font-bold text-slate-900 dark:text-white">{data.initial}</div>
                                    </div>

                                    {/* Max Amount */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                                                <CheckCircle2 size={14} className="text-orange-500" />
                                            </div>
                                            <span className="text-sm font-medium">Миқдори</span>
                                        </div>
                                        <div className="font-bold text-emerald-600">{data.max}</div>
                                    </div>
                                </div>

                                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 font-semibold hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                                    Батафсил <ChevronRight size={16} />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Additional Info / Footer */}
                <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-blue-100 dark:border-blue-800/50">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
                            <Info size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Қўшимча маълумотлар</h4>
                            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl">
                                ◾️ АҚШ доллари ва СЎМдаги омонатлар рўйхати <br />
                                ◾️ Микроқарзлар рўйхати (Тез кунда қўшилади)
                            </p>
                        </div>
                    </div>
                    <Link to="/marketplaces?category=Недвижимость" className="shrink-0 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25">
                        Уйларни кўриш
                    </Link>
                </div>
            </div>
        </div>
    );
}
