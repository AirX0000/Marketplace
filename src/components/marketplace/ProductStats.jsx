import React from 'react';
import { Clock, Eye, Users, TrendingUp } from 'lucide-react';

const StatBadge = ({ icon: Icon, label, value, colorClass }) => (
    <div className="flex items-center gap-4 p-5 rounded-[24px] bg-[#191624]/60 backdrop-blur-xl border border-white/5 hover:border-white/10 transition-all shadow-xl group/stat relative overflow-hidden">
        <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className={`h-6 w-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <div className="relative z-10 flex flex-col justify-center">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</div>
            <div className="text-sm font-black text-white uppercase tracking-wider">{value}</div>
        </div>
    </div>
);

export const ProductStats = ({ marketplace }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'Недавно';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', { 
            day: 'numeric', month: 'short', year: 'numeric' 
        });
    };

    // Calculate pseudo-realistic deterministic numbers
    const views = marketplace.views || 0;
    const currentHour = new Date().getHours();
    const idHash = (marketplace.id?.toString().charCodeAt(0) || 1) + currentHour;
    
    // Base viewers on total views, minimum 1, max dynamic
    const watchingNow = Math.max(1, (idHash % 4) + Math.floor(views / 80));
    
    // Interest is positive pseudo-random
    const interest = Math.max(5, (idHash % 60) + Math.min(40, Math.floor(views / 10)));

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatBadge 
                icon={Users} 
                label="Смотрят сейчас" 
                value={`${watchingNow} человек`} 
                colorClass="bg-purple-500"
            />
            <StatBadge 
                icon={TrendingUp} 
                label="Интерес за 24ч" 
                value={`+${interest}%`} 
                colorClass="bg-emerald-500"
            />
            <StatBadge 
                icon={Clock} 
                label="Опубликовано" 
                value={formatDate(marketplace.createdAt)} 
                colorClass="bg-blue-500"
            />
            <StatBadge 
                icon={Eye} 
                label="Просмотров" 
                value={views.toLocaleString()} 
                colorClass="bg-yellow-500"
            />
        </div>
    );
};
