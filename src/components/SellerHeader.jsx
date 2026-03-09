import { ArrowLeft, MapPin, Calendar, Star, CheckCircle, MessageCircle, Phone, Share2, Info } from 'lucide-react';

export function SellerHeader({ partner }) {
    const brandColor = partner.storeColor || "#7c3aed"; // Default purple
    const coverImage = partner.storeBanner
        ? `url(${partner.storeBanner})`
        : 'linear-gradient(to right, #191624, #13111C)';

    return (
        <div className="bg-[#13111C] border-b border-white/5 relative overflow-hidden">
            {/* Top Navigation */}
            <div className="absolute top-8 left-0 right-0 z-30 pointer-events-none">
                <div className="container mx-auto px-4 flex justify-between items-center pointer-events-auto">
                    <Link to="/marketplaces" className="h-12 w-12 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-2xl backdrop-blur-xl border border-white/10 transition-all active:scale-90 group">
                        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <button className="h-12 w-12 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-2xl backdrop-blur-xl border border-white/10 transition-all active:scale-90">
                        <Share2 className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Cover Banner */}
            <div
                className="h-64 md:h-80 w-full relative bg-cover bg-center transition-all duration-700"
                style={{
                    backgroundImage: typeof coverImage === 'string' && coverImage.startsWith('url') ? coverImage : undefined,
                    background: typeof coverImage === 'string' && !coverImage.startsWith('url') ? coverImage : undefined,
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-[#13111C] via-[#13111C]/40 to-transparent"></div>

                {/* Visual Accent */}
                <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-[#13111C] to-transparent pointer-events-none" />

                {/* Particle Glow */}
                <div className="absolute bottom-10 left-10 w-64 h-64 bg-purple-600/20 blur-[100px] pointer-events-none animate-pulse" />
            </div>

            <div className="container mx-auto px-4 -mt-24 pb-12 relative z-20">
                <div className="flex flex-col md:flex-row items-end gap-10">
                    {/* Logo with Glow */}
                    <div className="relative group shrink-0">
                        <div className="absolute -inset-4 bg-purple-600/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="h-44 w-44 rounded-[2.5rem] border-4 border-[#13111C] bg-[#191624] shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden relative z-10 p-2">
                            <div className="h-full w-full rounded-[1.8rem] overflow-hidden bg-white/5 flex items-center justify-center">
                                {partner.storeLogo ? (
                                    <img src={partner.storeLogo} alt={partner.storeName} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <span className="font-black text-6xl text-white/10 uppercase tracking-tighter">
                                        {partner.storeName?.[0] || 'S'}
                                    </span>
                                )}
                            </div>
                        </div>
                        {partner.isVerified && (
                            <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2.5 rounded-2xl border-4 border-[#13111C] shadow-xl z-20">
                                <CheckCircle className="h-6 w-6 text-white fill-white/20" />
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 pb-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-10 bg-purple-600 rounded-full" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">Официальный Магазин</span>
                                </div>
                                <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">
                                    {partner.storeName || "Premium Store"}
                                </h1>

                                <div className="flex flex-wrap items-center gap-6 mt-4">
                                    <div className="flex items-center h-10 px-4 bg-white/5 rounded-xl border border-white/5 group hover:border-purple-500/30 transition-all">
                                        <Star className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500" />
                                        <span className="text-sm font-black text-white mr-1.5 leading-none">4.9</span>
                                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest border-l border-white/10 pl-2 leading-none">120+ отзывов</span>
                                    </div>

                                    <div className="flex items-center h-10 px-4 bg-white/5 rounded-xl border border-white/5 uppercase text-[9px] font-black tracking-widest text-slate-400">
                                        <Calendar className="h-3.5 w-3.5 mr-2 text-blue-400" />
                                        Магазин с 2024
                                    </div>

                                    {partner.region && (
                                        <div className="flex items-center h-10 px-4 bg-white/5 rounded-xl border border-white/5 uppercase text-[9px] font-black tracking-widest text-slate-400">
                                            <MapPin className="h-3.5 w-3.5 mr-2 text-red-400" />
                                            {partner.region}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 shrink-0">
                                <button className="flex items-center h-16 px-8 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-[0.1em] text-xs border border-white/10 transition-all active:scale-95 group shadow-xl backdrop-blur-md">
                                    <MessageCircle className="h-5 w-5 mr-3 text-purple-400 group-hover:scale-110 transition-transform" />
                                    Написать
                                </button>
                                <button className="flex items-center h-16 px-10 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase tracking-[0.1em] text-xs transition-all active:scale-95 shadow-[0_20px_40px_rgba(147,51,234,0.3)] hover:shadow-[0_25px_50px_rgba(147,51,234,0.4)] relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Phone className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />
                                    Контакты
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
