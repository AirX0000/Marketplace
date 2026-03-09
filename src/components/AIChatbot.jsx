import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

export function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', content: 'Привет! Я ИИ-ассистент Autohouse Premium. Как я могу помочь вам сегодня?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const history = messages.slice(1).map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            const { response } = await api.aiChat(userMsg, history);
            setMessages(prev => [...prev, { role: 'bot', content: response }]);
        } catch (error) {
            console.error("AI Chat failed", error);
            const errorMsg = "Извините, произошла ошибка. Пожалуйста, попробуйте позже или свяжитесь с поддержкой.";
            setMessages(prev => [...prev, { role: 'bot', content: errorMsg }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[9999]">
            {/* Toggle Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0, rotate: -20 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0, rotate: 20 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="h-16 px-8 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white shadow-[0_20px_40px_rgba(147,51,234,0.4)] flex items-center justify-center gap-4 group relative overflow-hidden border border-white/20"
                    >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center justify-center">
                            <Sparkles className="h-6 w-6 absolute opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500" />
                            <MessageSquare className="h-6 w-6 group-hover:opacity-0 transition-all duration-500" />
                        </div>
                        <span className="font-black tracking-widest uppercase text-xs">AI Ассистент</span>

                        {/* Status Dot */}
                        <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)] animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 50, scale: 0.95, filter: 'blur(10px)' }}
                        className="w-[380px] sm:w-[450px] h-[650px] bg-[#191624]/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/10 flex flex-col overflow-hidden relative"
                    >
                        {/* Decorative Background Glows */}
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-600/10 blur-[100px] pointer-events-none" />
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600/10 blur-[100px] pointer-events-none" />

                        {/* Header */}
                        <div className="p-8 pb-6 flex items-center justify-between relative z-10 border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg border border-white/20 relative group">
                                    <Bot size={28} className="text-white group-hover:scale-110 transition-transform" />
                                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-[#191624] shadow-lg" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-black text-lg text-white uppercase tracking-tight">Autohouse AI</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1 w-1 rounded-full bg-green-400" />
                                        <span className="text-[10px] text-green-400/80 uppercase font-black tracking-[0.2em]">Система активна</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="h-12 w-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl text-white/50 hover:text-white transition-all border border-white/5 active:scale-95"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide relative z-10">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={idx}
                                    className={cn(
                                        "flex gap-4 max-w-[90%]",
                                        msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                    )}
                                >
                                    <div className={cn(
                                        "h-10 w-10 min-w-[40px] rounded-xl flex items-center justify-center border transition-all",
                                        msg.role === 'user'
                                            ? "bg-white/5 border-white/10 text-slate-400"
                                            : "bg-purple-600/10 border-purple-500/20 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                                    )}>
                                        {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                                    </div>
                                    <div className={cn(
                                        "p-5 rounded-3xl text-sm font-bold leading-relaxed whitespace-pre-wrap transition-all",
                                        msg.role === 'user'
                                            ? "bg-purple-600 text-white rounded-tr-none shadow-[0_10px_30px_rgba(147,51,234,0.2)] border border-purple-500/30"
                                            : "bg-white/5 text-slate-200 border border-white/10 rounded-tl-none backdrop-blur-md"
                                    )}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex gap-4 max-w-[85%]">
                                    <div className="h-10 w-10 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                                        <Bot size={20} className="animate-bounce" />
                                    </div>
                                    <div className="bg-white/5 p-5 rounded-3xl border border-white/10 rounded-tl-none flex items-center gap-3">
                                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce" />
                                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]" />
                                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Footer */}
                        <div className="p-8 pt-4 relative z-10 border-t border-white/5">
                            <form onSubmit={handleSend} className="relative group">
                                <div className="absolute inset-0 bg-purple-600/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Ваш вопрос ассистенту..."
                                    className="w-full pl-6 pr-16 py-5 rounded-2xl border border-white/10 bg-white/5 focus:bg-white/10 focus:border-purple-500/50 focus:outline-none transition-all text-sm font-bold text-white placeholder-slate-600"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || loading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-xl bg-purple-600 text-white flex items-center justify-center disabled:opacity-50 disabled:grayscale hover:bg-purple-500 hover:scale-105 active:scale-95 transition-all shadow-lg"
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send size={20} />}
                                </button>
                            </form>
                            <div className="mt-4 flex items-center justify-center gap-6 opacity-40">
                                <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <Zap size={10} className="text-purple-500" />
                                    Powered by Autohouse AI
                                </span>
                                <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <ShieldCheck size={10} className="text-blue-500" />
                                    Secure SSL
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
