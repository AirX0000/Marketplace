import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../lib/api';
import { X, Upload, Loader2, AlertCircle, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

export function CreateReturnModal({ isOpen, onClose, orderItem, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const { register, handleSubmit, formState: { errors } } = useForm();

    if (!isOpen || !orderItem) return null;

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const data = await api.uploadImage(file);
            setImageUrl(data.url);
            toast.success("Фото загружено");
        } catch (error) {
            toast.error('Ошибка загрузки фото');
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await api.createReturnRequest({
                orderItemId: orderItem.id,
                reason: data.reason,
                details: data.details,
                images: imageUrl ? [imageUrl] : []
            });
            toast.success("Запрос на возврат создан");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl relative animate-in zoom-in-95">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold mb-1">Оформить возврат</h2>
                <p className="text-sm text-slate-500 mb-6">Товар: {orderItem.marketplace.name}</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Причина возврата</label>
                        <select
                            {...register('reason', { required: 'Выберите причину' })}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                        >
                            <option value="">Выберите причину...</option>
                            <option value="DEFECTIVE">Товар бракованный / поврежден</option>
                            <option value="WRONG_ITEM">Пришел не тот товар</option>
                            <option value="NOT_AS_DESCRIBED">Не соответствует описанию</option>
                            <option value="CHANGED_MIND">Передумал (не вскрыт)</option>
                            <option value="OTHER">Другое</option>
                        </select>
                        {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Подробности</label>
                        <textarea
                            {...register('details', { required: 'Опишите проблему' })}
                            rows={3}
                            placeholder="Опишите дефект или причину возврата..."
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none resize-none"
                        />
                        {errors.details && <p className="text-xs text-red-500 mt-1">{errors.details.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Прикрепить фото дефекта (необязательно)</label>
                        <div className="flex items-center gap-4">
                            {imageUrl ? (
                                <div className="relative h-24 w-24 rounded-lg overflow-hidden border">
                                    <img src={imageUrl} alt="Defect" className="h-full w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setImageUrl('')}
                                        className="absolute top-1 right-1 bg-white/80 rounded-full p-1 hover:bg-white transition-colors"
                                    >
                                        <X size={12} className="text-red-500 hover:scale-110" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 border-slate-300 hover:bg-slate-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {uploading ? (
                                            <Loader2 className="animate-spin h-6 w-6 text-slate-500 mb-2" />
                                        ) : (
                                            <Camera className="h-6 w-6 text-slate-500 mb-2" />
                                        )}
                                        <p className="text-xs text-slate-500">{uploading ? 'Загрузка...' : 'Нажмите, чтобы выбрать фото'}</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-sm text-blue-700">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p>
                            После отправки заявки продавец рассмотрит её в течение 48 часов.
                            Деньги будут возвращены на ваш баланс или карту после одобрения.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <Loader2 className="animate-spin h-4 w-4" />}
                            Отправить заявку
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
