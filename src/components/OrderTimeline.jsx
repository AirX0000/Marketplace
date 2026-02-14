import React from 'react';
import { Check, Clock, Package, Truck, MapPin } from 'lucide-react';

export function OrderTimeline({ status, createdAt, updatedAt }) {
    const steps = [
        { key: 'placed', label: 'Order Placed', icon: Clock, statuses: ['CREATED', 'PENDING_PAYMENT'] },
        { key: 'processing', label: 'Processing', icon: Package, statuses: ['PAID', 'PROCESSING'] },
        { key: 'shipped', label: 'Shipped', icon: Truck, statuses: ['SHIPPED'] },
        { key: 'delivered', label: 'Delivered', icon: MapPin, statuses: ['COMPLETED'] }
    ];

    // Determine current active step index
    // We map the incoming status to one of our step keys
    const statusToStepIndex = {
        'CREATED': 0,
        'PENDING_PAYMENT': 0,
        'PAID': 1,
        'PROCESSING': 1,
        'SHIPPED': 2,
        'COMPLETED': 3,
        'CANCELLED': -1 // Special case
    };

    const currentStepIndex = statusToStepIndex[status] ?? 0;

    if (status === 'CANCELLED') {
        return (
            <div className="w-full py-4">
                <div className="flex items-center justify-center p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    <span className="font-bold">This order has been cancelled</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-6">
            <div className="relative flex items-center justify-between w-full">
                {/* Connecting Line - Background */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full" />

                {/* Connecting Line - Active Progress */}
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 -z-10 rounded-full transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.key} className="flex flex-col items-center relative group">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isCompleted
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : 'bg-white border-slate-200 text-slate-300'
                                    } ${isCurrent ? 'ring-4 ring-emerald-100 scale-110' : ''}`}
                            >
                                <Icon size={18} />
                            </div>

                            <div className="absolute top-12 text-center w-32 -left-11">
                                <div className={`text-xs font-bold mb-1 transition-colors ${isCompleted ? 'text-slate-900' : 'text-slate-400'
                                    }`}>
                                    {step.label}
                                </div>
                                {isCurrent && (
                                    <div className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full inline-block text-slate-600">
                                        {new Date(updatedAt).toLocaleDateString()}
                                    </div>
                                )}
                                {index === 0 && !isCurrent && (
                                    <div className="text-[10px] text-slate-400">
                                        {new Date(createdAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
