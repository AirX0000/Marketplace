import React from 'react';

export function ContactsPage() {
    return (
        <div className="container py-12 px-4 md:px-6">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Контакты</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Свяжитесь с нашей командой по вопросам сотрудничества, поддержки пользователей и размещения объявлений.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-[2fr_3fr]">
                <div className="space-y-4">
                    <div>
                        <h2 className="font-semibold mb-1">Поддержка пользователей</h2>
                        <p className="text-sm text-muted-foreground">
                            Email: <a href="mailto:support@aura-market.uz" className="text-primary">support@aura-market.uz</a>
                        </p>
                    </div>
                    <div>
                        <h2 className="font-semibold mb-1">Партнёрство и реклама</h2>
                        <p className="text-sm text-muted-foreground">
                            Email: <a href="mailto:partners@aura-market.uz" className="text-primary">partners@aura-market.uz</a>
                        </p>
                    </div>
                    <div>
                        <h2 className="font-semibold mb-1">Офис</h2>
                        <p className="text-sm text-muted-foreground">
                            Ташкент, деловой центр (условный адрес)
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                    <h2 className="font-semibold mb-1">Обратная связь</h2>
                    <p className="text-xs text-muted-foreground mb-4">
                        Оставьте сообщение, и мы ответим вам на email в ближайшее время.
                    </p>
                    <form className="space-y-3">
                        <div className="grid gap-3 md:grid-cols-2">
                            <input
                                type="text"
                                placeholder="Имя"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Тема"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                        <textarea
                            placeholder="Ваше сообщение"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm min-h-[100px]"
                        />
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                        >
                            Отправить
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

