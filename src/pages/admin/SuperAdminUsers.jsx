import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Shield, User, Search, Store, Lock, Unlock, Mail, Calendar, Check, Trash2, UserPlus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function SuperAdminUsers() {
    const [searchParams] = useSearchParams();
    const urlRole = searchParams.get('role');
    const urlCategory = searchParams.get('category');

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState(urlRole || 'ALL'); // ALL, ADMIN, SUPER_ADMIN, PARTNER, USER

    // Add User Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'USER',
        isPhoneVerified: true,
        isForcedVerified: true
    });

    useEffect(() => {
        if (urlRole) {
            setRoleFilter(urlRole);
        } else {
            setRoleFilter('ALL');
        }
    }, [urlRole, urlCategory]);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        let result = users;

        // Filter by role
        if (roleFilter !== 'ALL') {
            result = result.filter(u => u.role === roleFilter);
        }

        // Filter by business category (from URL)
        if (urlCategory) {
            result = result.filter(u => u.businessCategory === urlCategory);
        }

        // Filter by search
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(u =>
                u.name?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                u.phone?.includes(q)
            );
        }

        setFilteredUsers(result);
    }, [users, roleFilter, search, urlCategory]);

    const loadUsers = () => {
        api.getAdminUsers()
            .then(data => {
                setUsers(data);
                setFilteredUsers(data);
            })
            .catch(e => toast.error("Ошибка загрузки пользователей"))
            .finally(() => setLoading(false));
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading("Создание пользователя...");
        try {
            await api.createUser(newUser);
            toast.success("Пользователь успешно создан", { id: loadingToast });
            setIsAddModalOpen(false);
            setNewUser({
                name: '',
                email: '',
                phone: '',
                password: '',
                role: 'USER',
                isPhoneVerified: true,
                isForcedVerified: true
            });
            loadUsers();
        } catch (error) {
            toast.error(error.message || "Ошибка создания пользователя", { id: loadingToast });
        }
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

    const handleVerificationToggle = async (user) => {
        const isVerified = !user.isPhoneVerified;
        const loadingToast = toast.loading(isVerified ? "Верификация пользователя..." : "Снятие верификации...");
        try {
            await api.updateUserVerification(user.id, isVerified);
            setUsers(users.map(u => u.id === user.id ? { ...u, isPhoneVerified: isVerified, isForcedVerified: isVerified } : u));
            toast.success(isVerified ? "Пользователь верифицирован" : "Верификация снята", { id: loadingToast });
        } catch (error) {
            toast.error("Ошибка смены статуса верификации", { id: loadingToast });
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
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {urlCategory ? `Управление Партнерами: ${urlCategory}` : 'Управление Пользователями'}
                    </h1>
                    <p className="text-muted-foreground">
                        {urlCategory ? `Список зарегистрированных пользователей в категории ${urlCategory}` : 'Просмотр и управление всеми пользователями платформы'}
                    </p>
                </div>
                {!urlCategory && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-medium"
                    >
                        <UserPlus size={18} />
                        Добавить пользователя
                    </button>
                )}
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-1 rounded-xl border border-border shadow-sm">
                <div className="flex gap-1 p-1 bg-muted rounded-lg overflow-x-auto max-w-full">
                    {[
                        { id: 'ALL', label: 'Все', icon: UsersIcon },
                        { id: 'SUPER_ADMIN', label: 'Super Admin', icon: Shield },
                        { id: 'ADMIN', label: 'Админы', icon: Shield },
                        { id: 'PARTNER', label: 'Партнеры', icon: Store },
                        { id: 'USER', label: 'Пользователи', icon: User }
                    ].map(tab => {
                        // Hide other role tabs if we are specifically looking at a category (which implies PARTNER)
                        if (urlCategory && tab.id !== 'PARTNER' && tab.id !== 'ALL') return null;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setRoleFilter(tab.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${roleFilter === tab.id
                                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                    }`}
                            >
                                {tab.id === 'ALL' ? <UsersIcon size={14} /> : <tab.icon size={14} />}
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="relative w-full md:w-64 mr-2">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Поиск..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Пользователь</th>
                                <th className="p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Роль</th>
                                <th className="p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Верификация</th>
                                <th className="p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Статус</th>
                                <th className="p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Дата Регистрации</th>
                                <th className="p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-muted p-4 rounded-full mb-3">
                                                <Search className="h-6 w-6 text-muted-foreground/50" />
                                            </div>
                                            Пользователи не найдены
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-muted/30 transition-colors group border-b border-border/50 last:border-0">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${user.role === 'SUPER_ADMIN' ? 'bg-red-500/20 text-red-500' :
                                                    user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-500' :
                                                        user.role === 'PARTNER' ? 'bg-blue-500/20 text-blue-500' :
                                                            'bg-muted text-muted-foreground'
                                                    }`}>
                                                    {user.name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-foreground">{user.name || "Без имени"}</div>
                                                    <div className="text-xs text-muted-foreground flex flex-col">
                                                        <span>{user.email}</span>
                                                        <span>{user.phone}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    className={`h-8 rounded-lg border text-xs font-semibold px-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all appearance-none pl-3 pr-8 bg-no-repeat bg-[right_0.5rem_center] ${user.role === 'SUPER_ADMIN' ? 'bg-red-500/10 text-red-500 border-red-500/20 focus:ring-red-500/20' :
                                                        user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20 focus:ring-purple-500/20' :
                                                            user.role === 'PARTNER' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 focus:ring-blue-500/20' :
                                                                'bg-muted text-foreground border-border focus:ring-border'
                                                        }`}
                                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundSize: '1.5em 1.5em' }}
                                                >
                                                    <option value="USER" className="bg-background text-foreground">User</option>
                                                    <option value="PARTNER" className="bg-background text-foreground">Partner</option>
                                                    <option value="ADMIN" className="bg-background text-foreground">Admin</option>
                                                    <option value="SUPER_ADMIN" className="bg-background text-foreground">Super Admin</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleVerificationToggle(user)}
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all ${user.isPhoneVerified
                                                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
                                                    : 'bg-muted border border-border text-muted-foreground hover:bg-background hover:text-foreground'
                                                    }`}
                                            >
                                                {user.isPhoneVerified ? (
                                                    <><Check size={12} /> {user.isForcedVerified ? 'Принудительно' : 'Подтвержден'}</>
                                                ) : (
                                                    'Не подтвержден'
                                                )}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                {user.isBlocked ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 text-xs font-medium text-red-500 w-fit">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> Заблокирован
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-500 w-fit">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Активен
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-muted-foreground font-medium">
                                            <div className="flex items-center gap-2 text-xs">
                                                <Calendar size={13} className="text-muted-foreground/60" />
                                                {new Date(user.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleBlockToggle(user.id, !user.isBlocked, user.name)}
                                                className={`h-8 px-3 inline-flex items-center justify-center gap-2 rounded-lg border text-xs font-medium transition-all ${user.isBlocked
                                                    ? 'bg-muted text-foreground border-border hover:bg-background'
                                                    : 'bg-background text-muted-foreground border-border hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500'
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
                                                className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-border text-muted-foreground/50 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all ml-1"
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
                <div className="p-4 border-t border-border bg-muted/20 text-xs text-muted-foreground flex justify-between items-center">
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

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/50">
                            <h2 className="text-xl font-bold text-foreground">Добавить пользователя</h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-muted-foreground">Имя</label>
                                <input
                                    required
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm placeholder:text-muted-foreground/50"
                                    placeholder="Иван Иванов"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-muted-foreground">Email</label>
                                    <input
                                        required
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm placeholder:text-muted-foreground/50"
                                        placeholder="user@example.com"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-muted-foreground">Телефон</label>
                                    <input
                                        required
                                        type="tel"
                                        value={newUser.phone}
                                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                        className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm placeholder:text-muted-foreground/50"
                                        placeholder="+998901234567"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-muted-foreground">Пароль</label>
                                <input
                                    required
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm placeholder:text-muted-foreground/50"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-muted-foreground">Роль</label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm appearance-none bg-no-repeat bg-[right_1rem_center]"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundSize: '1.5em 1.5em' }}
                                >
                                    <option value="USER">User</option>
                                    <option value="PARTNER">Partner (Seller)</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                </select>
                            </div>
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="isVerified"
                                        checked={newUser.isPhoneVerified}
                                        onChange={(e) => setNewUser({ ...newUser, isPhoneVerified: e.target.checked })}
                                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer transition-all"
                                    />
                                    <label htmlFor="isVerified" className="text-sm font-medium text-foreground cursor-pointer select-none">
                                        Подтвердить телефон
                                    </label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="isForced"
                                        checked={newUser.isForcedVerified}
                                        onChange={(e) => setNewUser({ ...newUser, isForcedVerified: e.target.checked })}
                                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer transition-all"
                                    />
                                    <label htmlFor="isForced" className="text-sm font-medium text-foreground cursor-pointer select-none text-emerald-600">
                                        Принудительная верификация (Bypass)
                                    </label>
                                </div>
                            </div>
                            <div className="pt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 h-12 px-4 rounded-xl border border-border font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 h-12 px-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                                >
                                    Создать
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function UsersIcon({ size }) {
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
