import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function ServiceGrid() {
    const { t } = useTranslation();
    return (
        <div className="flex justify-center gap-4 md:gap-10 mb-12 md:mb-16 pb-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 md:px-0 -mx-4 md:mx-0">

            {/* Auto */}
            <Link to="/marketplaces?category=Transport" className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-105 active:scale-95 snap-center shrink-0">
                <div className="w-[85px] h-[85px] xs:w-[100px] xs:h-[100px] md:w-32 md:h-32 bg-card rounded-[24px] md:rounded-3xl overflow-hidden shadow-xl shadow-blue-500/10 flex items-center justify-center group-hover:shadow-blue-500/30 transition-all border border-border relative">
                    <img
                        src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=400"
                        alt="Cars"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
                <span className="mt-3 text-[10px] xs:text-xs md:text-sm font-bold text-foreground uppercase tracking-widest group-hover:text-primary transition-colors text-center">
                    {t('home.auto', 'Транспорт')}
                </span>
            </Link>

            {/* Real Estate */}
            <Link to="/marketplaces?category=Недвижимость" className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-105 active:scale-95 snap-center shrink-0">
                <div className="w-[85px] h-[85px] xs:w-[100px] xs:h-[100px] md:w-32 md:h-32 bg-card rounded-[24px] md:rounded-3xl overflow-hidden shadow-xl shadow-emerald-500/10 flex items-center justify-center group-hover:shadow-emerald-500/30 transition-all border border-border relative">
                    <img
                        src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=400"
                        alt="Недвижимость"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
                <span className="mt-3 text-[10px] xs:text-xs md:text-sm font-bold text-foreground uppercase tracking-widest group-hover:text-primary transition-colors text-center">
                    {t('home.real_estate', 'Недвижимость')}
                </span>
            </Link>

            {/* Services (Услуги) */}
            <Link to="/marketplaces?category=Услуги" className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-105 active:scale-95 snap-center shrink-0">
                <div className="w-[85px] h-[85px] xs:w-[100px] xs:h-[100px] md:w-32 md:h-32 bg-card rounded-[24px] md:rounded-3xl overflow-hidden shadow-xl shadow-purple-500/10 flex items-center justify-center group-hover:shadow-purple-500/30 transition-all border border-border relative">
                    <img
                        src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400"
                        alt="Услуги"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
                <span className="mt-3 text-[10px] xs:text-xs md:text-sm font-bold text-foreground uppercase tracking-widest group-hover:text-primary transition-colors text-center">
                    {t('home.services', 'Услуги')}
                </span>
            </Link>

            {/* Mortgage (Ипотека) */}
            <Link to="/mortgage" className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-105 active:scale-95 snap-center shrink-0">
                <div className="w-[85px] h-[85px] xs:w-[100px] xs:h-[100px] md:w-32 md:h-32 bg-card rounded-[24px] md:rounded-3xl overflow-hidden shadow-xl shadow-orange-500/10 flex items-center justify-center group-hover:shadow-orange-500/30 transition-all border border-border relative">
                    <img
                        src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400"
                        alt="Ипотека"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
                <span className="mt-3 text-[10px] xs:text-xs md:text-sm font-bold text-foreground uppercase tracking-widest group-hover:text-primary transition-colors text-center">
                    {t('home.mortgage', 'Ипотека')}
                </span>
            </Link>
        </div>
    );
}
