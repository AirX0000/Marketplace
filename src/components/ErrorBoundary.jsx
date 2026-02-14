import React from 'react';

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
        // TODO: Send to logging service (Sentry, LogRocket, etc.)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-center mb-2">Что-то пошло не так</h2>
                        <p className="text-gray-600 text-center mb-6">
                            Произошла ошибка при загрузке страницы. Пожалуйста, попробуйте обновить страницу.
                        </p>
                        {process.env.NODE_ENV !== 'production' && this.state.error && (
                            <details className="mb-4">
                                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                    Детали ошибки
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                        <div className="flex gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                            >
                                Обновить страницу
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
                            >
                                На главную
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
