import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useShop } from '../../context/ShopContext';
import { Plus, MoreHorizontal, X, Loader2, Check, AlertCircle, Eye, Shield, Filter, Trash2, Search, Building, Store, Car, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ListingModal } from '../../components/dashboard/ListingModal';
import { toast } from 'react-hot-toast';

export function AdminListings() {
    const { user } = useShop();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingListing, setEditingListing] = useState(null);
    const [initialCategory, setInitialCategory] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED

    // Admin Only
    const isAdmin = user?.role === 'ADMIN';

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
                    <p className="text-slate-700">
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
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Поиск по названию..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 h-10 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
                <div className="w-full md:w-64">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
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
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusFilter === 'PENDING' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {tab.count > 0 ? tab.count : '!'}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100/50 text-slate-700 border-b">
                            <tr>
                                <th className="p-4 font-bold w-[40%] text-slate-900">Товар</th>
                                {isAdmin && <th className="p-4 font-bold text-slate-900">Продавец</th>}
                                <th className="p-4 font-bold text-slate-900">Цена</th>
                                <th className="p-4 font-bold text-slate-900">Категория</th>
                                <th className="p-4 font-bold text-slate-900">Статус</th>
                                <th className="p-4 font-bold text-right text-slate-900">Действия</th>
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

                                return filteredListings.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 6 : 5} className="p-12 text-center text-slate-700">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="bg-slate-50 p-3 rounded-full mb-2">
                                                    <Filter className="h-6 w-6 text-slate-400" />
                                                </div>
                                                <span className="font-medium text-slate-900">Товары не найдены</span>
                                                <span className="text-xs text-slate-500">В этой категории пока нет товаров</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredListings.map((item) => (
                                        <tr key={item.id} className="bg-white hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                                                        {item.image ? (
                                                            <img src={item.image} className="h-full w-full object-cover" alt={item.name} />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-slate-400 bg-slate-100">?</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 line-clamp-1">{item.name}</div>
                                                        <div className="text-xs text-slate-500 line-clamp-1">{item.region}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {isAdmin && (
                                                <td className="p-4 text-slate-600">
                                                    {item.owner ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-900 font-semibold text-xs">{item.owner.name || 'Магазин'}</span>
                                                            <span className="text-[10px] text-slate-500">{item.owner.email}</span>
                                                        </div>
                                                    ) : <span className="text-xs text-slate-400">Системный</span>}
                                                </td>
                                            )}
                                            <td className="p-4 whitespace-nowrap font-medium text-slate-900">{(item.price || 0).toLocaleString()} Sum</td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
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
                                                            <button
                                                                onClick={() => handleEdit(item)}
                                                                className="h-8 w-8 inline-flex items-center justify-center rounded-md border text-blue-600 hover:bg-blue-50 transition-colors"
                                                                title="Редактировать"
                                                            >
                                                                <MoreHorizontal size={16} />
                                                            </button>
                                                            {item.status !== 'APPROVED' && (
                                                                <button
                                                                    onClick={() => handleStatusChange(item.id, 'APPROVED')}
                                                                    className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-green-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors"
                                                                    title="Одобрить"
                                                                >
                                                                    <Check size={16} />
                                                                </button>
                                                            )}
                                                            {item.status !== 'REJECTED' && (
                                                                <button
                                                                    onClick={() => handleStatusChange(item.id, 'REJECTED')}
                                                                    className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors"
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
                                                                className={`h-8 w-8 inline-flex items-center justify-center rounded-md border transition-colors ${item.isVerified ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'}`}
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
                                                                className={`h-8 w-8 inline-flex items-center justify-center rounded-md border transition-colors ${item.isOfficial ? 'bg-amber-500 text-white border-amber-500' : 'border-slate-200 text-slate-500 hover:bg-amber-50 hover:text-amber-700'}`}
                                                                title={item.isOfficial ? 'Снять статус дилера' : 'Присвоить официального дилера'}
                                                            >
                                                                <Sparkles size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="h-8 w-8 inline-flex items-center justify-center rounded-md border text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                                                title="Удалить"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => handleEdit(item)} className="text-sm font-medium text-blue-600 hover:underline px-2">Ред.</button>
                                                            <button onClick={() => handleDelete(item.id)} className="text-sm font-medium text-red-600 hover:underline px-2">Удал.</button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                );
                            })()}
                        </tbody>
                    </table>
                </div>
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
