import React from 'react';
import * as Sentry from '@sentry/react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        // Check for chunk loading error which typically happens after a new deploy
        const isChunkLoadFailed = error.name === 'ChunkLoadError' || 
            (error.message && (
                error.message.includes('Failed to fetch dynamically imported module') ||
                error.message.includes('Loading chunk') ||
                error.message.includes('MIME type of "text/html"')
            ));

        if (isChunkLoadFailed) {
            const hasReloaded = sessionStorage.getItem('chunk_load_error_reload');
            if (!hasReloaded) {
                sessionStorage.setItem('chunk_load_error_reload', 'true');
                window.location.reload();
                return;
            }
        }

        Sentry.captureException(error, { extra: errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#13111C] relative overflow-hidden">
                    {/* Background Gradients */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse" />
                    </div>

                    <div className="max-w-md w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 relative z-10 shadow-2xl">
                        <div className="flex items-center justify-center w-20 h-20 mx-auto bg-red-500/10 rounded-3xl mb-6 transform -rotate-6 border border-red-500/20">
                            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-black text-white text-center mb-4 uppercase italic tracking-tighter">Ой! Что-то пошло не так</h2>
                        <p className="text-indigo-100/60 text-center mb-8 font-medium leading-relaxed">
                            Произошла неожиданная ошибка. Наша команда уже уведомлена. Попробуйте обновить страницу или вернуться в каталог.
                        </p>
                        
                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/25"
                            >
                                Обновить страницу
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full h-14 bg-white/5 text-white border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                            >
                                Вернуться на главную
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
