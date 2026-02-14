import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Building2, Users as UsersIcon, Package, TrendingUp, Edit2, Trash2, Lock, Unlock } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function AdminCompanies() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCompanies: 0,
        activeCompanies: 0,
        totalProducts: 0,
        totalRevenue: 0
    });

    const [selectedCompany, setSelectedCompany] = useState(null);

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            setLoading(true);
            console.log("Loading companies data...");

            // Parallel fetch for better performance
            const [allUsers, allListings] = await Promise.all([
                api.getAdminUsers(),
                api.getAdminMarketplaces({ status: 'ALL' })
            ]);

            console.log("Data received:", {
                usersType: typeof allUsers,
                usersIsArray: Array.isArray(allUsers),
                listingsType: typeof allListings,
                listingsIsArray: Array.isArray(allListings)
            });

            if (!Array.isArray(allUsers) || !Array.isArray(allListings)) {
                console.error("Invalid data format received API");
                toast.error("Ошибка данных с сервера");
                setLoading(false);
                return;
            }

            const partnerUsers = allUsers.filter(u => u.role === 'PARTNER');

            // Map data
            const companiesWithData = partnerUsers.map(partner => {
                // Find listings for this partner
                const partnerListings = allListings.filter(l =>
                    (l.ownerId === partner.id) ||
                    (l.owner && l.owner.email === partner.email)
                );

                return {
                    ...partner,
                    productsCount: partnerListings.length,
                    activeProducts: partnerListings.filter(l => l.status === 'APPROVED').length
                };
            });

            setCompanies(companiesWithData);

            // Calculate stats
            setStats({
                totalCompanies: companiesWithData.length,
                activeCompanies: companiesWithData.filter(c => c.productsCount > 0).length,
                totalProducts: companiesWithData.reduce((sum, c) => sum + c.productsCount, 0),
                totalRevenue: 15450000
            });
        } catch (error) {
            console.error("Failed to load companies", error);
            toast.error("Не удалось загрузить списой компаний");
        } finally {
            setLoading(false);
        }
    };

    const handleBlockToggle = async (id, isBlocked, name) => {
        const action = isBlocked ? "отключение" : "активация";
        if (!confirm(`Вы уверены, что хотите ${isBlocked ? 'отключить' : 'активировать'} компанию "${name}"?`)) return;

        // Optimistic update
        setCompanies(prev => prev.map(c => c.id === id ? { ...c, isBlocked } : c));

        try {
            await api.updateUserBlock(id, isBlocked);
            // Reload to ensure sync
            // loadCompanies(); 
        } catch (error) {
            console.error("Failed to update status", error);
            alert(`Ошибка: ${action} не удалась`);
            // Revert
            setCompanies(prev => prev.map(c => c.id === id ? { ...c, isBlocked: !isBlocked } : c));
        }
    };

    const handleDelete = async (companyId, name) => {
        if (window.confirm(`Вы уверены, что хотите УДАЛИТЬ компанию "${name}"?\n\nЭто действие необратимо! Если у компании есть заказы или товары с продажами, удаление будет невозможно.`)) {
            const loadingToast = toast.loading("Удаление компании...");
            try {
                await api.deleteUser(companyId); // Partners are Users
                setCompanies(prev => prev.filter(c => c.id !== companyId));
                toast.success("Компания удалена", { id: loadingToast });
            } catch (error) {
                console.error(error);
                toast.error(error.message || "Ошибка удаления", { id: loadingToast });
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-slate-700">Загрузка компаний...</p>
                </div>
            </div>
        );
    }



    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Компании и Партнеры</h2>
                <p className="text-slate-700">Управление зарегистрированными компаниями</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Всего Компаний"
                    value={stats.totalCompanies}
                    icon={<Building2 className="h-4 w-4" />}
                    description="Зарегистрированные партнеры"
                />
                <StatsCard
                    title="Активные"
                    value={stats.activeCompanies}
                    icon={<TrendingUp className="h-4 w-4" />}
                    description="С товарами в каталоге"
                />
                <StatsCard
                    title="Всего Товаров"
                    value={stats.totalProducts}
                    icon={<Package className="h-4 w-4" />}
                    description="Опубликовано"
                />
                <StatsCard
                    title="Общая Выручка"
                    value={`${stats.totalRevenue.toLocaleString()} So'm`}
                    icon={<UsersIcon className="h-4 w-4" />}
                    description="За все время"
                />
            </div>

            {/* Companies Table */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-white">
                    <h3 className="font-semibold text-lg text-slate-900">Список Компаний</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-100 border-b">
                            <tr>
                                <th className="text-left p-4 font-semibold text-slate-700">Компания</th>
                                <th className="text-left p-4 font-semibold text-slate-700">Email</th>
                                <th className="text-left p-4 font-semibold text-slate-700">Товаров</th>
                                <th className="text-left p-4 font-semibold text-slate-700">Активных</th>
                                <th className="text-left p-4 font-semibold text-slate-700">Дата регистрации</th>
                                <th className="text-left p-4 font-semibold text-slate-700">Статус</th>
                                <th className="text-right p-4 font-semibold text-slate-700">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {companies.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-slate-500 bg-white">
                                        Нет зарегистрированных компаний
                                    </td>
                                </tr>
                            ) : (
                                companies.map((company) => (
                                    <tr key={company.id} className="hover:bg-slate-50 transition-colors bg-white group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                                    <Building2 className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{company.name}</div>
                                                    <div className="text-xs text-slate-500">ID: {company.id.slice(0, 8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-slate-600">{company.email}</td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                {company.productsCount}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {company.activeProducts}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {new Date(company.createdAt).toLocaleDateString('ru-RU')}
                                        </td>
                                        <td className="p-4">
                                            {company.isBlocked ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Отключена
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Активна
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setSelectedCompany(company)}
                                                className="h-8 px-3 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all mr-2"
                                            >
                                                <Edit2 size={12} /> Детали
                                            </button>

                                            <button
                                                onClick={() => handleBlockToggle(company.id, !company.isBlocked, company.name)}
                                                className={`h-8 px-3 inline-flex items-center justify-center gap-2 rounded-lg border text-xs font-medium transition-all ${company.isBlocked
                                                    ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 opacity-50 group-hover:opacity-100'
                                                    }`}
                                            >
                                                {company.isBlocked ? (
                                                    <>
                                                        <Unlock size={12} /> Активировать
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock size={12} /> Отключить
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => handleDelete(company.id, company.name)}
                                                className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all ml-1"
                                                title="Удалить компанию"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Company Details Modal */}
            {selectedCompany && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                    {selectedCompany.companyName || selectedCompany.name}
                                </h3>
                                <p className="text-sm text-slate-500">{selectedCompany.email}</p>
                            </div>
                            <button
                                onClick={() => setSelectedCompany(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Владелец</label>
                                    <p className="font-medium text-slate-900">{selectedCompany.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Категория</label>
                                    <p className="font-medium text-slate-900">{selectedCompany.businessCategory || '—'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Телефон</label>
                                    <p className="font-medium text-slate-900">{selectedCompany.phone || '—'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">ИНН</label>
                                    <p className="font-medium text-slate-900">{selectedCompany.taxId || '—'}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Адрес</label>
                                <p className="font-medium text-slate-900 p-3 bg-slate-50 rounded-lg border border-slate-100 mt-1">
                                    {selectedCompany.businessAddress || 'Адрес не указан'}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Описание</label>
                                <p className="font-medium text-slate-900 p-3 bg-slate-50 rounded-lg border border-slate-100 mt-1">
                                    {selectedCompany.businessDescription || 'Описание отсутствует'}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Статистика</label>
                                <div className="grid grid-cols-3 gap-4 mt-2">
                                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
                                        <div className="text-2xl font-bold text-blue-600">{selectedCompany.productsCount}</div>
                                        <div className="text-xs text-blue-800">Всего товаров</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                                        <div className="text-2xl font-bold text-emerald-600">{selectedCompany.activeProducts}</div>
                                        <div className="text-xs text-emerald-800">Активных</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-center">
                                        <div className="text-2xl font-bold text-purple-600">0</div>
                                        <div className="text-xs text-purple-800">Заказов</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t bg-slate-50 flex justify-end">
                            <button
                                onClick={() => setSelectedCompany(null)}
                                className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors"
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatsCard({ title, value, icon, description }) {
    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">{title}</span>
                <div className="text-blue-600 500">{icon}</div>
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-slate-700 mt-1">{description}</p>
        </div>
    );
}
