import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function getImageUrl(img) {
    if (!img) return null;
    
    if (Array.isArray(img)) {
        if (img.length === 0) return null;
        img = img[0];
    }
    
    try {
        if (typeof img === 'string' && (img.startsWith('[') || img.startsWith('"'))) {
            const parsed = JSON.parse(img);
            img = Array.isArray(parsed) ? parsed[0] : parsed;
        }
    } catch (e) {
        // Not JSON, continue with original string
    }
    
    if (typeof img !== 'string') return null;
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    
    const host = import.meta.env && import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.split('/api')[0] 
        : 'https://autohouse.uz';
        
    return `${host}${img.startsWith('/') ? '' : '/'}${img}`;
}
