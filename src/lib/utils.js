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
            if (Array.isArray(parsed) && parsed.length === 0) return null;
            img = Array.isArray(parsed) ? parsed[0] : parsed;
        }
    } catch (e) {
        // Not JSON, continue with original string
    }
    
    if (typeof img !== 'string') return null;
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    
    // Fallback if the image string is just a filename rather than a full path
    let url = img;
    if (!img.startsWith('/') && !img.startsWith('http')) {
        url = `/uploads/${img}`;
    }
    
    if (typeof window !== 'undefined' && url.startsWith('/')) {
        // If we're on localhost development server, use the localhost backend port (3000)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return `http://${window.location.hostname}:3000${url}`;
        }
        
        // In all other environments (DO monolith, etc), the backend and uploads
        // share the exact same origin as the frontend. 
        return `${window.location.origin}${url}`;
    }
    
    return url;
}
