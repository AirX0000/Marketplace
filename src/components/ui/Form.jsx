import React from 'react';

export function FormField({ label, error, required, children, hint }) {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {children}
            {hint && !error && (
                <p className="mt-1 text-xs text-gray-500">{hint}</p>
            )}
            {error && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

export function Input({ error, ...props }) {
    const baseClasses = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition";
    const errorClasses = error
        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500";

    return (
        <input
            className={`${baseClasses} ${errorClasses}`}
            aria-invalid={!!error}
            {...props}
        />
    );
}

export function Textarea({ error, ...props }) {
    const baseClasses = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition resize-none";
    const errorClasses = error
        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500";

    return (
        <textarea
            className={`${baseClasses} ${errorClasses}`}
            aria-invalid={!!error}
            {...props}
        />
    );
}

export function Select({ error, children, ...props }) {
    const baseClasses = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition";
    const errorClasses = error
        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500";

    return (
        <select
            className={`${baseClasses} ${errorClasses}`}
            aria-invalid={!!error}
            {...props}
        >
            {children}
        </select>
    );
}

export function FormError({ message }) {
    if (!message) return null;

    return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{message}</span>
        </div>
    );
}

export function SubmitButton({ isLoading, children, loadingText = "Отправка...", ...props }) {
    return (
        <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {isLoading ? loadingText : children}
        </button>
    );
}
