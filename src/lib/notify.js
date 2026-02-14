import toast from 'react-hot-toast';

export const notify = {
    success: (message) => {
        toast.success(message, {
            duration: 3000,
            position: 'top-right',
            style: {
                background: '#10b981',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
            },
        });
    },

    error: (message) => {
        toast.error(message, {
            duration: 4000,
            position: 'top-right',
            style: {
                background: '#ef4444',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
            },
        });
    },

    loading: (message) => {
        return toast.loading(message, {
            position: 'top-right',
        });
    },

    promise: (promise, messages) => {
        return toast.promise(
            promise,
            {
                loading: messages.loading || 'Загрузка...',
                success: messages.success || 'Успешно!',
                error: messages.error || 'Ошибка!',
            },
            {
                position: 'top-right',
            }
        );
    },

    dismiss: (toastId) => {
        toast.dismiss(toastId);
    },
};
