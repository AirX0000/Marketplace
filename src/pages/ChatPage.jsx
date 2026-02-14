import React, { useEffect, useState, useRef } from 'react';
import { api } from '../lib/api';
import io from 'socket.io-client';
import { useShop } from '../context/ShopContext';
import { Send, User, Search, MessageSquare, Loader2 } from 'lucide-react';

const SOCKET_URL = 'http://localhost:3000'; // Or from env

export function ChatPage() {
    const { user } = useShop();
    const [socket, setSocket] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [activeRoomId, setActiveRoomId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Initial Setup
    useEffect(() => {
        // Connect Socket with Token
        const token = localStorage.getItem('token');
        const newSocket = io(SOCKET_URL, {
            auth: {
                token: token
            }
        });
        setSocket(newSocket);

        loadRooms();

        return () => newSocket.close();
    }, []);

    // Load Messages when room changes
    useEffect(() => {
        if (!activeRoomId || !socket) return;

        api.getChatMessages(activeRoomId).then(data => {
            setMessages(data);
            scrollToBottom();
        });

        socket.emit('join_room', activeRoomId);

        // Listen for new messages
        const handleReceiveMessage = (message) => {
            if (message.chatRoomId === activeRoomId) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            }
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [activeRoomId, socket]);

    const loadRooms = async () => {
        try {
            const data = await api.getChatRooms();
            setRooms(data);
            if (data.length > 0 && !activeRoomId) {
                // Auto select first room if none selected
                // setActiveRoomId(data[0].id); 
            }
        } catch (error) {
            console.error("Failed to load chats", error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !activeRoomId) return;

        const messageData = {
            roomId: activeRoomId,
            content: inputText
        };

        if (socket) {
            socket.emit('send_message', messageData);
            setInputText("");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading chats...</div>;

    const activeRoom = rooms.find(r => r.id === activeRoomId);

    return (
        <div className="container py-6 px-4 md:px-6 h-[calc(100vh-100px)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">

                {/* Rooms List */}
                <div className="md:col-span-1 border-r dark:border-slate-800 flex flex-col h-full bg-white dark:bg-slate-900">
                    <div className="p-4 border-b dark:border-slate-800">
                        <h2 className="font-bold text-lg mb-4 dark:text-white">Сообщения</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Поиск..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 dark:text-white dark:placeholder-slate-500"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {rooms.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                Нет чатов
                            </div>
                        ) : (
                            rooms.map(room => (
                                <button
                                    key={room.id}
                                    onClick={() => setActiveRoomId(room.id)}
                                    className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left border-b border-slate-50 dark:border-slate-800
                                        ${activeRoomId === room.id ? 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/50' : ''}`}
                                >
                                    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {room.partner?.avatar ? (
                                            <img src={room.partner.avatar} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="h-5 w-5 text-slate-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                                                {room.partner?.storeName || room.partner?.name || 'Пользователь'}
                                            </span>
                                            {room.lastMessageAt && (
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(room.lastMessageAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                                            {room.lastMessage || 'Начните общение'}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="md:col-span-2 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950">
                    {activeRoomId ? (
                        <>
                            {/* Header */}
                            <div className="p-4 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center gap-3 shadow-sm z-10">
                                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                    {activeRoom?.partner?.avatar ? (
                                        <img src={activeRoom.partner.avatar} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="h-5 w-5 text-slate-500" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">
                                        {activeRoom?.partner?.storeName || activeRoom?.partner?.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Online</span>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map(msg => {
                                    const isMe = msg.senderId === user.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm ${isMe
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border dark:border-slate-700'
                                                }`}>
                                                <p>{msg.content}</p>
                                                <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={sendMessage} className="p-4 bg-white dark:bg-slate-900 border-t dark:border-slate-800">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={e => setInputText(e.target.value)}
                                        placeholder="Введите сообщение..."
                                        className="flex-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-4 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 dark:text-white dark:placeholder-slate-500 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputText.trim()}
                                        className="h-12 w-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare size={32} />
                            </div>
                            <p>Выберите чат чтобы начать общение</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
