export function SellerTabs({ activeTab, onTabChange }) {
    const tabs = [
        { id: 'products', label: 'Товары' },
        { id: 'about', label: 'О магазине' },
        { id: 'reviews', label: 'Отзывы' }
    ];

    return (
        <div className="sticky top-[72px] z-30 bg-[#13111C]/90 backdrop-blur-2xl border-b border-white/5 py-2">
            <div className="container mx-auto px-4">
                <div className="flex items-center space-x-12 overflow-x-auto no-scrollbar py-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "py-4 text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap relative group",
                                activeTab === tab.id
                                    ? "text-purple-400"
                                    : "text-slate-500 hover:text-white"
                            )}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.6)]"
                                />
                            )}
                            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-purple-600/0 group-hover:bg-purple-600/20 rounded-full transition-all" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
