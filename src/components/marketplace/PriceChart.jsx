import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import { format } from 'date-fns';
import { ru, uz } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

export function PriceChart({ data }) {
    const { t, i18n } = useTranslation();
    const currentLocale = i18n.language === 'uz' ? uz : ru;

    if (!data || data.length < 2) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-2xl border border-dashed border-border">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest text-center px-4">
                    {t('ads.no_price_history') || "История изменения цены пока недоступна"}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-2 text-center max-w-[200px]">
                    {t('ads.no_price_history_desc') || "График появится после первого изменения цены продавцом"}
                </p>
            </div>
        );
    }

    const formattedData = data.map(item => ({
        ...item,
        date: format(new Date(item.createdAt), 'd MMM', { locale: currentLocale }),
        fullDate: format(new Date(item.createdAt), 'd MMMM yyyy HH:mm', { locale: currentLocale }),
        price: item.price
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card/95 backdrop-blur-xl border border-border p-3 rounded-xl shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                        {payload[0].payload.fullDate}
                    </p>
                    <p className="text-sm font-black text-primary">
                        {payload[0].value.toLocaleString()} UZS
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-[240px] mt-4 min-h-[240px] min-w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedData}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--foreground), 0.05)" />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor', opacity: 0.5 }}
                        dy={10}
                    />
                    <YAxis 
                        hide 
                        domain={['dataMin - 1000', 'dataMax + 1000']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="var(--primary)" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
