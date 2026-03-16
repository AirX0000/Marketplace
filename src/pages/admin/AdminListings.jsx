import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useShop } from '../../context/ShopContext';
import { Plus, MoreHorizontal, X, Loader2, Check, AlertCircle, Eye, Shield, Filter, Trash2, Search, Building, Store, Car, Sparkles, Star, Phone, MessageCircle, ExternalLink, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ListingModal } from '../../components/dashboard/ListingModal';
import { toast } from 'react-hot-toast';
import { getImageUrl } from '../../lib/utils';
export function AdminListings() {
    const { user } = useShop();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingListing, setEditingListing] = useState(null);
    const [initialCategory, setInitialCategory] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
    const [selectedItems, setSelectedItems] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    // Admin Only
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    useEffect(() => {
        loadListings();
    }, [user]); // Removed statusFilter dependency for client-side filtering

    async function loadListings() {
        setLoading(true);
        try {
            let data;
            if (isAdmin) {
                // Fetch ALL listings once for client-side filtering
                data = await api.getAdminMarketplaces({});
            } else {
                // Partner sees only their listings
                data = await api.getMyListings();
            }
            setListings(data);
        } catch (error) {
            console.error("Failed to load listings", error);
            toast.error("Не удалось загрузить товары");
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id) => {
        if (confirm("Вы уверены, что хотите удалить этот товар?")) {
            try {
                await api.deleteAdminListing(id);
                setListings(listings.filter(l => l.id !== id));
                toast.success("Товар удален");
            } catch (error) {
                toast.error("Ошибка удаления товара");
            }
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        const loadingToast = toast.loading("Обновление статуса...");
        try {
            await api.updateMarketplaceStatus(id, newStatus);
            setListings(listings.map(l => l.id === id ? { ...l, status: newStatus } : l));
            toast.success(`Товар ${newStatus === 'APPROVED' ? 'одобрен' : 'отклонен'} `, { id: loadingToast });
        } catch (error) {
            toast.error("Не удалось обновить статус", { id: loadingToast });
        }
    };

    const handleEdit = (listing) => {
        setEditingListing(listing);
        setIsModalOpen(true);
    };

    const handleAdd = (category = null) => {
        setEditingListing(null);
        setInitialCategory(category);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingListing(null);
    };

    const handleSave = async (data) => {
        try {
            if (editingListing) {
                await api.updateListing(editingListing.id, data);
            } else {
                await api.createListing(data);
            }
            loadListings();
            handleCloseModal();
            toast.success("Товар сохранен");
        } catch (error) {
            toast.error(error.message || "Ошибка сохранения");
            console.error(error);
        }
    };

    const handleSelectAll = (e, filteredListings) => {
        if (e.target.checked) {
            setSelectedItems(filteredListings.map(l => l.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelect = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handleBulkAction = async (action) => {
        if (!selectedItems.length) return;
        
        const confirmMsg = action === 'DELETE' 
            ? `Вы уверены, что хотите удалить ${selectedItems.length} товаров?`
            : `Вы уверены, что хотите ${action === 'APPROVED' ? 'одобрить' : 'отклонить'} ${selectedItems.length} товаров?`;
            
        if (!confirm(confirmMsg)) return;

        const loadingToast = toast.loading("Выполнение...");
        
        try {
            if (action === 'DELETE') {
                await Promise.all(selectedItems.map(id => api.deleteAdminListing(id)));
                setListings(listings.filter(l => !selectedItems.includes(l.id)));
                toast.success(`Удалено ${selectedItems.length} товаров`, { id: loadingToast });
            } else {
                await Promise.all(selectedItems.map(id => api.updateMarketplaceStatus(id, action)));
                setListings(listings.map(l => selectedItems.includes(l.id) ? { ...l, status: action } : l));
                toast.success(`Обновлено ${selectedItems.length} товаров`, { id: loadingToast });
            }
            setSelectedItems([]);
        } catch (error) {
            toast.error("Произошла ошибка при массовом действии", { id: loadingToast });
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Tabs configuration
    const tabs = [
        { id: 'ALL', label: 'Все товары' },
        { id: 'PENDING', label: 'На проверке', count: listings.filter(l => l.status === 'PENDING').length },
        { id: 'APPROVED', label: 'Активные' },
        { id: 'REJECTED', label: 'Отклоненные' }
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    if (loading && listings.length === 0) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-6 pb-20 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isAdmin ? "Управление Товарами" : "Мои Товары"}
                    </h1>
                    <p className="text-muted-foreground">
                        {isAdmin ? "Модерация каталога и добавление товаров" : "Управление вашим ассортиментом"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleAdd()}
                        className="bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 rounded-md font-medium text-sm flex items-center shadow-sm shadow-blue-600/20"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Товар
                    </button>
                    <button
                        onClick={() => handleAdd('Private House')}
                        className="bg-emerald-600 text-white hover:bg-emerald-700 h-10 px-4 py-2 rounded-md font-medium text-sm flex items-center shadow-sm shadow-emerald-600/20"
                    >
                        <Building className="mr-2 h-4 w-4" /> Недвижимость
                    </button>
                    <button
                        onClick={() => handleAdd('Private Auto')}
                        className="bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-4 py-2 rounded-md font-medium text-sm flex items-center shadow-sm shadow-indigo-600/20"
                    >
                        <Car className="mr-2 h-4 w-4" /> Транспорт
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Поиск по названию..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 h-10 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <div className="w-full md:w-64">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                        <option value="ALL">Все категории</option>
                        <option value="Недвижимость">Недвижимость</option>
                        <option value="Cars">Транспорт</option>
                        <option value="Services">Услуги</option>
                    </select>
                </div>
            </div>

            {/* Filters Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-4 overflow-x-auto pb-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${statusFilter === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            {tab.label}
                            {/* Show count badge only for PENDING tab if Admin */}
                            {isAdmin && tab.id === 'PENDING' && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusFilter === 'PENDING' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    {tab.count > 0 ? tab.count : '!'}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Desktop Table */}
            <div className="border rounded-xl bg-card overflow-hidden shadow-sm hidden md:block">
                {/* Bulk Actions Toolbar */}
                {isAdmin && selectedItems.length > 0 && (
                    <div className="bg-muted p-3 flex items-center justify-between border-b border-border">
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" /> Выбрано: {selectedItems.length}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleBulkAction('APPROVED')}
                                className="h-8 px-3 rounded-md bg-emerald-500/10 text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-colors flex items-center gap-1.5"
                            >
                                <Check size={14} /> Одобрить
                            </button>
                            <button
                                onClick={() => handleBulkAction('REJECTED')}
                                className="h-8 px-3 rounded-md bg-amber-500/10 text-amber-600 font-black text-[10px] uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-colors flex items-center gap-1.5"
                            >
                                <X size={14} /> Отклонить
                            </button>
                            <button
                                onClick={() => handleBulkAction('DELETE')}
                                className="h-8 px-3 rounded-md bg-red-500/10 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors flex items-center gap-1.5"
                            >
                                <Trash2 size={14} /> Удалить
                            </button>
                        </div>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                            <tr>
                                {isAdmin && (
                                    <th className="p-4 w-12 text-center">
                                    </th>
                                )}
                                <th className="p-4 font-black uppercase text-[10px] tracking-widest text-foreground cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-1">Товар <ArrowUpDown size={12} className={sortConfig.key === 'name' ? 'text-primary' : 'text-muted-foreground/30'} /></div>
                                </th>
                                {isAdmin && <th className="p-4 font-black uppercase text-[10px] tracking-widest text-foreground">Продавец</th>}
                                <th className="p-4 font-black uppercase text-[10px] tracking-widest text-foreground cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('price')}>
                                    <div className="flex items-center gap-1">Цена <ArrowUpDown size={12} className={sortConfig.key === 'price' ? 'text-primary' : 'text-muted-foreground/30'} /></div>
                                </th>
                                <th className="p-4 font-black uppercase text-[10px] tracking-widest text-foreground">Категория</th>
                                <th className="p-4 font-black uppercase text-[10px] tracking-widest text-foreground cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('createdAt')}>
                                    <div className="flex items-center gap-1">Статус <ArrowUpDown size={12} className={sortConfig.key === 'createdAt' ? 'text-primary' : 'text-muted-foreground/30'} /></div>
                                </th>
                                <th className="p-4 font-black uppercase text-[10px] tracking-widest text-foreground text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {(() => {
                                // Apply client-side filter
                                const filteredListings = listings.filter(item => {
                                    // 1. Status Filter
                                    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;

                                    // 2. Category Filter
                                    if (categoryFilter !== 'ALL') {
                                        // Simple mapping for main categories
                                        if (categoryFilter === 'Недвижимость' && !['Houses', 'Apartments', 'Commercial', 'Land', 'Novostroyka', 'New Building', 'Private House'].includes(item.category)) return false;
                                        if (categoryFilter === 'Cars' && !['Cars', 'Transport', 'Moto', 'Trucks', 'Dealer', 'Private Auto'].includes(item.category)) return false;
                                        // Direct match fallback
                                        if (!['Недвижимость', 'Cars'].includes(categoryFilter) && item.category !== categoryFilter) return false;
                                    }

                                    // 3. Search Filter
                                    if (searchTerm) {
                                        const term = searchTerm.toLowerCase();
                                        const nameMatch = item.name?.toLowerCase().includes(term);
                                        const ownerMatch = item.owner?.name?.toLowerCase().includes(term);
                                        if (!nameMatch && !ownerMatch) return false;
                                    }

                                    return true;
                                });

                                // Apply sorting
                                const sortedListings = [...filteredListings].sort((a, b) => {
                                    if (a[sortConfig.key] < b[sortConfig.key]) {
                                        return sortConfig.direction === 'asc' ? -1 : 1;
                                    }
                                    if (a[sortConfig.key] > b[sortConfig.key]) {
                                        return sortConfig.direction === 'asc' ? 1 : -1;
                                    }
                                    return 0;
                                });

                                // Define headers again because we need `filteredListings` for the "Select All" checkbox
                                return (
                                    <>
                                        {isAdmin && sortedListings.length > 0 && (
                                            <tr className="bg-muted/30 border-b border-border">
                                                <th className="px-4 py-2 w-12 text-center">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 bg-background"
                                                        checked={sortedListings.length > 0 && selectedItems.length === sortedListings.length}
                                                        onChange={(e) => handleSelectAll(e, sortedListings)}
                                                        title="Выбрать все"
                                                    />
                                                </th>
                                                <th colSpan={6} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-left">
                                                    Выбрать все
                                                </th>
                                            </tr>
                                        )}
                                        {sortedListings.length === 0 ? (
                                            <tr>
                                                <td colSpan={isAdmin ? 7 : 5} className="p-12 text-center text-muted-foreground">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="bg-muted p-3 rounded-full mb-2">
                                                            <Filter className="h-6 w-6 text-muted-foreground/50" />
                                                        </div>
                                                        <span className="font-black uppercase text-xs tracking-widest text-foreground">Товары не найдены</span>
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">В этой категории пока нет товаров</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            sortedListings.map((item) => (
                                                <tr key={item.id} className="bg-card hover:bg-muted/50 transition-colors">
                                                    {isAdmin && (
                                                        <td className="p-4 text-center">
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 bg-background cursor-pointer"
                                                                checked={selectedItems.includes(item.id)}
                                                                onChange={() => handleSelect(item.id)}
                                                            />
                                                        </td>
                                                    )}
                                                    <td className="p-4 font-medium">
                                                        <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                                                        <img 
                                                            src={getImageUrl(item.images || item.image) || "https://images.unsplash.com/photo-1472851294608-4151050801cd?auto=format&fit=crop&q=80&w=1000"} 
                                                            className="h-full w-full object-cover" 
                                                            alt={item.name}
                                                            onError={(e) => {
                                                                e.target.src = "https://images.unsplash.com/photo-1472851294608-4151050801cd?auto=format&fit=crop&q=80&w=1000";
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-foreground line-clamp-1">{item.name}</div>
                                                        <div className="text-xs text-muted-foreground line-clamp-1">{item.region}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {isAdmin && (
                                                <td className="p-4 text-muted-foreground">
                                                    {item.owner ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-foreground font-semibold text-xs">{item.owner.name || 'Магазин'}</span>
                                                            <span className="text-[10px] text-muted-foreground">{item.owner.email}</span>
                                                            {(item.phone || item.owner?.phone) && (
                                                                <div className="flex gap-1 mt-1">
                                                                    <a href={`tel:${item.phone || item.owner?.phone}`} onClick={e => e.stopPropagation()} className="flex items-center justify-center gap-1 text-[10px] font-bold text-primary hover:text-white hover:bg-primary transition-colors bg-primary/5 w-fit px-2 py-0.5 rounded-full border border-primary/20">
                                                                        <Phone size={10} />
                                                                    </a>
                                                                    <a href={`https://t.me/${(item.phone || item.owner?.phone).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center justify-center gap-1 text-[10px] font-bold text-sky-500 hover:text-white hover:bg-sky-500 transition-colors bg-sky-500/10 w-fit px-2 py-0.5 rounded-full border border-sky-500/20">
                                                                        <MessageCircle size={10} />
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : <span className="text-xs text-muted-foreground/60">Системный</span>}
                                                </td>
                                            )}
                                            <td className="p-4 whitespace-nowrap font-medium text-foreground">{(item.price || 0).toLocaleString()} Sum</td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-primary ring-1 ring-inset ring-primary/20">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <StatusBadge status={item.status || 'PENDING'} />
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {isAdmin ? (
                                                        <>
                                                            <Link
                                                                to={`/catalog/${item.id}`}
                                                                target="_blank"
                                                                className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                                                title="Смотреть на сайте"
                                                            >
                                                                <ExternalLink size={16} />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleEdit(item)}
                                                                className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border text-primary hover:bg-primary/10 transition-colors"
                                                                title="Редактировать"
                                                            >
                                                                <MoreHorizontal size={16} />
                                                            </button>
                                                            {item.status !== 'APPROVED' && (
                                                                <button
                                                                    onClick={() => handleStatusChange(item.id, 'APPROVED')}
                                                                    className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                                                                    title="Одобрить"
                                                                >
                                                                    <Check size={16} />
                                                                </button>
                                                            )}
                                                            {item.status !== 'REJECTED' && (
                                                                <button
                                                                    onClick={() => handleStatusChange(item.id, 'REJECTED')}
                                                                    className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                                                    title="Отклонить"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            )}
                                                            {/* Trust Badge Toggles */}
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        const next = !item.isVerified;
                                                                        await api.setTrustFlags(item.id, { isVerified: next });
                                                                        setListings(listings.map(l => l.id === item.id ? { ...l, isVerified: next } : l));
                                                                        toast.success(next ? '✅ Продавец верифицирован' : 'Верификация снята');
                                                                    } catch { toast.error('Ошибка'); }
                                                                }}
                                                                className={`h-8 w-8 inline-flex items-center justify-center rounded-md border transition-colors ${item.isVerified ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border-border text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500'}`}
                                                                title={item.isVerified ? 'Снять верификацию' : 'Верифицировать продавца'}
                                                            >
                                                                <Shield size={14} />
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        const next = !item.isOfficial;
                                                                        await api.setTrustFlags(item.id, { isOfficial: next });
                                                                        setListings(listings.map(l => l.id === item.id ? { ...l, isOfficial: next } : l));
                                                                        toast.success(next ? '⭐ Официальный дилер присвоен' : 'Статус дилера снят');
                                                                    } catch { toast.error('Ошибка'); }
                                                                }}
                                                                className={`h-8 w-8 inline-flex items-center justify-center rounded-md border transition-colors ${item.isOfficial ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' : 'border-border text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500'}`}
                                                                title={item.isOfficial ? 'Снять статус дилера' : 'Присвоить официального дилера'}
                                                            >
                                                                <Sparkles size={14} />
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        const next = !item.isFeatured;
                                                                        await api.toggleMarketplaceFeatured(item.id, next);
                                                                        setListings(listings.map(l => l.id === item.id ? { ...l, isFeatured: next } : l));
                                                                        toast.success(next ? '⭐ Объявление в топе' : 'Снято с топа');
                                                                    } catch { toast.error('Ошибка'); }
                                                                }}
                                                                className={`h-8 w-8 inline-flex items-center justify-center rounded-md border transition-all ${item.isFeatured ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' : 'border-border text-muted-foreground hover:bg-indigo-500/10 hover:text-indigo-600'}`}
                                                                title={item.isFeatured ? 'Убрать из топа' : 'Выделить в топ'}
                                                            >
                                                                <Star size={14} className={item.isFeatured ? 'fill-current' : ''} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border text-red-500 hover:bg-red-500/10 transition-colors"
                                                                title="Удалить"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => handleEdit(item)} className="text-sm font-bold text-primary hover:underline px-2">Ред.</button>
                                                            <button onClick={() => handleDelete(item.id)} className="text-sm font-bold text-red-500 hover:underline px-2">Удал.</button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                                    </tr>
                                                ))
                                            )}
                                        </>
                                    );
                                })()}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card List */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {(() => {
                    const filteredListings = listings.filter(item => {
                        if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
                        if (categoryFilter !== 'ALL') {
                            if (categoryFilter === 'Недвижимость' && !['Houses', 'Apartments', 'Commercial', 'Land', 'Novostroyka', 'New Building', 'Private House'].includes(item.category)) return false;
                            if (categoryFilter === 'Cars' && !['Cars', 'Transport', 'Moto', 'Trucks', 'Dealer', 'Private Auto'].includes(item.category)) return false;
                            if (!['Недвижимость', 'Cars'].includes(categoryFilter) && item.category !== categoryFilter) return false;
                        }
                        if (searchTerm) {
                            const term = searchTerm.toLowerCase();
                            const nameMatch = item.name?.toLowerCase().includes(term);
                            const ownerMatch = item.owner?.name?.toLowerCase().includes(term);
                            if (!nameMatch && !ownerMatch) return false;
                        }
                        return true;
                    });

                    return filteredListings.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                             <Filter className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                             <p className="text-sm font-medium text-slate-500">Товары не найдены</p>
                        </div>
                    ) : (
                        filteredListings.map((item) => (
                            <div key={item.id} className="bg-card border border-border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                                <div className="flex gap-4 mb-4">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                                        <img 
                                            src={getImageUrl(item.images || item.image) || "https://images.unsplash.com/photo-1472851294608-4151050801cd?auto=format&fit=crop&q=80&w=1000"} 
                                            className="w-full h-full object-cover" 
                                            alt={item.name}
                                            onError={(e) => {
                                                e.target.src = "https://images.unsplash.com/photo-1472851294608-4151050801cd?auto=format&fit=crop&q=80&w=1000";
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="font-black text-foreground leading-tight uppercase text-sm line-clamp-2">{item.name}</h4>
                                            <StatusBadge status={item.status || 'PENDING'} />
                                        </div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{item.region}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-lg font-black text-primary">{(item.price || 0).toLocaleString()} <span className="text-[10px] uppercase">Sum</span></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="flex-1 h-10 rounded-xl bg-primary/10 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-2"
                                    >
                                        <MoreHorizontal size={14} /> Редакт.
                                    </button>
                                    {isAdmin && item.status !== 'APPROVED' && (
                                        <button
                                            onClick={() => handleStatusChange(item.id, 'APPROVED')}
                                            className="h-10 px-4 rounded-xl bg-emerald-500/10 text-emerald-600 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                                        >
                                            <Check size={14} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="h-10 px-4 rounded-xl bg-red-500/10 text-red-500 font-black text-[10px] uppercase tracking-widest flex items-center justify-center"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                
                                {isAdmin && item.owner && (
                                    <div className="mt-4 pt-3 flex items-center gap-2 border-t border-border/50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                                {item.owner.name?.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-foreground uppercase leading-none">{item.owner.name}</span>
                                                <span className="text-[8px] text-muted-foreground uppercase tracking-tighter mt-0.5">{item.owner.email}</span>
                                            </div>
                                        </div>
                                        {(item.phone || item.owner?.phone) && (
                                            <div className="flex gap-1 ml-auto">
                                                <a href={`tel:${item.phone || item.owner?.phone}`} onClick={e => e.stopPropagation()} className="h-8 px-3 rounded-xl bg-primary/10 text-primary flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-colors">
                                                    <Phone size={12} />
                                                </a>
                                                <a href={`https://t.me/${(item.phone || item.owner?.phone).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="h-8 px-3 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-colors">
                                                    <MessageCircle size={12} />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <div className="mt-4">
                                    <Link to={`/catalog/${item.id}`} target="_blank" className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors border border-slate-200">
                                        <ExternalLink size={14} /> Смотреть на сайте
                                    </Link>
                                </div>
                            </div>
                        ))
                    );
                })()}
            </div>

            {isModalOpen && (
                <ListingModal
                    listing={editingListing}
                    initialCategory={initialCategory}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

function StatusBadge({ status }) {
    switch (status) {
        case 'APPROVED':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    <Check size={12} /> Активен
                </span>
            );
        case 'REJECTED':
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                    <AlertCircle size={12} /> Отклонен
                </span>
            );
        default: // PENDING
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                    <Loader2 size={12} className="animate-spin" /> На проверке
                </span>
            );
    }
}

// Helper to format number with spaces/commas (17 000 000)
const formatPrice = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

// Categories Data
