import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function ServiceGrid() {
    const { t } = useTranslation();
    return (
        <div className="flex justify-center gap-4 md:gap-10 mb-12 md:mb-16 pb-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 md:px-0 -mx-4 md:mx-0">

            {/* Auto */}
            <Link to="/marketplaces?category=Transport" className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-105 active:scale-95 snap-center shrink-0">
                <div className="w-[100px] h-[100px] md:w-32 md:h-32 bg-card rounded-[24px] md:rounded-3xl overflow-hidden shadow-xl shadow-blue-500/10 flex items-center justify-center group-hover:shadow-blue-500/30 transition-all border border-border relative">
                    <img
                        src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=400"
                        alt="Cars"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded-full text-[10px] text-white font-medium uppercase tracking-wider">
                        {t('home.auto', 'Авто')}
                    </div>
                </div>
            </Link>

            {/* Real Estate */}
            <Link to="/marketplaces?category=Недвижимость" className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-105 active:scale-95 snap-center shrink-0">
                <div className="w-[100px] h-[100px] md:w-32 md:h-32 bg-card rounded-[24px] md:rounded-3xl overflow-hidden shadow-xl shadow-emerald-500/10 flex items-center justify-center group-hover:shadow-emerald-500/30 transition-all border border-border relative">
                    <img
                        src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=400"
                        alt="Недвижимость"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded-full text-[10px] text-white font-medium uppercase tracking-wider">
                        {t('home.real_estate', 'Недвижимость')}
                    </div>
                </div>
            </Link>



            {/* Services (Услуги) */}
            <Link to="/marketplaces?category=Услуги" className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-105 active:scale-95 snap-center shrink-0">
                <div className="w-[100px] h-[100px] md:w-32 md:h-32 bg-card rounded-[24px] md:rounded-3xl overflow-hidden shadow-xl shadow-purple-500/10 flex items-center justify-center group-hover:shadow-purple-500/30 transition-all border border-border relative">
                    <img
                        src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400"
                        alt="Услуги"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded-full text-[10px] text-white font-medium uppercase tracking-wider">
                        {t('home.services', 'Услуги')}
                    </div>
                </div>
            </Link>
        </div>
    );
}
