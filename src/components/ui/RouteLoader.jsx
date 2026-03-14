import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress
nprogress.configure({ 
    showSpinner: false,
    easing: 'ease',
    speed: 500,
    minimum: 0.3
});

export const RouteLoader = () => {
    const location = useLocation();

    useEffect(() => {
        nprogress.start();
        
        const timer = setTimeout(() => {
            nprogress.done();
        }, 100); // Small delay to ensure it shows up

        return () => {
            clearTimeout(timer);
            nprogress.done();
        };
    }, [location]);

    return null;
};
