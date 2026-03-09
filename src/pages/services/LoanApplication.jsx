import React, { useState } from 'react';
import { Check, Info, Bell, ShieldCheck, ChevronRight, UploadCloud, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEPS = [
    { id: 1, title: 'Personal Info', desc: 'Contact details & Identity' },
    { id: 2, title: 'Financial Details', desc: 'Income & Employment' },
    { id: 3, title: 'Documents', desc: 'Identity verification' },
    { id: 4, title: 'Review', desc: 'Submit application' },
];

export function LoanApplication() {
    const [currentStep, setCurrentStep] = useState(1);
    const [loanType, setLoanType] = useState('Auto Loan');

    // Sliders state
    const [loanAmount, setLoanAmount] = useState(45000);
    const [downpayment, setDownpayment] = useState(9000);
    const [loanTerm, setLoanTerm] = useState(60);

    // Calculated fields based on mockup
    const principalAmount = loanAmount - downpayment;
    const estimatedAPR = 4.25;

    // Simple mock calculation matching the mockup ($667/mo)
    const monthlyRate = estimatedAPR / 100 / 12;
    const monthlyPayment = principalAmount > 0
        ? (principalAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / (Math.pow(1 + monthlyRate, loanTerm) - 1)
        : 0;
    const monthlyInterest = (principalAmount * estimatedAPR) / 100 / 12;

    return (
        <div className="min-h-screen bg-neutral-50 font-sans text-slate-800 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-600 outline outline-2 outline-offset-2 outline-orange-600 rounded-xl flex items-center justify-center text-white">
                            <span className="font-serif font-black text-xl">III</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight">Autohouse Marketplace</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="#" className="text-orange-600 font-bold">Apply</Link>
                        <Link to="#" className="text-slate-500 font-bold hover:text-slate-800 transition-colors">Rates</Link>
                        <Link to="#" className="text-slate-500 font-bold hover:text-slate-800 transition-colors">Calculate</Link>
                        <div className="w-px h-6 bg-slate-200 mx-2"></div>
                        <button className="text-slate-500 hover:text-slate-800 relative">
                            <Bell size={20} />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-orange-600 rounded-full border border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-2">
                            <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-orange-200 overflow-hidden">
                                <img src="https://i.pravatar.cc/100?img=11" alt="Profile" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </nav>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Left Sidebar: Progress Navigation */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="sticky top-28">
                            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-6 pl-4">Application Progress</h3>

                            <div className="space-y-0 relative">
                                {/* Vertical Connecting Line */}
                                <div className="absolute left-[23px] top-[24px] bottom-[24px] w-0.5 bg-slate-200 z-0"></div>

                                {STEPS.map((step, idx) => {
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
                                    )
                                })}
                            </div>

                            {/* Help Box */}
                            <div className="mt-8 bg-orange-600 rounded-2xl p-6 text-white text-center sm:text-left relative overflow-hidden shadow-xl shadow-orange-600/20">
                                {/* Decorative elements */}
                                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="absolute right-4 bottom-4 text-white/10 rotate-12">
                                    <Info size={100} strokeWidth={1} />
                                </div>

                                <h4 className="font-bold text-lg mb-2 relative z-10">Need Help?</h4>
                                <p className="text-sm text-orange-100 mb-6 relative z-10">Our financial experts are available 24/7 to guide you.</p>
                                <button className="w-full bg-white text-orange-600 font-bold py-3 rounded-xl hover:bg-orange-50 transition-colors shadow-sm relative z-10 block">
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="lg:col-span-9 space-y-8 animate-in slide-in-from-bottom-4 duration-500">

                        {/* Top Configurator Section */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900 mb-2">New Loan Application</h1>
                                    <p className="text-slate-500 text-sm">Step 1: Choose your loan type and set parameters</p>
                                </div>
                                <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-200 shrink-0">
                                    <button
                                        onClick={() => setLoanType('Auto Loan')}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${loanType === 'Auto Loan' ? 'bg-white text-orange-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        🚗 Auto Loan
                                    </button>
                                    <button
                                        onClick={() => setLoanType('Mortgage')}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${loanType === 'Mortgage' ? 'bg-white text-orange-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        🏠 Mortgage
                                    </button>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-12">
                                {/* Sliders */}
                                <div className="space-y-8">
                                    {/* Loan Amount */}
                                    <div>
                                        <div className="flex justify-between items-end mb-4">
                                            <label className="text-sm font-bold text-slate-700">Loan Amount</label>
                                            <span className="text-2xl font-black text-orange-600">${loanAmount.toLocaleString()}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="5000"
                                            max="150000"
                                            step="1000"
                                            value={loanAmount}
                                            onChange={(e) => setLoanAmount(Number(e.target.value))}
                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
                                        />
                                        <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                                            <span>$5,000</span>
                                            <span>$150,000</span>
                                        </div>
                                    </div>

                                    {/* Downpayment */}
                                    <div>
                                        <div className="flex justify-between items-end mb-4">
                                            <label className="text-sm font-bold text-slate-700">Downpayment</label>
                                            <span className="text-2xl font-black text-orange-600">${downpayment.toLocaleString()}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="50000"
                                            step="500"
                                            value={downpayment}
                                            onChange={(e) => setDownpayment(Number(e.target.value))}
                                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
                                        />
                                        <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                                            <span>$0</span>
                                            <span>$50,000</span>
                                        </div>
                                    </div>

                                    {/* Loan Term */}
                                    <div>
                                        <div className="flex justify-between items-end mb-4">
                                            <label className="text-sm font-bold text-slate-700">Loan Term (Months)</label>
                                            <span className="text-2xl font-black text-orange-600">{loanTerm} Months</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[36, 48, 60, 72].map(term => (
                                                <button
                                                    key={term}
                                                    onClick={() => setLoanTerm(term)}
                                                    className={`py-3 rounded-xl text-sm font-bold transition-all border ${loanTerm === term ? 'border-orange-500 text-orange-600 bg-orange-50' : 'border-slate-200 text-slate-500 bg-slate-50 hover:bg-slate-100'}`}
                                                >
                                                    {term}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Summary Card */}
                                <div className="bg-orange-50/50 rounded-3xl border border-orange-100 p-8 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-orange-100 text-orange-600 flex items-center justify-center">📋</div>
                                            Payment Summary
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-slate-500 font-medium">Estimated APR</span>
                                                <span className="text-sm font-bold text-slate-900">{estimatedAPR.toFixed(2)}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-slate-500 font-medium">Principal Amount</span>
                                                <span className="text-sm font-bold text-slate-900">${principalAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-slate-500 font-medium">Monthly Interest</span>
                                                <span className="text-sm font-bold text-slate-900">${monthlyInterest.toFixed(2)}</span>
                                            </div>
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

                        {/* Personal Details Form Section */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative">
                            {/* Alert Overlay (mocking the error state from the screenshot) */}
                            <div className="absolute -right-6 top-1/2 p-4 bg-white border border-red-100 shadow-2xl rounded-2xl flex gap-3 max-w-sm z-20 animate-in fade-in slide-in-from-right-8">
                                <div className="mt-1">
                                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                        <AlertCircle size={18} strokeWidth={3} />
                                    </div>
                                </div>
                                <div className="pr-6">
                                    <h4 className="font-bold text-sm text-slate-900">Alert</h4>
                                    <p className="text-xs text-red-600 mt-1 font-medium leading-relaxed">Please complete all required fields to proceed.</p>
                                </div>
                                <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><Check size={14} className="rotate-45" /></button>
                            </div>


                            <h2 className="text-xl font-bold text-slate-900 mb-8">Personal Details</h2>

                            <div className="grid md:grid-cols-2 gap-6 relative">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Full Name</label>
                                    <input
                                        type="text"
                                        defaultValue="Johnathan Doe"
                                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                                    <input
                                        type="email"
                                        defaultValue="john@example.com"
                                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Phone Number</label>
                                    <input
                                        type="tel"
                                        defaultValue="+1 (555) 000-0000"
                                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Identity Type</label>
                                    <select className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center]">
                                        <option>Driver's License</option>
                                        <option>National ID</option>
                                        <option>Passport</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2 space-y-2 relative">
                                    <label className="text-sm font-bold text-slate-700">Identity Verification (Front)</label>
                                    <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex flex-col items-center justify-center hover:bg-slate-100 hover:border-orange-400 transition-all cursor-pointer group">
                                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                            <UploadCloud size={20} className="text-slate-400 group-hover:text-orange-600" />
                                        </div>
                                        <div className="text-sm font-medium text-slate-600">
                                            Drag and drop or <span className="text-orange-600 font-bold">browse</span>
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">PNG, JPG or PDF up to 10MB</div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-between pt-4">
                            <button className="text-slate-500 font-bold hover:text-slate-800 transition-colors">
                                Save for later
                            </button>
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="bg-[#E95C17] hover:bg-[#D45112] text-white px-8 py-4 rounded-xl font-bold shadow-[0_8px_20px_rgba(233,92,23,0.3)] hover:shadow-[0_8px_25px_rgba(233,92,23,0.4)] transition-all flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Continue to Step 2 <ChevronRight size={18} strokeWidth={3} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-200 mt-12 bg-white/50 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <ShieldCheck size={16} /> Bank-level 256-bit SSL encrypted security
                    </div>
                    <div className="flex gap-6 text-sm font-medium text-slate-400">
                        <Link to="#" className="hover:text-slate-600">Privacy Policy</Link>
                        <Link to="#" className="hover:text-slate-600">Terms of Service</Link>
                        <Link to="#" className="hover:text-slate-600">Security</Link>
                    </div>
                    <div className="text-sm text-slate-400 font-medium">
                        © 2024 Autohouse Marketplace. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
