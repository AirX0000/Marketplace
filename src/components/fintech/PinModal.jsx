import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Delete } from 'lucide-react';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

export function PinModal({ isOpen, onClose, onSuccess, amount, actionName }) {
    const [pin, setPin] = useState('');
    const [isSetupMode, setIsSetupMode] = useState(false);
    const [setupPin1, setSetupPin1] = useState('');
    const [savedPin, setSavedPin] = useState(null);

    useEffect(() => {
        if (isOpen) {
            const stored = localStorage.getItem('autohouse_pay_pin');
            if (!stored) {
                setIsSetupMode(true);
            } else {
                setIsSetupMode(false);
                setSavedPin(stored);
            }
            setPin('');
            setSetupPin1('');
        }
    }, [isOpen]);

    const handleNumberClick = (num) => {
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            
            if (newPin.length === 4) {
                setTimeout(() => processPinBlock(newPin), 300);
            }
        }
    };

    const handleDeleteClick = () => {
        setPin(pin.slice(0, -1));
    };

    const processPinBlock = (enteredPin) => {
        if (isSetupMode) {
            if (!setupPin1) {
                setSetupPin1(enteredPin);
                setPin('');
                return;
            }
            // Confirming setup
            if (enteredPin === setupPin1) {
                localStorage.setItem('autohouse_pay_pin', btoa(enteredPin)); // Basic obfuscation
                toast.success('PIN-код успешно установлен');
                onSuccess();
                onClose();
            } else {
                toast.error('PIN-коды не совпадают. Попробуйте снова.');
                setSetupPin1('');
                setPin('');
            }
        } else {
            // Verifying
            if (btoa(enteredPin) === savedPin) {
                onSuccess();
                onClose();
            } else {
                toast.error('Неверный PIN-код');
                setPin('');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#191624] w-full max-w-sm rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center p-8 animate-in zoom-in-95 duration-300">
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-4 text-purple-500 shadow-[0_0_30px_rgba(147,51,234,0.2)]">
                    <ShieldCheck size={32} />
                </div>

                <h3 className="text-xl font-black text-white mb-2">
                    {isSetupMode ? (!setupPin1 ? 'Создайте PIN-код' : 'Повторите PIN-код') : 'Введите PIN-код'}
                </h3>
                
                {actionName && !isSetupMode && (
                    <div className="text-slate-400 text-sm mb-6 text-center">
                        Подтверждение: <span className="text-white font-bold">{actionName}</span>
                        {amount && <div className="text-purple-400 font-bold mt-1">{Number(amount).toLocaleString()} UZS</div>}
                    </div>
                )}
                {isSetupMode && (
                    <p className="text-slate-400 text-xs mb-6 text-center">
                        Код нужен для подтверждения будущих операций
                    </p>
                )}

                {/* PIN Dots */}
                <div className="flex gap-4 mb-8">
                    {[0, 1, 2, 3].map(i => (
                        <div 
                            key={i} 
                            className={cn(
                                "w-4 h-4 rounded-full transition-all duration-300",
                                pin.length > i ? "bg-purple-500 shadow-[0_0_10px_rgba(147,51,234,0.8)] scale-110" : "bg-white/10 border border-white/10"
                            )} 
                        />
                    ))}
                </div>

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-4 w-full px-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                            key={num}
                            onClick={() => handleNumberClick(num.toString())}
                            className="h-14 bg-white/5 hover:bg-white/10 active:bg-purple-600/30 active:scale-95 rounded-2xl text-xl font-bold text-white transition-all border border-white/5"
                        >
                            {num}
                        </button>
                    ))}
                    <div /> {/* Empty space bottom left */}
                    <button
                        onClick={() => handleNumberClick('0')}
                        className="h-14 bg-white/5 hover:bg-white/10 active:bg-purple-600/30 active:scale-95 rounded-2xl text-xl font-bold text-white transition-all border border-white/5"
                    >
                        0
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        className="h-14 flex items-center justify-center bg-transparent active:bg-red-500/20 active:scale-95 rounded-2xl text-slate-400 hover:text-white transition-all"
                    >
                        <Delete size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}
