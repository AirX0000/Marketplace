import React, { useState, useEffect } from 'react';
import { Check, Info, Bell, ShieldCheck, ChevronRight, UploadCloud, AlertCircle, ChevronLeft, Loader2, User, Briefcase, FileText, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

const STEPS = [
    { id: 1, title: 'Personal Info', desc: 'Contact details & Identity', icon: User },
    { id: 2, title: 'Financial Details', desc: 'Income & Employment', icon: Briefcase },
    { id: 3, title: 'Documents', desc: 'Identity verification', icon: FileText },
    { id: 4, title: 'Review', desc: 'Submit application', icon: Star },
];

export function LoanApplication() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loanType, setLoanType] = useState('Auto Loan');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Step 1 - Loan params
    const [loanAmount, setLoanAmount] = useState(45000);
    const [downpayment, setDownpayment] = useState(9000);
    const [loanTerm, setLoanTerm] = useState(60);

    // Step 1 - Personal
    const [personal, setPersonal] = useState({ fullName: '', email: '', phone: '', identityType: "Driver's License" });

    // Step 2 - Financial
    const [financial, setFinancial] = useState({ employer: '', jobTitle: '', monthlyIncome: '', employmentType: 'Employed', workExperience: '' });

    // Step 3 - Documents
    const [documents, setDocuments] = useState({ idFront: null, idBack: null, proofOfIncome: null });
    const [uploadedFiles, setUploadedFiles] = useState({});

    const principalAmount = loanAmount - downpayment;
    const estimatedAPR = loanType === 'Mortgage' ? 12.5 : 4.25;
    const monthlyRate = estimatedAPR / 100 / 12;
    const monthlyPayment = principalAmount > 0
        ? (principalAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / (Math.pow(1 + monthlyRate, loanTerm) - 1)
        : 0;
    const monthlyInterest = (principalAmount * estimatedAPR) / 100 / 12;

    const validateStep = () => {
        if (currentStep === 1) {
            if (!personal.fullName || !personal.email || !personal.phone) {
                setAlertVisible(true);
                setTimeout(() => setAlertVisible(false), 4000);
                return false;
            }
        }
        if (currentStep === 2) {
            if (!financial.employer || !financial.monthlyIncome) {
                toast.error('Заполните данные о доходах и работодателе');
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (!validateStep()) return;
        setCurrentStep(s => Math.min(s + 1, 4));
    };

    const handleFileUpload = (field) => (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadedFiles(prev => ({ ...prev, [field]: file.name }));
        toast.success(`${file.name} загружен`);
    };

    const handleSubmit = async () => {
        setSubmitLoading(true);
        try {
            await api.submitLoanApplication({
                type: loanType,
                amount: loanAmount,
                downpayment,
                term: loanTerm,
                principalAmount,
                estimatedAPR,
                monthlyPayment: Math.round(monthlyPayment),
                applicant: personal,
                financial,
                notes: `Loan Type: ${loanType}, Monthly Income: ${financial.monthlyIncome}`
            });
            setSubmitted(true);
            toast.success('Заявка успешно отправлена!');
        } catch (e) {
            toast.error('Ошибка отправки. Попробуйте позже.');
        } finally {
            setSubmitLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-neutral-50 font-sans flex items-center justify-center px-4">
                <div className="bg-white rounded-3xl p-12 shadow-xl text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check size={36} className="text-emerald-600" strokeWidth={3} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3">Заявка отправлена!</h2>
                    <p className="text-slate-500 text-sm mb-8">Мы свяжемся с вами в течение 24-48 часов. Вы можете отслеживать статус заявки в личном кабинете.</p>
                    <div className="flex gap-3">
                        <Link to="/profile/loans" className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-sm transition-colors text-center">
                            Мои заявки
                        </Link>
                        <Link to="/" className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors text-center">
                            На главную
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 font-sans text-slate-800 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-600 outline outline-2 outline-offset-2 outline-orange-600 rounded-xl flex items-center justify-center text-white">
                            <span className="font-serif font-black text-xl">Ш</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight">Autohouse Marketplace</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <span className="text-orange-600 font-bold">Apply</span>
                        <span className="text-slate-500 font-bold">Rates</span>
                        <span className="text-slate-500 font-bold">Calculate</span>
                        <div className="w-px h-6 bg-slate-200 mx-2"></div>
                        <button className="text-slate-500 hover:text-slate-800 relative">
                            <Bell size={20} />
                        </button>
                    </nav>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Sidebar */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="sticky top-28">
                            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-6 pl-4">Application Progress</h3>
                            <div className="space-y-0 relative">
                                <div className="absolute left-[23px] top-[24px] bottom-[24px] w-0.5 bg-slate-200 z-0"></div>
                                {STEPS.map((step) => {
                                    const isCurrent = currentStep === step.id;
                                    const isCompleted = currentStep > step.id;
                                    return (
                                        <div key={step.id} className="relative z-10 flex gap-4 min-h-[80px]">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all relative z-10 bg-white
                                                    ${isCurrent ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30' :
                                                        isCompleted ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}
                                                >
                                                    {isCompleted ? <Check size={20} strokeWidth={3} /> : step.id}
                                                </div>
                                            </div>
                                            <div className="pt-2">
                                                <div className={`font-bold text-sm ${isCurrent ? 'text-slate-900' : 'text-slate-500'}`}>{step.title}</div>
                                                <div className="text-xs text-slate-400 mt-0.5">{step.desc}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 bg-orange-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl shadow-orange-600/20">
                                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="absolute right-4 bottom-4 text-white/10 rotate-12"><Info size={100} strokeWidth={1} /></div>
                                <h4 className="font-bold text-lg mb-2 relative z-10">Need Help?</h4>
                                <p className="text-sm text-orange-100 mb-6 relative z-10">Our financial experts are available 24/7 to guide you.</p>
                                <button className="w-full bg-white text-orange-600 font-bold py-3 rounded-xl hover:bg-orange-50 transition-colors shadow-sm relative z-10">
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="lg:col-span-9 space-y-8 animate-in slide-in-from-bottom-4 duration-500">

                        {/* === STEP 1 === */}
                        {currentStep === 1 && (
                            <>
                                {/* Loan Configurator */}
                                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                        <div>
                                            <h1 className="text-2xl font-black text-slate-900 mb-2">New Loan Application</h1>
                                            <p className="text-slate-500 text-sm">Step 1: Choose your loan type and set parameters</p>
                                        </div>
                                        <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-200 shrink-0">
                                            {['Auto Loan', 'Mortgage'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setLoanType(type)}
                                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${loanType === type ? 'bg-white text-orange-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
                                                >
                                                    {type === 'Auto Loan' ? '🚗' : '🏠'} {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-12">
                                        <div className="space-y-8">
                                            {/* Loan Amount */}
                                            <div>
                                                <div className="flex justify-between items-end mb-4">
                                                    <label className="text-sm font-bold text-slate-700">Loan Amount</label>
                                                    <span className="text-2xl font-black text-orange-600">${loanAmount.toLocaleString()}</span>
                                                </div>
                                                <input type="range" min="5000" max="150000" step="1000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600" />
                                                <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium"><span>$5,000</span><span>$150,000</span></div>
                                            </div>
                                            {/* Downpayment */}
                                            <div>
                                                <div className="flex justify-between items-end mb-4">
                                                    <label className="text-sm font-bold text-slate-700">Downpayment</label>
                                                    <span className="text-2xl font-black text-orange-600">${downpayment.toLocaleString()}</span>
                                                </div>
                                                <input type="range" min="0" max="50000" step="500" value={downpayment} onChange={(e) => setDownpayment(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600" />
                                                <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium"><span>$0</span><span>$50,000</span></div>
                                            </div>
                                            {/* Loan Term */}
                                            <div>
                                                <div className="flex justify-between items-end mb-4">
                                                    <label className="text-sm font-bold text-slate-700">Loan Term (Months)</label>
                                                    <span className="text-2xl font-black text-orange-600">{loanTerm} Months</span>
                                                </div>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {[36, 48, 60, 72].map(term => (
                                                        <button key={term} onClick={() => setLoanTerm(term)} className={`py-3 rounded-xl text-sm font-bold transition-all border ${loanTerm === term ? 'border-orange-500 text-orange-600 bg-orange-50' : 'border-slate-200 text-slate-500 bg-slate-50 hover:bg-slate-100'}`}>{term}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Payment Summary */}
                                        <div className="bg-orange-50/50 rounded-3xl border border-orange-100 p-8 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded bg-orange-100 text-orange-600 flex items-center justify-center">📋</div>
                                                    Payment Summary
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between"><span className="text-sm text-slate-500 font-medium">Estimated APR</span><span className="text-sm font-bold text-slate-900">{estimatedAPR.toFixed(2)}%</span></div>
                                                    <div className="flex justify-between"><span className="text-sm text-slate-500 font-medium">Principal Amount</span><span className="text-sm font-bold text-slate-900">${principalAmount.toLocaleString()}</span></div>
                                                    <div className="flex justify-between"><span className="text-sm text-slate-500 font-medium">Monthly Interest</span><span className="text-sm font-bold text-slate-900">${monthlyInterest.toFixed(2)}</span></div>
                                                </div>
                                                <div className="h-px bg-slate-200 my-6"></div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Monthly Payment</p>
                                                <div className="flex items-baseline gap-2 text-orange-600">
                                                    <span className="text-4xl font-black">${Math.round(monthlyPayment).toLocaleString()}</span>
                                                    <span className="text-sm font-bold text-slate-500">/month</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Details */}
                                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative">
                                    {alertVisible && (
                                        <div className="absolute -right-6 top-1/2 p-4 bg-white border border-red-100 shadow-2xl rounded-2xl flex gap-3 max-w-xs z-20 animate-in fade-in slide-in-from-right-8">
                                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                                                <AlertCircle size={18} strokeWidth={3} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-900">Alert</h4>
                                                <p className="text-xs text-red-600 mt-1 font-medium">Please complete all required fields to proceed.</p>
                                            </div>
                                        </div>
                                    )}
                                    <h2 className="text-xl font-bold text-slate-900 mb-8">Personal Details</h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Full Name *</label>
                                            <input type="text" value={personal.fullName} onChange={(e) => setPersonal(p => ({ ...p, fullName: e.target.value }))} placeholder="Имя Фамилия" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Email Address *</label>
                                            <input type="email" value={personal.email} onChange={(e) => setPersonal(p => ({ ...p, email: e.target.value }))} placeholder="example@mail.com" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Phone Number *</label>
                                            <input type="tel" value={personal.phone} onChange={(e) => setPersonal(p => ({ ...p, phone: e.target.value }))} placeholder="+998..." className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Identity Type</label>
                                            <select value={personal.identityType} onChange={(e) => setPersonal(p => ({ ...p, identityType: e.target.value }))} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium">
                                                <option>Driver's License</option>
                                                <option>National ID (Паспорт)</option>
                                                <option>International Passport</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* === STEP 2 === */}
                        {currentStep === 2 && (
                            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900 mb-2">Financial Details</h2>
                                <p className="text-sm text-slate-500 mb-8">Расскажите о вашем источнике дохода</p>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Работодатель *</label>
                                        <input type="text" value={financial.employer} onChange={(e) => setFinancial(p => ({ ...p, employer: e.target.value }))} placeholder="Название компании" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Должность</label>
                                        <input type="text" value={financial.jobTitle} onChange={(e) => setFinancial(p => ({ ...p, jobTitle: e.target.value }))} placeholder="Например: Менеджер" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Ежемесячный доход (UZS) *</label>
                                        <input type="number" value={financial.monthlyIncome} onChange={(e) => setFinancial(p => ({ ...p, monthlyIncome: e.target.value }))} placeholder="Например: 5000000" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Тип занятости</label>
                                        <select value={financial.employmentType} onChange={(e) => setFinancial(p => ({ ...p, employmentType: e.target.value }))} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium">
                                            <option>Employed</option>
                                            <option>Self-Employed</option>
                                            <option>Business Owner</option>
                                            <option>Pensioner</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Стаж работы (лет)</label>
                                        <input type="number" value={financial.workExperience} onChange={(e) => setFinancial(p => ({ ...p, workExperience: e.target.value }))} placeholder="Например: 3" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* === STEP 3 === */}
                        {currentStep === 3 && (
                            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900 mb-2">Documents</h2>
                                <p className="text-sm text-slate-500 mb-8">Загрузите документы для подтверждения личности</p>
                                <div className="space-y-6">
                                    {[
                                        { field: 'idFront', label: 'ID / Паспорт (лицевая сторона)' },
                                        { field: 'idBack', label: 'ID / Паспорт (обратная сторона)' },
                                        { field: 'proofOfIncome', label: 'Справка о доходах' },
                                    ].map(({ field, label }) => (
                                        <div key={field} className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">{label}</label>
                                            <label className={`w-full h-28 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-orange-400 transition-all group ${uploadedFiles[field] ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50'}`}>
                                                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileUpload(field)} />
                                                {uploadedFiles[field] ? (
                                                    <>
                                                        <Check size={24} className="text-emerald-500 mb-1" />
                                                        <span className="text-sm font-bold text-emerald-600">{uploadedFiles[field]}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <UploadCloud size={24} className="text-slate-400 group-hover:text-orange-500 mb-1 transition-colors" />
                                                        <span className="text-sm text-slate-500">Drag & drop or <span className="text-orange-600 font-bold">browse</span></span>
                                                        <span className="text-xs text-slate-400 mt-0.5">PNG, JPG, PDF до 10MB</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* === STEP 4 === */}
                        {currentStep === 4 && (
                            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                                <h2 className="text-xl font-bold text-slate-900 mb-2">Review & Submit</h2>
                                <p className="text-sm text-slate-500 mb-8">Проверьте данные перед отправкой</p>
                                <div className="space-y-6">
                                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
                                        <h3 className="font-bold text-slate-800 mb-4">Параметры кредита</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div><span className="text-slate-500">Тип:</span> <span className="font-bold">{loanType}</span></div>
                                            <div><span className="text-slate-500">Сумма:</span> <span className="font-bold">${loanAmount.toLocaleString()}</span></div>
                                            <div><span className="text-slate-500">Первонач. взнос:</span> <span className="font-bold">${downpayment.toLocaleString()}</span></div>
                                            <div><span className="text-slate-500">Срок:</span> <span className="font-bold">{loanTerm} мес.</span></div>
                                            <div><span className="text-slate-500">Ставка:</span> <span className="font-bold">{estimatedAPR}%</span></div>
                                            <div><span className="text-slate-500">Ежемесячно:</span> <span className="font-bold text-orange-600">${Math.round(monthlyPayment).toLocaleString()}</span></div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                                        <h3 className="font-bold text-slate-800 mb-4">Личные данные</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div><span className="text-slate-500">Имя:</span> <span className="font-bold">{personal.fullName || '—'}</span></div>
                                            <div><span className="text-slate-500">Email:</span> <span className="font-bold">{personal.email || '—'}</span></div>
                                            <div><span className="text-slate-500">Телефон:</span> <span className="font-bold">{personal.phone || '—'}</span></div>
                                            <div><span className="text-slate-500">Доход:</span> <span className="font-bold">{financial.monthlyIncome ? Number(financial.monthlyIncome).toLocaleString() + ' UZS' : '—'}</span></div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                        <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
                                        <p className="text-xs text-blue-700">Нажимая «Отправить», вы соглашаетесь с условиями кредитования. Заявка будет рассмотрена в течение 24–48 часов.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-4">
                            {currentStep > 1 ? (
                                <button onClick={() => setCurrentStep(s => s - 1)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors">
                                    <ChevronLeft size={18} /> Back
                                </button>
                            ) : (
                                <button className="text-slate-500 font-bold hover:text-slate-800 transition-colors">
                                    Save for later
                                </button>
                            )}

                            {currentStep < 4 ? (
                                <button onClick={handleNext} className="bg-[#E95C17] hover:bg-[#D45112] text-white px-8 py-4 rounded-xl font-bold shadow-[0_8px_20px_rgba(233,92,23,0.3)] hover:shadow-[0_8px_25px_rgba(233,92,23,0.4)] transition-all flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0">
                                    Continue to Step {currentStep + 1} <ChevronRight size={18} strokeWidth={3} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitLoading}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold shadow-[0_8px_20px_rgba(5,150,105,0.3)] transition-all flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70"
                                >
                                    {submitLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={3} />}
                                    {submitLoading ? 'Отправляем...' : 'Submit Application'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <footer className="border-t border-slate-200 mt-12 bg-white/50 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <ShieldCheck size={16} /> Bank-level 256-bit SSL encrypted security
                    </div>
                    <div className="flex gap-6 text-sm font-medium text-slate-400">
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Service</Link>
                        <Link to="#">Security</Link>
                    </div>
                    <div className="text-sm text-slate-400 font-medium">© 2024 Autohouse Marketplace.</div>
                </div>
            </footer>
        </div>
    );
}
