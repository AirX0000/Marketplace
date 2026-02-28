import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MarketplaceCard } from '../MarketplaceCard';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';

export function RecentlyViewed() {
    const { t } = useTranslation();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        try {
            const data = JSON.parse(localStorage.getItem('viewHistory') || '[]');
            setHistory(data);
        } catch (e) {
            console.error("Failed to load history", e);
        }
    }, []);

    if (history.length === 0) return null;

    return (
        <section className="py-12 bg-card border-t border-border">
            <div className="container px-4">
                <div className="flex items-center gap-2 mb-8">
                    <Clock className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">
                        {t('common.recently_viewed', 'Вы недавно смотрели')}
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {history.map((item) => (
                        <MarketplaceCard key={item.id} marketplace={item} />
                    ))}
                </div>
            </div>
        </section>
    );
}
