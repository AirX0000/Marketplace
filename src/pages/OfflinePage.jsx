import React from 'react';
import { WifiOff, RotateCcw, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export const OfflinePage = () => {
    return (
        <div className="min-h-screen bg-[#13111C] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Premium Mesh Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-[#191624] rounded-[32px] p-10 border border-white/5 shadow-2xl text-center relative z-10"
            >
                <div className="h-20 w-20 bg-purple-600/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-purple-600/20">
                    <WifiOff className="h-10 w-10 text-purple-400" />
                </div>
                
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Вы оффлайн</h1>
                <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed italic">
                    Кажется, интернет-соединение прервалось. Но не волнуйтесь, Autohouse работает в режиме ограниченного доступа.
                </p>

                <div className="space-y-4">
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full h-14 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all italic shadow-lg shadow-purple-600/20 active:scale-95"
                    >
                        <RotateCcw className="h-4 w-4" /> Попробовать снова
                    </button>
                    <a 
                        href="/"
                        className="w-full h-14 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all border border-white/5 italic active:scale-95"
                    >
                        <Home className="h-4 w-4" /> На главную
                    </a>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 opacity-50">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Autohouse Premium Offline Module</p>
                </div>
            </motion.div>
        </div>
    );
};
