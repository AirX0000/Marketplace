import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

export function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', content: 'Привет! Я ИИ-ассистент autohouse. Чем могу помочь?' }
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
            // Format history for backend (exclude current user message which is sent separately)
            const history = messages.slice(1).map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            const { response } = await api.aiChat(userMsg, history);
            setMessages(prev => [...prev, { role: 'bot', content: response }]);
        } catch (error) {
            console.error("AI Chat failed", error);
            const errorMsg = error.message?.includes('timeout')
                ? "Извините, сервер не отвечает. Пожалуйста, попробуйте позже."
                : "Извините, произошла ошибка. Наша команда уже работает над этим. Попробуйте позже или свяжитесь с поддержкой: support@aura.com";
            setMessages(prev => [...prev, { role: 'bot', content: errorMsg }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group overflow-hidden"
                >
                    <Sparkles className="h-6 w-6 absolute opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity" />
                    <MessageSquare className="h-6 w-6 group-hover:opacity-0 transition-opacity" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="bg-blue-600 p-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Bot size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">autohouse AI</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-[10px] opacity-80 uppercase tracking-wider font-semibold">Online</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={cn(
                                "flex gap-2 max-w-[85%]",
                                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                            )}>
                                <div className={cn(
                                    "h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center",
                                    msg.role === 'user' ? "bg-slate-200 dark:bg-slate-800 text-slate-600" : "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                                )}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={cn(
                                    "p-3 rounded-2xl text-sm leading-relaxed",
                                    msg.role === 'user'
                                        ? "bg-blue-600 text-white rounded-tr-none"
                                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-sm"
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-2 max-w-[85%]">
                                <div className="h-8 w-8 rounded-full flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                    <Bot size={16} />
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                        <div className="relative">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Напишите сообщение..."
                                className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="absolute right-2 top-2 h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
