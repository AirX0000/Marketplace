import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, Map } from 'lucide-react';

export function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0F0E17] flex items-center justify-center p-6 overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
            
            <div className="max-w-2xl w-full text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="relative inline-block mb-8">
                        <motion.h1 
                            className="text-[150px] md:text-[220px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 opacity-20"
                            animate={{ 
                                scale: [1, 1.05, 1],
                                rotate: [0, 2, 0, -2, 0]
                            }}
                            transition={{ 
                                duration: 10, 
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            404
                        </motion.h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                                className="bg-purple-600 p-6 rounded-3xl shadow-[0_20px_50px_rgba(147,51,234,0.3)] border border-purple-400/30"
                            >
                                <Search size={48} className="text-white" />
                            </motion.div>
                        </div>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">
                        Страница потерялась в пути
                    </h2>
                    
                    <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-lg mx-auto font-medium">
                        Похоже, этой страницы больше не существует или адрес был введен неверно. Но не волнуйтесь, мы поможем вам вернуться на правильный маршрут.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black transition-all hover:bg-slate-200 active:scale-95 shadow-xl uppercase tracking-widest text-sm"
                        >
                            <Home size={20} />
                            На главную
                        </button>
                        
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#191624] text-white border border-white/10 px-8 py-4 rounded-2xl font-black transition-all hover:bg-white/5 active:scale-95 uppercase tracking-widest text-sm"
                        >
                            <ArrowLeft size={20} />
                            Вернуться назад
                        </button>
                    </div>

                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50">
                        <QuickLink icon={<Map size={16} />} label="Каталог" path="/marketplaces" navigate={navigate} />
                        <QuickLink icon={<Search size={16} />} label="Поиск" path="/marketplaces" navigate={navigate} />
                        <QuickLink icon={<Home size={16} />} label="О нас" path="/about" navigate={navigate} />
                        <QuickLink icon={<Map size={16} />} label="Помощь" path="/help" navigate={navigate} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function QuickLink({ icon, label, path, navigate }) {
    return (
        <button 
            onClick={() => navigate(path)}
            className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-purple-400 transition-colors uppercase tracking-widest"
        >
            {icon}
            {label}
        </button>
    );
}
