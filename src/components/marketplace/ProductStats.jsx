import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Zap, Clock } from 'lucide-react';

const StatBadge = ({ icon: Icon, label, value, colorClass }) => (
    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group/stat relative overflow-hidden">
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className={`h-4 w-4 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <div className="relative z-10">
            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">{label}</div>
            <div className="text-xs font-black text-white uppercase tracking-tighter italic">{value}</div>
        </div>
    </div>
);

export const ProductStats = ({ marketplace }) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            <StatBadge 
                icon={Users} 
                label="Смотрят сейчас" 
                value="12 человек" 
                colorClass="bg-purple-500"
            />
            <StatBadge 
                icon={TrendingUp} 
                label="Интерес за 24ч" 
                value="+85%" 
                colorClass="bg-green-500"
            />
            <StatBadge 
                icon={Clock} 
                label="Опубликовано" 
                value="Сегодня, 10:45" 
                colorClass="bg-blue-500"
            />
            <StatBadge 
                icon={Zap} 
                label="Просмотров" 
                value={marketplace.views || 1024} 
                colorClass="bg-yellow-500"
            />
        </div>
    );
};
