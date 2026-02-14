import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { useShop } from '../../context/ShopContext';
import { MessageSquare, Send, Plus, Search, CheckCircle, XCircle, Clock, MoreVertical, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function AdminSupport() {
    const { user } = useShop();
    const isAdmin = user?.role === 'ADMIN';
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // New Ticket Form
    const [newTicketData, setNewTicketData] = useState({ subject: '', message: '', priority: 'NORMAL' });

    useEffect(() => {
        loadTickets();
    }, []);

    useEffect(() => {
        if (selectedTicket) {
            scrollToBottom();
        }
    }, [selectedTicket?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadTickets = async () => {
        setLoading(true);
        try {
            const data = await api.getTickets();
            setTickets(data);
        } catch (error) {
            console.error("Failed to load tickets", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTicket = async (ticket) => {
        // Optimistic update or just set if we already have data? 
        // Better navigate or fetch details to get messages
        try {
            const details = await api.getTicket(ticket.id);
            setSelectedTicket(details);
            setIsCreating(false); // Close create mode if open
        } catch (e) {
            toast.error("Не удалось загрузить сообщения");
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            const res = await api.createTicket(newTicketData);
            setTickets([res, ...tickets]);
            setIsCreating(false);
            setNewTicketData({ subject: '', message: '', priority: 'NORMAL' });
            handleSelectTicket(res);
            toast.success("Тикет создан");
        } catch (error) {
            toast.error("Ошибка создания тикета");
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;

        try {
            const reply = await api.replyTicket(selectedTicket.id, newMessage);
            setSelectedTicket({
                ...selectedTicket,
                messages: [...selectedTicket.messages, { ...reply, user: { name: user.name } }], // Optimistic user name
                updatedAt: new Date().toISOString(),
                status: 'OPEN'
            });
            setNewMessage("");
            // Update in list too
            setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, updatedAt: new Date().toISOString(), status: 'OPEN' } : t));
        } catch (error) {
            toast.error("Не удалось отправить сообщение");
        }
    };

    const handleStatusChange = async (status) => {
        if (!selectedTicket) return;
        try {
            await api.updateTicketStatus(selectedTicket.id, status);
            setSelectedTicket({ ...selectedTicket, status });
            setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status } : t));
            toast.success(`Тикет ${status === 'CLOSED' ? 'закрыт' : 'открыт'}`);
        } catch (error) {
            toast.error("Ошибка обновления статуса");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'text-blue-600 bg-blue-50 border-green-200';
            case 'CLOSED': return 'text-gray-500 bg-gray-50 border-gray-200';
            default: return 'text-blue-600 bg-blue-50 border-blue-200';
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 animate-in fade-in">
            {/* Left Sidebar: Ticket List */}
            <div className={`w-full md:w-1/3 bg-card border rounded-xl flex flex-col shadow-sm overflow-hidden ${selectedTicket ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b flex justify-between items-center bg-muted/30">
                    <h2 className="font-semibold flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Поддержка
                    </h2>
                    {!isAdmin && (
                        <button
                            onClick={() => { setIsCreating(true); setSelectedTicket(null); }}
                            className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors"
                            title="Новый тикет"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {loading && <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto text-slate-700" /></div>}

                    {!loading && tickets.length === 0 && (
                        <div className="text-center p-8 text-slate-700 text-sm">
                            Нет обращений
                        </div>
                    )}

                    {tickets.map(ticket => (
                        <button
                            key={ticket.id}
                            onClick={() => handleSelectTicket(ticket)}
                            className={`w-full text-left p-3 rounded-lg border transition-all hover:shadow-md ${selectedTicket?.id === ticket.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'bg-background hover:border-primary/50'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getStatusColor(ticket.status)}`}>
                                    {ticket.status === 'OPEN' ? 'ОТКРЫТ' : 'ЗАКРЫТ'}
                                </span>
                                <span className="text-[10px] text-slate-700">
                                    {new Date(ticket.updatedAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="font-medium text-sm line-clamp-1 mb-1">{ticket.subject}</div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-700 truncate max-w-[120px]">
                                    {isAdmin ? (ticket.user?.name || ticket.userId) : `ID: ...${ticket.id.slice(-4)}`}
                                </span>
                                {ticket.priority === 'HIGH' && <span className="text-[10px] text-red-500 font-bold">HIGH</span>}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Side: Chat or Create Form */}
            <div className={`w-full md:w-2/3 bg-card border rounded-xl flex flex-col shadow-sm overflow-hidden ${!selectedTicket && !isCreating ? 'hidden md:flex' : 'flex'}`}>
                {isCreating ? (
                    // Create Form
                    <div className="flex-1 flex flex-col">
                        <div className="p-4 border-b flex items-center gap-2">
                            <button onClick={() => setIsCreating(false)} className="md:hidden mr-2"><XCircle className="h-6 w-6" /></button>
                            <h3 className="font-bold">Новое обращение</h3>
                        </div>
                        <form onSubmit={handleCreateTicket} className="p-6 space-y-4 flex-1 overflow-y-auto">
                            <div>
                                <label className="text-sm font-medium">Тема</label>
                                <input required value={newTicketData.subject} onChange={e => setNewTicketData({ ...newTicketData, subject: e.target.value })} className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm bg-background" placeholder="Краткая суть проблемы" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Приоритет</label>
                                <select value={newTicketData.priority} onChange={e => setNewTicketData({ ...newTicketData, priority: e.target.value })} className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm bg-background">
                                    <option value="LOW">Низкий (Вопрос)</option>
                                    <option value="NORMAL">Обычный</option>
                                    <option value="HIGH">Высокий (Проблема)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Сообщение</label>
                                <textarea required rows={8} value={newTicketData.message} onChange={e => setNewTicketData({ ...newTicketData, message: e.target.value })} className="flex w-full rounded-md border border-input px-3 py-2 text-sm bg-background" placeholder="Опишите проблему подробно..." />
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-2 rounded-md font-medium text-sm flex items-center gap-2">
                                    <Send className="h-4 w-4" /> Отправить
                                </button>
                            </div>
                        </form>
                    </div>
                ) : selectedTicket ? (
                    // Chat View
                    <div className="flex-1 flex flex-col h-full">
                        {/* Header */}
                        <div className="p-4 border-b bg-muted/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedTicket(null)} className="md:hidden"><XCircle className="h-6 w-6 text-slate-700" /></button>
                                <div>
                                    <h3 className="font-bold text-sm sm:text-base line-clamp-1">{selectedTicket.subject}</h3>
                                    <div className="text-xs text-slate-700 flex items-center gap-2">
                                        <span>{isAdmin ? `Пользователь: ${selectedTicket.user?.name || 'Unknown'}` : `Статус: ${selectedTicket.status}`}</span>
                                        <span className="text-gray-300">|</span>
                                        <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isAdmin && selectedTicket.status === 'OPEN' && (
                                    <button onClick={() => handleStatusChange('CLOSED')} className="bg-white border hover:bg-gray-50 text-xs px-3 py-1.5 rounded-md text-red-600 font-medium">
                                        Закрыть тикет
                                    </button>
                                )}
                                {isAdmin && selectedTicket.status === 'CLOSED' && (
                                    <button onClick={() => handleStatusChange('OPEN')} className="bg-white border hover:bg-gray-50 text-xs px-3 py-1.5 rounded-md text-blue-600 font-medium">
                                        Открыть
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
                            {selectedTicket.messages?.map((msg, idx) => {
                                const isMe = isAdmin ? msg.isAdmin : !msg.isAdmin; // Simplification: if I am admin, admin msgs are me. If I am user, user msgs are me.
                                // Actually better: compare msg.userId with current user.id
                                const isMyMsg = msg.userId === user.userId;

                                return (
                                    <div key={msg.id || idx} className={`flex ${isMyMsg ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-xl p-3 text-sm ${isMyMsg
                                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                : 'bg-muted text-foreground rounded-tl-none border'
                                            }`}>
                                            {!isMyMsg && <div className="text-[10px] opacity-70 mb-1 font-bold">{msg.user?.name || (msg.isAdmin ? 'Admin' : 'User')}</div>}
                                            <div className="whitespace-pre-wrap">{msg.message}</div>
                                            <div className={`text-[10px] mt-1 text-right ${isMyMsg ? 'text-primary-foreground/70' : 'text-slate-700'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        {selectedTicket.status === 'OPEN' ? (
                            <form onSubmit={handleReply} className="p-4 border-t bg-background flex gap-2">
                                <input
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Напишите сообщение..."
                                    className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md flex items-center justify-center disabled:opacity-50"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </form>
                        ) : (
                            <div className="p-4 border-t bg-muted/20 text-center text-sm text-slate-700">
                                Этот тикет закрыт. {isAdmin ? 'Вы можете открыть его снова.' : 'Создайте новый, если проблема не решена.'}
                            </div>
                        )}
                    </div>
                ) : (
                    // Empty State
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-700 p-8">
                        <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                        <h3 className="text-lg font-medium">Служба Поддержки</h3>
                        <p className="max-w-xs text-center text-sm mt-2">
                            Выберите обращение из списка слева или создайте новое, чтобы связаться с нами.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
