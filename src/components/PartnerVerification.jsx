
import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { ShieldCheck, AlertTriangle, Check, Clock, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
            toast.success('Документы отправлены на проверку');
        } catch (e) {
            toast.error('Ошибка отправки: ' + e.message);
        }
    };

    const handleSendSMS = async () => {
        setSmsLoading(true);
        try {
            const res = await api.sendVerification();
            // In dev mode, we show the mock message
            toast.info(res.message);
            setShowCodeInput(true);
        } catch (e) {
            toast.error(e.message);
        } finally {
            setSmsLoading(false);
        }
    };

    const handleVerifyPhone = async () => {
        try {
            await api.verifyPhone(null, phoneCode);
            toast.success('Телефон подтверждён!');
            onRefreshProfile();
            setShowCodeInput(false);
        } catch (e) {
            toast.error(e.message);
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse font-bold uppercase tracking-widest">Загрузка...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-10 text-white animate-in fade-in">
            <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">Верификация Партнера</h2>

            {/* Step 1: Phone Verification */}
            <div className={`p-10 rounded-[2.5rem] border ${user.isPhoneVerified ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-[#191624] border-white/5 shadow-2xl'}`}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <h3 className="font-black text-xl flex items-center justify-center md:justify-start gap-3 uppercase tracking-tight">
                            1. Подтверждение телефона
                            {user.isPhoneVerified && <div className="bg-emerald-500/20 p-1.5 rounded-full"><Check className="text-emerald-400" size={18} strokeWidth={3} /></div>}
                        </h3>
                        <p className="text-sm text-slate-400 mt-2 font-bold uppercase tracking-widest opacity-70">
                            {user.isPhoneVerified
                                ? `Номер ${user.phone} подтвержден`
                                : `Необходимо подтвердить номер ${user.phone || 'не указан'}`
                            }
                        </p>
                    </div>
                    {!user.isPhoneVerified && (
                        <div className="w-full md:w-auto">
                            {!showCodeInput ? (
                                <button
                                    onClick={handleSendSMS}
                                    disabled={!user.phone || smsLoading}
                                    className="w-full md:w-auto px-8 py-4 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-purple-500 disabled:opacity-30 transition-all shadow-[0_10px_20px_rgba(147,51,234,0.3)] active:scale-95"
                                >
                                    {smsLoading ? 'Отправка...' : 'Отправить код'}
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="Код"
                                        className="bg-[#13111C] border border-white/10 rounded-xl px-4 py-4 w-32 text-center font-black text-white focus:border-purple-500 transition-all outline-none"
                                        value={phoneCode}
                                        onChange={e => setPhoneCode(e.target.value)}
                                    />
                                    <button
                                        onClick={handleVerifyPhone}
                                        className="flex-1 px-8 py-4 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-[0_10px_20px_rgba(16,185,129,0.3)] active:scale-95"
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
            <div className={`p-10 rounded-[2.5rem] border ${kyc?.status === 'APPROVED' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-[#191624] border-white/5 shadow-2xl'}`}>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                    <h3 className="font-black text-xl flex items-center gap-3 uppercase tracking-tight">
                        2. Юридические данные
                        {kyc?.status === 'APPROVED' && <div className="bg-emerald-500/20 p-1.5 rounded-full"><Check className="text-emerald-400" size={18} strokeWidth={3} /></div>}
                    </h3>
                    <StatusBadge status={kyc?.status || 'NOT_STARTED'} />
                </div>

                {kyc?.status === 'APPROVED' ? (
                    <div className="text-emerald-400 font-bold text-center md:text-left py-4 uppercase tracking-widest text-sm bg-emerald-500/5 px-6 rounded-2xl border border-emerald-500/10">
                        Ваши документы проверены. Вы можете полноценно торговать на платформе.
                    </div>
                ) : (
                    <form onSubmit={handleKYCSubmit} className="space-y-8 max-w-2xl mx-auto md:mx-0">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Номер лицензии / ИНН</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#13111C] border border-white/10 rounded-2xl px-6 py-4 font-bold text-white focus:border-purple-500 transition-all outline-none disabled:opacity-50"
                                    value={formData.licenseNumber}
                                    onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                                    disabled={kyc?.status === 'PENDING'}
                                    required
                                    placeholder="000 000 000"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Скан лицензии (URL)</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors"><Upload size={16} /></div>
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        className="w-full bg-[#13111C] border border-white/10 rounded-2xl pl-12 pr-6 py-4 font-bold text-white focus:border-purple-500 transition-all outline-none disabled:opacity-50"
                                        value={formData.licenseUrl}
                                        onChange={e => setFormData({ ...formData, licenseUrl: e.target.value })}
                                        disabled={kyc?.status === 'PENDING'}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Копия паспорта директора (URL)</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors"><Upload size={16} /></div>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    className="w-full bg-[#13111C] border border-white/10 rounded-2xl pl-12 pr-6 py-4 font-bold text-white focus:border-purple-500 transition-all outline-none disabled:opacity-50"
                                    value={formData.passportUrl}
                                    onChange={e => setFormData({ ...formData, passportUrl: e.target.value })}
                                    disabled={kyc?.status === 'PENDING'}
                                />
                            </div>
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-2 ml-1 opacity-50">Временно: вставьте ссылку на файл</p>
                        </div>

                        {kyc?.status !== 'PENDING' && (
                            <button
                                type="submit"
                                className="w-full md:w-auto px-12 py-5 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-purple-500 transition-all shadow-[0_15px_30px_rgba(147,51,234,0.3)] active:scale-95 text-xs"
                            >
                                Отправить на проверку
                            </button>
                        )}

                        {kyc?.status === 'PENDING' && (
                            <div className="flex items-center gap-4 p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-amber-500">
                                <Clock size={24} className="animate-spin-slow" />
                                <div className="font-black uppercase tracking-widest text-[10px]">
                                    Документы на рассмотрении. Ожидайте ответа от администрации.
                                </div>
                            </div>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        NOT_STARTED: 'bg-slate-500/10 text-slate-500 border-slate-500/10',
        PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/10',
        APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10',
        REJECTED: 'bg-red-500/10 text-red-400 border-red-500/10'
    };

    const labels = {
        NOT_STARTED: 'Не начато',
        PENDING: 'На проверке',
        APPROVED: 'Подтверждено',
        REJECTED: 'Отклонено'
    };

    return (
        <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${styles[status]}`}>
            Статус: {labels[status]}
        </span>
    );
}
