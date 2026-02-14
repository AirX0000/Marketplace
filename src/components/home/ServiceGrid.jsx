import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, CarFront, Utensils, Wallet, Plane, Landmark } from 'lucide-react';

export function ServiceGrid() {
    return (
        <div className="flex justify-center gap-6 md:gap-10 mb-12 md:mb-16">

            {/* Auto */}
            <Link to="/marketplaces?category=Transport" className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-110 active:scale-95">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-blue-500/10 flex items-center justify-center group-hover:shadow-blue-500/30 transition-all border border-slate-100 dark:border-slate-700">
                    <CarFront className="w-10 h-10 md:w-12 md:h-12 text-blue-600" />
                </div>
            </Link>

            {/* Real Estate */}
            <Link to="/marketplaces?category=Real Estate" className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-110 active:scale-95">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-emerald-500/10 flex items-center justify-center group-hover:shadow-emerald-500/30 transition-all border border-slate-100 dark:border-slate-700">
                    <Landmark className="w-10 h-10 md:w-12 md:h-12 text-emerald-600" />
                </div>
            </Link>



        </div>
    );
}
