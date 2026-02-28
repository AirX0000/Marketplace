import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { api } from '../lib/api';
import { useShop } from '../context/ShopContext';
import { Send, User as UserIcon, Store, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function ChatPage() {
    const { user } = useShop();
    const [rooms, setRooms] = useState([]);
    const [activeRoom, setActiveRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!user) return;

        // Connect to Socket
        const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || window.location.origin;
        socketRef.current = io(socketUrl, {
            auth: { token: localStorage.getItem('token') }
        });

        socketRef.current.on('receive_message', (message) => {
            if (activeRoom && message.chatRoomId === activeRoom.id) {
                setMessages(prev => [...prev, message]);
            }
            // Update rooms list last message
            setRooms(prev => prev.map(r =>
                r.id === message.chatRoomId
                    ? { ...r, lastMessage: message.content, updatedAt: message.createdAt }
                    : r
            ));
        });

        loadRooms();

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [user, activeRoom?.id]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const loadRooms = async () => {
        try {
            const data = await api.fetchAPI('/chat/rooms');
            setRooms(data);
            setLoading(false);
        } catch (error) {
            toast.error("Не удалось загрузить чаты");
        }
    };

    const handleSelectRoom = async (room) => {
        setActiveRoom(room);
        setLoading(true);
        try {
            const data = await api.fetchAPI(`/chat/rooms/${room.id}/messages`);
            setMessages(data);
            if (socketRef.current) {
                socketRef.current.emit('join_room', room.id);
            }
        } catch (error) {
            toast.error("Ошибка загрузки сообщений");
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeRoom || !socketRef.current) return;

        socketRef.current.emit('send_message', {
            roomId: activeRoom.id,
            content: newMessage
        });
        setNewMessage('');
    };

    if (!user) return <div className="p-12 text-center text-foreground">Войдите в систему для доступа к чатам</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="bg-card rounded-[32px] shadow-2xl border border-border overflow-hidden flex h-[700px]">
                {/* Sidebar */}
                <div className="w-80 border-r border-border flex flex-col bg-muted/30">
                    <div className="p-6 border-b border-border bg-card">
                        <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-primary" /> Сообщения
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {rooms.length === 0 && !loading && (
                            <div className="p-8 text-center text-muted-foreground text-sm">Нет активных чатов</div>
                        )}
                        {rooms.map(room => (
                            <button
                                key={room.id}
                                onClick={() => handleSelectRoom(room)}
                                className={`w-full p-4 flex gap-3 hover:bg-muted/50 transition-all text-left border-b border-border ${activeRoom?.id === room.id ? 'bg-muted shadow-inner border-l-4 border-l-primary' : ''}`}
                            >
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted shrink-0">
                                    {room.partner?.avatar ? (
                                        <img src={room.partner.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                            {room.partner?.role === 'PARTNER' ? <Store className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-foreground truncate">
                                        {room.partner?.storeName || room.partner?.name || "Пользователь"}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate mt-0.5">{room.lastMessage || "Начните чат..."}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Message Window */}
                <div className="flex-1 flex flex-col bg-background">
                    {activeRoom ? (
                        <>
                            <div className="p-4 border-b border-border flex items-center gap-3 bg-card">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                                    {activeRoom.partner?.avatar ? (
                                        <img src={activeRoom.partner.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><UserIcon className="w-5 h-5" /></div>}
                                </div>
                                <div>
                                    <div className="font-bold text-foreground">{activeRoom.partner?.storeName || activeRoom.partner?.name}</div>
                                    <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Online</div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/10">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-sm ${msg.senderId === user.id ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-card text-foreground rounded-tl-none border border-border'}`}>
                                            {msg.content}
                                            <div className={`text-[10px] mt-1 opacity-60 ${msg.senderId === user.id ? 'text-right' : 'text-left'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} className="p-4 border-t border-border flex gap-3 bg-card">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Введите сообщение..."
                                    className="flex-1 bg-muted border border-border text-foreground rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                                />
                                <button
                                    type="submit"
                                    className="bg-primary text-primary-foreground p-3 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                            <MessageSquare className="w-16 h-16 mb-4 opacity-10" />
                            <p className="font-bold">Выберите чат, чтобы начать общение</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
