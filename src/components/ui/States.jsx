import React from 'react';

export function LoadingState({ message = "Загрузка...", fullScreen = false }) {
    const Spinner = () => (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    );

    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            <Spinner />
            <p className="text-gray-600 text-sm">{message}</p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                {content}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            {content}
        </div>
    );
}

export function LoadingSkeleton({ type = 'card', count = 1 }) {
    const skeletons = {
        card: (
            <div className="bg-white rounded-lg shadow p-4 animate-pulse">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        ),
        list: (
            <div className="bg-white rounded-lg shadow p-4 mb-2 animate-pulse">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        ),
        table: (
            <div className="bg-white rounded-lg shadow animate-pulse">
                <div className="h-12 bg-gray-200 border-b"></div>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 border-b flex items-center px-4 gap-4">
                        <div className="h-4 bg-gray-200 rounded flex-1"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                ))}
            </div>
        ),
    };

    return (
        <>
            {[...Array(count)].map((_, i) => (
                <div key={i}>{skeletons[type]}</div>
            ))}
        </>
    );
}

export function ErrorState({ message = "Произошла ошибка", onRetry, fullScreen = false }) {
    const content = (
        <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
                <p className="text-gray-600">{message}</p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    Попробовать снова
                </button>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                {content}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            {content}
        </div>
    );
}

export function EmptyState({ message = "Нет данных", icon, action }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
            {icon || (
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
            )}
            <p className="text-gray-600 mb-4">{message}</p>
            {action}
        </div>
    );
}
