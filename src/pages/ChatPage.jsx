import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { api } from '../lib/api';
import { useShop } from '../context/ShopContext';
import {
    Search, Bell, Settings, LayoutDashboard, Package, MessageSquare,
    BarChart3, ShieldCheck, Phone, Video,
    MoreHorizontal, Plus, Smile, Send, ExternalLink, X, CheckCircle2, Car
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const NavItem = ({ icon, label, active, count, isShortcut, onClick }) => {
    if (isShortcut) {
        return (
            <button onClick={onClick} className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/[0.02] rounded-xl transition-colors text-slate-400 hover:text-white group">
                <span className="text-sm font-medium">{label}</span>
                {count > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#13111C] border border-white/10 group-hover:border-white/20 transition-colors">{count}</span>}
            </button>
        );
    }

    return (
        <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${active ? 'bg-[#6919FF] text-white shadow-[0_4px_20px_rgba(105,25,255,0.3)]' : 'text-slate-400 hover:bg-white/[0.02] hover:text-white'}`}>
            {React.cloneElement(icon, { size: 18, className: active ? 'text-white' : 'text-slate-400' })}
            <span className="text-sm font-bold">{label}</span>
            {count > 0 && <span className="ml-auto bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">{count}</span>}
        </button>
    );
};

export function ChatPage() {
    const { user } = useShop();
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [activeRoom, setActiveRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const getSocketUrl = () => {
            const apiUrl = import.meta.env.VITE_API_URL;
            if (window.location.hostname === 'localhost' && apiUrl) {
                return apiUrl.replace('/api', '');
            }
            return window.location.origin;
        };

        const socketUrl = getSocketUrl();
        socketRef.current = io(socketUrl, {
            auth: { token: localStorage.getItem('token') }
        });

        socketRef.current.on('receive_message', (message) => {
            if (activeRoom && message.chatRoomId === activeRoom.id) {
                setMessages(prev => [...prev, message]);
            }
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
    }, [user, activeRoom?.id, navigate]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const loadRooms = async () => {
        try {
            const data = await api.fetchAPI('/chat/rooms');
            // Provide mock rooms if empty for visual parity with mockup
            if (!data || data.length === 0) {
                setRooms([
                    { id: '1', partner: { name: 'Alexander Rossi', storeName: 'Alexander Rossi', avatar: 'https://i.pravatar.cc/100?img=11' }, lastMessage: 'Is the Porsche 911 still available?', updatedAt: new Date().toISOString() },
                    { id: '2', partner: { name: 'Marina Silva', avatar: 'https://i.pravatar.cc/100?img=5' }, lastMessage: 'The financing documents are ready for your review...', updatedAt: new Date(Date.now() - 86400000).toISOString() },
                    { id: '3', partner: { name: 'David Chen', avatar: 'https://i.pravatar.cc/100?img=12' }, lastMessage: "Thanks! I'll check the service history now.", updatedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
                    { id: '4', partner: { name: 'Sarah Jenkins', avatar: 'https://i.pravatar.cc/100?img=3' }, lastMessage: 'Can we schedule a test drive for Saturday morning?', updatedAt: new Date(Date.now() - 86400000 * 4).toISOString() },
                ]);
            } else {
                setRooms(data);
            }
            setLoading(false);
        } catch (error) {
            toast.error("Failed to load chats");
        }
    };

    const handleSelectRoom = async (room) => {
        setActiveRoom(room);
        setLoading(true);
        try {
            // Check if it's our mock data
            if (room.id.length < 10) {
                // Return mock conversation for UI visual
                setMessages([
                    { id: 'm1', senderId: room.id, content: 'Hi there! I saw your listing for the 2024 Porsche 911 GT3 RS. Is it still available for a viewing?', createdAt: new Date(Date.now() - 3600000).toISOString() },
                    { id: 'm2', senderId: user?.id, content: "Hello Alexander! Yes, the GT3 RS is still available. It's currently in our showroom in Beverly Hills.", createdAt: new Date(Date.now() - 3500000).toISOString() },
                    { id: 'm3', senderId: room.id, content: "That's great. Does it come with the Weissach package? I couldn't tell for sure from the photos.", createdAt: new Date(Date.now() - 1500000).toISOString() },
                    { id: 'm4', senderId: user?.id, content: "Absolutely. It has the full Weissach package including the carbon fibre components and magnesium wheels. I can send over the original window sticker if you'd like?", createdAt: new Date(Date.now() - 500000).toISOString() },
                ]);
            } else {
                const data = await api.fetchAPI(`/chat/rooms/${room.id}/messages`);
                setMessages(data);
                if (socketRef.current) {
                    socketRef.current.emit('join_room', room.id);
                }
            }
        } catch (error) {
            toast.error("Error loading conversation");
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeRoom) return;

        if (activeRoom.id.length < 10) {
            // Mock send for UI purposes
            setMessages(prev => [...prev, {
                id: Math.random().toString(),
                senderId: user?.id,
                content: newMessage,
                createdAt: new Date().toISOString()
            }]);
        } else if (socketRef.current) {
            socketRef.current.emit('send_message', {
                roomId: activeRoom.id,
                content: newMessage
            });
        }

        setNewMessage('');
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 z-[100] flex bg-[#13111C] font-sans text-slate-200">
            {/* Left Sidebar */}
            <aside className="w-[260px] flex-shrink-0 bg-[#191624] border-r border-white/5 flex flex-col">
                {/* Logo Section */}
                <div className="h-20 flex items-center px-6 mt-2 relative">
                    <button onClick={() => navigate('/')} className="absolute inset-0 w-full h-full z-10 cursor-pointer opacity-0" title="Back to Home" />
                    <div className="w-8 h-8 bg-[#6919FF] rounded-lg flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(105,25,255,0.4)]">
                        <Car size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-white tracking-wide text-lg">Autohouse</span>
                </div>

                {/* Navigation */}
                <nav className="px-4 py-4 flex-1 space-y-1 overflow-y-auto scrollbar-none">
                    <NavItem icon={<LayoutDashboard />} label="Dashboard" onClick={() => navigate('/profile')} />
                    <NavItem icon={<Package />} label="Inventory" onClick={() => navigate('/profile/listings')} />
                    <NavItem icon={<MessageSquare />} label="Messages" active />
                    <NavItem icon={<BarChart3 />} label="Analytics" onClick={() => navigate('/services/analytics')} />
                    <NavItem icon={<Settings />} label="Settings" onClick={() => navigate('/profile/settings')} />

                    <div className="mt-10 mb-4 px-4 text-[10px] font-bold text-slate-500 tracking-wider uppercase">Shortcuts</div>
                    <NavItem label="Favorites" count={12} isShortcut onClick={() => navigate('/favorites')} />
                    <NavItem label="Recent Inquiries" count={4} isShortcut />
                </nav>

                {/* Trust Score Widget */}
                <div className="p-4 mb-2">
                    <div className="bg-[#13111C] rounded-2xl p-4 border border-white/5 shadow-inner">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                <ShieldCheck size={16} />
                            </div>
                            <span className="font-bold text-sm text-white">Trust Score: 98%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mb-4 leading-relaxed font-medium">You are a verified premium seller on Autohouse.</p>
                        <button onClick={() => navigate('/profile')} className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 text-xs font-bold text-slate-300 transition-colors">
                            VIEW PROFILE
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Global Header */}
                <header className="h-[88px] flex-shrink-0 border-b border-white/5 flex items-center justify-between px-8 bg-[#13111C]">
                    <div className="flex-1 max-w-xl relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-slate-400 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search marketplace..."
                            className="w-full h-12 bg-[#191624] border border-white/5 rounded-full pl-14 pr-4 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-white placeholder-slate-500 shadow-inner"
                        />
                    </div>
                    <div className="flex items-center gap-5 ml-4">
                        <button className="w-10 h-10 rounded-full bg-[#191624] border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors text-slate-400">
                            <Bell size={18} />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-[#191624] border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors text-slate-400">
                            <Settings size={18} />
                        </button>
                        <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-purple-500 overflow-hidden ring-2 ring-white/10 hover:ring-purple-500/50 transition-all cursor-pointer">
                            <img src={user?.avatar || "https://i.pravatar.cc/100?img=33"} alt="Profile" className="w-full h-full object-cover" />
                        </button>
                        {/* Close App Screen Button */}
                        <button onClick={() => navigate(-1)} className="ml-2 text-slate-500 hover:text-white transition-colors" title="Close Chat">
                            <X size={24} />
                        </button>
                    </div>
                </header>

                {/* Chat Flex Container */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Messages List Column */}
                    <div className="w-[380px] flex-shrink-0 border-r border-white/5 flex flex-col bg-[#110F18]">
                        <div className="p-6 pb-4">
                            <h2 className="text-[28px] font-black text-white mb-6 tracking-tight">Messages</h2>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search conversations"
                                    className="w-full h-11 bg-[#1A1724] border border-white/5 rounded-full pl-12 pr-4 text-sm focus:outline-none focus:border-purple-500/30 transition-all text-white placeholder-slate-500 ring-1 ring-transparent focus:ring-purple-500/20"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-[2px] p-4 pt-2 scrollbar-thin scrollbar-thumb-white/10">
                            {loading ? (
                                <div className="text-center py-10 text-slate-500 text-sm font-medium">Loading conversations...</div>
                            ) : rooms.map((room, idx) => {
                                const isActive = activeRoom?.id === room.id;
                                // Mock first room to have unread messages matching mockup
                                const showUnread = idx === 0 && !isActive;

                                return (
                                    <div
                                        key={room.id}
                                        onClick={() => handleSelectRoom(room)}
                                        className={`w-full p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all border border-transparent ${isActive ? 'bg-[#1D1929] border-white/5 shadow-md' : 'hover:bg-white/[0.02]'}`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className={`w-12 h-12 rounded-full overflow-hidden bg-[#2A273D] ${isActive ? 'ring-2 ring-purple-500/30' : ''}`}>
                                                <img src={room.partner?.avatar || `https://i.pravatar.cc/100?u=${room.id}`} alt="avatar" className="w-full h-full object-cover" />
                                            </div>
                                            {/* Status dot */}
                                            {idx % 2 === 0 ? (
                                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#13111C] rounded-full"></div>
                                            ) : (
                                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-slate-400 border-2 border-[#13111C] rounded-full"></div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`font-bold text-sm truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                                                    {room.partner?.storeName || room.partner?.name || "User"}
                                                </span>
                                                <span className={`text-[10px] font-medium whitespace-nowrap ${isActive ? 'text-purple-400' : 'text-slate-500'}`}>
                                                    {new Date(room.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center pr-1">
                                                <span className={`text-xs truncate ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                                                    {room.lastMessage}
                                                </span>
                                                {(showUnread || (isActive && idx === 0)) && (
                                                    <div className="w-[18px] h-[18px] rounded-full bg-[#6919FF] flex items-center justify-center text-[9px] font-bold text-white shrink-0 ml-3 shadow-[0_0_10px_rgba(105,25,255,0.4)]">
                                                        2
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Active Chat Column */}
                    <div className="flex-1 flex flex-col bg-[#0F0D15] relative">
                        {activeRoom ? (
                            <>
                                {/* Chat Header */}
                                <div className="h-[90px] flex-shrink-0 border-b border-white/5 px-8 flex items-center justify-between bg-[#13111C]/50 backdrop-blur-sm z-10 sticky top-0">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#2A273D]">
                                                <img src={activeRoom.partner?.avatar || `https://i.pravatar.cc/100?u=${activeRoom.id}`} alt="avatar" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#13111C] rounded-full"></div>
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-white leading-tight mb-1">{activeRoom.partner?.storeName || activeRoom.partner?.name || "User"}</h2>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="text-emerald-400 font-bold">Online</span>
                                                <span className="text-slate-600 font-medium">• Last seen 5m ago</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="hidden lg:block text-right">
                                            <div className="text-[9px] font-bold text-slate-500 tracking-widest uppercase mb-1">Related Product</div>
                                            <button onClick={() => navigate('/marketplaces/1')} className="text-xs font-bold text-[#6919FF] hover:text-purple-400 flex items-center gap-1.5 transition-colors">
                                                2024 Porsche 911 GT3 RS <ExternalLink size={12} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                        <div className="flex gap-3">
                                            <button className="w-11 h-11 rounded-full bg-[#1A1724] border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                                                <Phone size={18} />
                                            </button>
                                            <button className="w-11 h-11 rounded-full bg-[#1A1724] border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                                                <Video size={18} />
                                            </button>
                                            <button className="w-11 h-11 rounded-full bg-[#1A1724] border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages History Area */}
                                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                    <div className="flex justify-center my-6">
                                        <span className="px-4 py-1.5 rounded-full bg-white/5 text-[9px] font-bold text-slate-500 tracking-widest uppercase border border-white/5">Today</span>
                                    </div>

                                    {messages.map((msg, idx) => {
                                        const isMyMsg = msg.senderId === user.id;

                                        // Specific mockup implementation details
                                        const showTypingIndicator = !isMyMsg && idx === messages.length - 1 && Math.random() > 0.8; // Randomly show for visual

                                        return (
                                            <div key={msg.id} className={`flex w-full ${isMyMsg ? 'justify-end' : 'justify-start'}`}>
                                                {!isMyMsg && (
                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2A273D] mr-4 shrink-0 flex-end mt-auto mb-[28px]">
                                                        <img src={activeRoom.partner?.avatar || `https://i.pravatar.cc/100?u=${activeRoom.id}`} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                )}

                                                <div className={`flex flex-col ${isMyMsg ? 'items-end' : 'items-start'} max-w-[65%]`}>
                                                    <div className={`p-5 text-sm leading-relaxed ${isMyMsg
                                                            ? 'bg-[#6919FF] text-white rounded-3xl rounded-br-[4px] shadow-[0_5px_20px_rgba(105,25,255,0.2)]'
                                                            : 'bg-[#1E1B29] text-slate-200 border border-white/5 rounded-3xl rounded-bl-[4px] shadow-sm'
                                                        }`}>
                                                        {msg.content}
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 mt-2 ${isMyMsg ? 'mr-1' : 'ml-1'}`}>
                                                        <span className="text-[10px] font-medium text-slate-600">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {isMyMsg && <CheckCircle2 size={12} className="text-[#6919FF]" />}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}

                                    {/* Typing Indicator Mock */}
                                    {activeRoom.id.length < 10 && messages.length % 2 === 0 && (
                                        <div className="flex w-full justify-start mt-4">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2A273D] mr-4 shrink-0 mt-auto mb-2">
                                                <img src={activeRoom.partner?.avatar || `https://i.pravatar.cc/100?img=11`} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="bg-[#1E1B29] border border-white/5 rounded-3xl rounded-bl-[4px] px-4 py-3 shadow-sm flex items-center gap-1.5 h-12">
                                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                            </div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} className="h-4" />
                                </div>

                                {/* Chat Input Area */}
                                <div className="p-6 pt-2 bg-gradient-to-t from-[#0F0D15] px-8 pb-8 z-10 sticky bottom-0">
                                    <form onSubmit={handleSendMessage} className="flex flex-col bg-[#1A1724] border border-white/5 rounded-full p-1.5 relative shadow-xl focus-within:ring-1 focus-within:ring-[#6919FF]/50 transition-shadow">
                                        <div className="flex items-center px-2">
                                            <button type="button" className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors shrink-0">
                                                <Plus size={20} />
                                            </button>
                                            <button type="button" className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors shrink-0 mr-2">
                                                <Smile size={20} />
                                            </button>
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                className="flex-1 bg-transparent text-sm text-white px-2 h-12 focus:outline-none placeholder-slate-500"
                                                placeholder={`Message ${activeRoom.partner?.name || "User"}...`}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newMessage.trim()}
                                                className="ml-2 bg-[#6919FF] hover:bg-[#5914E0] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(105,25,255,0.3)] hover:shadow-[0_0_20px_rgba(105,25,255,0.5)] shrink-0"
                                            >
                                                Send <Send size={16} className="-mt-0.5 ml-1" />
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-[#0F0D15]">
                                <MessageSquare className="w-16 h-16 mb-6 opacity-20" strokeWidth={1.5} />
                                <p className="font-medium text-lg text-slate-400">Select a conversation to start messaging</p>
                                <p className="text-sm mt-2 opacity-60">End-to-end encrypted fast communication</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatPage;
