import React from 'react';
import { Loader2, Check, AlertCircle, Package, Truck, Clock, XCircle } from 'lucide-react';

export function OrderStatusBadge({ status }) {
    const statusConfig = {
        'CREATED': {
            label: 'Создан',
            color: 'bg-gray-100 text-gray-700',
            icon: Clock
        },
        'PENDING_PAYMENT': {
            label: 'Ожидает оплаты',
            color: 'bg-yellow-100 text-yellow-700',
            icon: Clock
        },
        'PAID': {
            label: 'Оплачен',
            color: 'bg-blue-100 text-blue-700',
            icon: Check
        },
        'PROCESSING': {
            label: 'В обработке',
            color: 'bg-purple-100 text-purple-700',
            icon: Loader2
        },
        'SHIPPED': {
            label: 'Отправлен',
            color: 'bg-indigo-100 text-indigo-700',
            icon: Truck
        },
        'COMPLETED': {
            label: 'Доставлен',
            color: 'bg-green-100 text-green-700',
            icon: Check
        },
        'CANCELLED': {
            label: 'Отменён',
            color: 'bg-red-100 text-red-700',
            icon: XCircle
        }
    };

    const config = statusConfig[status] || statusConfig['CREATED'];
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
            <Icon size={12} className={status === 'PROCESSING' ? 'animate-spin' : ''} />
            {config.label}
        </span>
    );
}

// Status selector for admin/partner
export function OrderStatusSelector({ currentStatus, orderId, onStatusChange }) {
    const [isUpdating, setIsUpdating] = React.useState(false);

    const statusOptions = [
        { value: 'CREATED', label: 'Создан' },
        { value: 'PENDING_PAYMENT', label: 'Ожидает оплаты' },
        { value: 'PAID', label: 'Оплачен' },
        { value: 'PROCESSING', label: 'В обработке' },
        { value: 'SHIPPED', label: 'Отправлен' },
        { value: 'COMPLETED', label: 'Доставлен' },
        { value: 'CANCELLED', label: 'Отменён' }
    ];

    const handleChange = async (e) => {
        const newStatus = e.target.value;
        setIsUpdating(true);
        try {
            await onStatusChange(orderId, newStatus);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="relative inline-block">
            <select
                value={currentStatus}
                onChange={handleChange}
                disabled={isUpdating}
                className="appearance-none bg-white border border-input rounded-md px-3 py-1.5 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
                {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {isUpdating && (
                <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
        </div>
    );
}
