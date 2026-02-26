import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Shield, User, Search, Store, Lock, Unlock, Mail, Calendar, Check, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function SuperAdminUsers() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL'); // ALL, ADMIN, PARTNER, USER

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        let result = users;

        // Filter by role
        if (roleFilter !== 'ALL') {
            result = result.filter(u => u.role === roleFilter);
        }

        // Filter by search
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(u =>
                u.name?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q)
            );
        }

        setFilteredUsers(result);
    }, [users, roleFilter, search]);

    const loadUsers = () => {
        api.getAdminUsers()
            .then(data => {
                setUsers(data);
                setFilteredUsers(data);
            })
            .catch(e => toast.error("Ошибка загрузки пользователей"))
            .finally(() => setLoading(false));
    };

    const handleRoleChange = async (id, newRole) => {
        const loadingToast = toast.loading("Обновление роли...");
        try {
            await api.updateUserRole(id, newRole);
            setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
            toast.success("Роль успешно обновлена", { id: loadingToast });
        } catch (error) {
            toast.error("Ошибка обновления роли", { id: loadingToast });
        }
    };

    const handleBlockToggle = async (id, isBlocked, name) => {
        const action = isBlocked ? "блокировка" : "разблокировка";
        if (!confirm(`Вы уверены, что хотите ${isBlocked ? 'заблокировать' : 'разблокировать'} пользователя ${name}?`)) return;

        const loadingToast = toast.loading(`${isBlocked ? 'Блокировка' : 'Разблокировка'} пользователя...`);
        try {
            await api.updateUserBlock(id, isBlocked);
            setUsers(users.map(u => u.id === id ? { ...u, isBlocked } : u));
            toast.success(`Пользователь ${isBlocked ? 'заблокирован' : 'разблокирован'}`, { id: loadingToast });
        } catch (error) {
            toast.error(`Ошибка: ${action} не удалась`, { id: loadingToast });
        }
    };

    const handleDelete = async (userId, name) => {
        if (window.confirm(`Вы уверены, что хотите УДАЛИТЬ пользователя ${name}?\n\nЭто действие необратимо! Будут удалены:\n- Профиль\n- Отзывы\n- Избранное\n- Тикеты\n\nЕсли у пользователя есть заказы или продажи, удаление будет отклонено.`)) {
            const loadingToast = toast.loading("Удаление пользователя...");
            try {
                await api.deleteUser(userId);
                toast.success("Пользователь удален", { id: loadingToast });
                loadUsers();
            } catch (error) {
                console.error('Delete error:', error);
                toast.error(error.message || "Ошибка удаления", { id: loadingToast });
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 animate-in fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Управление Пользователями</h1>
                <p className="text-slate-700">Просмотр и управление всеми пользователями платформы</p>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-1 rounded-xl border shadow-sm">
                <div className="flex gap-1 p-1 bg-slate-100/80 rounded-lg overflow-x-auto max-w-full">
                    {[
                        { id: 'ALL', label: 'Все', icon: Users },
                        { id: 'ADMIN', label: 'Админы', icon: Shield },
                        { id: 'PARTNER', label: 'Партнеры', icon: Store },
                        { id: 'USER', label: 'Пользователи', icon: User }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setRoleFilter(tab.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${roleFilter === tab.id
                                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                }`}
                        >
                            {tab.id === 'ALL' ? <User size={14} /> : <tab.icon size={14} />}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64 mr-2">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Поиск..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-9 pl-9 pr-4 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Пользователь</th>
                                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Роль</th>
                                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Статус</th>
                                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Дата Регистрации</th>
                                <th className="p-4 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-slate-50 p-4 rounded-full mb-3">
                                                <Search className="h-6 w-6 text-slate-300" />
                                            </div>
                                            Пользователи не найдены
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' :
                                                    user.role === 'PARTNER' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {user.name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">{user.name || "Без имени"}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    className={`h-8 rounded-lg border text-xs font-semibold px-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all appearance-none pl-3 pr-8 bg-no-repeat bg-[right_0.5rem_center] ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200 focus:ring-purple-200' :
                                                        user.role === 'PARTNER' ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-200' :
                                                            'bg-slate-50 text-slate-700 border-slate-200 focus:ring-slate-200'
                                                        }`}
                                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundSize: '1.5em 1.5em' }}
                                                >
                                                    <option value="USER">User</option>
                                                    <option value="PARTNER">Partner</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {user.isBlocked ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Заблокирован
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Активен
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-500 font-medium">
                                            <div className="flex items-center gap-2 text-xs">
                                                <Calendar size={13} className="text-slate-400" />
                                                {new Date(user.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleBlockToggle(user.id, !user.isBlocked, user.name)}
                                                className={`h-8 px-3 inline-flex items-center justify-center gap-2 rounded-lg border text-xs font-medium transition-all ${user.isBlocked
                                                    ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                                                    }`}
                                            >
                                                {user.isBlocked ? (
                                                    <>
                                                        <Unlock size={12} /> Разблокировать
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock size={12} /> Блокировать
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => handleDelete(user.id, user.name)}
                                                className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all ml-1"
                                                title="Удалить пользователя"
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
                <div className="p-4 border-t bg-muted/20 text-xs text-slate-700 flex justify-between items-center">
                    <div>
                        Всего пользователей: {filteredUsers.length}
                    </div>
                    {filteredUsers.length < users.length && (
                        <div>
                            (Отфильтровано из {users.length})
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Users({ size }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
