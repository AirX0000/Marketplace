import React, { useState } from 'react';
import { Car, Plus, Fuel, AlertTriangle, Shield, CreditCard, X, TrendingUp, HandCoins } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export function MyGarage() {
    // Mock Data - In real app, fetch from API
    const [cars, setCars] = useState([
        {
            id: 1,
            brand: "Chevrolet",
            model: "Cobalt",
            year: 2023,
            plate: "01 A 777 AA",
            color: "White",
            mileage: 49000,
            estimatedPrice: 10850,
            image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600"
        }
    ]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newCar, setNewCar] = useState({ brand: '', model: '', year: new Date().getFullYear(), plate: '' });

    const handleAddCar = (e) => {
        e.preventDefault();
        const car = {
            id: Date.now(),
            ...newCar,
            estimatedPrice: 12000, // Mock calculation
            image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600"
        };
        setCars([...cars, car]);
        setIsAddModalOpen(false);
        setNewCar({ brand: '', model: '', year: new Date().getFullYear(), plate: '' });
        toast.success("Автомобиль добавлен в гараж!");
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* Header / Add Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                    Мой Гараж
                </h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95"
                >
                    <Plus size={18} /> Добавить авто
                </button>
            </div>

            {/* Cars List */}
            <div className="grid gap-6">
                {cars.map(car => (
                    <div key={car.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 dark:bg-slate-800 rounded-full -translate-y-1/2 translate-x-1/3 opacity-50 group-hover:scale-110 transition-transform duration-700" />

                        <div className="relative z-10 grid md:grid-cols-[280px_1fr] gap-8 items-center">
                            {/* Car Image Area */}
                            <div className="relative">
                                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
                                    <img src={car.image} alt={car.model} className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-lg border shadow-sm text-xs font-bold uppercase tracking-widest text-slate-900 whitespace-nowrap">
                                    {car.plate || "NO PLATE"}
                                </div>
                            </div>

                            {/* Car Details */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{car.brand}</div>
                                        <h3 className="text-3xl font-black text-slate-900">{car.model}</h3>
                                        <div className="text-slate-500 font-medium">{car.year} • {car.mileage?.toLocaleString() || 0} км</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Оценка</div>
                                        <div className="text-2xl font-black text-blue-600">${car.estimatedPrice.toLocaleString()}</div>
                                        <div className="text-xs text-green-500 font-bold flex items-center justify-end gap-1">
                                            <TrendingUp size={12} /> +2.4% за месяц
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats / Status */}
                                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                    <StatusBadge label="ОСАГО" active={true} />
                                    <StatusBadge label="Техосмотр" active={true} />
                                    <StatusBadge label="Штрафы" active={false} count={0} />
                                </div>

                                {/* Actions Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <QuickAction icon={Fuel} label="Заправки" color="text-purple-600" bg="bg-purple-50 hover:bg-purple-100" />
                                    <QuickAction icon={HandCoins} label="Мойки" color="text-blue-600" bg="bg-blue-50 hover:bg-blue-100" />
                                    <QuickAction icon={AlertTriangle} label="Штрафы" color="text-orange-600" bg="bg-orange-50 hover:bg-orange-100" count={0} />
                                    <QuickAction icon={CreditCard} label="Документы" color="text-emerald-600" bg="bg-emerald-50 hover:bg-emerald-100" />
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex gap-4">
                                    <Link to={`/admin/listings?create=true&carId=${car.id}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                                        Продать за ${car.estimatedPrice.toLocaleString()}
                                    </Link>
                                    <button className="h-12 w-12 rounded-xl border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                                        <Shield size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {cars.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Car size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">В гараже пусто</h3>
                        <p className="text-slate-500 mb-6 max-w-xs mx-auto">Добавьте свой автомобиль, чтобы следить за штрафами, страховкой и ценой.</p>
                        <button onClick={() => setIsAddModalOpen(true)} className="text-blue-600 font-bold hover:underline">
                            Добавить автомобиль
                        </button>
                    </div>
                )}
            </div>

            {/* Service & Tools Section */}
            <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Сервисы и услуги</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <ServiceCard
                        title="Страхование"
                        desc="КАСКО, ОСАГО с выгодой до 20%"
                        badge="5% кэшбек"
                        icon={Shield}
                        color="bg-blue-500"
                    />
                    <ServiceCard
                        title="Автокредит"
                        desc="Одобрение за 5 минут онлайн"
                        icon={CreditCard}
                        color="bg-purple-500"
                    />
                </div>
            </div>

            {/* Add Car Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-xl">Добавить авто</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddCar} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Марка</label>
                                <input required type="text" value={newCar.brand} onChange={e => setNewCar({ ...newCar, brand: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 transition-all font-bold" placeholder="Chevrolet" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Модель</label>
                                <input required type="text" value={newCar.model} onChange={e => setNewCar({ ...newCar, model: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 transition-all font-bold" placeholder="Cobalt" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Год выпуска</label>
                                    <input required type="number" value={newCar.year} onChange={e => setNewCar({ ...newCar, year: Number(e.target.value) })} className="w-full p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 transition-all font-bold" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Гос. номер</label>
                                    <input type="text" value={newCar.plate} onChange={e => setNewCar({ ...newCar, plate: e.target.value.toUpperCase() })} className="w-full p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 transition-all font-bold uppercase" placeholder="01 A..." />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 active:scale-95 transition-all mt-4">
                                Добавить в гараж
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function QuickAction({ icon: Icon, label, color, bg, count }) {
    return (
        <button className={`flex flex-col items-center justify-center p-4 rounded-2xl ${bg} transition-colors group relative`}>
            {count !== undefined && count > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm animate-pulse">
                    {count}
                </span>
            )}
            <div className={`w-12 h-12 rounded-xl bg-white/80 backdrop-blur flex items-center justify-center ${color} mb-2 shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <span className="text-xs font-bold text-slate-600">{label}</span>
        </button>
    );
}

function StatusBadge({ label, active, count }) {
    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold whitespace-nowrap ${active ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
            <div className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            {label}
            {count !== undefined && (
                <span className="ml-1 text-slate-400 font-normal">{count > 0 ? `(${count})` : 'не найдены'}</span>
            )}
        </div>
    );
}

function ServiceCard({ title, desc, icon: Icon, badge, color }) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group">
            <div className={`w-14 h-14 rounded-2xl ${color} text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform`}>
                <Icon size={28} />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-lg text-slate-900 leading-tight">{title}</h4>
                    {badge && <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{badge}</span>}
                </div>
                <p className="text-sm text-slate-500 font-medium">{desc}</p>
            </div>
            <div className="text-slate-300 group-hover:text-slate-600 transition-colors">→</div>
        </div>
    );
}
