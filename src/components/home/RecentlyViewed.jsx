import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MarketplaceCard } from '../MarketplaceCard';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { api } from '../../lib/api';

export function RecentlyViewed() {
    const { t } = useTranslation();
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const data = JSON.parse(localStorage.getItem('viewHistory') || '[]');
                if (data.length === 0) {
                    setIsLoading(false);
                    return;
                }

                const ids = data.map(item => item.id).join(',');
                const response = await api.getMarketplaces({ ids, limit: 12 });

                const activeListings = response.listings || [];
                const activeIds = new Set(activeListings.map(item => item.id));
                const validHistory = data.filter(item => activeIds.has(item.id));

                if (validHistory.length !== data.length) {
                    localStorage.setItem('viewHistory', JSON.stringify(validHistory));
                }

                const freshHistory = validHistory.map(item => {
                    const freshData = activeListings.find(listing => listing.id === item.id);
                    return freshData || item;
                });

                setHistory(freshHistory);
            } catch (e) {
                console.error("Failed to load or verify history", e);
                try {
                    const data = JSON.parse(localStorage.getItem('viewHistory') || '[]');
                    setHistory(data);
                } catch (err) { }
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecent();
    }, []);

    if (isLoading || history.length === 0) return null;

    return (
        <section className="py-12 bg-card border-t border-border">
            <div className="container">
                <div className="flex items-center gap-2 mb-8">
                    <Clock className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">
                        {t('common.recently_viewed', 'Вы недавно смотрели')}
                    </h2>
                </div>
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0 md:mx-0 md:px-0 no-scrollbar">
                    {history.map((item) => (
                        <div key={item.id} className="snap-center shrink-0 w-[280px] md:w-auto">
                            <MarketplaceCard marketplace={item} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
