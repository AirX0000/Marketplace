import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BottomNav } from '../components/BottomNav';
import { CompareWidget } from '../components/CompareWidget';
import { ChevronUp } from 'lucide-react';

function ScrollToTop() {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 400);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    if (!visible) return null;
    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Наверх"
            className="fixed bottom-24 right-6 z-50 w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center justify-center hover:shadow-primary/30"
        >
            <ChevronUp size={20} />
        </button>
    );
}

const pageVariants = {
    initial: { opacity: 0, y: 8 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -8 },
};
const pageTransition = { duration: 0.22, ease: 'easeInOut' };

export function RootLayout() {
    const location = useLocation();
    return (
        <div className="flex min-h-screen flex-col text-foreground">
            {/* Skip to content - Accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:shadow-lg"
            >
                Перейти к содержимому
            </a>

            <Header />
            <main id="main-content" className="flex-1 pb-20 md:pb-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                        className="h-full"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
            <BottomNav />
            <CompareWidget />
            <ScrollToTop />
            <Footer />
        </div>
    );
}
