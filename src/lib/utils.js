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
    
    // The app runs as a unified monolithic deployment on DigitalOcean
    // Frontend and backend share the same domain and port.
    // Therefore, an absolute path (e.g. /uploads/...) will perfectly map to the backend.
    
    // Fallback if the image string is just a filename rather than a full path
    if (!img.startsWith('/') && !img.startsWith('http')) {
        return `/uploads/${img}`;
    }
    
    return img;
}
