import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, ChevronRight, Minimize2, Maximize2 } from 'lucide-react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';

export function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Привет! Я ваш AI-помощник по недвижимости. Опишите, что вы ищете? (Например: "Квартира на Чиланзаре до 60k")' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            // Call Backend AI
            const { filters, recommendations } = await api.getAIRecommendations(userMsg);

            if (recommendations && recommendations.length > 0) {
                // Construct URL params
                const params = new URLSearchParams();
                if (filters.category) params.append('category', filters.category[0]); // Simple case
                if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
                if (filters.rooms) params.append('attr_rooms', filters.rooms); // Assuming attr filter support or we add it
                if (filters.district) params.append('q', filters.district); // Search by district

                // Add specific logic for search bar if district not exact
                if (filters.locationKeyword && !filters.district) params.append('q', filters.locationKeyword);

                setMessages(prev => [...prev, {
                    type: 'bot',
                    text: `Нашел для вас ${recommendations.length} вариантов:`,
                    products: recommendations,
                    searchLink: `/marketplaces?${params.toString()}`
                }]);
            } else {
                setMessages(prev => [...prev, { type: 'bot', text: 'К сожалению, ничего не нашел по вашему запросу. Попробуйте изменить параметры.' }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { type: 'bot', text: 'Произошла ошибка при поиске. Попробуйте позже.' }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 z-50 animate-bounce-subtle"
            >
                <Bot size={28} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-48px)] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <div className="bg-blue-600 p-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-1.5 rounded-lg">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">AI Ассистент</h3>
                        <p className="text-[10px] opacity-80 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-md transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.type === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white border border-slate-100 shadow-sm text-slate-800 rounded-bl-none'
                            }`}>
                            <p>{msg.text}</p>

                            {/* Product Recommendations */}
                            {msg.products && (
                                <div className="mt-3 space-y-2">
                                    {msg.products.map(p => (
                                        <Link
                                            to={`/marketplace/${p.id}`}
                                            key={p.id}
                                            className="block bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg p-2 transition-colors flex gap-3 group"
                                        >
                                            <div className="w-12 h-12 bg-slate-200 rounded-md overflow-hidden shrink-0">
                                                {p.image && <img src={p.image} className="w-full h-full object-cover" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-xs truncate group-hover:text-blue-600">{p.name}</div>
                                                <div className="text-[10px] text-slate-500 truncate">{p.attributes?.district || p.region}</div>
                                                <div className="font-bold text-xs text-blue-600 mt-0.5">{p.price?.toLocaleString()} sum</div>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-300 self-center" />
                                        </Link>
                                    ))}
                                </div>
                            )}


                            {/* Smart Filter Link */}
                            {msg.searchLink && (
                                <Link
                                    to={msg.searchLink}
                                    onClick={() => setIsOpen(false)} // Close chat on navigation
                                    className="mt-3 flex items-center justify-center w-full py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                                >
                                    Показать всё в каталоге
                                    <ChevronRight size={14} className="ml-1" />
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-none p-3 flex gap-1">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Напишите параметры..."
                        className="w-full h-10 pl-4 pr-12 rounded-full border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="absolute right-1 h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                    >
                        <Send size={14} />
                    </button>
                </div>
            </div>
        </div >
    );
}
