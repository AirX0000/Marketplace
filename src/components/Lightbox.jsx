import React, { useEffect, useCallback, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';

export function Lightbox({ images = [], startIndex = 0, onClose }) {
    const [current, setCurrent] = useState(startIndex);
    const [zoomed, setZoomed] = useState(false);
    const [touchStart, setTouchStart] = useState(null);

    const go = useCallback((dir) => {
        setZoomed(false);
        setCurrent(c => (c + dir + images.length) % images.length);
    }, [images.length]);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') go(1);
            if (e.key === 'ArrowLeft') go(-1);
        };
        document.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [go, onClose]);

    const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
    const handleTouchEnd = (e) => {
        if (!touchStart) return;
        const diff = touchStart - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) go(diff > 0 ? 1 : -1);
        setTouchStart(null);
    };

    if (!images.length) return null;
    const src = images[current];

    return (
        <div
            className="fixed inset-0 z-[999] bg-black/95 flex flex-col animate-in fade-in duration-200"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4 z-10">
                <span className="text-white/60 text-sm font-medium">{current + 1} / {images.length}</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setZoomed(z => !z)}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title={zoomed ? 'Уменьшить' : 'Увеличить'}
                    >
                        {zoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
                    </button>
                    <a
                        href={src}
                        download
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Скачать"
                    >
                        <Download size={18} />
                    </a>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/10 hover:bg-red-500/80 text-white transition-colors"
                        title="Закрыть (Esc)"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Main image */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden px-16">
                {images.length > 1 && (
                    <button
                        onClick={() => go(-1)}
                        className="absolute left-2 md:left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110"
                    >
                        <ChevronLeft size={28} />
                    </button>
                )}

                <img
                    src={src}
                    alt={`Фото ${current + 1}`}
                    className={`max-h-full max-w-full object-contain transition-all duration-300 select-none ${zoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
                    onClick={() => setZoomed(z => !z)}
                    draggable={false}
                />

                {images.length > 1 && (
                    <button
                        onClick={() => go(1)}
                        className="absolute right-2 md:right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110"
                    >
                        <ChevronRight size={28} />
                    </button>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex justify-center gap-2 px-6 py-4 overflow-x-auto scrollbar-none">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => { setCurrent(i); setZoomed(false); }}
                            className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${i === current ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-80'}`}
                        >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
