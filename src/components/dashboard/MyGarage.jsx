import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Plus, Fuel, AlertTriangle, Shield, CreditCard, X, HandCoins, Trash2, Edit2, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../../lib/api';

export function MyGarage() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newCar, setNewCar] = useState({ brand: '', model: '', year: new Date().getFullYear(), plateNumber: '', vin: '' });
    const [activeTab, setActiveTab] = useState('All Vehicles');

    useEffect(() => {
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            setLoading(true);
            const data = await api.getGarageCars();
            setCars(data);
        } catch (error) {
            console.error('Failed to fetch garage cars:', error);
            // toast.error('Ошибка загрузки гаража');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCar = async (e) => {
        e.preventDefault();
        try {
            const addedCar = await api.addGarageCar({
                brand: newCar.brand,
                model: newCar.model,
                year: Number(newCar.year),
                plateNumber: newCar.plateNumber,
                vin: newCar.vin
            });
            setCars([addedCar, ...cars]);
            setIsAddModalOpen(false);
            setNewCar({ brand: '', model: '', year: new Date().getFullYear(), plateNumber: '', vin: '' });
            toast.success("Vehicle added to garage!");
        } catch (error) {
            console.error('Failed to add car:', error);
            toast.error('Error adding vehicle');
        }
    };

    const handleDeleteCar = async (id) => {
        if (!confirm('Are you sure you want to remove this vehicle?')) return;
        try {
            await api.deleteGarageCar(id);
            setCars(cars.filter(car => car.id !== id));
            toast.success("Vehicle removed!");
        } catch (error) {
            console.error('Failed to delete car:', error);
            toast.error('Error removing vehicle');
        }
    };

    if (loading) {
        return <div className="p-12 text-center text-slate-500 animate-pulse font-bold">Loading Garage Studio...</div>;
    }

    return (
        <div className="space-y-8 text-white w-full">
            {/* Header Area with Digital Wallet */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                {/* Titles */}
                <div className="max-w-md">
                    <h2 className="text-4xl font-black text-white mb-3">Мой Гараж</h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Управляйте вашим автопарком, отслеживайте баланс и обновляйте данные о листингах в одном месте.
                    </p>
                </div>

                {/* Digital Wallet Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-br from-[#7C3AED] via-[#6366F1] to-[#4F46E5] rounded-[2.5rem] p-8 lg:min-w-[420px] shadow-[0_20px_50px_rgba(99,102,241,0.3)] relative overflow-hidden group border border-white/20"
                >
                    {/* Decorative Elements */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-900/40 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex justify-between items-start mb-10 relative z-10">
                        <div>
                            <div className="text-[10px] font-black text-white/60 tracking-[0.2em] uppercase mb-1">Цифровой кошелек</div>
                            <div className="text-xl font-black text-white">Баланс Autohouse</div>
                        </div>
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                            <Wallet className="text-white" size={24} />
                        </div>
                    </div>

                    <div className="flex justify-between items-end relative z-10">
                        <div>
                            <div className="text-5xl font-black text-white tracking-tight">15,450,000</div>
                            <div className="text-indigo-100/70 text-sm font-bold mt-2 uppercase tracking-widest">UZS</div>
                        </div>
                        <button className="bg-white text-[#4F46E5] hover:bg-indigo-50 px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] active:scale-95 uppercase tracking-wider">
                            Пополнить
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-10 border-b border-white/5 pb-0 overflow-x-auto no-scrollbar scroll-smooth">
                {['All Vehicles', 'Private', 'Commercial', 'Favorites'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-5 text-sm font-black transition-all relative whitespace-nowrap uppercase tracking-widest ${activeTab === tab ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {tab} {tab === 'All Vehicles' && <span className="text-xs opacity-50 ml-1">({cars.length})</span>}
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTabGarage"
                                className="absolute bottom-0 left-0 w-full h-[3px] bg-purple-500 rounded-t-full shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Garage Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
                <AnimatePresence>
                    {/* Existing Cars */}
                    {cars.map((car, index) => (
                        <motion.div
                            key={car.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-[#191624] rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col sm:flex-row overflow-hidden group hover:border-purple-500/30 transition-all active:scale-[0.99]"
                        >
                            {/* Car Image Area */}
                            <div className="sm:w-2/5 aspect-[4/3] sm:aspect-auto bg-[#13111C] relative overflow-hidden">
                                <img
                                    src={car.image || "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?q=80&w=1000&auto=format&fit=crop"}
                                    alt={car.model}
                                    className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-1000 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#191624] opacity-0 sm:opacity-100 pointer-events-none" />
                            </div>

                            {/* Details Area */}
                            <div className="p-8 sm:w-3/5 flex flex-col justify-between bg-gradient-to-br from-transparent to-white/[0.02]">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em]">{car.brand}</div>
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                        Активен
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-white mb-6 leading-tight group-hover:text-purple-400 transition-colors uppercase tracking-tight">{car.model}</h3>

                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-1">
                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Номер VIN</div>
                                        <div className="text-xs font-bold text-slate-300 w-full truncate font-mono tracking-tighter">
                                            {car.vin || "WPOAA2994LS29..."}
                                        </div>
                                    </div>
                                    <div className="pl-4 border-l border-white/10 space-y-1">
                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Госномер</div>
                                        <div className="text-xs font-black text-white flex flex-col tracking-wider">
                                            <span className="text-[10px] text-slate-500 font-bold">01 | 777</span>
                                            <span className="text-sm">{car.plateNumber || "AAA"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-auto">
                                    <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-black py-4 px-6 rounded-2xl text-xs transition-all active:scale-95 uppercase tracking-widest">
                                        Детали
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCar(car.id)}
                                        className="w-14 h-14 flex items-center justify-center bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all active:scale-90 border border-red-500/20"
                                        title="Удалить"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Add New Vehicle Card Placeholder */}
                    <motion.button
                        layout
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-[#191624]/30 border-2 border-dashed border-white/5 hover:border-purple-500/50 hover:bg-[#191624]/50 rounded-[2.5rem] p-12 flex flex-col items-center justify-center min-h-[300px] transition-all group active:scale-[0.98]"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-white/5 group-hover:bg-purple-600/20 text-purple-500 flex items-center justify-center mb-6 transition-all group-hover:scale-110 group-hover:rotate-90">
                            <Plus size={32} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest">Добавить авто</h3>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-tighter opacity-60">Зарегистрировать новое транспортное средство</p>
                    </motion.button>
                </AnimatePresence>
            </div>

            {/* Add Car Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#191624] border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden relative z-10 shadow-[0_30px_100px_rgba(0,0,0,0.5)]"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center">
                                <h3 className="font-black text-2xl text-white uppercase tracking-tight">Новое авто</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-3 hover:bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleAddCar} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Марка</label>
                                        <input required type="text" value={newCar.brand} onChange={e => setNewCar({ ...newCar, brand: e.target.value })} className="w-full p-4 bg-[#13111C] rounded-2xl border border-white/5 focus:border-purple-500 transition-all font-bold text-white placeholder-slate-700 outline-none" placeholder="Porsche" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Модель</label>
                                        <input required type="text" value={newCar.model} onChange={e => setNewCar({ ...newCar, model: e.target.value })} className="w-full p-4 bg-[#13111C] rounded-2xl border border-white/5 focus:border-purple-500 transition-all font-bold text-white placeholder-slate-700 outline-none" placeholder="911 Turbo S" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Год выпуска</label>
                                        <input required type="number" value={newCar.year} onChange={e => setNewCar({ ...newCar, year: Number(e.target.value) })} className="w-full p-4 bg-[#13111C] rounded-2xl border border-white/5 focus:border-purple-500 transition-all font-bold text-white outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Госномер</label>
                                        <input type="text" value={newCar.plateNumber} onChange={e => setNewCar({ ...newCar, plateNumber: e.target.value.toUpperCase() })} className="w-full p-4 bg-[#13111C] rounded-2xl border border-white/5 focus:border-purple-500 transition-all font-black text-white uppercase placeholder-slate-700 outline-none" placeholder="01 777 AAA" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">VIN НОМЕР <span className="font-normal opacity-50 lowercase tracking-normal">(опционально)</span></label>
                                    <input type="text" value={newCar.vin} onChange={e => setNewCar({ ...newCar, vin: e.target.value.toUpperCase() })} className="w-full p-4 bg-[#13111C] rounded-2xl border border-white/5 focus:border-purple-500 transition-all font-bold text-white uppercase placeholder-slate-700 outline-none" placeholder="WPOAA..." />
                                </div>
                                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-5 rounded-2xl shadow-[0_15px_30px_rgba(147,51,234,0.3)] active:scale-95 transition-all mt-6 uppercase tracking-widest text-sm">
                                    Сохранить в гараж
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

