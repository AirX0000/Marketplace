import React, { useState } from 'react';
import { Building2, Percent, Calendar, Wallet, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Data stored with localized strings
const BANKS_DATA = [
    {
        name: { uz: "Халқ банки", ru: "Народный банк (Xalq banki)" },
        primary: { percent: "17%", term: { uz: "20 йилгача", ru: "до 20 лет" }, initial: { uz: "15% дан", ru: "от 15%" }, max: { uz: "420 млн сўмгача", ru: "до 420 млн сум" } },
        secondary: { percent: "25%", term: { uz: "15 йил", ru: "15 лет" }, initial: { uz: "25%", ru: "25%" }, max: { uz: "800 млн сўмгача", ru: "до 800 млн сум" } }
    },
    {
        name: { uz: "Азия Альянс Банк", ru: "Азия Альянс Банк" },
        primary: { percent: "18%", term: { uz: "20 йилгача", ru: "до 20 лет" }, initial: { uz: "15% дан", ru: "от 15%" }, max: { uz: "420 млн сўмгача", ru: "до 420 млн сум" } },
        secondary: { percent: "26%", term: { uz: "15 йил", ru: "15 лет" }, initial: { uz: "26% дан", ru: "от 26%" }, max: { uz: "1 млрд 318 млн сўмгача", ru: "до 1 млрд 318 млн сум" } }
    },
    {
        name: { uz: "БРБ", ru: "БРБ (BRB)" },
        primary: { percent: "17.5% - 18%", term: { uz: "20 йилгача", ru: "до 20 лет" }, initial: { uz: "15% - 25%", ru: "15% - 25%" }, max: { uz: "420 млн сўмгача", ru: "до 420 млн сум" } },
        secondary: { percent: "24.5% - 26%", term: { uz: "15 йилгача", ru: "до 15 лет" }, initial: { uz: "20% дан", ru: "от 20%" }, max: { uz: "2 млрд 60 млн сўмгача", ru: "до 2 млрд 60 млн сум" } }
    },
    {
        name: { uz: "Гарант банк", ru: "Гарант банк" },
        primary: null,
        secondary: { percent: "26% - 28%", term: { uz: "20 йилгача", ru: "до 20 лет" }, initial: { uz: "25% - 45%", ru: "25% - 45%" }, max: { uz: "420 млн сўмгача", ru: "до 420 млн сум" } }
    },
    {
        name: { uz: "Тенге Банк", ru: "Тенге Банк" },
        primary: { percent: "23.9% - 24.9%", term: { uz: "15 йилгача", ru: "до 15 лет" }, initial: { uz: "25% дан", ru: "от 25%" }, max: { uz: "820 млн сўмгача", ru: "до 820 млн сум" } },
        secondary: { percent: "24.6%", term: { uz: "10 йилгача", ru: "до 10 лет" }, initial: { uz: "28% дан", ru: "от 28%" }, max: { uz: "820 млн сўмгача", ru: "до 820 млн сум" } }
    },
    {
        name: { uz: "Ипак Йўли Банк", ru: "Ипак Йули Банк" },
        primary: { percent: "16.5% - 17.5%", term: { uz: "20 йилгача", ru: "до 20 лет" }, initial: { uz: "5% - 15%", ru: "5% - 15%" }, max: { uz: "420 млн сўмгача", ru: "до 420 млн сум" } },
        secondary: { percent: "23% - 24.9%", term: { uz: "15 йил", ru: "15 лет" }, initial: { uz: "25% - 50%", ru: "25% - 50%" }, max: { uz: "1.5 млрд сўмгача", ru: "до 1.5 млрд сум" } }
    },
    {
        name: { uz: "МКБанк", ru: "МКБанк" },
        primary: { percent: "18%", term: { uz: "20 йилгача", ru: "до 20 лет" }, initial: { uz: "15% дан", ru: "от 15%" }, max: { uz: "420 млн сўмгача", ru: "до 420 млн сум" } },
        secondary: { percent: "24% - 26%", term: { uz: "20 йилгача", ru: "до 20 лет" }, initial: { uz: "25% дан", ru: "от 25%" }, max: { uz: "1 млрд 648 млн сўмгача", ru: "до 1 млрд 648 млн сум" } }
    },
    {
        name: { uz: "Ўзмиллийбанк", ru: "Узнацбанк (NBU)" },
        primary: { percent: "17% - 17.5%", term: { uz: "20 йилгача", ru: "до 20 лет" }, initial: { uz: "15% - 40%", ru: "15% - 40%" }, max: { uz: "420 млн сўмгача", ru: "до 420 млн сум" } },
        secondary: { percent: "21.5% - 22%", term: { uz: "20 йилгача", ru: "до 20 лет" }, initial: { uz: "25% дан", ru: "от 25%" }, max: { uz: "800 млн сўмгача", ru: "до 800 млн сум" } }
    },
    {
        name: { uz: "Туронбанк", ru: "Туронбанк" },
        primary: { percent: "17% - 18%", term: { uz: "20 йилгача", ru: "до 20 лет" }, initial: { uz: "15% - 70%", ru: "15% - 70%" }, max: { uz: "420 млн сўмгача", ru: "до 420 млн сум" } },
        secondary: { percent: "26%", term: { uz: "10 йилгача", ru: "до 10 лет" }, initial: { uz: "20% - 30%", ru: "20% - 30%" }, max: { uz: "1 млрд 648 млн сўмгача", ru: "до 1 млрд 648 млн сум" } }
    },
    {
        name: { uz: "Асакабанк", ru: "Асакабанк" },
        primary: { percent: "20%", term: { uz: "20 йилгача", ru: "до 20 лет" }, initial: { uz: "25% дан", ru: "от 25%" }, max: { uz: "800 млн сўмгача", ru: "до 800 млн сум" } },
        secondary: { percent: "24.5%", term: { uz: "10 йилгача", ru: "до 10 лет" }, initial: { uz: "25%", ru: "25%" }, max: { uz: "800 млн сўмгача", ru: "до 800 млн сум" } }
    },
    {
        name: { uz: "ЎзСҚБ", ru: "Узпромстройбанк (SQB)" },
        primary: { percent: "19%", term: { uz: "20 йилгача", ru: "до 20 лет" }, initial: { uz: "25% дан", ru: "от 25%" }, max: { uz: "800 млн сўмгача", ru: "до 800 млн сум" } },
        secondary: { percent: "23.5% - 24.5%", term: { uz: "15 йилгача", ru: "до 15 лет" }, initial: { uz: "20% дан", ru: "от 20%" }, max: { uz: "1.5 млрд сўмгача", ru: "до 1.5 млрд сум" } }
    }
];

export function MortgageInfoPage() {
    const { i18n } = useTranslation();
    const isRu = i18n.language === 'ru';

    const [marketType, setMarketType] = useState('primary'); // 'primary' | 'secondary'

    const tString = (obj) => {
        if (!obj) return '';
        if (typeof obj === 'string') return obj;
        return isRu ? obj.ru : obj.uz;
    };

    const text = {
        title: isRu ? 'Ипотечные Кредиты' : 'Ипотека Кредитлари',
        desc: isRu ? 'Самая актуальная информация по ипотечным кредитам для первичного и вторичного рынков. Подготовлено на основе данных от ответственных сотрудников головных офисов банков.' : 'Бирламчи ва иккиламчи бозор учун ипотека кредитлари бўйича энг сўнгги маълумотлар. Банкларнинг бош офис масъул ходимлари томонидан берилган маълумот асосида тайёрланди.',
        primaryToggle: isRu ? 'Первичный Рынок' : 'Бирламчи Бозор',
        secondaryToggle: isRu ? 'Вторичный Рынок' : 'Иккиламчи Бозор',
        percentLbl: isRu ? 'Процент' : 'Фоизи',
        termLbl: isRu ? 'Срок' : 'Муддати',
        initialLbl: isRu ? 'Первоначальный взнос' : 'Бошланғич тўлов',
        maxLbl: isRu ? 'Сумма' : 'Миқдори',
        detailsBtn: isRu ? 'Подробнее' : 'Батафсил',
        extraTitle: isRu ? 'Дополнительная информация' : 'Қўшимча маълумотлар',
        extraText1: isRu ? '◾️ Список вкладов в долларах США и СУМ' : '◾️ АҚШ доллари ва СЎМдаги омонатлар рўйхати',
        extraText2: isRu ? '◾️ Список микрозаймов (Скоро)' : '◾️ Микроқарзлар рўйхати (Тез кунда қўшилади)',
        viewHousesBtn: isRu ? 'Смотреть дома' : 'Уйларни кўриш',
        realEstateTag: isRu ? 'Недвижимость' : 'Кўчмас мулк'
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* Header / Hero */}
            <div className="bg-emerald-600 text-white py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-emerald-50 text-xs font-semibold uppercase tracking-wider mb-6">
                        <Building2 size={16} />
                        {text.realEstateTag}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                        {text.title}
                    </h1>
                    <p className="text-emerald-100 max-w-2xl text-lg mb-8">
                        {text.desc}
                    </p>

                    {/* Toggle */}
                    <div className="inline-flex p-1 bg-black/20 backdrop-blur-md rounded-2xl flex-wrap">
                        <button
                            onClick={() => setMarketType('primary')}
                            className={`px-6 md:px-8 py-3 rounded-xl font-bold transition-all ${marketType === 'primary' ? 'bg-white text-emerald-600 shadow-lg scale-100' : 'text-white/80 hover:bg-white/10 hover:text-white scale-95'}`}
                        >
                            {text.primaryToggle}
                        </button>
                        <button
                            onClick={() => setMarketType('secondary')}
                            className={`px-6 md:px-8 py-3 rounded-xl font-bold transition-all ${marketType === 'secondary' ? 'bg-white text-emerald-600 shadow-lg scale-100' : 'text-white/80 hover:bg-white/10 hover:text-white scale-95'}`}
                        >
                            {text.secondaryToggle}
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
                                            <span className="text-sm font-medium">{text.percentLbl}</span>
                                        </div>
                                        <div className="font-bold text-slate-900 dark:text-white">{tString(data.percent)}</div>
                                    </div>

                                    {/* Term */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                                                <Calendar size={14} className="text-blue-500" />
                                            </div>
                                            <span className="text-sm font-medium">{text.termLbl}</span>
                                        </div>
                                        <div className="font-bold text-slate-900 dark:text-white">{tString(data.term)}</div>
                                    </div>

                                    {/* Initial Payment */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                                                <Wallet size={14} className="text-purple-500" />
                                            </div>
                                            <span className="text-sm font-medium">{text.initialLbl}</span>
                                        </div>
                                        <div className="font-bold text-slate-900 dark:text-white">{tString(data.initial)}</div>
                                    </div>

                                    {/* Max Amount */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                                                <CheckCircle2 size={14} className="text-orange-500" />
                                            </div>
                                            <span className="text-sm font-medium">{text.maxLbl}</span>
                                        </div>
                                        <div className="font-bold text-emerald-600">{tString(data.max)}</div>
                                    </div>
                                </div>

                                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 font-semibold hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                                    {text.detailsBtn} <ChevronRight size={16} />
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
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{text.extraTitle}</h4>
                            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl">
                                {text.extraText1} <br />
                                {text.extraText2}
                            </p>
                        </div>
                    </div>
                    <Link to="/marketplaces?category=Недвижимость" className="shrink-0 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25">
                        {text.viewHousesBtn}
                    </Link>
                </div>
            </div>
        </div>
    );
}
