import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

// ─── Context ────────────────────────────────────────────────────────────────
const ConfirmContext = createContext(null);

// ─── Provider (wrap in App.jsx) ──────────────────────────────────────────────
export function ConfirmProvider({ children }) {
    const [dialog, setDialog] = useState(null); // { message, resolve, variant }

    const confirm = useCallback((message, { variant = 'danger', title } = {}) => {
        return new Promise((resolve) => {
            setDialog({ message, title, variant, resolve });
        });
    }, []);

    const handleClose = (result) => {
        dialog?.resolve(result);
        setDialog(null);
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {dialog && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
                    onClick={() => handleClose(false)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-150"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                            dialog.variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'
                        }`}>
                            {dialog.variant === 'danger'
                                ? <Trash2 className="h-6 w-6 text-red-600" />
                                : <AlertTriangle className="h-6 w-6 text-amber-600" />
                            }
                        </div>

                        {/* Title */}
                        {dialog.title && (
                            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-1">
                                {dialog.title}
                            </h3>
                        )}

                        {/* Message */}
                        <p className="text-sm text-slate-600 dark:text-slate-400 text-center leading-relaxed mb-6">
                            {dialog.message}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleClose(false)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={() => handleClose(true)}
                                className={`flex-1 py-2.5 rounded-xl font-bold text-white transition-colors shadow-lg ${
                                    dialog.variant === 'danger'
                                        ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                                        : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                                }`}
                            >
                                Подтвердить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
    return ctx;
}
