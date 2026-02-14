
import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { ShieldCheck, AlertTriangle, Check, Clock, Upload } from 'lucide-react';

export function PartnerVerification({ user, onRefreshProfile }) {
    const [kyc, setKyc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        licenseNumber: '',
        licenseUrl: '',
        passportUrl: ''
    });

    // Phone Verification State
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [phoneCode, setPhoneCode] = useState('');
    const [smsLoading, setSmsLoading] = useState(false);

    useEffect(() => {
        loadKYC();
    }, []);

    const loadKYC = async () => {
        try {
            const data = await api.getKYCStatus();
            setKyc(data);
            if (data && data.status !== 'NOT_STARTED') {
                setFormData({
                    licenseNumber: data.licenseNumber || '',
                    licenseUrl: data.licenseUrl || '',
                    passportUrl: data.passportUrl || ''
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleKYCSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.submitKYC(formData);
            loadKYC();
            alert("Документы отправлены на проверку");
        } catch (e) {
            alert("Ошибка отправки: " + e.message);
        }
    };

    const handleSendSMS = async () => {
        setSmsLoading(true);
        try {
            const res = await api.sendVerification();
            // In dev mode, we show the mock message
            alert(res.message);
            setShowCodeInput(true);
        } catch (e) {
            alert(e.message);
        } finally {
            setSmsLoading(false);
        }
    };

    const handleVerifyPhone = async () => {
        try {
            await api.verifyPhone(null, phoneCode);
            alert("Телефон подтвержден!");
            onRefreshProfile(); // Refresh parent user state to show green tick
            setShowCodeInput(false);
        } catch (e) {
            alert(e.message);
        }
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold">Верификация Партнера</h2>

            {/* Step 1: Phone Verification */}
            <div className={`p-6 rounded-xl border ${user.isPhoneVerified ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            1. Подтверждение телефона
                            {user.isPhoneVerified && <Check className="text-green-600" size={20} />}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {user.isPhoneVerified
                                ? `Номер ${user.phone} подтвержден.`
                                : `Необходимо подтвердить номер ${user.phone || 'не указан'}`
                            }
                        </p>
                    </div>
                    {!user.isPhoneVerified && (
                        <div>
                            {!showCodeInput ? (
                                <button
                                    onClick={handleSendSMS}
                                    disabled={!user.phone || smsLoading}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {smsLoading ? 'Отправка...' : 'Отправить код'}
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Код из SMS"
                                        className="border rounded px-2 py-1 w-24"
                                        value={phoneCode}
                                        onChange={e => setPhoneCode(e.target.value)}
                                    />
                                    <button
                                        onClick={handleVerifyPhone}
                                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        OK
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Step 2: KYC Documents */}
            <div className={`p-6 rounded-xl border ${kyc?.status === 'APPROVED' ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                <div className="mb-6">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        2. Юридические данные
                        {kyc?.status === 'APPROVED' && <Check className="text-green-600" size={20} />}
                    </h3>
                    <StatusBadge status={kyc?.status || 'NOT_STARTED'} />
                </div>

                {kyc?.status === 'APPROVED' ? (
                    <div className="text-green-700">
                        Ваши документы проверены. Вы можете полноценно торговать на платформе.
                    </div>
                ) : (
                    <form onSubmit={handleKYCSubmit} className="space-y-4 max-w-lg">
                        <div>
                            <label className="block text-sm font-medium mb-1">Номер лицензии / ИНН</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2"
                                value={formData.licenseNumber}
                                onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                                disabled={kyc?.status === 'PENDING'}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Ссылка на скан лицензии</label>
                            <input
                                type="text"
                                placeholder="http://..."
                                className="w-full border rounded-lg px-3 py-2"
                                value={formData.licenseUrl}
                                onChange={e => setFormData({ ...formData, licenseUrl: e.target.value })}
                                disabled={kyc?.status === 'PENDING'}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Временно: вставьте ссылку на файл</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Ссылка на копию паспорта директора</label>
                            <input
                                type="text"
                                placeholder="http://..."
                                className="w-full border rounded-lg px-3 py-2"
                                value={formData.passportUrl}
                                onChange={e => setFormData({ ...formData, passportUrl: e.target.value })}
                                disabled={kyc?.status === 'PENDING'}
                            />
                        </div>

                        {kyc?.status !== 'PENDING' && (
                            <button
                                type="submit"
                                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90"
                            >
                                Отправить на проверку
                            </button>
                        )}

                        {kyc?.status === 'PENDING' && (
                            <p className="text-amber-600 flex items-center gap-2">
                                <Clock size={16} /> Документы на рассмотрении. Ожидайте ответа.
                            </p>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        NOT_STARTED: 'bg-gray-100 text-gray-600',
        PENDING: 'bg-yellow-100 text-yellow-700',
        APPROVED: 'bg-green-100 text-green-700',
        REJECTED: 'bg-red-100 text-red-700'
    };

    const labels = {
        NOT_STARTED: 'Не начато',
        PENDING: 'На проверке',
        APPROVED: 'Подтверждено',
        REJECTED: 'Отклонено'
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
            Статус: {labels[status]}
        </span>
    );
}
