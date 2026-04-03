import React from 'react';
import { MarketplaceCardSkeleton } from './Skeleton';

export function ProductSkeleton({ className }) {
    // Re-use the premium MarketplaceCardSkeleton from Skeleton.jsx 
    // to ensure visual consistency across the app.
    return <MarketplaceCardSkeleton className={className} />;
}
